import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  ListGroup,
  Image,
  Form,
  Button,
  Card,
  InputGroup,
} from 'react-bootstrap';
import Message from '../components/Message';
import Breadcrumb from '../components/Breadcrumb';
import { addToCart, removeFromCart } from '../actions/cartActions';
import { validateCoupon, removeCoupon } from '../actions/couponActions';

const CartScreen = ({ match, location, history }) => {
  const [couponCode, setCouponCode] = useState('');
  
  const productId = match.params.id;

  const month = location.search ? Number(location.search.split('=')[1]) : 1;

  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const coupon = useSelector((state) => state.coupon);
  const { coupon: appliedCoupon, discountAmount, error: couponError } = coupon;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (productId) {
      dispatch(addToCart(productId, month));
    }
  }, [dispatch, productId, month]);

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price, 0);

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    history.push('/login?redirect=shipping');
  };

  const applyCouponHandler = () => {
    if (!userInfo) {
      alert('Please login to use coupons');
      return;
    }
    if (couponCode.trim()) {
      const productIds = cartItems.map((item) => item.product);
      dispatch(validateCoupon(couponCode.trim().toUpperCase(), cartTotal, productIds));
    }
  };

  const removeCouponHandler = () => {
    dispatch(removeCoupon());
    setCouponCode('');
  };

  const breadcrumbItems = [
    { text: 'Home', link: '/' },
    { text: 'Shopping Cart' }
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <Row>
      <Col md={8}>
        <h1>My Cart</h1>
        {cartItems.length === 0 ? (
          <Message>
            Your cart is empty <Link to='/'>Go Back</Link>
          </Message>
        ) : (
          <ListGroup variant='flush'>
            {cartItems.map((item) => (
              <ListGroup.Item key={item.product}>
                <Row className='align-items-center'>
                  <Col md={2} xs={3}>
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fluid 
                      rounded 
                      className='cart-item-image'
                    />
                  </Col>
                  <Col md={3} xs={9} className='ps-2 ps-md-3'>
                    <Link to={`/product/${item.product}`}>{item.name}</Link>
                  </Col>
                  <Col md={2} xs={6} className='mt-2 mt-md-0'>LKR{item.price}</Col>
                  <Col md={3} xs={5} className='mt-2 mt-md-0'>
                    <Form.Control
                      className='px-0'
                      as='select'
                      value={item.month}
                      onChange={(e) =>
                        dispatch(
                          addToCart(item.product, Number(e.target.value))
                        )
                      }
                    >
                      <option value='0'>Select...</option>
                      <option value='1'>1 - January</option>
                      <option value='2'>2 - February</option>
                      <option value='3'>3 - March</option>
                      <option value='4'>4 - April</option>
                      <option value='5'>5 - May</option>
                      <option value='6'>6 - June</option>
                      <option value='7'>7 - July</option>
                      <option value='8'>8 - August</option>
                      <option value='9'>9 - September</option>
                      <option value='10'>10 - October</option>
                      <option value='11'>11 - November</option>
                      <option value='12'>12 - December</option>
                      {/* {[...Array(item.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))} */}
                    </Form.Control>
                  </Col>
                  <Col md={1} xs={1} className='mt-2 mt-md-0'>
                    <Button
                      type='button'
                      variant='light'
                      onClick={() => removeFromCartHandler(item.product)}
                    >
                      <i className='fas fa-trash'></i>
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Col>
      <Col md={4}>
        <Card>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>
                Subtotal ({cartItems.reduce((acc, item) => acc + 1, 0)}) items
              </h2>
              LKR {cartTotal.toFixed(2)}
            </ListGroup.Item>

            {/* Coupon Section */}
            <ListGroup.Item>
              <h5>Have a Coupon?</h5>
              {appliedCoupon ? (
                <div>
                  <div className='d-flex justify-content-between align-items-center mb-2 p-2 bg-success text-white rounded'>
                    <div>
                      <i className='fas fa-check-circle mr-2'></i>
                      <strong>{appliedCoupon.code}</strong> applied!
                      <div className='small'>{appliedCoupon.description}</div>
                    </div>
                    <Button
                      variant='light'
                      size='sm'
                      onClick={removeCouponHandler}
                    >
                      <i className='fas fa-times'></i>
                    </Button>
                  </div>
                  <div className='d-flex justify-content-between'>
                    <span>Discount:</span>
                    <span className='text-success'>
                      -LKR {discountAmount?.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <InputGroup className='mb-2'>
                    <Form.Control
                      type='text'
                      placeholder='Enter coupon code'
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          applyCouponHandler();
                        }
                      }}
                    />
                    <Button
                      variant='outline-secondary'
                      onClick={applyCouponHandler}
                      disabled={!couponCode.trim() || cartItems.length === 0}
                    >
                      Apply
                    </Button>
                  </InputGroup>
                  {couponError && (
                    <Message variant='danger'>{couponError}</Message>
                  )}
                </div>
              )}
            </ListGroup.Item>

            {/* Total */}
            {appliedCoupon && (
              <ListGroup.Item>
                <h4 className='d-flex justify-content-between'>
                  <span>Total:</span>
                  <span>LKR {(cartTotal - (discountAmount || 0)).toFixed(2)}</span>
                </h4>
              </ListGroup.Item>
            )}

            <ListGroup.Item>
              <Button
                type='button'
                className='btn-block'
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                Proceed To Checkout
              </Button>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
    </>
  );
};

export default CartScreen;
