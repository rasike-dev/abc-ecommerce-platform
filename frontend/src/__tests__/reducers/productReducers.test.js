import {
  productListReducer,
  productDetailsReducer,
  productDeleteReducer,
  productCreateReducer,
  productUpdateReducer,
  productReviewCreateReducer,
  productTopRatedReducer,
} from '../../reducers/productReducers';
import {
  PRODUCT_LIST_REQUEST,
  PRODUCT_LIST_SUCCESS,
  PRODUCT_LIST_FAIL,
  PRODUCT_DETAILS_REQUEST,
  PRODUCT_DETAILS_SUCCESS,
  PRODUCT_DETAILS_FAIL,
  PRODUCT_DELETE_REQUEST,
  PRODUCT_DELETE_SUCCESS,
  PRODUCT_DELETE_FAIL,
  PRODUCT_CREATE_REQUEST,
  PRODUCT_CREATE_SUCCESS,
  PRODUCT_CREATE_FAIL,
  PRODUCT_CREATE_RESET,
  PRODUCT_UPDATE_REQUEST,
  PRODUCT_UPDATE_SUCCESS,
  PRODUCT_UPDATE_FAIL,
  PRODUCT_UPDATE_RESET,
  PRODUCT_CREATE_REVIEW_REQUEST,
  PRODUCT_CREATE_REVIEW_SUCCESS,
  PRODUCT_CREATE_REVIEW_FAIL,
  PRODUCT_CREATE_REVIEW_RESET,
  PRODUCT_TOP_REQUEST,
  PRODUCT_TOP_SUCCESS,
  PRODUCT_TOP_FAIL,
} from '../../constants/productConstants';

describe('Product List Reducer', () => {
  it('should return initial state', () => {
    expect(productListReducer(undefined, {})).toEqual({ products: [] });
  });

  it('should handle PRODUCT_LIST_REQUEST', () => {
    const action = { type: PRODUCT_LIST_REQUEST };
    const state = productListReducer(undefined, action);
    expect(state).toEqual({ loading: true, products: [] });
  });

  it('should handle PRODUCT_LIST_SUCCESS', () => {
    const payload = {
      products: [{ _id: '1', name: 'Product 1' }],
      pages: 5,
      page: 1,
    };
    const action = { type: PRODUCT_LIST_SUCCESS, payload };
    const state = productListReducer(undefined, action);
    expect(state).toEqual({
      loading: false,
      products: payload.products,
      pages: payload.pages,
      page: payload.page,
    });
  });

  it('should handle PRODUCT_LIST_FAIL', () => {
    const action = { type: PRODUCT_LIST_FAIL, payload: 'Error message' };
    const state = productListReducer(undefined, action);
    expect(state).toEqual({ loading: false, error: 'Error message' });
  });
});

describe('Product Details Reducer', () => {
  it('should return initial state', () => {
    expect(productDetailsReducer(undefined, {})).toEqual({
      product: { reviews: [] },
    });
  });

  it('should handle PRODUCT_DETAILS_REQUEST', () => {
    const action = { type: PRODUCT_DETAILS_REQUEST };
    const state = productDetailsReducer(undefined, action);
    expect(state.loading).toBe(true);
  });

  it('should handle PRODUCT_DETAILS_SUCCESS', () => {
    const product = { _id: '1', name: 'Product 1', reviews: [] };
    const action = { type: PRODUCT_DETAILS_SUCCESS, payload: product };
    const state = productDetailsReducer(undefined, action);
    expect(state).toEqual({ loading: false, product });
  });

  it('should handle PRODUCT_DETAILS_FAIL', () => {
    const action = { type: PRODUCT_DETAILS_FAIL, payload: 'Error message' };
    const state = productDetailsReducer(undefined, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Error message');
  });
});

describe('Product Delete Reducer', () => {
  it('should handle PRODUCT_DELETE_REQUEST', () => {
    const action = { type: PRODUCT_DELETE_REQUEST };
    const state = productDeleteReducer(undefined, action);
    expect(state).toEqual({ loading: true });
  });

  it('should handle PRODUCT_DELETE_SUCCESS', () => {
    const action = { type: PRODUCT_DELETE_SUCCESS };
    const state = productDeleteReducer(undefined, action);
    expect(state).toEqual({ loading: false, success: true });
  });

  it('should handle PRODUCT_DELETE_FAIL', () => {
    const action = { type: PRODUCT_DELETE_FAIL, payload: 'Error message' };
    const state = productDeleteReducer(undefined, action);
    expect(state).toEqual({ loading: false, error: 'Error message' });
  });
});

describe('Product Create Reducer', () => {
  it('should handle PRODUCT_CREATE_REQUEST', () => {
    const action = { type: PRODUCT_CREATE_REQUEST };
    const state = productCreateReducer(undefined, action);
    expect(state).toEqual({ loading: true });
  });

  it('should handle PRODUCT_CREATE_SUCCESS', () => {
    const product = { _id: '1', name: 'New Product' };
    const action = { type: PRODUCT_CREATE_SUCCESS, payload: product };
    const state = productCreateReducer(undefined, action);
    expect(state).toEqual({ loading: false, success: true, product });
  });

  it('should handle PRODUCT_CREATE_FAIL', () => {
    const action = { type: PRODUCT_CREATE_FAIL, payload: 'Error message' };
    const state = productCreateReducer(undefined, action);
    expect(state).toEqual({ loading: false, error: 'Error message' });
  });

  it('should handle PRODUCT_CREATE_RESET', () => {
    const action = { type: PRODUCT_CREATE_RESET };
    const state = productCreateReducer({ loading: false, success: true }, action);
    expect(state).toEqual({});
  });
});

describe('Product Update Reducer', () => {
  it('should handle PRODUCT_UPDATE_REQUEST', () => {
    const action = { type: PRODUCT_UPDATE_REQUEST };
    const state = productUpdateReducer(undefined, action);
    expect(state).toEqual({ loading: true, product: {} });
  });

  it('should handle PRODUCT_UPDATE_SUCCESS', () => {
    const product = { _id: '1', name: 'Updated Product' };
    const action = { type: PRODUCT_UPDATE_SUCCESS, payload: product };
    const state = productUpdateReducer(undefined, action);
    expect(state).toEqual({ loading: false, success: true, product });
  });

  it('should handle PRODUCT_UPDATE_FAIL', () => {
    const action = { type: PRODUCT_UPDATE_FAIL, payload: 'Error message' };
    const state = productUpdateReducer(undefined, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Error message');
  });

  it('should handle PRODUCT_UPDATE_RESET', () => {
    const action = { type: PRODUCT_UPDATE_RESET };
    const state = productUpdateReducer({ loading: false, success: true }, action);
    expect(state).toEqual({ product: {} });
  });
});

describe('Product Review Create Reducer', () => {
  it('should handle PRODUCT_CREATE_REVIEW_REQUEST', () => {
    const action = { type: PRODUCT_CREATE_REVIEW_REQUEST };
    const state = productReviewCreateReducer(undefined, action);
    expect(state).toEqual({ loading: true });
  });

  it('should handle PRODUCT_CREATE_REVIEW_SUCCESS', () => {
    const action = { type: PRODUCT_CREATE_REVIEW_SUCCESS };
    const state = productReviewCreateReducer(undefined, action);
    expect(state).toEqual({ loading: false, success: true });
  });

  it('should handle PRODUCT_CREATE_REVIEW_FAIL', () => {
    const action = { type: PRODUCT_CREATE_REVIEW_FAIL, payload: 'Error message' };
    const state = productReviewCreateReducer(undefined, action);
    expect(state).toEqual({ loading: false, error: 'Error message' });
  });

  it('should handle PRODUCT_CREATE_REVIEW_RESET', () => {
    const action = { type: PRODUCT_CREATE_REVIEW_RESET };
    const state = productReviewCreateReducer({ loading: false, success: true }, action);
    expect(state).toEqual({});
  });
});

describe('Product Top Rated Reducer', () => {
  it('should return initial state', () => {
    expect(productTopRatedReducer(undefined, {})).toEqual({ products: [] });
  });

  it('should handle PRODUCT_TOP_REQUEST', () => {
    const action = { type: PRODUCT_TOP_REQUEST };
    const state = productTopRatedReducer(undefined, action);
    expect(state).toEqual({ loading: true, products: [] });
  });

  it('should handle PRODUCT_TOP_SUCCESS', () => {
    const products = [{ _id: '1', name: 'Top Product' }];
    const action = { type: PRODUCT_TOP_SUCCESS, payload: products };
    const state = productTopRatedReducer(undefined, action);
    expect(state).toEqual({ loading: false, products });
  });

  it('should handle PRODUCT_TOP_FAIL', () => {
    const action = { type: PRODUCT_TOP_FAIL, payload: 'Error message' };
    const state = productTopRatedReducer(undefined, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Error message');
  });
});

