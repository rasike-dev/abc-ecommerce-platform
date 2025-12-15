import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Rating from './Rating';
import QuickViewModal from './QuickViewModal';
import { addToWishlist, removeFromWishlist } from '../actions/wishlistActions';

const Product = ({ product }) => {
  const [showQuickView, setShowQuickView] = useState(false);
  const history = useHistory();
  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const wishlist = useSelector((state) => state.wishlist);
  const { wishlistItems } = wishlist;

  const isInWishlist = wishlistItems.some(
    (item) => item.product && item.product._id === product._id
  );

  const handleQuickView = (e) => {
    e.preventDefault();
    setShowQuickView(true);
  };

  const handleAddToCart = (productId) => {
    setShowQuickView(false);
    history.push(`/cart/${productId}?month=1`);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userInfo) {
      history.push('/login');
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product._id));
    }
  };

  return (
    <>
      <Card className='my-3 p-3 rounded product-card'>
        <div className='product-image-container' style={{ position: 'relative' }}>
          <Link to={`/product/${product._id}`}>
            <Card.Img src={product.image} variant='top' className='product-image' />
            <div className='product-overlay'>
              <Button 
                variant='light' 
                size='sm' 
                onClick={handleQuickView}
                className='quick-view-btn'
              >
                <i className='fas fa-eye'></i> Quick View
              </Button>
            </div>
          </Link>
          
          {/* Wishlist Heart Button - Outside Link */}
          <Button
            variant='light'
            size='sm'
            className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
            onClick={handleWishlistToggle}
          >
            <i className={`${isInWishlist ? 'fas' : 'far'} fa-heart`}></i>
          </Button>
        </div>

      <Card.Body>
        <Link to={`/product/${product._id}`}>
          <Card.Title as='div'>
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>
        
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
        
        <Card.Text as='h4'>{product.teacher}</Card.Text>
        <Card.Text as='h3'>LKR{product.price}</Card.Text>
        
        {/* Enrollment Count */}
        {product.enrollmentCount > 0 && (
          <Card.Text className='text-muted' style={{ fontSize: '0.9rem' }}>
            <i className='fas fa-users'></i> {product.enrollmentCount} students enrolled
          </Card.Text>
        )}
        
        <Card.Text as='div'>
          <Rating
            value={product.rating}
            text={`${product.numReviews} reviews`}
          />
        </Card.Text>
      </Card.Body>
    </Card>
    <QuickViewModal 
      show={showQuickView}
      onHide={() => setShowQuickView(false)}
      product={product}
      onAddToCart={handleAddToCart}
    />
    </>
  );
};

export default Product;
