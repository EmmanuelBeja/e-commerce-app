import React, { useState, useReducer, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  AsyncStorage
} from 'react-native';
import { useDispatch } from 'react-redux';

import Colors from '../constants/Colors';
import * as authActions from '../store/actions/auth';

const StartupScreen = props => {
  const dispatch = useDispatch();
  useEffect(() => {
    const tryLogin = async () => {
      // NOTE: .getItem is an async function
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        props.navigation.navigate('Auth');
        return;
      }
      const transformedData = JSON.parse(userData);
      const {token, userId, expiryDate} = transformedData;
      const expirationDate = new Date(expiryDate);
      if (expirationDate <= new Date() || !token || !userId) {
        props.navigation.navigate('Auth');
        return;
      }
      const expirationTime = expirationDate.getTime() - new Date().getTime();
      dispatch(authActions.authenticate(userId, token, expirationTime));
      props.navigation.navigate('Shop');
    };
    tryLogin();
  }, [dispatch])

  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default StartupScreen;
