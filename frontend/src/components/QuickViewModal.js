import React from 'react';
import { Modal, Button, Row, Col, Image, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';

/**
 * Quick View Modal Component
 * Shows a quick preview of product details without navigating to product page
 */
const QuickViewModal = ({ show, onHide, product, onAddToCart }) => {
  if (!product) return null;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product._id);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size='lg' centered>
      <Modal.Header closeButton>
        <Modal.Title>Quick View</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={5} className='mb-3 mb-md-0'>
            <Image 
              src={product.image} 
              alt={product.name} 
              fluid 
              className='rounded'
            />
          </Col>
          <Col md={7}>
            <h3>{product.name}</h3>
            
            {/* Badges */}
            <div className='mb-2'>
              {product.isBestseller && (
                <span className='badge badge-warning mr-1'>
                  <i className='fas fa-star'></i> Bestseller
                </span>
              )}
              {product.isNewCourse && (
                <span className='badge badge-success mr-1'>
                  <i className='fas fa-sparkles'></i> New
                </span>
              )}
              {product.isPopular && (
                <span className='badge badge-info mr-1'>
                  <i className='fas fa-fire'></i> Popular
                </span>
              )}
            </div>
            
            <Rating 
              value={product.rating} 
              text={`${product.numReviews} reviews`} 
            />
            <ListGroup variant='flush' className='mt-3'>
              <ListGroup.Item className='px-0'>
                <strong>Teacher:</strong> {product.teacher}
              </ListGroup.Item>
              <ListGroup.Item className='px-0'>
                <strong>Price:</strong> <span className='text-primary'>LKR {product.price}</span>
              </ListGroup.Item>
              {product.enrollmentCount > 0 && (
                <ListGroup.Item className='px-0'>
                  <strong>Students Enrolled:</strong> {product.enrollmentCount}
                </ListGroup.Item>
              )}
              {product.grade && (
                <ListGroup.Item className='px-0'>
                  <strong>Grade:</strong> {product.grade}
                </ListGroup.Item>
              )}
              {product.subject && (
                <ListGroup.Item className='px-0'>
                  <strong>Subject:</strong> {product.subject}
                </ListGroup.Item>
              )}
              <ListGroup.Item className='px-0'>
                <strong>Description:</strong>
                <p className='mt-2 mb-0'>{product.description}</p>
              </ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={onHide}>
          Close
        </Button>
        <Link to={`/product/${product._id}`}>
          <Button variant='info' onClick={onHide}>
            View Full Details
          </Button>
        </Link>
        <Button variant='primary' onClick={handleAddToCart}>
          <i className='fas fa-shopping-cart'></i> Add to Cart
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QuickViewModal;

