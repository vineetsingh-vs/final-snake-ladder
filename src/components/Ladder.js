import React, { useState, useEffect } from 'react';
import * as Helper from '../utils/Helper';

let Ladder = ( props ) => {

	const { data } = props;
    let [styles, setStyles]= useState({});
   
    
    useEffect(() => {
        // Update the document title using the browser API
        // setStyles((previousState) => {
        //     const state = Helper.generateLadderStyle( data );
        //     return{...previousState, state};
        // }); 
        styles =  Helper.generateLadderStyle( data );
        setStyles((prev) =>({...prev, ...styles}));
      }, []);
	

	return (
		<div className="ladder" style={styles}>
		</div>
	)

}

export default Ladder;