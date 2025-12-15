import React, { createContext, useState, useEffect, useContext } from 'react';

// Theme configuration
export const themes = {
  light: {
    name: 'light',
    colors: {
      // Primary colors
      primary: '#007bff',
      secondary: '#6c757d',
      success: '#28a745',
      danger: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8',
      light: '#f8f9fa',
      dark: '#343a40',
      
      // Background colors
      background: '#ffffff',
      backgroundSecondary: '#f8f9fa',
      backgroundTertiary: '#e9ecef',
      
      // Text colors
      textPrimary: '#212529',
      textSecondary: '#6c757d',
      textMuted: '#6c757d',
      textInverse: '#ffffff',
      
      // Component specific
      cardBackground: '#ffffff',
      cardBorder: '#dee2e6',
      cardShadow: 'rgba(0, 0, 0, 0.1)',
      
      // Interactive elements
      linkColor: '#007bff',
      linkHover: '#0056b3',
      buttonPrimaryBg: '#007bff',
      buttonPrimaryText: '#ffffff',
      
      // Product card specific
      productOverlay: 'rgba(0, 0, 0, 0.7)',
      wishlistHeart: '#e74c3c',
      wishlistBg: '#ffffff',
      wishlistBorder: 'rgba(0, 0, 0, 0.15)',
      
      // Badge colors
      badgeWarning: '#ffc107',
      badgeWarningText: '#212529',
      badgeSuccess: '#28a745',
      badgeSuccessText: '#ffffff',
      badgeInfo: '#17a2b8',
      badgeInfoText: '#ffffff',
      badgeDanger: '#dc3545',
      badgeDangerText: '#ffffff',
      
      // Navbar
      navbarBg: '#343a40',
      navbarText: '#ffffff',
      navbarHover: 'rgba(255, 255, 255, 0.75)',
      
      // Form elements
      inputBg: '#ffffff',
      inputBorder: '#ced4da',
      inputText: '#495057',
      inputFocus: '#80bdff',
      
      // Skeleton loader
      skeletonBase: '#f0f0f0',
      skeletonHighlight: '#e0e0e0',
      
      // Borders
      borderColor: '#dee2e6',
      borderLight: '#e9ecef',
    }
  },
  dark: {
    name: 'dark',
    colors: {
      // Primary colors
      primary: '#4da3ff',
      secondary: '#6c757d',
      success: '#51cf66',
      danger: '#ff6b6b',
      warning: '#ffd43b',
      info: '#4dabf7',
      light: '#495057',
      dark: '#212529',
      
      // Background colors
      background: '#1a1a1a',
      backgroundSecondary: '#2d2d2d',
      backgroundTertiary: '#3a3a3a',
      
      // Text colors
      textPrimary: '#e9ecef',
      textSecondary: '#adb5bd',
      textMuted: '#868e96',
      textInverse: '#212529',
      
      // Component specific
      cardBackground: '#2d2d2d',
      cardBorder: '#495057',
      cardShadow: 'rgba(0, 0, 0, 0.3)',
      
      // Interactive elements
      linkColor: '#4da3ff',
      linkHover: '#74b9ff',
      buttonPrimaryBg: '#4da3ff',
      buttonPrimaryText: '#212529',
      
      // Product card specific
      productOverlay: 'rgba(0, 0, 0, 0.85)',
      wishlistHeart: '#ff6b6b',
      wishlistBg: '#3a3a3a',
      wishlistBorder: 'rgba(255, 255, 255, 0.15)',
      
      // Badge colors
      badgeWarning: '#ffd43b',
      badgeWarningText: '#212529',
      badgeSuccess: '#51cf66',
      badgeSuccessText: '#212529',
      badgeInfo: '#4dabf7',
      badgeInfoText: '#212529',
      badgeDanger: '#ff6b6b',
      badgeDangerText: '#ffffff',
      
      // Navbar
      navbarBg: '#212529',
      navbarText: '#e9ecef',
      navbarHover: 'rgba(233, 236, 239, 0.75)',
      
      // Form elements
      inputBg: '#2d2d2d',
      inputBorder: '#495057',
      inputText: '#e9ecef',
      inputFocus: '#4da3ff',
      
      // Skeleton loader
      skeletonBase: '#2a2a2a',
      skeletonHighlight: '#3a3a3a',
      
      // Borders
      borderColor: '#495057',
      borderLight: '#3a3a3a',
    }
  }
};

// Create Theme Context
const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to light
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Apply theme to CSS custom properties
  useEffect(() => {
    const theme = themes[currentTheme];
    const root = document.documentElement;

    // Apply all color variables to :root
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Add theme class to body for additional styling hooks
    document.body.className = `theme-${currentTheme}`;
    
    // Save to localStorage
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  // Toggle between themes
  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Set specific theme
  const setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const value = {
    theme: currentTheme,
    themeColors: themes[currentTheme].colors,
    toggleTheme,
    setTheme,
    isDark: currentTheme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;

