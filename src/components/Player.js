import React, { useState, useEffect } from 'react';
import * as Helper from '../utils/Helper';



let Player = ( props ) => {

	const { data } = props;

	let [styles, setStyles]= useState({});

      useEffect(() => {
        styles =  Helper.getPlayerPositionCSSStyles( data );
        setStyles((prev) =>({...prev, ...styles}));
      }, [data.index]);



	return (
		<div className="player" style={styles}>
			<span>{ data.id }</span>
		</div>
	)


}



export default Player;

