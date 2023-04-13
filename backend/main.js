// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path');

const mongoose = require('mongoose');

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
    console.log('MongoDB connected successfully');
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