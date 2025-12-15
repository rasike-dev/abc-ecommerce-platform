import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import Product from '../components/Product';
import ProductGroup from '../components/ProductGroup';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';
import Meta from '../components/Meta';
import RecentlyViewed from '../components/RecentlyViewed';
import { ProductGridSkeleton } from '../components/SkeletonLoader';
import SortDropdown from '../components/SortDropdown';
import FilterPanel from '../components/FilterPanel';
import { listProducts } from '../actions/productActions';
import { listProductGroups } from '../actions/productGroupActions';

const HomeScreen = ({ match }) => {
  const keyword = match.params.keyword;
  const pageNumber = match.params.pageNumber || 1;
  const [sortBy, setSortBy] = useState('default');
  const [filters, setFilters] = useState({
    grade: '',
    subject: '',
    minPrice: '',
    maxPrice: '',
  });

  const dispatch = useDispatch();

  const productList = useSelector((state) => state.productList);
  const { loading, error, products, page, pages } = productList;

  const groupList = useSelector((state) => state.groupList);
  const { loading: loadingGroup, groups } = groupList;

  useEffect(() => {
    const filtersToSend = {
      ...filters,
      sortBy: sortBy !== 'default' ? sortBy : null,
    };
    dispatch(listProducts(keyword, pageNumber, null, filtersToSend));
    dispatch(listProductGroups(keyword, pageNumber));
  }, [dispatch, keyword, pageNumber, filters, sortBy]);

  const handleClearFilters = () => {
    setFilters({
      grade: '',
      subject: '',
      minPrice: '',
      maxPrice: '',
    });
    setSortBy('default');
  };

  return (
    <>
      <Meta />
      {!keyword ? (
        <ProductCarousel />
      ) : (
        <Link to='/' className='btn btn-light'>
          Go Back
        </Link>
      )}
      {!keyword && <RecentlyViewed />}
      
      <Row>
        {/* Filter Panel - Left Side */}
        <Col md={3} className='mb-3'>
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={handleClearFilters}
          />
        </Col>

        {/* Products - Right Side */}
        <Col md={9}>
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <h1 className='mb-0'>Latest Classes</h1>
            {!loading && !error && products && products.length > 0 && (
              <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
            )}
          </div>
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : error ? (
            <Message variant='danger'>{error}</Message>
          ) : (
            <>
              <Row className='g-3'>
                {products && products.map((product) => (
                  <Col key={product._id} xs={12} sm={6} md={6} lg={4}>
                    <Product product={product} />
                  </Col>
                ))}
              </Row>
              <Paginate
                pages={pages}
                page={page}
                keyword={keyword ? keyword : ''}
              />
            </>
          )}
        </Col>
      </Row>
    </>
  );
};

export default HomeScreen;
