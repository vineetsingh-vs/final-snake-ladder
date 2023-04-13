import './App.css';

import React, { useState, useEffect } from 'react';
import * as Helper from './utils/Helper';


import Tile from './components/Tile';
import LadderContainer from './components/LadderContainer';
import Snake from './components/Snake';
import Player from './components/Player';

const { ipcRenderer } = window.require('electron');
// const remote = electron.remote
// const {dialog} = remote

function App() {

  let [state, setState] = useState({
    gameboard: Helper.generateGameboard(),
    snakes: Helper.generateSnakes(2),
    ladders: Helper.generateLadders(1),
    players:  Helper.generatePlayers(1),
    dice: null
  });


 

  const gameRollDice = () => {
    setState(previous => ({...previous, dice: Math.floor((Math.random() * 6) + 1)}));
  }

  const movePlayer =() => {
    
    let data = {
			id: state.players[0].id,
			moves: state.dice,
			tile: state.players[0].tile,
			index: state.players[0].index,
		};
    playerUpdatePosition(data);
    setTimeout((data) => {
      setState(previous => ({...previous, dice: null}));
    },100)
   
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
		<div>
			<div className="player-info">
				<p>Current Player</p>
				<p className="name">{state.players[0].name}</p>
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
					<button className="full green" onClick={ movePlayer }>Move</button>
					:
					<button className="full blue" onClick={ gameRollDice }>Roll</button>
				}
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
                {	<LadderContainer ladders={state.ladders} />
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
