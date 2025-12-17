import axios from '../utils/axios'
import {
  USER_DETAILS_FAIL,
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT,
  USER_REGISTER_FAIL,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_UPDATE_PROFILE_FAIL,
  USER_UPDATE_PROFILE_REQUEST,
  USER_UPDATE_PROFILE_SUCCESS,
  USER_DETAILS_RESET,
  USER_LIST_FAIL,
  USER_LIST_SUCCESS,
  USER_LIST_REQUEST,
  USER_LIST_RESET,
  USER_DELETE_REQUEST,
  USER_DELETE_SUCCESS,
  USER_DELETE_FAIL,
  USER_UPDATE_FAIL,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_REQUEST,
} from '../constants/userConstants'
import { ORDER_LIST_MY_RESET } from '../constants/orderConstants'
import { setUserInfo, clearAuthData, getToken } from '../utils/auth'

export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({
      type: USER_LOGIN_REQUEST,
    })

    const { data } = await axios.post('/auth/login', { email, password })

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    })

    setUserInfo(data)
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}

export const logout = () => (dispatch) => {
  clearAuthData()
  dispatch({ type: USER_LOGOUT })
  dispatch({ type: USER_DETAILS_RESET })
  dispatch({ type: ORDER_LIST_MY_RESET })
  dispatch({ type: USER_LIST_RESET })
  // Use window.location instead of document.location for better compatibility
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

export const register = (name, email, password) => async (dispatch) => {
  try {
    dispatch({
      type: USER_REGISTER_REQUEST,
    })

    const { data } = await axios.post('/auth/register', { name, email, password })

    dispatch({
      type: USER_REGISTER_SUCCESS,
      payload: data,
    })

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    })

    setUserInfo(data)
  } catch (error) {
    dispatch({
      type: USER_REGISTER_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}

export const getUserDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: USER_DETAILS_REQUEST,
    })

    const token = getToken()
    if (!token) {
      dispatch({ type: USER_DETAILS_FAIL, payload: 'No authentication token' })
      return
    }

    const { data } = await axios.get(`/users/${id}`)

    dispatch({
      type: USER_DETAILS_SUCCESS,
      payload: data,
    })
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    // Auth errors are handled globally by axios interceptor
    // No need to manually logout here as interceptor will handle it
    dispatch({
      type: USER_DETAILS_FAIL,
      payload: message,
    })
  }
}

export const updateUserProfile = (user) => async (dispatch, getState) => {
  try {
    dispatch({
      type: USER_UPDATE_PROFILE_REQUEST,
    })

    const token = getToken()
    if (!token) {
      dispatch({ type: USER_UPDATE_PROFILE_FAIL, payload: 'No authentication token' })
      return
    }

    const { data } = await axios.put('/users/profile', user)

    dispatch({
      type: USER_UPDATE_PROFILE_SUCCESS,
      payload: data,
    })
    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    })
    setUserInfo(data)
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    // Auth errors are handled globally by axios interceptor
    // No need to manually logout here as interceptor will handle it
    dispatch({
      type: USER_UPDATE_PROFILE_FAIL,
      payload: message,
    })
  }
}

export const listUsers = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: USER_LIST_REQUEST,
    })

    const token = getToken()
    if (!token) {
      dispatch({ type: USER_LIST_FAIL, payload: 'No authentication token' })
      return
    }

    const { data } = await axios.get('/users')

    dispatch({
      type: USER_LIST_SUCCESS,
      payload: data,
    })
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    // Auth errors are handled globally by axios interceptor
    // No need to manually logout here as interceptor will handle it
    dispatch({
      type: USER_LIST_FAIL,
      payload: message,
    })
  }
}

export const deleteUser = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: USER_DELETE_REQUEST,
    })

    const token = getToken()
    if (!token) {
      dispatch({ type: USER_DELETE_FAIL, payload: 'No authentication token' })
      return
    }

    await axios.delete(`/users/${id}`)

    dispatch({ type: USER_DELETE_SUCCESS })
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    // Auth errors are handled globally by axios interceptor
    // No need to manually logout here as interceptor will handle it
    dispatch({
      type: USER_DELETE_FAIL,
      payload: message,
    })
  }
}

export const updateUser = (user) => async (dispatch, getState) => {
  try {
    dispatch({
      type: USER_UPDATE_REQUEST,
    })

    const token = getToken()
    if (!token) {
      dispatch({ type: USER_UPDATE_FAIL, payload: 'No authentication token' })
      return
    }

    const { data } = await axios.put(`/users/${user._id}`, user)

    dispatch({ type: USER_UPDATE_SUCCESS })

    dispatch({ type: USER_DETAILS_SUCCESS, payload: data })

    dispatch({ type: USER_DETAILS_RESET })
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    // Auth errors are handled globally by axios interceptor
    // No need to manually logout here as interceptor will handle it
    dispatch({
      type: USER_UPDATE_FAIL,
      payload: message,
    })
  }
}
