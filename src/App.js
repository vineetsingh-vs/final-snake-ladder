import './App.css';

import React, { useState, useEffect, useRef } from 'react';
import * as Helper from './utils/Helper';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';


import Tile from './components/Tile';
import LadderContainer from './components/LadderContainer';
import Snake from './components/Snake';
import Player from './components/Player';

import soundwin from './SnakesAndLadder_winharpsichord.mp3'
import sounddice from './SnakesAndLadderrolling.mp3'

const { ipcRenderer } = window.require('electron');
// const remote = electron.remote
// const {dialog} = remote

function App() {

  let audiodice = new Audio(sounddice)
  let audiowin = new Audio(soundwin)
  const startmusicwin = () => {
    audiowin.play();
  }
  const startmusicdice = () => {
    audiodice.play();
  }
  const stateRef = useRef();
  const options = [
    '2', '3', '4'
  ];
  const types= [
    'Computer', 'Manual'
  ];
  const defaultOption = '1';
  let [state, setState] = useState({
    gameboard: Helper.generateGameboard(),
    snakes: Helper.generateSnakes(2),
    ladders: Helper.generateLadders(1),
    players:  Helper.generatePlayers(2),
    dice: null, 
    player: 0,
    gameStart: false,
    type: 'Computer',
    playerCounter: 0
  });

  useEffect(() => {
    stateRef.current = state.playerCounter + 1;
    ipcRenderer.on('toReact', (event, data) => {
      if(stateRef.current === 2){
        startmusicdice();
        setState(previous => {
          return ({...previous, dice: + data.move.replace(/["']/g, "")});
        });
      }
    });

    
  }, [state.playerCounter]);
 
 
  const gameRollDice = () => {
    startmusicdice();
    setState(previous => ({...previous, dice: Math.floor((Math.random() * 6) + 1)}));
  }

  const movePlayer =() => {
    const player = state.playerCounter;
    setState(previous => ({...previous, playerCounter: (state.playerCounter +1)%state.players.length}));
    let data = {
      id: state.players[player].id,
      moves: state.dice,
      tile: state.players[player].tile,
      index: state.players[player].index,
    };
    playerUpdatePosition(data);
    setTimeout((data) => {
      setState(previous => ({...previous, dice: null, player: player}));
    },100)
   
  }

  const start =() =>{
    setState(previous => ({...previous, gameStart: true}));
  }
  const onSelect = (event) => {
   setState(previous => ({...previous, players: Helper.generatePlayers(event.value)}))
  }

  const onType = (event) => {
    setState(previous => ({...previous, type: event.value}))
   }

async function playerUpdatePosition( data ) {
  const updated_data = Helper.calculatePlayerNewPosition( data );
  let previous_player_data = Helper.getLastCalculatedPlayerPosition();
  let perfect_throws = Helper.calculatePerfectThrowsFromPosition( previous_player_data.index );
  if( previous_player_data.index === 100 ) {
  
    ipcRenderer.send('fromReact', {message: 'hello Player 1 win'});
    setTimeout(function() {
      playerUpdatePosition({ id: data.id, index: 100, moves: 1-100 });
    }, 400);
    window.location.reload();
  }
  const players = state.players.map((player) => {
    if(player.id === data.id) {
      player = {...player, ...updated_data};
    }
    return player;
  });
  setState((prev) => ({...prev, players: players}));
  let stats_ladder_count = 0;
    let stats_snake_count = 0;
    let ladders = state.ladders;
    for(let i =0; i < ladders.length; i++) {
      if(ladders[i].from === updated_data.index) {
        setTimeout(function() {
          playerUpdatePosition({ id: data.id, index: updated_data.index, moves: ladders[i].to-ladders[i].from });
        }, 400);
      }
    }

    let snakes = state.snakes;
    for(let i =0; i < snakes.length; i++) {
      if(snakes[i].from === updated_data.index) {
        setTimeout(function() {
          playerUpdatePosition({ id: data.id, index: updated_data.index, moves: snakes[i].to-snakes[i].from });
        }, 400);
      }
    }
}

  let player_dashboard = (
    state.gameStart ? 
    <div>
      <div className="player-info">
        <p>Current Player</p>
        <p className="name">Player{state.playerCounter + 1}</p>
        {/* <div className="moves-to-win">
          You are <strong>5</strong> moves away from a perfect win.
        </div> */}
      </div>

      <div className="dice">
        <div className="number">
        {/* <span>&#8995;</span> */}
          { state.dice ?
            <span>{ state.dice }</span> : <span>&#8995;</span>
          }
        </div>
      </div>

      <div className="m-t-20">
      {/* <button className="full green">Move</button> */}
        { state.dice ?
          <button  className="full green" onClick={ () => {movePlayer(state.player ===0 ? 1: 0)} }>Move</button>
          :
          <button 
          style={{ opacity: state.playerCounter + 1 === 2 ? 0.5 : 1, cursor: state.playerCounter + 1 === 2 ? 'not-allowed' : 'pointer' }}
          disabled={state.playerCounter + 1 === 2} 
          className="full blue" onClick={ gameRollDice }>Roll</button>
        }
        <br></br>
        <button className="full grey" onClick={ () => { window.location.reload();} }>Reset</button>
      </div>
    </div>
    : 
    <div>
      <div className="player-info">
        <p>Select No of Players</p>
        <Dropdown options={options} onChange={onSelect} value={defaultOption} placeholder="Select an option" />
        {/* <div className="moves-to-win">
          You are <strong>5</strong> moves away from a perfect win.
        </div> */}
      </div>
      <div className="player-info">
        <p>Select type of Players</p>
        <Dropdown options={types} onChange={onSelect} value={'Computer'} placeholder="Select an option" />
        {/* <div className="moves-to-win">
          You are <strong>5</strong> moves away from a perfect win.
        </div> */}
      </div>

      <div className="m-t-20">
      {/* <button className="full green">Move</button> */}
      <button className="full green" onClick={ start }>Start</button>
      </div>
    </div>
  );
  return (
   
      <div>
        <aside id="main">
          <h2>Control Panel</h2>
            { 
              player_dashboard
            }
        </aside>
            <header id="main">
              <h1>Snakes &amp; Ladders</h1>
              </header>
            <div className="gameboard-container">
              <div id="gameboard" className="gameboard flex row">
                { state.gameboard.map( tile => {
                    return(
                      <Tile key={ tile.id } data={tile} />
                    )
                  })
                }
              </div>
                { <LadderContainer ladders={state.ladders} />
              }

              { state.snakes.length> 0 &&
                        <div className="snakes">
                          { state.snakes.map( snake => {
                              return <Snake key={ 'snake_' + snake.id } data={ snake } />
                            })
                          }
                        </div>
              }
              { state.players.length > 0 && 
                <div className="players">
                  { state.players.map( player => {
                      return(
                        <Player key={ 'player_' + player.id } data={ player } />
                      )
                    })
                  }
                </div>
              }
            </div>
          </div>
    
    );
}


export default App;
