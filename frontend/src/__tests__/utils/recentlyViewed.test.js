import {
  addToRecentlyViewed,
  getRecentlyViewed,
  clearRecentlyViewed,
  removeFromRecentlyViewed,
} from '../../utils/recentlyViewed';

describe('Recently Viewed Utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('addToRecentlyViewed', () => {
    it('should add a new product to recently viewed', () => {
      const product = {
        _id: '1',
        name: 'Test Product',
        image: '/test.jpg',
        price: 1000,
        rating: 4.5,
        numReviews: 10,
        teacher: 'Test Teacher',
      };

      const result = addToRecentlyViewed(product);

      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('1');
      expect(localStorage.getItem('recentlyViewedProducts')).toBeTruthy();
    });

    it('should move existing product to the front', () => {
      const existingProducts = [
        { _id: '1', name: 'Product 1' },
        { _id: '2', name: 'Product 2' },
      ];
      localStorage.setItem('recentlyViewedProducts', JSON.stringify(existingProducts));

      const product = { _id: '1', name: 'Product 1', image: '/test.jpg', price: 100, rating: 4, numReviews: 5, teacher: 'Teacher' };

      const result = addToRecentlyViewed(product);

      expect(result).toHaveLength(2);
      expect(result[0]._id).toBe('1'); // Should be at the front
    });

    it('should limit to 8 items maximum', () => {
      const existingProducts = Array.from({ length: 8 }, (_, i) => ({
        _id: String(i + 1),
        name: `Product ${i + 1}`,
      }));
      localStorage.setItem('recentlyViewedProducts', JSON.stringify(existingProducts));

      const product = { _id: '9', name: 'Product 9', image: '/test.jpg', price: 100, rating: 4, numReviews: 5, teacher: 'Teacher' };

      const result = addToRecentlyViewed(product);

      expect(result).toHaveLength(8);
      expect(result[0]._id).toBe('9'); // Newest product at the front
      expect(result[7]._id).toBe('7'); // Product 8 was dropped, so 7 is last
    });

    it('should handle errors gracefully', () => {
      // Override getItem to throw error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = () => {
        throw new Error('Storage error');
      };

      const product = { _id: '1', name: 'Product 1', image: '/test.jpg', price: 100, rating: 4, numReviews: 5, teacher: 'Teacher' };
      const result = addToRecentlyViewed(product);

      // Should still add the product despite the error
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('1');
      
      // Restore original
      localStorage.getItem = originalGetItem;
    });
  });

  describe('getRecentlyViewed', () => {
    it('should return empty array when no items exist', () => {
      const result = getRecentlyViewed();

      expect(result).toEqual([]);
    });

    it('should return parsed products from localStorage', () => {
      const products = [
        { _id: '1', name: 'Product 1' },
        { _id: '2', name: 'Product 2' },
      ];
      localStorage.setItem('recentlyViewedProducts', JSON.stringify(products));

      const result = getRecentlyViewed();

      expect(result).toEqual(products);
    });

    it('should handle parse errors gracefully', () => {
      localStorage.setItem('recentlyViewedProducts', 'invalid json');

      const result = getRecentlyViewed();

      expect(result).toEqual([]);
    });
  });

  describe('clearRecentlyViewed', () => {
    it('should remove recently viewed from localStorage', () => {
      localStorage.setItem('recentlyViewedProducts', JSON.stringify([{ _id: '1' }]));
      
      clearRecentlyViewed();

      expect(localStorage.getItem('recentlyViewedProducts')).toBeNull();
    });

    it('should handle errors gracefully', () => {
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = () => {
        throw new Error('Storage error');
      };

      expect(() => clearRecentlyViewed()).not.toThrow();
      
      // Restore
      localStorage.removeItem = originalRemoveItem;
    });
  });

  describe('removeFromRecentlyViewed', () => {
    it('should remove specific product from recently viewed', () => {
      const products = [
        { _id: '1', name: 'Product 1' },
        { _id: '2', name: 'Product 2' },
        { _id: '3', name: 'Product 3' },
      ];
      localStorage.setItem('recentlyViewedProducts', JSON.stringify(products));

      const result = removeFromRecentlyViewed('2');

      expect(result).toHaveLength(2);
      expect(result.find((p) => p._id === '2')).toBeUndefined();
    });

    it('should handle removing non-existent product', () => {
      const products = [{ _id: '1', name: 'Product 1' }];
      localStorage.setItem('recentlyViewedProducts', JSON.stringify(products));

      const result = removeFromRecentlyViewed('999');

      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('1');
    });

    it('should handle errors gracefully', () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = () => {
        throw new Error('Storage error');
      };

      const result = removeFromRecentlyViewed('1');

      expect(result).toEqual([]);
      
      // Restore
      localStorage.getItem = originalGetItem;
    });
  });
});

