import axios from '../utils/axios';
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
import { logout } from './userActions';

export const listProductGroups = (keyword = '', pageNumber = '') => async (
  dispatch
) => {
  try {
    dispatch({ type: PRODUCT_GROUP_LIST_REQUEST });

    const { data } = await axios.get(
      `/groups?keyword=${keyword}&pageNumber=${pageNumber}`
    );

    dispatch({
      type: PRODUCT_GROUP_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: PRODUCT_GROUP_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const productGroupDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: PRODUCT_GROUP_DETAILS_REQUEST });

    const { data } = await axios.get(`/groups/${id}`);

    dispatch({
      type: PRODUCT_GROUP_DETAILS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: PRODUCT_GROUP_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const deleteProductGroup = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: PRODUCT_GROUP_DELETE_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.delete(`/groups/${id}`, config);

    dispatch({
      type: PRODUCT_GROUP_DELETE_SUCCESS,
    });
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === 'Not authorized, token failed') {
      dispatch(logout());
    }
    dispatch({
      type: PRODUCT_GROUP_DELETE_FAIL,
      payload: message,
    });
  }
};

export const createProductGroup = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: PRODUCT_GROUP_CREATE_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post(`/groups`, {}, config);

    dispatch({
      type: PRODUCT_GROUP_CREATE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === 'Not authorized, token failed') {
      dispatch(logout());
    }
    dispatch({
      type: PRODUCT_GROUP_CREATE_FAIL,
      payload: message,
    });
  }
};

export const updateProductGroup = (group) => async (dispatch, getState) => {
  try {
    dispatch({
      type: PRODUCT_GROUP_UPDATE_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put(
      `/products/${group._id}`,
      group,
      config
    );

    dispatch({
      type: PRODUCT_GROUP_UPDATE_SUCCESS,
      payload: data,
    });
    dispatch({ type: PRODUCT_GROUP_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    if (message === 'Not authorized, token failed') {
      dispatch(logout());
    }
    dispatch({
      type: PRODUCT_GROUP_UPDATE_FAIL,
      payload: message,
    });
  }
};
