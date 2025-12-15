import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import Product from './Product';
import { getRecentlyViewed } from '../utils/recentlyViewed';

const RecentlyViewed = () => {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    // Load recently viewed products from localStorage
    const products = getRecentlyViewed();
    setRecentProducts(products);
  }, []);

  // Don't render if no recently viewed products
  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <div className='my-4'>
      <h2>Recently Viewed</h2>
      <Row className='g-3'>
        {recentProducts.map((product) => (
          <Col key={product._id} xs={12} sm={6} md={6} lg={4} xl={3}>
            <Product product={product} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RecentlyViewed;

