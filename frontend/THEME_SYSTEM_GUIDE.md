# Theme System Guide

## Overview

This e-commerce platform now features a comprehensive theme system that supports light and dark modes. The theme system is built using React Context API and CSS Custom Properties (CSS Variables) for optimal performance and ease of use.

## Features

✅ **Light & Dark Modes** - Professionally designed color palettes  
✅ **Persistent Theme** - User preference saved in localStorage  
✅ **Smooth Transitions** - All theme changes animate smoothly  
✅ **Bootstrap Integration** - All Bootstrap components themed automatically  
✅ **Easy to Extend** - Add new themes or colors easily  
✅ **Performance Optimized** - Uses CSS variables for instant updates  

## How It Works

### 1. ThemeProvider

The `ThemeProvider` component wraps the entire application and manages theme state:

```javascript
// App.js
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### 2. Theme Toggle

The theme toggle button is integrated into the Header component:

```javascript
import ThemeToggle from './components/ThemeToggle';

// In your Header component
<ThemeToggle />
```

### 3. Using Theme in Components

#### Method 1: Using the useTheme Hook

```javascript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme, isDark, toggleTheme, themeColors } = useTheme();
  
  return (
    <div style={{ backgroundColor: themeColors.background }}>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

#### Method 2: Using CSS Variables (Recommended)

```css
.my-component {
  background-color: var(--color-background);
  color: var(--color-textPrimary);
  border: 1px solid var(--color-borderColor);
}
```

#### Method 3: Inline Styles with CSS Variables

```javascript
function MyComponent() {
  return (
    <div style={{
      backgroundColor: 'var(--color-cardBackground)',
      color: 'var(--color-textPrimary)',
      border: '1px solid var(--color-borderColor)'
    }}>
      Content
    </div>
  );
}
```

## Available CSS Variables

### Background Colors
- `--color-background` - Main background
- `--color-backgroundSecondary` - Secondary background
- `--color-backgroundTertiary` - Tertiary background
- `--color-cardBackground` - Card backgrounds

### Text Colors
- `--color-textPrimary` - Primary text
- `--color-textSecondary` - Secondary text
- `--color-textMuted` - Muted/disabled text
- `--color-textInverse` - Inverse text (for dark backgrounds)

### Theme Colors
- `--color-primary` - Primary brand color
- `--color-secondary` - Secondary color
- `--color-success` - Success state
- `--color-danger` - Danger/error state
- `--color-warning` - Warning state
- `--color-info` - Info state
- `--color-light` - Light variant
- `--color-dark` - Dark variant

### Component-Specific
- `--color-linkColor` - Link color
- `--color-linkHover` - Link hover color
- `--color-wishlistHeart` - Wishlist heart icon
- `--color-productOverlay` - Product card overlay
- `--color-navbarBg` - Navbar background
- `--color-navbarText` - Navbar text

### Borders & Inputs
- `--color-borderColor` - Default border
- `--color-inputBg` - Input background
- `--color-inputBorder` - Input border
- `--color-inputText` - Input text
- `--color-inputFocus` - Input focus color

### Skeleton Loader
- `--color-skeletonBase` - Skeleton base color
- `--color-skeletonHighlight` - Skeleton highlight

## Theme Configuration

Themes are defined in `/src/context/ThemeContext.js`:

```javascript
export const themes = {
  light: {
    name: 'light',
    colors: {
      // Color definitions
    }
  },
  dark: {
    name: 'dark',
    colors: {
      // Color definitions
    }
  }
};
```

## Adding a New Theme

1. Add your theme to the `themes` object in `ThemeContext.js`:

```javascript
export const themes = {
  light: { /* ... */ },
  dark: { /* ... */ },
  custom: {
    name: 'custom',
    colors: {
      background: '#yourColor',
      // ... other colors
    }
  }
};
```

2. Update the `ThemeToggle` component to support multiple themes (if needed).

## Best Practices

### ✅ Do's
- Use CSS variables for all colors
- Test components in both light and dark modes
- Use semantic color names (primary, secondary) not specific colors
- Provide good contrast ratios for accessibility
- Use the `useTheme` hook when you need theme logic in JavaScript

### ❌ Don'ts
- Avoid hardcoded color values
- Don't use `!important` unless absolutely necessary
- Don't forget to test form elements in dark mode
- Avoid mixing CSS variables with hardcoded colors

## Bootstrap Component Theming

All Bootstrap components are automatically themed:

- ✅ Buttons (all variants)
- ✅ Cards
- ✅ Forms & Inputs
- ✅ Modals
- ✅ Alerts
- ✅ Tables
- ✅ Dropdowns
- ✅ Pagination
- ✅ Navbar
- ✅ Breadcrumbs
- ✅ Progress bars
- ✅ List groups

## Extending the Theme

### Adding New Colors

1. Add to both light and dark theme objects:

```javascript
light: {
  colors: {
    // existing colors...
    customColor: '#123456',
  }
}
```

2. The color will automatically be available as:
   - CSS variable: `var(--color-customColor)`
   - Hook: `themeColors.customColor`

### Custom Component Styling

For complex components, combine CSS variables with the `useTheme` hook:

```javascript
import { useTheme } from '../context/ThemeContext';

function ComplexComponent() {
  const { isDark, themeColors } = useTheme();
  
  return (
    <div 
      className={`my-component ${isDark ? 'dark-mode' : 'light-mode'}`}
      style={{
        backgroundColor: themeColors.cardBackground,
        // Complex logic-based styling
        boxShadow: isDark 
          ? '0 4px 6px rgba(0, 0, 0, 0.5)' 
          : '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
    >
      Content
    </div>
  );
}
```

## Troubleshooting

### Theme not applying?
- Check that `ThemeProvider` wraps your app
- Verify CSS variables are being set on `:root`
- Check browser console for errors

### Colors look wrong?
- Clear localStorage and refresh
- Check theme definitions in `ThemeContext.js`
- Verify CSS variable names match

### Transitions too slow/fast?
- Adjust transition timing in `index.css`:
```css
* {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

## Performance Notes

- Theme changes are instant (CSS variables update DOM immediately)
- No re-renders required for styled components
- localStorage prevents flickering on page load
- Smooth transitions without performance impact

## Accessibility

- Both themes maintain WCAG AA contrast ratios
- Theme preference is saved (no need to re-select)
- Works with system preferences (can be extended)
- All interactive elements maintain visibility

## Future Enhancements

Potential improvements:
- System preference detection (prefers-color-scheme)
- More theme options (blue, green, etc.)
- Per-user theme preferences (saved to backend)
- Custom theme builder UI
- High contrast mode
- Accessibility mode with larger text

## Support

For questions or issues with the theme system, refer to:
- `/src/context/ThemeContext.js` - Core theme logic
- `/src/index.css` - Theme CSS variables
- `/src/components/ThemeToggle.js` - Toggle component

