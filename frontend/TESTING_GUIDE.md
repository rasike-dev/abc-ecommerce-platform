# Frontend Testing Guide

## Overview

This guide covers the comprehensive test suite for the e-commerce platform frontend. The test suite is designed to ensure that new features don't break existing functionality through automated unit and integration tests.

## Test Structure

```
frontend/src/
├── setupTests.js                    # Jest/Testing Library configuration
├── __tests__/
│   ├── testUtils.js                # Shared test utilities and mocks
│   ├── components/                 # Component tests
│   │   ├── Rating.test.js
│   │   ├── Message.test.js
│   │   ├── Loader.test.js
│   │   ├── CheckoutSteps.test.js
│   │   ├── Paginate.test.js
│   │   └── Product.test.js
│   ├── screens/                    # Screen/Page tests
│   │   ├── HomeScreen.test.js
│   │   └── CartScreen.test.js
│   ├── reducers/                   # Redux reducer tests
│   │   ├── cartReducers.test.js
│   │   ├── productReducers.test.js
│   │   └── userReducers.test.js
│   ├── utils/                      # Utility function tests
│   │   └── recentlyViewed.test.js
│   └── integration/                # Integration tests
│       └── checkout.test.js
```

## Testing Stack

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM elements
- **@testing-library/user-event**: User interaction simulation

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test Rating.test.js
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="should render"
```

## Test Categories

### 1. Component Tests

Component tests verify that individual React components render correctly and handle user interactions properly.

**Example: Rating Component**
```javascript
// Tests star rendering logic
it('should display correct number of full stars', () => {
  const { container } = render(<Rating value={5} />);
  const fullStars = container.querySelectorAll('.fas.fa-star');
  expect(fullStars).toHaveLength(5);
});
```

**Components Tested:**
- ✅ Rating - Star rating display
- ✅ Message - Alert/notification messages
- ✅ Loader - Loading spinner
- ✅ CheckoutSteps - Multi-step checkout navigation
- ✅ Paginate - Pagination component
- ✅ Product - Product card with wishlist and quick view

### 2. Screen Tests

Screen tests verify entire page components with their full logic and state management.

**Example: HomeScreen**
```javascript
it('should render products when loaded successfully', () => {
  const initialState = {
    productList: {
      loading: false,
      products: [mockProduct1, mockProduct2],
      page: 1,
      pages: 1,
    },
  };
  
  renderWithProviders(<HomeScreen match={mockMatch} />, { initialState });
  
  expect(screen.getByText('Product 1')).toBeInTheDocument();
});
```

**Screens Tested:**
- ✅ HomeScreen - Product listing with filters and sorting
- ✅ CartScreen - Shopping cart with coupon functionality

### 3. Reducer Tests

Reducer tests ensure Redux state management works correctly for all actions.

**Example: Cart Reducer**
```javascript
it('should add new item to cart', () => {
  const action = {
    type: CART_ADD_ITEM,
    payload: newItem,
  };
  
  const state = cartReducer(initialState, action);
  
  expect(state.cartItems).toHaveLength(1);
  expect(state.cartItems[0]).toEqual(newItem);
});
```

**Reducers Tested:**
- ✅ Cart Reducer - Add/remove items, shipping, payment
- ✅ Product Reducer - List, details, create, update, delete
- ✅ User Reducer - Login, register, logout

### 4. Utility Tests

Utility tests verify helper functions and utilities.

**Example: Recently Viewed**
```javascript
it('should add a new product to recently viewed', () => {
  const product = { _id: '1', name: 'Test Product' };
  const result = addToRecentlyViewed(product);
  
  expect(result).toHaveLength(1);
  expect(result[0]._id).toBe('1');
});
```

**Utilities Tested:**
- ✅ recentlyViewed - LocalStorage management for recently viewed products

### 5. Integration Tests

Integration tests verify complete user flows across multiple components.

**Planned Integration Tests:**
- Checkout flow (Cart → Shipping → Payment → Order)
- Product search and filtering
- User authentication flow

## Test Utilities

### renderWithProviders

A custom render function that wraps components with Redux Provider and Router.

```javascript
import { renderWithProviders } from '../testUtils';

const initialState = {
  userLogin: { userInfo: mockUser },
  cart: { cartItems: [] },
};

renderWithProviders(<MyComponent />, { initialState });
```

### Mock Data

Pre-built mock data for common entities:

```javascript
import { 
  mockProduct, 
  mockUser, 
  mockOrder, 
  mockCartItem 
} from '../testUtils';
```

## Best Practices

### 1. Test Behavior, Not Implementation

❌ **Bad:**
```javascript
expect(component.state.counter).toBe(1);
```

✅ **Good:**
```javascript
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

### 2. Use Testing Library Queries Wisely

**Priority Order:**
1. `getByRole` - Accessibility first
2. `getByLabelText` - Form elements
3. `getByText` - User-visible text
4. `getByTestId` - Last resort

### 3. Mock External Dependencies

Always mock:
- API calls (axios)
- Child components (when testing parent)
- LocalStorage
- Router navigation

### 4. Keep Tests Independent

Each test should:
- Set up its own state
- Clean up after itself
- Not depend on other tests

### 5. Test User Interactions

```javascript
import { fireEvent } from '@testing-library/react';

const button = screen.getByText('Add to Cart');
fireEvent.click(button);

expect(mockDispatch).toHaveBeenCalledWith(addToCart('product-id'));
```

## Coverage Goals

| Category | Current | Goal |
|----------|---------|------|
| Statements | TBD | 80% |
| Branches | TBD | 75% |
| Functions | TBD | 80% |
| Lines | TBD | 80% |

## Continuous Integration

Tests should be run automatically:
- On every commit (pre-commit hook)
- On pull requests
- Before deployment

### GitHub Actions Example
```yaml
- name: Run tests
  run: |
    cd frontend
    npm test -- --coverage --watchAll=false
```

## Common Testing Patterns

### Testing Redux-Connected Components

```javascript
const initialState = {
  productList: { loading: false, products: [] },
};

renderWithProviders(<ProductScreen />, { initialState });
```

### Testing Async Operations

```javascript
it('should display products after loading', async () => {
  renderWithProviders(<HomeScreen />);
  
  await waitFor(() => {
    expect(screen.getByText('Product Name')).toBeInTheDocument();
  });
});
```

### Testing Forms

```javascript
const emailInput = screen.getByLabelText('Email');
fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
expect(emailInput).toHaveValue('test@example.com');
```

### Testing Navigation

```javascript
const mockHistory = { push: jest.fn() };
renderWithProviders(<Component history={mockHistory} />);

fireEvent.click(screen.getByText('Checkout'));
expect(mockHistory.push).toHaveBeenCalledWith('/shipping');
```

## Debugging Tests

### Run Tests in Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### View DOM in Tests
```javascript
import { screen } from '@testing-library/react';

screen.debug(); // Prints entire DOM
screen.debug(element); // Prints specific element
```

### Use Console Logs
```javascript
console.log(container.innerHTML); // View rendered HTML
```

## Adding New Tests

### 1. Create Test File
Place test file next to the component or in `__tests__` directory:
```
Component.js → Component.test.js
```

### 2. Import Dependencies
```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';
```

### 3. Write Tests
```javascript
describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### 4. Run and Verify
```bash
npm test MyComponent.test.js
```

## Troubleshooting

### Common Issues

**Issue: "Cannot find module"**
```bash
# Clear Jest cache
npm test -- --clearCache
```

**Issue: "Test timeout"**
```javascript
// Increase timeout for specific test
it('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

**Issue: "Act warning"**
```javascript
// Wrap state updates in act()
import { act } from '@testing-library/react';

await act(async () => {
  // async operations
});
```

## Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Maintenance

### Weekly Tasks
- Run full test suite with coverage
- Review and update failing tests
- Add tests for new features

### Monthly Tasks
- Review coverage reports
- Identify untested code paths
- Refactor test utilities as needed

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass
3. Maintain or improve coverage
4. Document any new test patterns

## Questions?

For testing-related questions, please:
- Check this guide first
- Review existing test files for examples
- Consult the team lead
- Update this guide with new patterns

---

**Last Updated:** December 2025
**Maintained By:** Development Team

