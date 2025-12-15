import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGOUT,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
} from '../../constants/userConstants';

// Mock user reducers
const userLoginReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return { loading: true };
    case USER_LOGIN_SUCCESS:
      return { loading: false, userInfo: action.payload };
    case USER_LOGIN_FAIL:
      return { loading: false, error: action.payload };
    case USER_LOGOUT:
      return {};
    default:
      return state;
  }
};

const userRegisterReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_REGISTER_REQUEST:
      return { loading: true };
    case USER_REGISTER_SUCCESS:
      return { loading: false, userInfo: action.payload };
    case USER_REGISTER_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

describe('User Login Reducer', () => {
  it('should return initial state', () => {
    expect(userLoginReducer(undefined, {})).toEqual({});
  });

  it('should handle USER_LOGIN_REQUEST', () => {
    const action = { type: USER_LOGIN_REQUEST };
    const state = userLoginReducer(undefined, action);
    expect(state).toEqual({ loading: true });
  });

  it('should handle USER_LOGIN_SUCCESS', () => {
    const userInfo = {
      _id: '1',
      name: 'Test User',
      email: 'test@example.com',
      token: 'test-token',
    };
    const action = { type: USER_LOGIN_SUCCESS, payload: userInfo };
    const state = userLoginReducer(undefined, action);
    expect(state).toEqual({ loading: false, userInfo });
  });

  it('should handle USER_LOGIN_FAIL', () => {
    const action = { type: USER_LOGIN_FAIL, payload: 'Invalid credentials' };
    const state = userLoginReducer(undefined, action);
    expect(state).toEqual({ loading: false, error: 'Invalid credentials' });
  });

  it('should handle USER_LOGOUT', () => {
    const currentState = {
      userInfo: { _id: '1', name: 'Test User' },
    };
    const action = { type: USER_LOGOUT };
    const state = userLoginReducer(currentState, action);
    expect(state).toEqual({});
  });
});

describe('User Register Reducer', () => {
  it('should return initial state', () => {
    expect(userRegisterReducer(undefined, {})).toEqual({});
  });

  it('should handle USER_REGISTER_REQUEST', () => {
    const action = { type: USER_REGISTER_REQUEST };
    const state = userRegisterReducer(undefined, action);
    expect(state).toEqual({ loading: true });
  });

  it('should handle USER_REGISTER_SUCCESS', () => {
    const userInfo = {
      _id: '1',
      name: 'New User',
      email: 'newuser@example.com',
      token: 'test-token',
    };
    const action = { type: USER_REGISTER_SUCCESS, payload: userInfo };
    const state = userRegisterReducer(undefined, action);
    expect(state).toEqual({ loading: false, userInfo });
  });

  it('should handle USER_REGISTER_FAIL', () => {
    const action = { type: USER_REGISTER_FAIL, payload: 'Email already exists' };
    const state = userRegisterReducer(undefined, action);
    expect(state).toEqual({ loading: false, error: 'Email already exists' });
  });
});

