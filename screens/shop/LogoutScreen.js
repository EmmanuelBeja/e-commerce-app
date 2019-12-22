import React, { useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import { useDispatch } from 'react-redux';
import * as authActions from '../../store/actions/auth';

const LogoutScreen = props => {
  const dispatch = useDispatch();

  const exit = useCallback(async () => {
    const res = await dispatch(authActions.logout());
  }, [dispatch]);

  useEffect(() => {
    exit();
  }, [exit]);

  return (<View><Text>Logout Screen</Text></View>);
}

export default LogoutScreen;
