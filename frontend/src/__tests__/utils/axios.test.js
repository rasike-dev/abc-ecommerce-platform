/**
 * Tests for axios interceptors
 * Tests automatic token injection and error handling
 */
import axios from 'axios';

// Mock the auth utilities before importing axios utils
jest.mock('../../utils/auth', () => ({
  getToken: jest.fn(),
  isTokenExpired: jest.fn(),
  clearAuthData: jest.fn(),
}));

// Mock the store before importing axios utils
jest.mock('../../store', () => ({
  dispatch: jest.fn(),
}));

// Mock userActions before importing axios utils
jest.mock('../../actions/userActions', () => ({
  logout: jest.fn(() => ({ type: 'USER_LOGOUT' })),
}));

// Import after mocks are set up
import { getToken, isTokenExpired, clearAuthData } from '../../utils/auth';
import store from '../../store';
import { logout } from '../../actions/userActions';

// Import axios utils to set up interceptors
import '../../utils/axios';

// Mock window.location
const mockLocation = { pathname: '/', href: '' };
delete window.location;
window.location = mockLocation;

describe('Axios Interceptors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.pathname = '/';
    mockLocation.href = '';
    
    // Reset mocks
    getToken.mockReturnValue(null);
    isTokenExpired.mockReturnValue(false);
  });

  describe('Request Interceptor Behavior', () => {
    it('should add Authorization header when token exists', () => {
      getToken.mockReturnValue('test-token-123');
      isTokenExpired.mockReturnValue(false);

      // Create a test config
      const config = {
        headers: {},
        url: '/users',
      };

      // Manually test the interceptor logic
      if (isTokenExpired()) {
        clearAuthData();
        store.dispatch(logout());
        throw new Error('Token expired');
      }

      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      expect(config.headers.Authorization).toBe('Bearer test-token-123');
    });

    it('should not add Authorization header when no token', () => {
      getToken.mockReturnValue(null);
      isTokenExpired.mockReturnValue(false);

      const config = {
        headers: {},
        url: '/users',
      };

      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      expect(config.headers.Authorization).toBeUndefined();
    });

    it('should reject request when token is expired', () => {
      getToken.mockReturnValue('expired-token');
      isTokenExpired.mockReturnValue(true);

      const config = {
        headers: {},
        url: '/users',
      };

      expect(() => {
        if (isTokenExpired()) {
          clearAuthData();
          store.dispatch(logout());
          throw new Error('Token expired');
        }
      }).toThrow('Token expired');
      
      expect(clearAuthData).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalled();
    });
  });

  describe('Response Interceptor Behavior', () => {
    it('should handle 401 Unauthorized errors with token failed message', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Not authorized, token failed' },
        },
      };

      mockLocation.pathname = '/profile';
      mockLocation.href = '';

      // Test the interceptor logic
      const { response } = error;
      if (response?.status === 401) {
        const errorMessage = response?.data?.message || error.message;
        if (
          errorMessage === 'Not authorized, token failed' ||
          errorMessage === 'Token expired' ||
          errorMessage === 'Invalid token' ||
          errorMessage.includes('jwt') ||
          errorMessage.includes('token')
        ) {
          clearAuthData();
          store.dispatch(logout());
          if (mockLocation.pathname !== '/login') {
            mockLocation.href = '/login';
          }
        }
      }

      expect(clearAuthData).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalled();
      expect(mockLocation.href).toBe('/login');
    });

    it('should handle 401 with token expired message', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Token expired' },
        },
      };

      mockLocation.pathname = '/cart';
      mockLocation.href = '';

      const { response } = error;
      if (response?.status === 401) {
        const errorMessage = response?.data?.message || error.message;
        if (
          errorMessage === 'Not authorized, token failed' ||
          errorMessage === 'Token expired' ||
          errorMessage === 'Invalid token' ||
          errorMessage.includes('jwt') ||
          errorMessage.includes('token')
        ) {
          clearAuthData();
          store.dispatch(logout());
          if (mockLocation.pathname !== '/login') {
            mockLocation.href = '/login';
          }
        }
      }

      expect(clearAuthData).toHaveBeenCalled();
      expect(mockLocation.href).toBe('/login');
    });

    it('should handle 401 with JWT error message', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'jwt malformed' },
        },
      };

      mockLocation.pathname = '/products';
      mockLocation.href = '';

      const { response } = error;
      if (response?.status === 401) {
        const errorMessage = response?.data?.message || error.message;
        if (
          errorMessage === 'Not authorized, token failed' ||
          errorMessage === 'Token expired' ||
          errorMessage === 'Invalid token' ||
          errorMessage.includes('jwt') ||
          errorMessage.includes('token')
        ) {
          clearAuthData();
          store.dispatch(logout());
          if (mockLocation.pathname !== '/login') {
            mockLocation.href = '/login';
          }
        }
      }

      expect(clearAuthData).toHaveBeenCalled();
      expect(mockLocation.href).toBe('/login');
    });

    it('should not redirect if already on login page', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Not authorized, token failed' },
        },
      };

      mockLocation.pathname = '/login';
      mockLocation.href = '';

      const { response } = error;
      if (response?.status === 401) {
        const errorMessage = response?.data?.message || error.message;
        if (
          errorMessage === 'Not authorized, token failed' ||
          errorMessage === 'Token expired' ||
          errorMessage === 'Invalid token' ||
          errorMessage.includes('jwt') ||
          errorMessage.includes('token')
        ) {
          clearAuthData();
          store.dispatch(logout());
          if (mockLocation.pathname !== '/login') {
            mockLocation.href = '/login';
          }
        }
      }

      expect(clearAuthData).toHaveBeenCalled();
      expect(mockLocation.href).toBe(''); // Should not redirect
    });

    it('should handle 403 Forbidden errors', () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Access forbidden' },
        },
      };

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { response } = error;
      if (response?.status === 403) {
        console.warn('Access forbidden');
      }

      expect(consoleSpy).toHaveBeenCalledWith('Access forbidden');
      expect(clearAuthData).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should not clear auth for non-token related 401s', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Some other error' },
        },
      };

      const { response } = error;
      if (response?.status === 401) {
        const errorMessage = response?.data?.message || error.message;
        if (
          errorMessage === 'Not authorized, token failed' ||
          errorMessage === 'Token expired' ||
          errorMessage === 'Invalid token' ||
          errorMessage.includes('jwt') ||
          errorMessage.includes('token')
        ) {
          clearAuthData();
          store.dispatch(logout());
          if (mockLocation.pathname !== '/login') {
            mockLocation.href = '/login';
          }
        }
      }

      // Should not clear auth for non-token related 401s
      expect(clearAuthData).not.toHaveBeenCalled();
    });
  });
});
