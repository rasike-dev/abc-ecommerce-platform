import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders, mockCartItem } from '../../test-utils';
import CartScreen from '../../screens/CartScreen';

// Mock child components
jest.mock('../../components/Message', () => {
  return function Message({ children }) {
    return <div data-testid="message">{children}</div>;
  };
});

jest.mock('../../components/Breadcrumb', () => {
  return function Breadcrumb() {
    return <div data-testid="breadcrumb">Breadcrumb</div>;
  };
});

// Mock actions
jest.mock('../../actions/cartActions', () => ({
  addToCart: jest.fn(() => ({ type: 'CART_ADD_ITEM' })),
  removeFromCart: jest.fn(() => ({ type: 'CART_REMOVE_ITEM' })),
}));

jest.mock('../../actions/couponActions', () => ({
  validateCoupon: jest.fn(() => ({ type: 'COUPON_VALIDATE_REQUEST' })),
  removeCoupon: jest.fn(() => ({ type: 'COUPON_REMOVE' })),
}));

describe('CartScreen', () => {
  const mockMatch = {
    params: {},
  };

  const mockLocation = {
    search: '',
  };

  const mockHistory = {
    push: jest.fn(),
  };

  it('should display empty cart message when no items', () => {
    const initialState = {
      cart: { cartItems: [] },
      coupon: {},
      userLogin: { userInfo: null },
    };

    renderWithProviders(
      <CartScreen match={mockMatch} location={mockLocation} history={mockHistory} />,
      { initialState }
    );

    expect(screen.getByTestId('message')).toHaveTextContent('Your cart is empty');
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('should display cart items when present', () => {
    const initialState = {
      cart: {
        cartItems: [
          { ...mockCartItem, product: '1', name: 'Test Product 1' },
          { ...mockCartItem, product: '2', name: 'Test Product 2' },
        ],
      },
      coupon: {},
      userLogin: { userInfo: null },
    };

    renderWithProviders(
      <CartScreen match={mockMatch} location={mockLocation} history={mockHistory} />,
      { initialState }
    );

    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
  });

  it('should display correct subtotal', () => {
    const initialState = {
      cart: {
        cartItems: [
          { ...mockCartItem, product: '1', price: 1000 },
          { ...mockCartItem, product: '2', price: 2000 },
        ],
      },
      coupon: {},
      userLogin: { userInfo: null },
    };

    renderWithProviders(
      <CartScreen match={mockMatch} location={mockLocation} history={mockHistory} />,
      { initialState }
    );

    expect(screen.getByText(/Subtotal \(2\) items/)).toBeInTheDocument();
    expect(screen.getByText('LKR 3000.00')).toBeInTheDocument();
  });

  it('should display coupon input when no coupon applied', () => {
    const initialState = {
      cart: { cartItems: [mockCartItem] },
      coupon: {},
      userLogin: { userInfo: { name: 'Test User' } },
    };

    renderWithProviders(
      <CartScreen match={mockMatch} location={mockLocation} history={mockHistory} />,
      { initialState }
    );

    expect(screen.getByPlaceholderText('Enter coupon code')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
  });

  it('should display applied coupon information', () => {
    const initialState = {
      cart: { cartItems: [mockCartItem] },
      coupon: {
        coupon: { code: 'SAVE10', description: '10% off' },
        discountAmount: 100,
      },
      userLogin: { userInfo: { name: 'Test User' } },
    };

    renderWithProviders(
      <CartScreen match={mockMatch} location={mockLocation} history={mockHistory} />,
      { initialState }
    );

    expect(screen.getByText('SAVE10')).toBeInTheDocument();
    expect(screen.getByText('10% off')).toBeInTheDocument();
    expect(screen.getByText('-LKR 100.00')).toBeInTheDocument();
  });

  it('should calculate total with discount when coupon applied', () => {
    const initialState = {
      cart: { cartItems: [{ ...mockCartItem, price: 1000 }] },
      coupon: {
        coupon: { code: 'SAVE10' },
        discountAmount: 100,
      },
      userLogin: { userInfo: { name: 'Test User' } },
    };

    renderWithProviders(
      <CartScreen match={mockMatch} location={mockLocation} history={mockHistory} />,
      { initialState }
    );

    expect(screen.getByText('LKR 900.00')).toBeInTheDocument();
  });

  it('should disable checkout button when cart is empty', () => {
    const initialState = {
      cart: { cartItems: [] },
      coupon: {},
      userLogin: { userInfo: null },
    };

    renderWithProviders(
      <CartScreen match={mockMatch} location={mockLocation} history={mockHistory} />,
      { initialState }
    );

    const checkoutButton = screen.getByText('Proceed To Checkout');
    expect(checkoutButton).toBeDisabled();
  });

  it('should enable checkout button when cart has items', () => {
    const initialState = {
      cart: { cartItems: [mockCartItem] },
      coupon: {},
      userLogin: { userInfo: null },
    };

    renderWithProviders(
      <CartScreen match={mockMatch} location={mockLocation} history={mockHistory} />,
      { initialState }
    );

    const checkoutButton = screen.getByText('Proceed To Checkout');
    expect(checkoutButton).not.toBeDisabled();
  });

  it('should navigate to login on checkout', () => {
    const initialState = {
      cart: { cartItems: [mockCartItem] },
      coupon: {},
      userLogin: { userInfo: null },
    };

    renderWithProviders(
      <CartScreen match={mockMatch} location={mockLocation} history={mockHistory} />,
      { initialState }
    );

    const checkoutButton = screen.getByText('Proceed To Checkout');
    fireEvent.click(checkoutButton);

    expect(mockHistory.push).toHaveBeenCalledWith('/login?redirect=shipping');
  });

  it('should display trash icon for removing items', () => {
    const initialState = {
      cart: { cartItems: [mockCartItem] },
      coupon: {},
      userLogin: { userInfo: null },
    };

    const { container } = renderWithProviders(
      <CartScreen match={mockMatch} location={mockLocation} history={mockHistory} />,
      { initialState }
    );

    const trashIcon = container.querySelector('.fa-trash');
    expect(trashIcon).toBeInTheDocument();
  });

  it('should display month selector for each item', () => {
    const initialState = {
      cart: { cartItems: [mockCartItem] },
      coupon: {},
      userLogin: { userInfo: null },
    };

    const { container } = renderWithProviders(
      <CartScreen match={mockMatch} location={mockLocation} history={mockHistory} />,
      { initialState }
    );

    const selectElement = container.querySelector('select');
    expect(selectElement).toBeInTheDocument();
    expect(selectElement).toHaveValue('1');
  });

  it('should display coupon error when validation fails', () => {
    const initialState = {
      cart: { cartItems: [mockCartItem] },
      coupon: { error: 'Invalid coupon code' },
      userLogin: { userInfo: { name: 'Test User' } },
    };

    renderWithProviders(
      <CartScreen match={mockMatch} location={mockLocation} history={mockHistory} />,
      { initialState }
    );

    expect(screen.getByText('Invalid coupon code')).toBeInTheDocument();
  });

  it('should render breadcrumb', () => {
    const initialState = {
      cart: { cartItems: [] },
      coupon: {},
      userLogin: { userInfo: null },
    };

    renderWithProviders(
      <CartScreen match={mockMatch} location={mockLocation} history={mockHistory} />,
      { initialState }
    );

    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
  });

  it('should display My Cart heading', () => {
    const initialState = {
      cart: { cartItems: [] },
      coupon: {},
      userLogin: { userInfo: null },
    };

    renderWithProviders(
      <CartScreen match={mockMatch} location={mockLocation} history={mockHistory} />,
      { initialState }
    );

    expect(screen.getByText('My Cart')).toBeInTheDocument();
  });
});

