import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { NavigationActions } from 'react-navigation';

import WeedrNavigator from './';

const NavigationContainer = props => {
  const navRef = useRef();
  const isAuth = useSelector(state => !!state.authReducer.token);

  useEffect(() => {
    if (!isAuth) {
      navRef.current.dispatch(
        NavigationActions.navigate({ routeName: 'Auth' })
      );
    }
  }, [isAuth]);

  return <WeedrNavigator ref={navRef} />;
};

export default NavigationContainer;
