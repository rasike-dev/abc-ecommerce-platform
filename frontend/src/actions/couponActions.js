import axios from '../utils/axios';
import {
  COUPON_VALIDATE_REQUEST,
  COUPON_VALIDATE_SUCCESS,
  COUPON_VALIDATE_FAIL,
  COUPON_REMOVE,
} from '../constants/couponConstants';

export const validateCoupon = (code, cartTotal, productIds = []) => async (dispatch, getState) => {
  try {
    dispatch({
      type: COUPON_VALIDATE_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    if (!userInfo || !userInfo.token) {
      throw new Error('Please login to use coupons');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post(
      `/coupons/validate`,
      { code, cartTotal, productIds },
      config
    );

    dispatch({
      type: COUPON_VALIDATE_SUCCESS,
      payload: data,
    });

    // Store in localStorage
    localStorage.setItem('coupon', JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: COUPON_VALIDATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const removeCoupon = () => (dispatch) => {
  localStorage.removeItem('coupon');
  dispatch({
    type: COUPON_REMOVE,
  });
};

