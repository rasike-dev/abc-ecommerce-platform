/**
 * Axios configuration with interceptors
 * Handles automatic token injection and error handling
 */
import axios from 'axios';
import { getToken, isTokenExpired, clearAuthData } from './auth';
import store from '../store';
import { logout } from '../actions/userActions';

// Set default base URL for all axios requests
axios.defaults.baseURL = '/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Request interceptor - automatically add token to requests
axios.interceptors.request.use(
  (config) => {
    // Skip token checks for public endpoints (login, register)
    const publicEndpoints = ['/auth/login', '/auth/register'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint) || config.url?.startsWith(endpoint)
    );

    // Only check token expiration for authenticated endpoints
    if (!isPublicEndpoint) {
      // Check if token is expired before making request
      if (isTokenExpired()) {
        console.warn('Token expired, clearing auth data');
        clearAuthData();
        store.dispatch(logout());
        return Promise.reject(new Error('Token expired'));
      }

      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors globally
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    // Handle 401 Unauthorized - token invalid or expired
    if (response?.status === 401) {
      const errorMessage = response?.data?.message || error.message;
      
      // Check for specific auth error messages
      if (
        errorMessage === 'Not authorized, token failed' ||
        errorMessage === 'Token expired' ||
        errorMessage === 'Invalid token' ||
        errorMessage.includes('jwt') ||
        errorMessage.includes('token')
      ) {
        console.warn('Authentication failed, logging out:', errorMessage);
        clearAuthData();
        store.dispatch(logout());
        
        // Don't redirect if already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    // Handle 403 Forbidden
    if (response?.status === 403) {
      console.warn('Access forbidden');
    }

    return Promise.reject(error);
  }
);

// Export default axios (with interceptors applied)
export default axios;

