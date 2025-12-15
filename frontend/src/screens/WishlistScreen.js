import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button, Card } from 'react-bootstrap';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Product from '../components/Product';
import Breadcrumb from '../components/Breadcrumb';
import { getWishlist } from '../actions/wishlistActions';

const WishlistScreen = ({ history }) => {
  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const wishlist = useSelector((state) => state.wishlist);
  const { loading, error, wishlistItems } = wishlist;

  useEffect(() => {
    if (!userInfo) {
      history.push('/login');
    } else {
      dispatch(getWishlist());
    }
  }, [dispatch, history, userInfo]);

  const breadcrumbItems = [
    { text: 'Home', link: '/' },
    { text: 'My Wishlist' }
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <h1>
        <i className='fas fa-heart'></i> My Wishlist
      </h1>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : wishlistItems.length === 0 ? (
        <Card className='text-center p-5'>
          <Card.Body>
            <i className='far fa-heart' style={{ fontSize: '4rem', color: '#ccc', marginBottom: '1rem' }}></i>
            <h3>Your wishlist is empty</h3>
            <p className='text-muted'>Start adding courses you're interested in!</p>
            <Link to='/'>
              <Button variant='primary' className='mt-3'>
                Browse Courses
              </Button>
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <>
          <p className='text-muted'>
            {wishlistItems.length} {wishlistItems.length === 1 ? 'course' : 'courses'} in your wishlist
          </p>
          <Row className='g-3'>
            {wishlistItems.map((item) => (
              item.product && (
                <Col key={item.product._id} xs={12} sm={6} md={6} lg={4} xl={3}>
                  <Product product={item.product} />
                </Col>
              )
            ))}
          </Row>
        </>
      )}
    </>
  );
};

export default WishlistScreen;

