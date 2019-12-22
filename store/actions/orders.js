import Order from '../../models/order';
export const ADD_ORDER = 'ADD_ORDER';
export const SET_ORDERS = 'SET_ORDERS';

export const fetchOrders = () => {
  return async (dispatch, getState) => {
    const userId = getState().authReducer.userId;
    try {
      const response = await fetch(`https://weedr-478cc.firebaseio.com/orders/${userId}.json`);
      if (!response.ok) {
        throw new Error('Ooops! Something went wrong.');
      }
      const resData = await response.json();
      const loadedOrders = [];
      for (const key in resData) {
        loadedOrders.push(
          new Order(
            key,
            resData[key].cartItems,
            resData[key].totalAmount,
            new Date(resData[key].date) // convert date string to date object
          )
        )
      };
      dispatch({
        type: SET_ORDERS,
        orders: loadedOrders
      });
    } catch (e) {
      throw e;
    }
  }
};

export const addOrder = (cartItems, totalAmount) => {
  return async (dispatch, getState) => {
    const token = getState().authReducer.token;
    const userId = getState().authReducer.userId;
    const date = new Date().toISOString();
    const response = await fetch(`https://weedr-478cc.firebaseio.com/orders/${userId}.json?auth=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cartItems,
        totalAmount,
        date
      })
    })

    const resData = await response.json();
    dispatch({
      type: ADD_ORDER,
      orderData: { id: resData.name, items: cartItems, amount: totalAmount, date: date }
    });
  }
};
