import './App.css';

import React from 'react';
import * as Helper from './utils/Helper';

import Tile from './components/Tile';
import LadderContainer from './components/LadderContainer';
import Snake from './components/Snake';

function App() {
  const gameboard = Helper.generateGameboard();
  const snakes = Helper.generateSnakes(2);
  const ladders = Helper.generateLadders(1);
  return (
		<div>
      <header id="main">
        <h1>Snakes &amp; Ladders</h1>
        </header>
			<div className="gameboard-container">
        <div id="gameboard" className="gameboard flex row">
          { gameboard.map( tile => {
              return(
                <Tile key={ tile.id } data={tile} />
              )
            })
          }
        </div>
          {	<LadderContainer ladders={ladders} />
				}

        { snakes.length> 0 &&
                  <div className="snakes">
                    { snakes.map( snake => {
                        return <Snake key={ 'snake_' + snake.id } data={ snake } />
                      })
                    }
                  </div>
                }
			</div>
		</div>
    );
}


export default App;
