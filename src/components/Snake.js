import React, { useState, useEffect } from 'react';
import * as Helper from '../utils/Helper';

let Snake = ( props ) => {

	const { data } = props;
    let [styles, setStyles]= useState({});

    useEffect(() => {
        styles =  Helper.generateSnakeStyle( data );
        setStyles((prev) =>({...prev, ...styles}));
      }, []);

	return (
		<div className="snake" style={styles}>
		</div>
	)


}

export default Snake;