import { combineReducers } from 'redux';

import productReducer from './products';
import cartReducer from './cart';
import orderReducer from './orders';
import authReducer from './auth';

const rootReducer = combineReducers({
  productReducer: productReducer,
  cartReducer: cartReducer,
  orderReducer: orderReducer,
  authReducer: authReducer
});

export default rootReducer;
