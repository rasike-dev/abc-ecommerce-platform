import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import {
  productListReducer,
  productDetailsReducer,
  productDeleteReducer,
  productCreateReducer,
  productUpdateReducer,
  productReviewCreateReducer,
  productTopRatedReducer,
} from './reducers/productReducers';
import {
  productGroupListReducer,
  productGroupDetailsReducer,
  productGroupDeleteReducer,
  productGroupCreateReducer,
  productGroupUpdateReducer,
} from './reducers/productGroupReducers';
import { cartReducer } from './reducers/cartReducers';
import {
  userLoginReducer,
  userRegisterReducer,
  userDetailsReducer,
  userUpdateProfileReducer,
  userListReducer,
  userDeleteReducer,
  userUpdateReducer,
} from './reducers/userReducers';
import {
  orderCreateReducer,
  orderDetailsReducer,
  orderPayReducer,
  orderDeliverReducer,
  orderListMyReducer,
  orderListReducer,
  orderSessionReducer,
  orderValidatePaymentReducer,
} from './reducers/orderReducers';
import { carouselListReducer } from './reducers/carouselReducers';
import { wishlistReducer } from './reducers/wishlistReducers';
import { couponReducer } from './reducers/couponReducers';

const reducer = combineReducers({
  productList: productListReducer,
  productDetails: productDetailsReducer,
  productDelete: productDeleteReducer,
  productCreate: productCreateReducer,
  productUpdate: productUpdateReducer,
  productReviewCreate: productReviewCreateReducer,
  productTopRated: productTopRatedReducer,
  cart: cartReducer,
  userLogin: userLoginReducer,
  userRegister: userRegisterReducer,
  userDetails: userDetailsReducer,
  userUpdateProfile: userUpdateProfileReducer,
  userList: userListReducer,
  userDelete: userDeleteReducer,
  userUpdate: userUpdateReducer,
  orderCreate: orderCreateReducer,
  orderDetails: orderDetailsReducer,
  sessionDetails: orderSessionReducer,
  orderSession: orderSessionReducer,
  orderPay: orderPayReducer,
  orderDeliver: orderDeliverReducer,
  orderListMy: orderListMyReducer,
  orderList: orderListReducer,
  carouselList: carouselListReducer,
  groupList: productGroupListReducer,
  groupDetails: productGroupDetailsReducer,
  groupDelete: productGroupDeleteReducer,
  groupCreate: productGroupCreateReducer,
  groupUpdate: productGroupUpdateReducer,
  wishlist: wishlistReducer,
  coupon: couponReducer,
  orderValidatePayment: orderValidatePaymentReducer,
});

const cartItemsFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : [];

const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const shippingAddressFromStorage = localStorage.getItem('shippingAddress')
  ? JSON.parse(localStorage.getItem('shippingAddress'))
  : {};

const wishlistItemsFromStorage = localStorage.getItem('wishlistItems')
  ? JSON.parse(localStorage.getItem('wishlistItems'))
  : [];

const couponFromStorage = localStorage.getItem('coupon')
  ? JSON.parse(localStorage.getItem('coupon'))
  : null;

const initialState = {
  cart: {
    cartItems: cartItemsFromStorage,
    shippingAddress: shippingAddressFromStorage,
  },
  userLogin: { userInfo: userInfoFromStorage },
  wishlist: {
    wishlistItems: wishlistItemsFromStorage,
    loading: false,
  },
  coupon: couponFromStorage || {},
};

const middleware = [thunk];

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
