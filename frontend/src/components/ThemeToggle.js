import React from 'react';
import { Button } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <Button
      variant="outline-light"
      size="sm"
      onClick={toggleTheme}
      className="theme-toggle-btn"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        border: 'none',
        padding: '0.5rem',
        marginLeft: '0.5rem',
        transition: 'all 0.3s ease',
      }}
    >
      {isDark ? (
        <i className="fas fa-sun" style={{ fontSize: '1.2rem', color: '#ffd43b' }}></i>
      ) : (
        <i className="fas fa-moon" style={{ fontSize: '1.2rem', color: '#f8f9fa' }}></i>
      )}
    </Button>
  );
};

export default ThemeToggle;

