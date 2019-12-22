import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  Platform,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';

import HeaderButton from '../../components/UI/HeaderButton';
import ProductItem from '../../components/shop/ProductItem';
import * as cartActions from '../../store/actions/cart';
import Colors from '../../constants/Colors';
import * as productActions from '../../store/actions/products';
import * as authActions from '../../store/actions/auth';

const ProductsOverviewScreen = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRole, setIsLoadingRole] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const products = useSelector(state => state.productReducer.availableProducts);
  const dispatch = useDispatch();

  const loadProducts = useCallback(async () => {
    setError(null);
    setIsRefreshing(true);
    try {
      await dispatch(productActions.fetchProducts());
    } catch (e) {
      setError(e);
    }
    setIsRefreshing(false);
  }, [dispatch]);

  const checkRole = useCallback(async () => {
    setIsLoadingRole(true);
    const res = await dispatch(authActions.getRole());
    setUserRole(res);
    setIsLoadingRole(false);
  }, [dispatch]);

  useEffect(() => {
    setIsLoading(true);
    checkRole();
    loadProducts().then(() => setIsLoading(false));
  }, [loadProducts, checkRole]);

  useEffect(() => {
    // fetch data when user changes page to update store
    const willFocusSub = props.navigation.addListener('willFocus', loadProducts);
    return () => {
      // clean up the listener
      willFocusSub.remove();
    }
  }, loadProducts);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary}/>
      </View>
    )
  };

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Ooops! Something went wrong.</Text>
        <Button
          title="Try Again"
          onPress={loadProducts}
          color={Colors.primary}
        />
      </View>
    )
  };

  // handle going to next page
  const selectItemHandler = (item) => {
    props.navigation.navigate('ProductDetail', { product: item });
  };

  const becomeSeller = async () => {
    setIsLoadingRole(true);
    await dispatch(authActions.changeRole('seller'));
    setIsLoadingRole(false);
  };

  const goToShop = () => {
    props.navigation.navigate('Admin');
  }

  return (
    <>
    <View style={{justifyContent: 'center', paddingTop: 10}}>
      {isLoadingRole
        ? <Text style={styles.loader}>Loading...</Text>
        : userRole === 'seller' ?  (
          <Button
            title="Go to your Shop. Click here."
            onPress={goToShop}
            color={Colors.primary}
          />
        ) : (
          <Button
            title="Have some weed? Join other Sellers."
            onPress={becomeSeller}
            color={Colors.primary}
          />
        )
      }
    </View>
    {!isLoading && products.length === 0 ?
        <View style={styles.centered}>
          <Text>We have no products yet. 🤷🏽</Text>
           <Text>Check later.</Text>
        </View>
      :
      <FlatList
        onRefresh={loadProducts}
        refreshing={isRefreshing}
        data={products}
        keyExtractor={item => item.id}
        renderItem={itemData => (
          <ProductItem
            image={itemData.item.imageUrl}
            title={itemData.item.title}
            price={itemData.item.price}
            onSelect={() => {
              selectItemHandler(itemData.item);
            }}
          >
            <Button
              color={Colors.primary}
              title="View Details"
              onPress={() => {
                selectItemHandler(itemData.item);
              }}
              style={styles.button}
            />
            <Button
              color={Colors.primary}
              title="Add To Cart"
              onPress={() => {
                dispatch(cartActions.addToCart(itemData.item));
              }}
              style={styles.button}
            />
          </ProductItem>
        )}
      />
    }
    </>
  );
};

ProductsOverviewScreen.navigationOptions = navData => {
  return {
    headerTitle: 'Weedr',
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
    ),
    headerRight: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Cart"
          iconName={Platform.OS === 'android' ? 'md-cart' : 'ios-cart'}
          onPress={() => {
            navData.navigation.navigate('Cart');
          }}
        />
      </HeaderButtons>
    )
  };
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 10
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loader: {
    textAlign: 'center',
  }
});

export default ProductsOverviewScreen;
