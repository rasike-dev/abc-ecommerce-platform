import axios from '../utils/axios';
import {
  CAROUSEL_REQUEST,
  CAROUSEL_SUCCESS,
  CAROUSEL_FAIL,
} from '../constants/carouselConstants';

export const listTopCarousel = () => async (dispatch) => {
  try {
    dispatch({ type: CAROUSEL_REQUEST });

    const { data } = await axios.get(`/carousel`);

    dispatch({
      type: CAROUSEL_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: CAROUSEL_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
