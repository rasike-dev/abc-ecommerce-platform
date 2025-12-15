# Frontend Test Suite

## Overview

This directory contains all unit and integration tests for the e-commerce platform frontend.

## Directory Structure

```
__tests__/
├── README.md                    # This file
├── testUtils.js                # Shared test utilities and mock data
├── components/                 # Component unit tests
│   ├── Rating.test.js         # Star rating component
│   ├── Message.test.js        # Alert messages
│   ├── Loader.test.js         # Loading spinner
│   ├── CheckoutSteps.test.js  # Checkout navigation
│   ├── Paginate.test.js       # Pagination
│   └── Product.test.js        # Product card
├── screens/                    # Screen/page tests
│   ├── HomeScreen.test.js     # Home page with product listing
│   └── CartScreen.test.js     # Shopping cart
├── reducers/                   # Redux reducer tests
│   ├── cartReducers.test.js   # Cart state management
│   ├── productReducers.test.js # Product state management
│   └── userReducers.test.js   # User authentication
├── utils/                      # Utility function tests
│   └── recentlyViewed.test.js # Recently viewed products
└── integration/                # Integration tests
    └── checkout.test.js       # End-to-end checkout flow
```

## Quick Start

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test Rating.test.js
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## Test Utilities

### renderWithProviders

Custom render function that wraps components with Redux Provider and Router:

```javascript
import { renderWithProviders } from '../testUtils';

const initialState = {
  userLogin: { userInfo: mockUser },
  cart: { cartItems: [] },
};

renderWithProviders(<MyComponent />, { initialState });
```

### Mock Data

Pre-built mock objects available in `testUtils.js`:

```javascript
import { 
  mockProduct,    // Mock product object
  mockUser,       // Mock user object
  mockOrder,      // Mock order object
  mockCartItem,   // Mock cart item
} from '../testUtils';
```

## Writing Tests

### Component Test Template

```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';
import MyComponent from '../../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    render(<MyComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });
});
```

### Redux-Connected Component Test

```javascript
import { renderWithProviders } from '../testUtils';

describe('ConnectedComponent', () => {
  it('should display data from Redux store', () => {
    const initialState = {
      productList: {
        products: [{ _id: '1', name: 'Test Product' }],
      },
    };

    renderWithProviders(<ConnectedComponent />, { initialState });
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
```

### Reducer Test Template

```javascript
import myReducer from '../../reducers/myReducer';
import { MY_ACTION } from '../../constants/myConstants';

describe('My Reducer', () => {
  it('should handle MY_ACTION', () => {
    const action = { type: MY_ACTION, payload: 'data' };
    const state = myReducer(undefined, action);
    expect(state).toEqual({ data: 'data' });
  });
});
```

## Best Practices

### 1. Test Behavior, Not Implementation
Focus on what the user sees and does, not internal state.

### 2. Use Descriptive Test Names
```javascript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('should display error message when form submission fails', () => { ... });
```

### 3. Arrange-Act-Assert Pattern
```javascript
it('should add item to cart', () => {
  // Arrange
  const initialState = { cartItems: [] };
  
  // Act
  const state = cartReducer(initialState, addItemAction);
  
  // Assert
  expect(state.cartItems).toHaveLength(1);
});
```

### 4. Keep Tests Independent
Each test should work in isolation without depending on other tests.

### 5. Mock External Dependencies
Always mock:
- API calls
- Child components (when testing parent)
- LocalStorage
- Router navigation

## Common Testing Patterns

### Testing User Interactions
```javascript
import { fireEvent } from '@testing-library/react';

const button = screen.getByText('Add to Cart');
fireEvent.click(button);
```

### Testing Forms
```javascript
const input = screen.getByLabelText('Email');
fireEvent.change(input, { target: { value: 'test@example.com' } });
expect(input).toHaveValue('test@example.com');
```

### Testing Async Operations
```javascript
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(screen.getByText('Loaded Data')).toBeInTheDocument();
});
```

### Testing Conditional Rendering
```javascript
// Test when condition is true
renderWithProviders(<Component />, { 
  initialState: { user: { isLoggedIn: true } } 
});
expect(screen.getByText('Welcome')).toBeInTheDocument();

// Test when condition is false
renderWithProviders(<Component />, { 
  initialState: { user: { isLoggedIn: false } } 
});
expect(screen.queryByText('Welcome')).not.toBeInTheDocument();
```

## Debugging Tests

### View Rendered DOM
```javascript
import { screen } from '@testing-library/react';

screen.debug(); // Prints entire DOM
screen.debug(element); // Prints specific element
```

### Run Single Test
```javascript
it.only('should test this one', () => {
  // Only this test will run
});
```

### Skip Test
```javascript
it.skip('should test this later', () => {
  // This test will be skipped
});
```

## Coverage Reports

After running `npm run test:coverage`, view the report:
- Terminal: Summary in console
- HTML: Open `coverage/lcov-report/index.html` in browser

## Continuous Integration

These tests run automatically in CI/CD:
- On every commit (if pre-commit hook is set up)
- On pull requests
- Before deployment

## Adding New Tests

1. Create test file next to component or in appropriate `__tests__` subdirectory
2. Import necessary dependencies
3. Write descriptive test cases
4. Run tests to verify they pass
5. Check coverage impact

## Troubleshooting

### "Cannot find module"
```bash
npm test -- --clearCache
```

### "Test timeout"
Increase timeout for specific test:
```javascript
it('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

### "Act warning"
Wrap state updates in `act()`:
```javascript
import { act } from '@testing-library/react';

await act(async () => {
  // async operations
});
```

## Resources

- [Testing Guide](../../TESTING_GUIDE.md) - Comprehensive testing documentation
- [Test Summary](../../TEST_SUMMARY.md) - Quick reference and statistics
- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)

## Contributing

When adding tests:
1. Follow existing patterns
2. Write clear, descriptive test names
3. Ensure tests are independent
4. Mock external dependencies
5. Maintain or improve coverage

---

**Questions?** Check the main [TESTING_GUIDE.md](../../TESTING_GUIDE.md) for detailed examples and patterns.

