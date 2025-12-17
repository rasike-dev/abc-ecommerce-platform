/**
 * Centralized authentication utility
 * Handles token storage, retrieval, validation, and expiration checking
 */

const USER_INFO_KEY = 'userInfo';
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer before actual expiry

/**
 * Get user info from localStorage safely
 * @returns {Object|null} User info object or null
 */
export const getUserInfo = () => {
  try {
    const userInfoStr = localStorage.getItem(USER_INFO_KEY);
    if (!userInfoStr) {
      return null;
    }
    return JSON.parse(userInfoStr);
  } catch (error) {
    console.error('Error parsing userInfo from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem(USER_INFO_KEY);
    return null;
  }
};

/**
 * Save user info to localStorage safely
 * @param {Object} userInfo - User info object to save
 */
export const setUserInfo = (userInfo) => {
  try {
    if (!userInfo) {
      localStorage.removeItem(USER_INFO_KEY);
      return;
    }
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  } catch (error) {
    console.error('Error saving userInfo to localStorage:', error);
  }
};

/**
 * Remove user info from localStorage
 */
export const removeUserInfo = () => {
  try {
    localStorage.removeItem(USER_INFO_KEY);
  } catch (error) {
    console.error('Error removing userInfo from localStorage:', error);
  }
};

/**
 * Get authentication token safely
 * @returns {string|null} Token or null
 */
export const getToken = () => {
  const userInfo = getUserInfo();
  return userInfo?.token || null;
};

/**
 * Check if token exists
 * @returns {boolean}
 */
export const hasToken = () => {
  return !!getToken();
};

/**
 * Check if token is expired
 * JWT tokens typically have an 'exp' claim (expiration timestamp in seconds)
 * @returns {boolean} True if token is expired or invalid
 */
export const isTokenExpired = () => {
  const userInfo = getUserInfo();
  // If no userInfo or no token, consider it as "expired" (needs login)
  // But this should only be checked for authenticated endpoints, not during login
  if (!userInfo || !userInfo.token) {
    return true;
  }

  try {
    // Decode JWT token (without verification, just to check expiry)
    const tokenParts = userInfo.token.split('.');
    if (tokenParts.length !== 3) {
      return true; // Invalid token format
    }

    const payload = JSON.parse(atob(tokenParts[1]));
    const exp = payload.exp; // Expiration time in seconds

    if (!exp) {
      // No expiration claim, assume token is valid (but should be checked server-side)
      return false;
    }

    // Convert to milliseconds and add buffer
    const expirationTime = exp * 1000;
    const currentTime = Date.now();
    const bufferTime = expirationTime - TOKEN_EXPIRY_BUFFER;

    return currentTime >= bufferTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    // If we can't parse the token, consider it expired
    return true;
  }
};

/**
 * Check if user is authenticated (has valid token)
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return hasToken() && !isTokenExpired();
};

/**
 * Validate and clean up user info
 * Removes invalid/expired tokens
 * @returns {Object|null} Valid user info or null
 */
export const validateUserInfo = () => {
  const userInfo = getUserInfo();
  
  if (!userInfo) {
    return null;
  }

  // Check if token is expired
  if (isTokenExpired()) {
    console.warn('Token expired, clearing user info');
    removeUserInfo();
    return null;
  }

  // Validate token exists
  if (!userInfo.token) {
    console.warn('No token found in user info, clearing');
    removeUserInfo();
    return null;
  }

  return userInfo;
};

/**
 * Clear all auth-related data from localStorage
 */
export const clearAuthData = () => {
  removeUserInfo();
  localStorage.removeItem('cartItems');
  localStorage.removeItem('shippingAddress');
  localStorage.removeItem('paymentMethod');
  localStorage.removeItem('wishlistItems');
  localStorage.removeItem('coupon');
};

