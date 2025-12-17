import axios from '../utils/axios';
import {
  WISHLIST_ADD_ITEM,
  WISHLIST_REMOVE_ITEM,
  WISHLIST_LIST_REQUEST,
  WISHLIST_LIST_SUCCESS,
  WISHLIST_LIST_FAIL,
  WISHLIST_CLEAR,
} from '../constants/wishlistConstants';

export const getWishlist = () => async (dispatch, getState) => {
  try {
    dispatch({ type: WISHLIST_LIST_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`/wishlist`, config);

    dispatch({
      type: WISHLIST_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: WISHLIST_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const addToWishlist = (productId) => async (dispatch, getState) => {
  try {
    const {
      userLogin: { userInfo },
    } = getState();

    if (!userInfo || !userInfo.token) {
      console.error('User not logged in or token missing');
      return;
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post(
      `/wishlist`,
      { productId },
      config
    );

    dispatch({
      type: WISHLIST_ADD_ITEM,
      payload: data,
    });
    
    // Store in localStorage
    localStorage.setItem('wishlistItems', JSON.stringify(data.items));
  } catch (error) {
    // Handle error silently or show message
    console.error('Error adding to wishlist:', error);
    console.error('Error details:', error.response?.data);
  }
};

export const removeFromWishlist = (productId) => async (dispatch, getState) => {
  try {
    const {
      userLogin: { userInfo },
    } = getState();

    if (!userInfo || !userInfo.token) {
      console.error('User not logged in or token missing');
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.delete(`/wishlist/${productId}`, config);

    dispatch({
      type: WISHLIST_REMOVE_ITEM,
      payload: data,
    });
    
    // Store in localStorage
    localStorage.setItem('wishlistItems', JSON.stringify(data.items));
  } catch (error) {
    console.error('Error removing from wishlist:', error);
  }
};

export const clearWishlist = () => async (dispatch, getState) => {
  try {
    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.delete(`/wishlist`, config);

    dispatch({ type: WISHLIST_CLEAR });
    
    // Clear from localStorage
    localStorage.removeItem('wishlistItems');
  } catch (error) {
    console.error('Error clearing wishlist:', error);
  }
};

