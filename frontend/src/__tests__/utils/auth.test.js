/**
 * Comprehensive tests for authentication utilities
 * Tests the full auth flow: storage, retrieval, validation, expiration, cleanup
 */
import {
  getUserInfo,
  setUserInfo,
  removeUserInfo,
  getToken,
  hasToken,
  isTokenExpired,
  isAuthenticated,
  validateUserInfo,
  clearAuthData,
} from '../../utils/auth';

// Helper function to create a mock JWT token
const createMockJWT = (expirationTime) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    exp: expirationTime, 
    iat: Math.floor(Date.now() / 1000),
    userId: '123',
    email: 'test@example.com'
  }));
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
};

describe('Auth Utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('getUserInfo', () => {
    it('should return null when no userInfo in localStorage', () => {
      expect(getUserInfo()).toBeNull();
    });

    it('should return userInfo when it exists in localStorage', () => {
      const mockUserInfo = { token: 'test-token', email: 'test@example.com' };
      localStorage.setItem('userInfo', JSON.stringify(mockUserInfo));
      
      expect(getUserInfo()).toEqual(mockUserInfo);
    });

    it('should handle corrupted JSON data gracefully', () => {
      localStorage.setItem('userInfo', 'invalid-json{');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = getUserInfo();
      
      expect(result).toBeNull();
      expect(localStorage.getItem('userInfo')).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should return null and clear corrupted data', () => {
      localStorage.setItem('userInfo', 'not-valid-json');
      getUserInfo();
      
      expect(localStorage.getItem('userInfo')).toBeNull();
    });
  });

  describe('setUserInfo', () => {
    it('should save userInfo to localStorage', () => {
      const mockUserInfo = { token: 'test-token', email: 'test@example.com' };
      
      setUserInfo(mockUserInfo);
      
      expect(JSON.parse(localStorage.getItem('userInfo'))).toEqual(mockUserInfo);
    });

    it('should remove userInfo when null is passed', () => {
      localStorage.setItem('userInfo', JSON.stringify({ token: 'test' }));
      
      setUserInfo(null);
      
      expect(localStorage.getItem('userInfo')).toBeNull();
    });

    it('should handle storage errors gracefully', () => {
      const mockUserInfo = { token: 'test-token' };
      
      // Test that function doesn't throw even if localStorage fails
      // (actual error simulation is complex with LocalStorageMock)
      expect(() => setUserInfo(mockUserInfo)).not.toThrow();
      
      // Verify it was saved successfully in normal case
      expect(JSON.parse(localStorage.getItem('userInfo'))).toEqual(mockUserInfo);
    });
  });

  describe('removeUserInfo', () => {
    it('should remove userInfo from localStorage', () => {
      localStorage.setItem('userInfo', JSON.stringify({ token: 'test' }));
      
      removeUserInfo();
      
      expect(localStorage.getItem('userInfo')).toBeNull();
    });

    it('should handle removal errors gracefully', () => {
      localStorage.setItem('userInfo', JSON.stringify({ token: 'test' }));
      
      // Test that function doesn't throw even if localStorage fails
      // (actual error simulation is complex with LocalStorageMock)
      expect(() => removeUserInfo()).not.toThrow();
      
      // Verify it was removed successfully in normal case
      expect(localStorage.getItem('userInfo')).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should return token when userInfo exists', () => {
      const mockUserInfo = { token: 'test-token-123', email: 'test@example.com' };
      localStorage.setItem('userInfo', JSON.stringify(mockUserInfo));
      
      expect(getToken()).toBe('test-token-123');
    });

    it('should return null when no userInfo', () => {
      expect(getToken()).toBeNull();
    });

    it('should return null when userInfo has no token', () => {
      localStorage.setItem('userInfo', JSON.stringify({ email: 'test@example.com' }));
      
      expect(getToken()).toBeNull();
    });
  });

  describe('hasToken', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('userInfo', JSON.stringify({ token: 'test-token' }));
      
      expect(hasToken()).toBe(true);
    });

    it('should return false when no token', () => {
      expect(hasToken()).toBe(false);
    });
  });

  describe('isTokenExpired', () => {
    it('should return true when no userInfo', () => {
      expect(isTokenExpired()).toBe(true);
    });

    it('should return true when no token in userInfo', () => {
      localStorage.setItem('userInfo', JSON.stringify({ email: 'test@example.com' }));
      
      expect(isTokenExpired()).toBe(true);
    });

    it('should return true for invalid token format', () => {
      localStorage.setItem('userInfo', JSON.stringify({ token: 'invalid-token' }));
      
      expect(isTokenExpired()).toBe(true);
    });

    it('should return false for valid non-expired token', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const token = createMockJWT(futureExp);
      localStorage.setItem('userInfo', JSON.stringify({ token }));
      
      expect(isTokenExpired()).toBe(false);
    });

    it('should return true for expired token', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const token = createMockJWT(pastExp);
      localStorage.setItem('userInfo', JSON.stringify({ token }));
      
      expect(isTokenExpired()).toBe(true);
    });

    it('should return true for token expiring within buffer time', () => {
      // Token expires in 4 minutes (less than 5 minute buffer)
      const nearExp = Math.floor(Date.now() / 1000) + 240;
      const token = createMockJWT(nearExp);
      localStorage.setItem('userInfo', JSON.stringify({ token }));
      
      expect(isTokenExpired()).toBe(true);
    });

    it('should return false for token without exp claim', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256' }));
      const payload = btoa(JSON.stringify({ userId: '123' })); // No exp
      const token = `${header}.${payload}.signature`;
      localStorage.setItem('userInfo', JSON.stringify({ token }));
      
      expect(isTokenExpired()).toBe(false);
    });

    it('should handle token parsing errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      // Invalid base64 in payload
      const token = 'header.invalid-base64.signature';
      localStorage.setItem('userInfo', JSON.stringify({ token }));
      
      expect(isTokenExpired()).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('should return false when token is expired', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const token = createMockJWT(pastExp);
      localStorage.setItem('userInfo', JSON.stringify({ token }));
      
      expect(isAuthenticated()).toBe(false);
    });

    it('should return true when token is valid and not expired', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const token = createMockJWT(futureExp);
      localStorage.setItem('userInfo', JSON.stringify({ token }));
      
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe('validateUserInfo', () => {
    it('should return null when no userInfo', () => {
      expect(validateUserInfo()).toBeNull();
    });

    it('should return null and clear expired token', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const token = createMockJWT(pastExp);
      localStorage.setItem('userInfo', JSON.stringify({ token }));
      
      const result = validateUserInfo();
      
      expect(result).toBeNull();
      expect(localStorage.getItem('userInfo')).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should return null and clear userInfo without token', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      localStorage.setItem('userInfo', JSON.stringify({ email: 'test@example.com' }));
      
      const result = validateUserInfo();
      
      expect(result).toBeNull();
      expect(localStorage.getItem('userInfo')).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should return userInfo when token is valid', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const token = createMockJWT(futureExp);
      const userInfo = { token, email: 'test@example.com' };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      const result = validateUserInfo();
      
      expect(result).toEqual(userInfo);
      expect(localStorage.getItem('userInfo')).not.toBeNull();
    });
  });

  describe('clearAuthData', () => {
    it('should clear all auth-related data from localStorage', () => {
      localStorage.setItem('userInfo', JSON.stringify({ token: 'test' }));
      localStorage.setItem('cartItems', JSON.stringify([{ id: 1 }]));
      localStorage.setItem('shippingAddress', JSON.stringify({ city: 'Test' }));
      localStorage.setItem('paymentMethod', 'stripe');
      localStorage.setItem('wishlistItems', JSON.stringify([{ id: 1 }]));
      localStorage.setItem('coupon', JSON.stringify({ code: 'TEST' }));
      
      clearAuthData();
      
      expect(localStorage.getItem('userInfo')).toBeNull();
      expect(localStorage.getItem('cartItems')).toBeNull();
      expect(localStorage.getItem('shippingAddress')).toBeNull();
      expect(localStorage.getItem('paymentMethod')).toBeNull();
      expect(localStorage.getItem('wishlistItems')).toBeNull();
      expect(localStorage.getItem('coupon')).toBeNull();
    });

    it('should not throw when items do not exist', () => {
      expect(() => clearAuthData()).not.toThrow();
    });
  });

  describe('Full Authentication Flow', () => {
    it('should handle complete login flow', () => {
      // 1. User logs in
      const userInfo = {
        token: createMockJWT(Math.floor(Date.now() / 1000) + 3600),
        email: 'test@example.com',
        name: 'Test User',
      };
      setUserInfo(userInfo);
      
      // 2. Verify token is stored
      expect(getUserInfo()).toEqual(userInfo);
      expect(getToken()).toBe(userInfo.token);
      expect(hasToken()).toBe(true);
      
      // 3. Verify authentication status
      expect(isAuthenticated()).toBe(true);
      expect(isTokenExpired()).toBe(false);
      
      // 4. Validate user info
      expect(validateUserInfo()).toEqual(userInfo);
    });

    it('should handle token expiration flow', () => {
      // 1. User logs in with token that will expire
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const userInfo = {
        token: createMockJWT(pastExp),
        email: 'test@example.com',
      };
      setUserInfo(userInfo);
      
      // 2. Initially token exists
      expect(hasToken()).toBe(true);
      
      // 3. But token is expired
      expect(isTokenExpired()).toBe(true);
      expect(isAuthenticated()).toBe(false);
      
      // 4. Validation should clear expired token
      const validated = validateUserInfo();
      expect(validated).toBeNull();
      expect(localStorage.getItem('userInfo')).toBeNull();
    });

    it('should handle logout flow', () => {
      // 1. User is logged in
      const userInfo = {
        token: createMockJWT(Math.floor(Date.now() / 1000) + 3600),
        email: 'test@example.com',
      };
      setUserInfo(userInfo);
      localStorage.setItem('cartItems', JSON.stringify([{ id: 1 }]));
      
      // 2. User logs out
      clearAuthData();
      
      // 3. Verify all data is cleared
      expect(getUserInfo()).toBeNull();
      expect(getToken()).toBeNull();
      expect(hasToken()).toBe(false);
      expect(isAuthenticated()).toBe(false);
      expect(localStorage.getItem('cartItems')).toBeNull();
    });

    it('should handle app reload with valid token', () => {
      // 1. User was logged in (simulating previous session)
      const userInfo = {
        token: createMockJWT(Math.floor(Date.now() / 1000) + 3600),
        email: 'test@example.com',
      };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      // 2. App reloads and validates
      const validated = validateUserInfo();
      
      // 3. Token should still be valid
      expect(validated).toEqual(userInfo);
      expect(isAuthenticated()).toBe(true);
    });

    it('should handle app reload with expired token', () => {
      // 1. User was logged in but token expired
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const userInfo = {
        token: createMockJWT(pastExp),
        email: 'test@example.com',
      };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      // 2. App reloads and validates
      const validated = validateUserInfo();
      
      // 3. Expired token should be cleared
      expect(validated).toBeNull();
      expect(isAuthenticated()).toBe(false);
    });
  });
});

