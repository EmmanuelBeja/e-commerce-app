import { AsyncStorage } from 'react-native';

export const LOGOUT = 'LOGOUT';
export const AUTHENTICATE = 'AUTHENTICATE';
export const UPDATE_ROLE = 'UPDATE_ROLE';

const API_KEY = 'AIzaSyAGml108XvrAfc6P7q-dhjGguLuZGj9Yo8';
let timer;

export const logout = () => {
  clearLogoutTimer();
  AsyncStorage.removeItem('userData');
  return { type: LOGOUT };
};

const clearLogoutTimer = () => {
  if (timer) {
    clearTimeout(timer);
  }
}

const setLogoutTimer = expiryTime => {
  return dispatch => {
    timer = setTimeout(() => {
      dispatch(logout())
    }, expiryTime);
  }
}

export const authenticate = (userId, token, expiryTime) => {
  return dispatch => {
    dispatch(setLogoutTimer(expiryTime));
    dispatch({
      type: AUTHENTICATE,
      data: {
        userId: userId,
        token: token
      }
    });
  }
};

export const signup = (email, password, role) => {
  return async dispatch => {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password,
        returnSecureToken: true
      })
    })

    if (!response.ok) {
      const errData = await response.json();
      let message = "Something went wrong";
      if (errData.error.message === 'EMAIL_EXISTS') {
        message = "User already exists.";
      } else if (errData.error.message === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
        message = "We have blocked all requests from this device due to unusual activity. Try again later."
      }
      throw new Error(message);
    }

    const resData = await response.json();
    dispatch(authenticate(resData.localId, resData.idToken, parseInt(resData.expiresIn) * 1000));
    dispatch(setRole(role))
    const expirationDate = new Date(
      new Date().getTime() + parseInt(resData.expiresIn) * 1000
    );
    saveDataToLocalStorage(resData.idToken, resData.localId, expirationDate);
  }
};

export const login = (email, password) => {
  return async dispatch => {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password,
        returnSecureToken: true
      })
    })

    if (!response.ok) {
      const errData = await response.json();
      let message = "Something went wrong";
      if (errData.error.message === 'EMAIL_NOT_FOUND' || errData.error.message === 'INVALID_PASSWORD') {
        message = "You entered the wrong credentials";
      }
      throw new Error(message);
    }

    const resData = await response.json();
    dispatch(authenticate(resData.localId, resData.idToken, parseInt(resData.expiresIn) * 1000));
    dispatch(getRole());
    const expirationDate = new Date(
      new Date().getTime() + parseInt(resData.expiresIn) * 1000
    );
    saveDataToLocalStorage(resData.idToken, resData.localId, expirationDate);
  }
};

const saveDataToLocalStorage = (token, userId, expiryDate) => {
  AsyncStorage.setItem('userData', JSON.stringify({
    token: token,
    userId: userId,
    expiryDate: expiryDate.toISOString()
  }));
  return;
}


const setRole = (role) => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const userId = getState().authReducer.userId;
    const response = await fetch(`https://weedr-478cc.firebaseio.com/users/${userId}.json?auth=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        role
      })
    });

    const resData = await response.json();
    dispatch({
      type: UPDATE_ROLE,
      role: role,
      roleId: resData.id
    });
  }
}

export const changeRole = (role) => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const userId = getState().authReducer.userId;
    const response = await fetch(`https://weedr-478cc.firebaseio.com/users/${userId}.json?auth=${token}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        role
      })
    })

    const resData = await response.json();
    dispatch({
      type: UPDATE_ROLE,
      role: role
    });
  }
}

export const getRole = () => {
  return async (dispatch, getState) => {
    const userId = getState().authReducer.userId;
    // console.log('userId', userId);
    const response = await fetch(`https://weedr-478cc.firebaseio.com/users/${userId}.json`)
    const resData = await response.json();
    dispatch({
      type: UPDATE_ROLE,
      role: resData.role
    });
    // console.log('resData===', resData);
    // let role;
    // for (const key in resData) {
    //   role = resData[key].role;
    // };
    // console.log('role=====', role);
    return resData.role;
  }
}
