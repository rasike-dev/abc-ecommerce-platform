import {
  PRODUCT_GROUP_LIST_REQUEST,
  PRODUCT_GROUP_LIST_SUCCESS,
  PRODUCT_GROUP_LIST_FAIL,
  PRODUCT_GROUP_DETAILS_REQUEST,
  PRODUCT_GROUP_DETAILS_SUCCESS,
  PRODUCT_GROUP_DETAILS_FAIL,
  PRODUCT_GROUP_DELETE_SUCCESS,
  PRODUCT_GROUP_DELETE_REQUEST,
  PRODUCT_GROUP_DELETE_FAIL,
  PRODUCT_GROUP_CREATE_REQUEST,
  PRODUCT_GROUP_CREATE_SUCCESS,
  PRODUCT_GROUP_CREATE_FAIL,
  PRODUCT_GROUP_UPDATE_REQUEST,
  PRODUCT_GROUP_UPDATE_SUCCESS,
  PRODUCT_GROUP_UPDATE_FAIL,
} from '../constants/productGroupConstants';

export const productGroupListReducer = (state = { groups: [] }, action) => {
  switch (action.type) {
    case PRODUCT_GROUP_LIST_REQUEST:
      return { loading: true, groups: [] };
    case PRODUCT_GROUP_LIST_SUCCESS:
      return {
        loading: false,
        groups: action.payload.groups,
        pages: action.payload.pages,
        page: action.payload.page,
      };
    case PRODUCT_GROUP_LIST_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const productGroupDetailsReducer = (
  state = { group: { reviews: [] } },
  action
) => {
  switch (action.type) {
    case PRODUCT_GROUP_DETAILS_REQUEST:
      return { ...state, loading: true };
    case PRODUCT_GROUP_DETAILS_SUCCESS:
      return { loading: false, group: action.payload };
    case PRODUCT_GROUP_DETAILS_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const productGroupDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case PRODUCT_GROUP_DELETE_REQUEST:
      return { loading: true };
    case PRODUCT_GROUP_DELETE_SUCCESS:
      return { loading: false, success: true };
    case PRODUCT_GROUP_DELETE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const productGroupCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case PRODUCT_GROUP_CREATE_REQUEST:
      return { loading: true };
    case PRODUCT_GROUP_CREATE_SUCCESS:
      return { loading: false, success: true, group: action.payload };
    case PRODUCT_GROUP_CREATE_FAIL:
      return { loading: false, error: action.payload };
    // case PRODUCT_GROUP_CREATE_RESET:
    //   return {};
    default:
      return state;
  }
};

export const productGroupUpdateReducer = (state = { group: {} }, action) => {
  switch (action.type) {
    case PRODUCT_GROUP_UPDATE_REQUEST:
      return { loading: true };
    case PRODUCT_GROUP_UPDATE_SUCCESS:
      return { loading: false, success: true, group: action.payload };
    case PRODUCT_GROUP_UPDATE_FAIL:
      return { loading: false, error: action.payload };
    // case PRODUCT_GROUP_UPDATE_RESET:
    //   return { group: {} };
    default:
      return state;
  }
};
