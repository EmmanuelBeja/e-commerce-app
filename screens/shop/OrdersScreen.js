import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, Button, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';

import HeaderButton from '../../components/UI/HeaderButton';
import OrderItem from '../../components/shop/OrderItem';
import * as ordersActions from '../../store/actions/orders';
import Colors from '../../constants/Colors';

const OrdersScreen = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const orders = useSelector(state => state.orderReducer.orders);
  const dispatch = useDispatch();

  const loadedOrders = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      await dispatch(ordersActions.fetchOrders());
    } catch (e) {
      setError(e);
    }
    setIsLoading(false);
  }, [dispatch]);

  useEffect(() => {
    loadedOrders();
  }, [loadedOrders]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary}/>
      </View>
    )
  };

  if (!isLoading && orders.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>Seems like you made no orders yet. 🤷🏽‍</Text>
      </View>
    )
  };

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Ooops! Something went wrong.</Text>
        <Button
          title="Try Again"
          onPress={loadedOrders}
          color={Colors.primary}
        />
      </View>
    )
  };

  return (
    <FlatList
      data={orders}
      keyExtractor={item => item.id}
      renderItem={itemData => (
        <OrderItem
          amount={itemData.item.totalAmount}
          date={itemData.item.readableDate}
          items={itemData.item.items}
        />
      )}
    />
  );
};

OrdersScreen.navigationOptions = navData => {
  return {
    headerTitle: 'Your Orders',
    headerLeft: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Menu"
          iconName={Platform.OS === 'android' ? 'md-menu' : 'ios-menu'}
          onPress={() => {
            navData.navigation.toggleDrawer();
          }}
        />
      </HeaderButtons>
    )
  };
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
export default OrdersScreen;
