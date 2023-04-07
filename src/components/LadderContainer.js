import React from 'react';
import Ladder from './Ladder';

let LadderContainer = ( props ) => {

	return (
		<div className="ladders">

			{ props.ladders.map( ladder => {
					return(
						<Ladder key={ 'ladder_' + ladder.id } data={ ladder } />
					)
				})
			}

		</div>
	)

}

export default LadderContainer;