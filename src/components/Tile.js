import React from 'react';

let Tile = ( props ) => {

	const { data } = props;

	return (
		<div className={ 'tile ' + data.style } id={ 'tile_' + data.id }>
			<span className="number">{ data.id }</span>
		</div>
	)


}

export default Tile;