import {
  CAROUSEL_REQUEST,
  CAROUSEL_SUCCESS,
  CAROUSEL_FAIL,
} from '../constants/carouselConstants';

export const carouselListReducer = (state = { carousels: [] }, action) => {
  switch (action.type) {
    case CAROUSEL_REQUEST:
      return { loading: true, carousels: [] };
    case CAROUSEL_SUCCESS:
      return { loading: false, carousels: action.payload };
    case CAROUSEL_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};
