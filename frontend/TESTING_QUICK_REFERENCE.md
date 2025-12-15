# Testing Quick Reference Card

## 🚀 Quick Commands

```bash
# Run all tests (watch mode)
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode (non-interactive)
npm run test:ci

# Run specific test file
npm test Rating.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should render"
```

## 📝 Common Test Patterns

### Basic Component Test
```javascript
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

it('should render text', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Redux-Connected Component
```javascript
import { renderWithProviders } from '../testUtils';

it('should use Redux state', () => {
  const initialState = { user: { name: 'John' } };
  renderWithProviders(<MyComponent />, { initialState });
  expect(screen.getByText('John')).toBeInTheDocument();
});
```

### User Interaction
```javascript
import { fireEvent } from '@testing-library/react';

it('should handle click', () => {
  render(<MyComponent />);
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Clicked')).toBeInTheDocument();
});
```

### Form Input
```javascript
const input = screen.getByLabelText('Email');
fireEvent.change(input, { target: { value: 'test@example.com' } });
expect(input).toHaveValue('test@example.com');
```

### Async Operations
```javascript
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### Reducer Test
```javascript
import myReducer from '../reducers/myReducer';

it('should update state', () => {
  const action = { type: 'UPDATE', payload: 'data' };
  const state = myReducer(undefined, action);
  expect(state.data).toBe('data');
});
```

## 🔍 Query Methods

### Priority Order
1. `getByRole('button')` - Accessibility first
2. `getByLabelText('Email')` - Form labels
3. `getByText('Submit')` - Visible text
4. `getByTestId('custom-id')` - Last resort

### Query Variants
- `getBy...` - Throws error if not found
- `queryBy...` - Returns null if not found
- `findBy...` - Async, waits for element

## 🎯 Assertions

```javascript
// Existence
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();

// Visibility
expect(element).toBeVisible();
expect(element).not.toBeVisible();

// Content
expect(element).toHaveTextContent('Hello');
expect(element).toHaveValue('test@example.com');

// Attributes
expect(element).toHaveAttribute('href', '/login');
expect(element).toHaveClass('active');

// State
expect(element).toBeDisabled();
expect(element).toBeEnabled();
expect(element).toBeChecked();

// Arrays/Objects
expect(array).toHaveLength(3);
expect(object).toEqual({ key: 'value' });
expect(value).toBe('exact match');
```

## 🛠️ Debugging

```javascript
// View DOM
screen.debug();
screen.debug(element);

// Run only this test
it.only('test name', () => { ... });

// Skip this test
it.skip('test name', () => { ... });

// Increase timeout
it('slow test', () => { ... }, 10000);
```

## 📦 Mock Data

```javascript
import { 
  mockProduct,
  mockUser,
  mockOrder,
  mockCartItem 
} from '../testUtils';

// Use in tests
render(<Product product={mockProduct} />);
```

## 🎨 Custom Render

```javascript
import { renderWithProviders } from '../testUtils';

// With Redux state
renderWithProviders(<Component />, {
  initialState: {
    cart: { cartItems: [] },
    user: { userInfo: mockUser }
  }
});
```

## 🧪 Test Structure

```javascript
describe('Component Name', () => {
  // Setup
  beforeEach(() => {
    // Runs before each test
  });

  afterEach(() => {
    // Runs after each test
  });

  // Group related tests
  describe('when user is logged in', () => {
    it('should show user name', () => { ... });
    it('should show logout button', () => { ... });
  });

  describe('when user is not logged in', () => {
    it('should show login button', () => { ... });
  });
});
```

## ⚡ Tips

### DO ✅
- Test user behavior, not implementation
- Use descriptive test names
- Keep tests independent
- Mock external dependencies
- Test edge cases

### DON'T ❌
- Test implementation details
- Make tests depend on each other
- Test third-party libraries
- Write vague test names
- Ignore failing tests

## 📊 Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

## 🔗 Resources

- [Full Testing Guide](./TESTING_GUIDE.md)
- [Test Summary](./TEST_SUMMARY.md)
- [React Testing Library](https://testing-library.com/react)
- [Jest Docs](https://jestjs.io/)

---

**Keep this handy while writing tests!** 📌

