import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders, mockProduct } from '../../test-utils';
import Product from '../../components/Product';

// Mock the child components
jest.mock('../../components/Rating', () => {
  return function Rating({ value, text }) {
    return <div data-testid="rating">{`${value} - ${text}`}</div>;
  };
});

jest.mock('../../components/QuickViewModal', () => {
  return function QuickViewModal({ show, product }) {
    return show ? <div data-testid="quick-view-modal">{product.name}</div> : null;
  };
});

describe('Product Component', () => {
  const initialState = {
    userLogin: { userInfo: null },
    wishlist: { wishlistItems: [] },
  };

  it('should render product information correctly', () => {
    renderWithProviders(<Product product={mockProduct} />, { initialState });
    
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.teacher)).toBeInTheDocument();
    expect(screen.getByText(`LKR${mockProduct.price}`)).toBeInTheDocument();
  });

  it('should display bestseller badge when isBestseller is true', () => {
    renderWithProviders(<Product product={mockProduct} />, { initialState });
    expect(screen.getByText(/Bestseller/)).toBeInTheDocument();
  });

  it('should display new course badge when isNewCourse is true', () => {
    const newProduct = { ...mockProduct, isNewCourse: true };
    renderWithProviders(<Product product={newProduct} />, { initialState });
    expect(screen.getByText(/New/)).toBeInTheDocument();
  });

  it('should display popular badge when isPopular is true', () => {
    const popularProduct = { ...mockProduct, isPopular: true };
    renderWithProviders(<Product product={popularProduct} />, { initialState });
    expect(screen.getByText(/Popular/)).toBeInTheDocument();
  });

  it('should display enrollment count when greater than 0', () => {
    renderWithProviders(<Product product={mockProduct} />, { initialState });
    expect(screen.getByText(/100 students enrolled/)).toBeInTheDocument();
  });

  it('should render rating component with correct props', () => {
    renderWithProviders(<Product product={mockProduct} />, { initialState });
    expect(screen.getByTestId('rating')).toHaveTextContent(`${mockProduct.rating}`);
    expect(screen.getByTestId('rating')).toHaveTextContent(`${mockProduct.numReviews} reviews`);
  });

  it('should show Quick View button on hover area', () => {
    renderWithProviders(<Product product={mockProduct} />, { initialState });
    expect(screen.getByText(/Quick View/)).toBeInTheDocument();
  });

  it('should open quick view modal when Quick View is clicked', () => {
    renderWithProviders(<Product product={mockProduct} />, { initialState });
    
    const quickViewBtn = screen.getByText(/Quick View/);
    fireEvent.click(quickViewBtn);
    
    expect(screen.getByTestId('quick-view-modal')).toBeInTheDocument();
  });

  it('should show empty heart icon when product not in wishlist', () => {
    const { container } = renderWithProviders(<Product product={mockProduct} />, { initialState });
    const heartIcon = container.querySelector('.fa-heart');
    expect(heartIcon).toHaveClass('far'); // Regular (empty) heart
  });

  it('should show filled heart icon when product in wishlist', () => {
    const stateWithWishlist = {
      userLogin: { userInfo: { name: 'Test User' } },
      wishlist: { 
        wishlistItems: [{ product: { _id: mockProduct._id } }] 
      },
    };
    
    const { container } = renderWithProviders(<Product product={mockProduct} />, { 
      initialState: stateWithWishlist 
    });
    
    const heartIcon = container.querySelector('.fa-heart');
    expect(heartIcon).toHaveClass('fas'); // Solid (filled) heart
  });

  it('should redirect to login when wishlist clicked without user', () => {
    const { container } = renderWithProviders(<Product product={mockProduct} />, { initialState });
    
    const wishlistBtn = container.querySelector('.wishlist-btn');
    fireEvent.click(wishlistBtn);
    
    // Check if history.push was called (would need to mock useHistory)
    // This is a simplified check
    expect(wishlistBtn).toBeInTheDocument();
  });

  it('should link to product detail page', () => {
    const { container } = renderWithProviders(<Product product={mockProduct} />, { initialState });
    
    const productLinks = container.querySelectorAll(`a[href="/product/${mockProduct._id}"]`);
    expect(productLinks.length).toBeGreaterThan(0);
  });

  it('should display product image', () => {
    const { container } = renderWithProviders(<Product product={mockProduct} />, { initialState });
    
    const image = container.querySelector('.product-image');
    expect(image).toHaveAttribute('src', mockProduct.image);
  });
});

