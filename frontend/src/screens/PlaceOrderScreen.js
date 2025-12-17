import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import CheckoutSteps from '../components/CheckoutSteps';
import Breadcrumb from '../components/Breadcrumb';
import { createOrder, createPaymentSession } from '../actions/orderActions';
import { ORDER_CREATE_RESET } from '../constants/orderConstants';
import { USER_DETAILS_RESET } from '../constants/userConstants';

const PlaceOrderScreen = ({ history }) => {
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const coupon = useSelector((state) => state.coupon);
  const { coupon: appliedCoupon, discountAmount } = coupon;

  if (!cart.shippingAddress.address) {
    history.push('/shipping');
  } else if (!cart.paymentMethod) {
    history.push('/payment');
  }
  //   Calculate prices
  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  const getBankFees = (price) => {
    if (Number(price) <= 2000) {
      return Number((2.3 * price) / 100);
    } else if (2000 < price && price <= 3000) {
      return Number((2.15 * price) / 100);
    } else if (3000 < price && price <= 5000) {
      return Number((2.05 * price) / 100);
    } else {
      return Number((2 * price) / 100);
    }
  };

  cart.itemsPrice = addDecimals(
    cart.cartItems.reduce((acc, item) => acc + item.price, 0)
  );
  
  // Apply discount if coupon is applied
  cart.discountAmount = discountAmount ? addDecimals(discountAmount) : '0.00';
  const subtotalAfterDiscount = Number(cart.itemsPrice) - Number(cart.discountAmount);
  
  cart.shippingPrice = addDecimals(
    Number(getBankFees(subtotalAfterDiscount)).toFixed(2)
  );
  cart.taxPrice = addDecimals(Number((0.0 * subtotalAfterDiscount).toFixed(2)));
  cart.totalPrice = (
    subtotalAfterDiscount +
    Number(cart.shippingPrice) +
    Number(cart.taxPrice)
  ).toFixed(2);

  const orderCreate = useSelector((state) => state.orderCreate);
  const { order, success, error } = orderCreate;

  useEffect(() => {
    if (success) {
      const redirectPayment = async () => {
        const providerName = order.paymentProvider || 'combank';
        try {
          const sessionData = await dispatch(createPaymentSession(order._id, providerName));
          if (sessionData && sessionData.data && sessionData.data.redirectUrl) {
            window.location.href = sessionData.data.redirectUrl;
          } else {
            // If no redirect URL, just go to order details (e.g., Combank lightbox)
            history.push(`/order/${order._id}`);
          }
        } catch (error) {
          console.error('Error creating payment session during redirect:', error);
          history.push(`/order/${order._id}`); // Go to order details even if session creation fails
        }
      };
      redirectPayment();

      dispatch({ type: USER_DETAILS_RESET });
      dispatch({ type: ORDER_CREATE_RESET });
    }
    // eslint-disable-next-line
  }, [history, success, dispatch, order]);

  const placeOrderHandler = () => {
    dispatch(
      createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod.method || cart.paymentMethod,
        paymentProvider: cart.paymentMethod.provider || 'combank',
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
        couponCode: appliedCoupon?.code || null,
        discountAmount: cart.discountAmount,
      })
    );
  };

  const getMonth = (month) => {
    switch (month) {
      case 1:
        return 'January';
      case 2:
        return 'February';
      case 3:
        return 'March';
      case 4:
        return 'April';
      case 5:
        return 'May';
      case 6:
        return 'June';
      case 7:
        return 'July';
      case 8:
        return 'August';
      case 9:
        return 'September';
      case 10:
        return 'October';
      case 11:
        return 'November';
      case 12:
        return 'December';
      default:
        return 'Unknown';
    }
  };

  const breadcrumbItems = [
    { text: 'Home', link: '/' },
    { text: 'Cart', link: '/cart' },
    { text: 'Shipping', link: '/shipping' },
    { text: 'Place Order' }
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <CheckoutSteps step1 step2 step3 step4 />
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>Billing</h2>
              <p>
                <strong>Address:</strong>
                {cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
                {cart.shippingAddress.postalCode},{' '}
                {cart.shippingAddress.country}
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <strong>Method: </strong>
              {cart.paymentMethod.method || cart.paymentMethod}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {cart.cartItems.length === 0 ? (
                <Message>Your cart is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {cart.cartItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row className='align-items-center'>
                        <Col md={1} xs={3}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                            className='cart-item-image'
                          />
                        </Col>
                        <Col md={5} xs={9}>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={2} xs={6} className='mt-2 mt-md-0'>{getMonth(item.month)}</Col>
                        <Col md={2} xs={6} className='px-0 mt-2 mt-md-0'>
                          LKR {item.price.toFixed(2)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>LKR {cart.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              
              {appliedCoupon && (
                <ListGroup.Item>
                  <Row>
                    <Col>
                      Discount ({appliedCoupon.code})
                      <div className='small text-muted'>{appliedCoupon.description}</div>
                    </Col>
                    <Col className='text-success'>-LKR {cart.discountAmount}</Col>
                  </Row>
                </ListGroup.Item>
              )}
              
              <ListGroup.Item>
                <Row>
                  <Col>Bank Charges</Col>
                  <Col>LKR {cart.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>LKR {cart.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col><strong>Total</strong></Col>
                  <Col><strong>LKR {cart.totalPrice}</strong></Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                {error && <Message variant='danger'>{error}</Message>}
              </ListGroup.Item>
              <ListGroup.Item>
                <Button
                  type='button'
                  className='btn-block'
                  disabled={cart.cartItems === 0}
                  onClick={placeOrderHandler}
                >
                  Place Order
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PlaceOrderScreen;
