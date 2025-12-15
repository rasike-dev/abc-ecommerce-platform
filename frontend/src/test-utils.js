import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

// Mock reducers for testing
const mockReducer = (initialState = {}) => (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

/**
 * Custom render function that wraps components with Redux Provider and Router
 * @param {React.Component} ui - Component to render
 * @param {Object} options - Options for rendering
 * @param {Object} options.initialState - Initial Redux state
 * @param {Object} options.store - Custom Redux store
 * @param {Array} options.middleware - Redux middleware
 * @returns {Object} - Render result
 */
export const renderWithProviders = (
  ui,
  {
    initialState = {},
    store = createStore(
      mockReducer(initialState),
      initialState,
      composeWithDevTools(applyMiddleware(thunk))
    ),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <Router>{children}</Router>
    </Provider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
  };
};

/**
 * Create mock store with initial state
 */
export const createMockStore = (initialState = {}) => {
  return createStore(
    mockReducer(initialState),
    initialState,
    composeWithDevTools(applyMiddleware(thunk))
  );
};

/**
 * Mock product data for testing
 */
export const mockProduct = {
  _id: '1',
  name: 'Test Product',
  image: '/images/test.jpg',
  description: 'Test Description',
  teacher: 'Test Teacher',
  grade: '10',
  subject: 'Mathematics',
  price: 1000,
  countInStock: 10,
  rating: 4.5,
  numReviews: 10,
  isBestseller: true,
  isNewCourse: false,
  isPopular: false,
  enrollmentCount: 100,
};

/**
 * Mock user data for testing
 */
export const mockUser = {
  _id: '1',
  name: 'Test User',
  email: 'test@example.com',
  isAdmin: false,
  token: 'test-token',
};

/**
 * Mock order data for testing
 */
export const mockOrder = {
  _id: '1',
  orderItems: [
    {
      name: 'Test Product',
      qty: 2,
      image: '/images/test.jpg',
      price: 1000,
      product: '1',
    },
  ],
  shippingAddress: {
    address: '123 Test St',
    city: 'Test City',
    postalCode: '12345',
    country: 'Test Country',
  },
  paymentMethod: 'PayPal',
  itemsPrice: 2000,
  taxPrice: 200,
  shippingPrice: 100,
  totalPrice: 2300,
  isPaid: false,
  isDelivered: false,
  user: mockUser,
};

/**
 * Mock cart item for testing
 */
export const mockCartItem = {
  product: '1',
  name: 'Test Product',
  image: '/images/test.jpg',
  price: 1000,
  countInStock: 10,
  month: 1,
};

export default renderWithProviders;

