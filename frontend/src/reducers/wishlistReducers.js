import {
  WISHLIST_ADD_ITEM,
  WISHLIST_REMOVE_ITEM,
  WISHLIST_LIST_REQUEST,
  WISHLIST_LIST_SUCCESS,
  WISHLIST_LIST_FAIL,
  WISHLIST_CLEAR,
} from '../constants/wishlistConstants';

export const wishlistReducer = (
  state = { wishlistItems: [], loading: false },
  action
) => {
  switch (action.type) {
    case WISHLIST_LIST_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case WISHLIST_LIST_SUCCESS:
      return {
        loading: false,
        wishlistItems: action.payload.items || [],
        error: null,
      };
    case WISHLIST_LIST_FAIL:
      return {
        loading: false,
        error: action.payload,
        wishlistItems: [],
      };
    case WISHLIST_ADD_ITEM:
      return {
        ...state,
        wishlistItems: action.payload.items || [],
        error: null,
      };
    case WISHLIST_REMOVE_ITEM:
      return {
        ...state,
        wishlistItems: action.payload.items || [],
        error: null,
      };
    case WISHLIST_CLEAR:
      return {
        wishlistItems: [],
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

