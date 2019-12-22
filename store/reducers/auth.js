import { AUTHENTICATE, LOGOUT, UPDATE_ROLE } from '../actions/auth';
const initialState = {
  token: null,
  userId: null,
  role: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case AUTHENTICATE:
      return {
        token: action.data.token,
        userId: action.data.userId,
        role: action.role
      }
    case UPDATE_ROLE:
      return {...state, role: action.role};
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
}
