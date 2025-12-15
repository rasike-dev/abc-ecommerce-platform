import {
  cartReducer,
} from '../../reducers/cartReducers';
import {
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_SAVE_SHIPPING_ADDRESS,
  CART_SAVE_PAYMENT_METHOD,
  CART_CLEAR_ITEMS,
} from '../../constants/cartConstants';

describe('Cart Reducer', () => {
  const initialState = {
    cartItems: [],
    shippingAddress: {},
  };

  it('should return initial state', () => {
    expect(cartReducer(undefined, {})).toEqual(initialState);
  });

  describe('CART_ADD_ITEM', () => {
    it('should add new item to cart', () => {
      const newItem = {
        product: '1',
        name: 'Test Product',
        image: '/test.jpg',
        price: 100,
        month: 1,
      };

      const action = {
        type: CART_ADD_ITEM,
        payload: newItem,
      };

      const state = cartReducer(initialState, action);

      expect(state.cartItems).toHaveLength(1);
      expect(state.cartItems[0]).toEqual(newItem);
    });

    it('should update existing item in cart', () => {
      const existingItem = {
        product: '1',
        name: 'Test Product',
        price: 100,
        month: 1,
      };

      const stateWithItem = {
        ...initialState,
        cartItems: [existingItem],
      };

      const updatedItem = {
        ...existingItem,
        month: 2,
      };

      const action = {
        type: CART_ADD_ITEM,
        payload: updatedItem,
      };

      const state = cartReducer(stateWithItem, action);

      expect(state.cartItems).toHaveLength(1);
      expect(state.cartItems[0].month).toBe(2);
    });
  });

  describe('CART_REMOVE_ITEM', () => {
    it('should remove item from cart', () => {
      const stateWithItems = {
        ...initialState,
        cartItems: [
          { product: '1', name: 'Product 1' },
          { product: '2', name: 'Product 2' },
        ],
      };

      const action = {
        type: CART_REMOVE_ITEM,
        payload: '1',
      };

      const state = cartReducer(stateWithItems, action);

      expect(state.cartItems).toHaveLength(1);
      expect(state.cartItems[0].product).toBe('2');
    });

    it('should handle removing non-existent item', () => {
      const stateWithItems = {
        ...initialState,
        cartItems: [{ product: '1', name: 'Product 1' }],
      };

      const action = {
        type: CART_REMOVE_ITEM,
        payload: '999',
      };

      const state = cartReducer(stateWithItems, action);

      expect(state.cartItems).toHaveLength(1);
    });
  });

  describe('CART_SAVE_SHIPPING_ADDRESS', () => {
    it('should save shipping address', () => {
      const address = {
        address: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country',
      };

      const action = {
        type: CART_SAVE_SHIPPING_ADDRESS,
        payload: address,
      };

      const state = cartReducer(initialState, action);

      expect(state.shippingAddress).toEqual(address);
    });
  });

  describe('CART_SAVE_PAYMENT_METHOD', () => {
    it('should save payment method', () => {
      const action = {
        type: CART_SAVE_PAYMENT_METHOD,
        payload: 'PayPal',
      };

      const state = cartReducer(initialState, action);

      expect(state.paymentMethod).toBe('PayPal');
    });
  });

  describe('CART_CLEAR_ITEMS', () => {
    it('should clear all cart items', () => {
      const stateWithItems = {
        ...initialState,
        cartItems: [
          { product: '1', name: 'Product 1' },
          { product: '2', name: 'Product 2' },
        ],
      };

      const action = {
        type: CART_CLEAR_ITEMS,
      };

      const state = cartReducer(stateWithItems, action);

      expect(state.cartItems).toHaveLength(0);
      expect(state.cartItems).toEqual([]);
    });
  });
});

