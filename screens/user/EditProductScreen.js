import React, {
  useState,
  useEffect,
  useCallback,
  useReducer
} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useSelector, useDispatch } from 'react-redux';

import HeaderButton from '../../components/UI/HeaderButton';
import CustomInput from '../../components/UI/CustomInput';
import * as productsActions from '../../store/actions/products';
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
  return state
};

const EditProductScreen = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const prodId = props.navigation.getParam('productId');
  const editedProduct = useSelector(state =>
    state.productReducer.userProducts.find(prod => prod.id === prodId)
  );
  const dispatch = useDispatch();

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      title: editedProduct ? editedProduct.title : '',
      imageUrl: editedProduct ? editedProduct.imageUrl : '',
      description: editedProduct ? editedProduct.description : '',
      price: editedProduct ? editedProduct.price : ''
    },
    inputValidities: {
      title: editedProduct ? true : false,
      imageUrl: editedProduct ? true : false,
      description: editedProduct ? true : false,
      price: editedProduct ? true : false
    },
    formIsValid: editedProduct ? true : false
  });

  useEffect(() => {
    if (error) {
      Alert.alert('An error occured', error, [{ text: 'okay' }]);
    }
  }, [error])

  const submitHandler = useCallback(async () => {
    if (!formState.formIsValid) {
      Alert.alert('Wrong input!', 'Please check the errors in the form.', [
        {text: 'Okay'}
      ]);
      return;
    }
    setError(null)
    setIsLoading(true);
    try {
      if (editedProduct) {
        await dispatch(
          productsActions.updateProduct(
            prodId,
            formState.inputValues.title,
            formState.inputValues.description,
            formState.inputValues.imageUrl
          )
        );
      } else {
        await dispatch(
          productsActions.createProduct(
            formState.inputValues.title,
            formState.inputValues.description,
            formState.inputValues.imageUrl,
            +formState.inputValues.price
          )
        );
      }
      props.navigation.goBack();
    } catch (e) {
      setError(e.message);
    }
    setIsLoading(false);

  }, [dispatch, prodId, formState]);

  useEffect(() => {
    props.navigation.setParams({ submit: submitHandler });
  }, [submitHandler]);

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

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary}/>
      </View>
    )
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior='padding'
      keyboardVerticalOffset={100}
    >
      <ScrollView>
        <View style={styles.form}>
          <CustomInput
            id='title'
            label='Title'
            errorText='Please enter a valid title'
            keyboardType='default'
            autoCapitalize='sentences'
            autoCorrect
            returnKeyType='next'
            onInputChange={inputChangeHandler}
            inputValue={editedProduct ? editedProduct.title : ''}
            initiallyValid={!!editedProduct}
            required
          />
          <CustomInput
            id='imageUrl'
            label='Image Url'
            errorText='Please enter a valid image url'
            keyboardType='default'
            autoCapitalize='sentences'
            returnKeyType='next'
            onInputChange={inputChangeHandler}
            inputValue={editedProduct ? editedProduct.imageUrl : ''}
            initiallyValid={!!editedProduct}
            required
          />
          {editedProduct ? null : (
            <CustomInput
              id='price'
              label='Price'
              errorText='Please enter a valid price'
              keyboardType='decimal-pad'
              returnKeyType='next'
              onInputChange={inputChangeHandler}
              required
              min={0.1}
            />
          )}
          <CustomInput
            id='description'
            label='Description'
            errorText='Please enter a valid description'
            keyboardType='default'
            autoCapitalize='sentences'
            autoCorrect
            multiline
            numberOfLines={3}
            onInputChange={inputChangeHandler}
            inputValue={editedProduct ? editedProduct.description : ''}
            initiallyValid={!!editedProduct}
            required
            minLength={5}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

EditProductScreen.navigationOptions = navData => {
  const submitFn = navData.navigation.getParam('submit');
  return {
    headerTitle: navData.navigation.getParam('productId')
      ? 'Edit Product'
      : 'Add Product',
    headerRight: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Save"
          iconName={
            Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'
          }
          onPress={submitFn}
        />
      </HeaderButtons>
    )
  };
};

const styles = StyleSheet.create({
  form: {
    margin: 20
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default EditProductScreen;
