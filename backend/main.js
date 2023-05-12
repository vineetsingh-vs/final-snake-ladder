// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path');

const mongoose = require('mongoose');

const bleno = require('@abandonware/bleno');

const noble = require('@abandonware/noble');

const desiredDeviceName = 'ENEB453';
const serviceUUID = '1111'; // Replace with the UUID of the service you want to use
const characteristicUuid = '2222'; // Replace with the UUID of the characteristic you want to use

// // UUIDs of the service and characteristic you want to send/receive data to/from
// const serviceUuid = '181C'; // Replace with the UUID of your target service
// const characteristicUuid = '2A3D'; // Replace with the UUID of your target characteristic

// // Create a new BLE service
// const serviceUuid = '12345678901234567890123456789012'; // Replace with your desired service UUID
// const characteristicUuid = '12345678901234567890123456789013'; // Replace with your desired characteristic UUID


// Define a generic Mongoose schema with a field of type Mixed
const genericSchema = new mongoose.Schema({}, { strict: false });

// Define a Mongoose model based on the schema
const GenericModel = mongoose.model('GenericModel', genericSchema);

const createWindow = () => { 
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    webPreferences: {
      nodeIntegration: true, // Enable Node.js integration in the renderer process
      contextIsolation: false, // Disable context isolation in the renderer process
      webSecurity: true, // Enable web security (default is true)
      allowRunningInsecureContent: false, // Disallow running insecure content (HTTP) on HTTPS pages
      nodeIntegrationInSubFrames: false, // Disable Node.js integration in sub-frames
      sandbox: false, // Disable the renderer process to run in a sandboxed environment
      devTools: true // Enable DevTools (default is true)
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL('http://localhost:3000')
  mainWindow.webContents.openDevTools();

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript('window.nodeIntegration = true;');
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  mongoose.connect('mongodb://admin:password@localhost', { useNewUrlParser: true })
  .then(() => {
    console.log('MongoDBconnected successfully');
    // Call a function to handle the event and store data

  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });
});
  


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});



ipcMain.on('fromReact', (event, messageData) => {
  const newData = new GenericModel(messageData);
   // Save the data object to MongoDB
   newData.save()
   .then(() => {
     console.log('Data saved successfully');
   })
   .catch((error) => {
     console.error('Failed to save data:', error);
   });
  dialog.showErrorBox('ENEB453', messageData.message);
});


// Define a service with a characteristic
const myCharacteristic = new bleno.Characteristic({
  uuid: characteristicUuid, // Set a unique UUID for your characteristic
  properties: ['read', 'write'], // Set the properties of the characteristic (e.g., 'read', 'write', 'notify', etc.)
  onReadRequest: (offset, callback) => {
    // Handle read requests for the characteristic
    callback(bleno.Characteristic.RESULT_SUCCESS, Buffer.from('Hello, World!'));
  },
  onWriteRequest: (data, offset, withoutResponse, callback) => {
    // Handle write requests for the characteristic
    console.log(`Received data: ${data.toString()}`);
    ipcMain.emit('fromBle', {move: data.toString()});
    callback(bleno.Characteristic.RESULT_SUCCESS);
  }
});

// Set the services for the peripheral
const myServices = new bleno.PrimaryService({
  uuid: serviceUUID, // Set a unique UUID for your service
  characteristics: [myCharacteristic]
});

// Start advertising the peripheral
bleno.on('stateChange', (state) => {
  if (state === 'poweredOn') {
    bleno.startAdvertising(desiredDeviceName, [myServices.uuid]); // Set the name of your peripheral and the UUID of the service you defined
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', (error) => {
  if (!error) {
    bleno.setServices([myServices]);
  }
});



// Scan for BLE devices
noble.startScanning();

// Handle discovered devices
noble.on('discover', (peripheral) => {
  console.log(peripheral.advertisement.localName);
  if (peripheral.advertisement.localName === desiredDeviceName) {
    // Stop scanning for devices
    noble.stopScanning();

    // Connect to desired peripheral device
    peripheral.connect((error) => {
      if (error) {
        console.error('Failed to connect:', error);
        return;
      }

      // Discover services and characteristics
      peripheral.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
        console.log(characteristics);
        if (error) {
          console.error('Failed to discover services and characteristics:', error);
          peripheral.disconnect();
          return;
        }

        // Find desired characteristic
        const characteristic = characteristics.find(c => c.uuid === characteristicUuid);
        console.log(characteristic);
        if (!characteristic) {
          console.error('Characteristic not found');
          peripheral.disconnect();
          return;
        }

        // Read data from characteristic
        characteristic.read((error, data) => {
          if (error) {
            console.error('Failed to read data:', error);
            peripheral.disconnect();
            return;
          }
          ipcMain.emit('fromBle', {move: data.toString()});
          console.log('Data:', data.toString());
          peripheral.disconnect();
        });
      });
    });
  }
});

