import {
  COUPON_VALIDATE_REQUEST,
  COUPON_VALIDATE_SUCCESS,
  COUPON_VALIDATE_FAIL,
  COUPON_REMOVE,
} from '../constants/couponConstants';

export const couponReducer = (state = {}, action) => {
  switch (action.type) {
    case COUPON_VALIDATE_REQUEST:
      return { loading: true };
    case COUPON_VALIDATE_SUCCESS:
      return {
        loading: false,
        coupon: action.payload.coupon,
        discountAmount: action.payload.discountAmount,
        finalTotal: action.payload.finalTotal,
      };
    case COUPON_VALIDATE_FAIL:
      return { loading: false, error: action.payload };
    case COUPON_REMOVE:
      return {};
    default:
      return state;
  }
};

