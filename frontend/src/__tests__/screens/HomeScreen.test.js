import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, mockProduct } from '../../test-utils';
import HomeScreen from '../../screens/HomeScreen';

// Mock child components
jest.mock('../../components/Product', () => {
  return function Product({ product }) {
    return <div data-testid="product">{product.name}</div>;
  };
});

jest.mock('../../components/ProductCarousel', () => {
  return function ProductCarousel() {
    return <div data-testid="product-carousel">Carousel</div>;
  };
});

jest.mock('../../components/Loader', () => {
  return function Loader() {
    return <div data-testid="loader">Loading...</div>;
  };
});

jest.mock('../../components/Message', () => {
  return function Message({ children }) {
    return <div data-testid="message">{children}</div>;
  };
});

jest.mock('../../components/Meta', () => {
  return function Meta() {
    return null;
  };
});

jest.mock('../../components/RecentlyViewed', () => {
  return function RecentlyViewed() {
    return <div data-testid="recently-viewed">Recently Viewed</div>;
  };
});

jest.mock('../../components/Paginate', () => {
  return function Paginate() {
    return <div data-testid="paginate">Pagination</div>;
  };
});

jest.mock('../../components/SortDropdown', () => {
  return function SortDropdown() {
    return <div data-testid="sort-dropdown">Sort</div>;
  };
});

jest.mock('../../components/FilterPanel', () => {
  return function FilterPanel() {
    return <div data-testid="filter-panel">Filters</div>;
  };
});

jest.mock('../../components/ProductGroup', () => {
  return function ProductGroup() {
    return <div data-testid="product-group">Product Group</div>;
  };
});

jest.mock('../../components/SkeletonLoader', () => ({
  ProductGridSkeleton: function ProductGridSkeleton() {
    return <div data-testid="skeleton-loader">Loading skeleton...</div>;
  },
}));

// Mock actions
jest.mock('../../actions/productActions', () => ({
  listProducts: jest.fn(() => ({ type: 'PRODUCT_LIST_REQUEST' })),
}));

jest.mock('../../actions/productGroupActions', () => ({
  listProductGroups: jest.fn(() => ({ type: 'GROUP_LIST_REQUEST' })),
}));

describe('HomeScreen', () => {
  const mockMatch = {
    params: {},
  };

  it('should render loading state', () => {
    const initialState = {
      productList: { loading: true, products: [] },
      groupList: { loading: true, groups: [] },
    };

    renderWithProviders(<HomeScreen match={mockMatch} />, { initialState });

    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });

  it('should render error message when error occurs', () => {
    const initialState = {
      productList: { loading: false, error: 'Failed to fetch products', products: [] },
      groupList: { loading: false, groups: [] },
    };

    renderWithProviders(<HomeScreen match={mockMatch} />, { initialState });

    expect(screen.getByTestId('message')).toHaveTextContent('Failed to fetch products');
  });

  it('should render products when loaded successfully', () => {
    const initialState = {
      productList: {
        loading: false,
        products: [
          { ...mockProduct, _id: '1', name: 'Product 1' },
          { ...mockProduct, _id: '2', name: 'Product 2' },
        ],
        page: 1,
        pages: 1,
      },
      groupList: { loading: false, groups: [] },
    };

    renderWithProviders(<HomeScreen match={mockMatch} />, { initialState });

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('should render carousel when no keyword', () => {
    const initialState = {
      productList: { loading: false, products: [], page: 1, pages: 1 },
      groupList: { loading: false, groups: [] },
    };

    renderWithProviders(<HomeScreen match={mockMatch} />, { initialState });

    expect(screen.getByTestId('product-carousel')).toBeInTheDocument();
  });

  it('should render back button when keyword exists', () => {
    const matchWithKeyword = {
      params: { keyword: 'test' },
    };

    const initialState = {
      productList: { loading: false, products: [], page: 1, pages: 1 },
      groupList: { loading: false, groups: [] },
    };

    renderWithProviders(<HomeScreen match={matchWithKeyword} />, { initialState });

    expect(screen.getByText('Go Back')).toBeInTheDocument();
    expect(screen.queryByTestId('product-carousel')).not.toBeInTheDocument();
  });

  it('should render recently viewed when no keyword', () => {
    const initialState = {
      productList: { loading: false, products: [], page: 1, pages: 1 },
      groupList: { loading: false, groups: [] },
    };

    renderWithProviders(<HomeScreen match={mockMatch} />, { initialState });

    expect(screen.getByTestId('recently-viewed')).toBeInTheDocument();
  });

  it('should not render recently viewed when keyword exists', () => {
    const matchWithKeyword = {
      params: { keyword: 'test' },
    };

    const initialState = {
      productList: { loading: false, products: [], page: 1, pages: 1 },
      groupList: { loading: false, groups: [] },
    };

    renderWithProviders(<HomeScreen match={matchWithKeyword} />, { initialState });

    expect(screen.queryByTestId('recently-viewed')).not.toBeInTheDocument();
  });

  it('should render filter panel', () => {
    const initialState = {
      productList: { loading: false, products: [], page: 1, pages: 1 },
      groupList: { loading: false, groups: [] },
    };

    renderWithProviders(<HomeScreen match={mockMatch} />, { initialState });

    expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
  });

  it('should render sort dropdown when products exist', () => {
    const initialState = {
      productList: {
        loading: false,
        products: [mockProduct],
        page: 1,
        pages: 1,
      },
      groupList: { loading: false, groups: [] },
    };

    renderWithProviders(<HomeScreen match={mockMatch} />, { initialState });

    expect(screen.getByTestId('sort-dropdown')).toBeInTheDocument();
  });

  it('should render pagination when products loaded', () => {
    const initialState = {
      productList: {
        loading: false,
        products: [mockProduct],
        page: 1,
        pages: 2,
      },
      groupList: { loading: false, groups: [] },
    };

    renderWithProviders(<HomeScreen match={mockMatch} />, { initialState });

    expect(screen.getByTestId('paginate')).toBeInTheDocument();
  });

  it('should display "Latest Classes" heading', () => {
    const initialState = {
      productList: { loading: false, products: [], page: 1, pages: 1 },
      groupList: { loading: false, groups: [] },
    };

    renderWithProviders(<HomeScreen match={mockMatch} />, { initialState });

    expect(screen.getByText('Latest Classes')).toBeInTheDocument();
  });
});

