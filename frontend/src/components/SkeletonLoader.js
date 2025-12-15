import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import './SkeletonLoader.css';

/**
 * Skeleton Loader for Product Cards
 */
export const ProductCardSkeleton = () => {
  return (
    <Card className='my-3 p-3 rounded product-card'>
      <div className='skeleton skeleton-image' style={{ height: '280px' }}></div>
      <Card.Body>
        <div className='skeleton skeleton-text' style={{ width: '80%', height: '20px', marginBottom: '10px' }}></div>
        <div className='skeleton skeleton-text' style={{ width: '60%', height: '16px', marginBottom: '10px' }}></div>
        <div className='skeleton skeleton-text' style={{ width: '40%', height: '24px', marginBottom: '10px' }}></div>
        <div className='skeleton skeleton-text' style={{ width: '70%', height: '16px' }}></div>
      </Card.Body>
    </Card>
  );
};

/**
 * Skeleton Loader for Product Grid
 */
export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <Row className='g-3'>
      {[...Array(count)].map((_, index) => (
        <Col key={index} xs={12} sm={6} md={6} lg={4} xl={3}>
          <ProductCardSkeleton />
        </Col>
      ))}
    </Row>
  );
};

/**
 * Skeleton Loader for Product Details Page
 */
export const ProductDetailSkeleton = () => {
  return (
    <Row>
      <Col md={4} className='mb-3 mb-md-0'>
        <div className='skeleton skeleton-image' style={{ height: '400px', width: '100%' }}></div>
      </Col>
      <Col md={4} className='mb-3 mb-md-0'>
        <div className='skeleton skeleton-text' style={{ width: '90%', height: '30px', marginBottom: '15px' }}></div>
        <div className='skeleton skeleton-text' style={{ width: '60%', height: '20px', marginBottom: '15px' }}></div>
        <div className='skeleton skeleton-text' style={{ width: '70%', height: '18px', marginBottom: '10px' }}></div>
        <div className='skeleton skeleton-text' style={{ width: '100%', height: '60px', marginBottom: '10px' }}></div>
      </Col>
      <Col md={4}>
        <Card>
          <Card.Body>
            <div className='skeleton skeleton-text' style={{ width: '80%', height: '20px', marginBottom: '15px' }}></div>
            <div className='skeleton skeleton-text' style={{ width: '60%', height: '20px', marginBottom: '15px' }}></div>
            <div className='skeleton skeleton-text' style={{ width: '70%', height: '20px', marginBottom: '15px' }}></div>
            <div className='skeleton skeleton-text' style={{ width: '100%', height: '40px' }}></div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

/**
 * Generic Skeleton Text
 */
export const SkeletonText = ({ width = '100%', height = '16px', className = '' }) => {
  return (
    <div 
      className={`skeleton skeleton-text ${className}`} 
      style={{ width, height }}
    ></div>
  );
};

/**
 * Generic Skeleton Image
 */
export const SkeletonImage = ({ width = '100%', height = '200px', className = '' }) => {
  return (
    <div 
      className={`skeleton skeleton-image ${className}`} 
      style={{ width, height }}
    ></div>
  );
};

export default ProductGridSkeleton;

