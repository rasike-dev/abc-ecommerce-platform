// Utility functions for managing recently viewed products in localStorage

const STORAGE_KEY = 'recentlyViewedProducts';
const MAX_ITEMS = 8; // Maximum number of recently viewed items to store

/**
 * Add a product to recently viewed list
 * @param {Object} product - Product object with _id, name, image, price, rating, teacher
 */
export const addToRecentlyViewed = (product) => {
  try {
    // Get existing recently viewed products
    const existing = getRecentlyViewed();
    
    // Create a lightweight product object (only essential data)
    const productData = {
      _id: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      rating: product.rating,
      numReviews: product.numReviews,
      teacher: product.teacher,
      viewedAt: new Date().toISOString()
    };
    
    // Remove if already exists (to update position)
    const filtered = existing.filter(item => item._id !== product._id);
    
    // Add to beginning of array
    const updated = [productData, ...filtered].slice(0, MAX_ITEMS);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    return updated;
  } catch (error) {
    console.error('Error adding to recently viewed:', error);
    return [];
  }
};

/**
 * Get all recently viewed products
 * @returns {Array} Array of recently viewed products
 */
export const getRecentlyViewed = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting recently viewed:', error);
    return [];
  }
};

/**
 * Clear all recently viewed products
 */
export const clearRecentlyViewed = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing recently viewed:', error);
  }
};

/**
 * Remove a specific product from recently viewed
 * @param {String} productId - Product ID to remove
 */
export const removeFromRecentlyViewed = (productId) => {
  try {
    const existing = getRecentlyViewed();
    const filtered = existing.filter(item => item._id !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error('Error removing from recently viewed:', error);
    return [];
  }
};

