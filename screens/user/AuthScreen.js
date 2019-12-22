import React, { useState, useReducer, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  ImageBackground,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useDispatch } from 'react-redux';

import * as authActions from '../../store/actions/auth';
import CustomInput from '../../components/UI/CustomInput';
import Card from '../../components/UI/Card';
import Colors from '../../constants/Colors';


const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';
const formReducer = (state, action) => {
  if (action.type === 'FORM_INPUT_UPDATE') {
    const updatedValues = {
      ...state.inputValues,
      [action.input]: action.value
    };
    const updatedValidities = {
      ...state.inputValidities,
      [action.input]: action.isValid
    };
    let updatedFormIsValid = true;
    for (const key in updatedValidities) {
      updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
    }
    return {
      formIsValid: updatedFormIsValid,
      inputValidities: updatedValidities,
      inputValues: updatedValues
    };
  }
  return state;
};

const AuthScreen = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const dispatch = useDispatch();

  const authHandler = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isSignup) {
        await dispatch(authActions.signup(
          formState.inputValues.email,
          formState.inputValues.password,
          'customer'
        ))
      } else {
        await dispatch(authActions.login(
          formState.inputValues.email,
          formState.inputValues.password
        ))
      }
      props.navigation.navigate("Shop")
    } catch (e) {
      setError(e);
      setIsLoading(false);
    }
    return;
  }

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      email: '',
      password: ''
    },
    inputValidities: {
      email: false,
      password: false
    },
    formIsValid: false
  });

  const inputChangeHandler = useCallback((inputIdentifier, inputValue, inputValidity) => {
    setIsLoading(true);
    dispatchFormState({
      type: FORM_INPUT_UPDATE,
      value: inputValue,
      isValid: inputValidity,
      input: inputIdentifier
    });
    setIsLoading(false);
  }, [dispatchFormState]);

  useEffect(() => {
    if (error) {
      Alert.alert('Something went wrong!', error.message, [
        {text: 'Okay'}
      ]);
    }
  }, [error]);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={50}
      style={styles.screen}
    >
    <ImageBackground
      source={{
          uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQkja1FT3am8IaIygv_cuOPSHNd-l--YZAaXVcpSWl2Cuaynj4p'
        }}
      style={{width: '100%', height: '100%'}}>
      <View style={styles.container}>
        <Card style={styles.authContainer}>
          <ScrollView>
            <Text style={styles.appLogo}>Weedr</Text>
            <Text style={styles.title}>{isSignup ? "Signup" : "Login"}</Text>
            <CustomInput
              id="email"
              label="E-Mail"
              keyboardType="email-address"
              required
              email
              autoCapitalize="none"
              errorText="Please enter a valid email address."
              onInputChange={inputChangeHandler}
              initialValue=""
              style={styles.input}
            />
            <CustomInput
              id="password"
              label="Password"
              keyboardType="default"
              secureTextEntry
              required
              minLength={6}
              autoCapitalize="none"
              errorText="Please enter a valid password(6 character min)."
              onInputChange={inputChangeHandler}
              initialValue=""
              style={styles.input}
            />
            {isLoading
              ?
                <View style={styles.centered}>
                  <ActivityIndicator size="large" color={Colors.primary}/>
                </View>
              :
                <View style={styles.buttonContainer}>
                  <Button title={isSignup ? "Signup" : "Login"} color={'white'} onPress={authHandler} />
                </View>
            }

            <View style={styles.buttonContainer}>
              <Button
                title={isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                color={'white'}
                onPress={() => setIsSignup(prevState => !prevState)}
              />
            </View>
          </ScrollView>
        </Card>
      </View>
    </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  appLogo: {
    fontFamily: 'open-sans-bold',
    fontSize: 50,
    color: 'white',
    marginBottom: 60,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  authContainer: {
    width: '80%',
    maxWidth: 400,
    maxHeight: 500,
    padding: 20,
    backgroundColor: 'transparent'
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
    color: 'white'
  },
  input: {
    color: 'white'
  },
  buttonContainer: {
    marginTop: 10
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default AuthScreen;
