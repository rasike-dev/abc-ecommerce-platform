import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Row,
  Col,
  ListGroup,
  Image,
  Card,
  Button,
  Spinner,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  getOrderDetails,
  payOrder,
  deliverOrder,
  createPaymentSession,
  validatePayment,
} from '../actions/orderActions';
import {
  ORDER_PAY_RESET,
  ORDER_DELIVER_RESET,
} from '../constants/orderConstants';

const OrderScreen = ({ match, history }) => {
  const orderId = match.params.id;
  const [initiatingPayment, setInitiatingPayment] = useState(false);

  const dispatch = useDispatch();

  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;

  const orderPay = useSelector((state) => state.orderPay);
  const { loading: loadingPay, success: successPay } = orderPay;

  const orderSession = useSelector((state) => state.orderSession);
  const { loading: loadingSession, session, error: sessionError } = orderSession || {};

  const orderDeliver = useSelector((state) => state.orderDeliver);
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  if (!loading && order) {
    order.itemsPrice = addDecimals(
      order.orderItems.reduce((acc, item) => acc + item.price, 0)
    );
  }

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };

  const query = useQuery();

  useEffect(() => {
    if (!userInfo) {
      history.push('/login');
    }

    if (!order || order._id !== orderId) {
      dispatch(getOrderDetails(orderId));
    } else if (!order.isPaid) {
      const handlePaymentInitiation = async () => {
        try {
          const providerName = order.paymentProvider || 'combank';

          if (!order.paymentResult || !order.paymentResult.sessionId) {
            const sessionData = await dispatch(createPaymentSession(orderId, providerName));

            if (sessionData && sessionData.data && sessionData.data.redirectUrl) {
              window.location.href = sessionData.data.redirectUrl;
            }
          }
        } catch (paymentSessionError) {
          console.error('Error creating payment session:', paymentSessionError);
        }
      };

      const handlePaymentValidation = async () => {
        const sessionId = query.get('session_id'); // For Stripe
        const token = query.get('token'); // For PayPal
        const payerId = query.get('PayerID'); // For PayPal
        const resultIndicator = query.get('resultIndicator'); // For Combank
        const sessionVersion = query.get('sessionVersion'); // For Combank
        const paymentSuccess = query.get('success'); // Generic success flag from redirect
        const cancelled = query.get('cancelled'); // Generic cancelled flag from redirect

        if (paymentSuccess === 'true' && (sessionId || token || resultIndicator)) {
          const paymentData: any = {
            ...(sessionId && { sessionId }),
            ...(token && { token }),
            ...(payerId && { payerId }),
            ...(resultIndicator && { resultIndicator }),
            ...(sessionVersion && { sessionVersion }),
          };

          try {
            await dispatch(validatePayment(orderId, paymentData));
            history.replace(`/order/${orderId}`); 
          } catch (validationError) {
            console.error('Error validating payment:', validationError);
          }
        } else if (cancelled === 'true') {
          console.log('Payment was cancelled by user.');
          history.replace(`/order/${orderId}`); // Remove query params
        }
      };

      handlePaymentValidation();
      // Only initiate payment if no session is active and no redirect params are present
      if (!order.paymentResult?.sessionId && !query.get('session_id') && !query.get('token') && !query.get('resultIndicator')) {
        handlePaymentInitiation();
      }
    }
  }, [
    dispatch,
    orderId,
    history,
    order,
    userInfo,
    query,
  ]);

  const deliverHandler = () => {
    dispatch(deliverOrder(order));
  };

  const getMonth = (month) => {
    switch (month) {
      case 1: return 'January';
      case 2: return 'February';
      case 3: return 'March';
      case 4: return 'April';
      case 5: return 'May';
      case 6: return 'June';
      case 7: return 'July';
      case 8: return 'August';
      case 9: return 'September';
      case 10: return 'October';
      case 11: return 'November';
      case 12: return 'December';
      default: return '';
    }
  };

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : (
    <>
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>Billing</h2>
              <p>
                <strong>Name: </strong> {order.user.name}
              </p>
              <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Address:</strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode},{' '}
                {order.shippingAddress.country}
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant='success'>Paid on {order.paidAt}</Message>
              ) : order.isPaymentFail ? (
                <Message variant='danger'>
                  Payment Failed, Please try again.
                </Message>
              ) : (
                <Message variant='danger'>Not Paid</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {order.orderItems.map((item, index) => (
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
                          LKR {addDecimals(item.price)}
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
                  <Col>LKR {addDecimals(order.itemsPrice)}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Bank Charges</Col>
                  <Col>LKR {addDecimals(order.shippingPrice)}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>LKR {addDecimals(order.taxPrice)}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>LKR {addDecimals(order.totalPrice)}</Col>
                </Row>
              </ListGroup.Item>
              {!order.isPaid && (
                <ListGroup.Item>
                  {sessionError && (
                    <Message variant='danger'>
                      Payment initialization failed: {sessionError}
                    </Message>
                  )}
                  <Button
                    type='button'
                    className='btn-block'
                    disabled={!order || loading || loadingSession || initiatingPayment || !userInfo || !order.paymentProvider}
                    onClick={async () => {
                      console.log('Initiating payment for provider:', order.paymentProvider);
                      setInitiatingPayment(true);
                      try {
                        const providerName = order.paymentProvider || 'combank';
                        console.log('Creating payment session for:', providerName);
                        
                        const sessionData = await dispatch(createPaymentSession(orderId, providerName));
                        console.log('Session data received:', sessionData);
                        
                        console.log('Full session data structure:', JSON.stringify(sessionData, null, 2));
                        
                        let redirectUrl = null;
                        
                        // Check multiple possible locations for the redirect URL
                        if (sessionData?.data?.redirectUrl) {
                          redirectUrl = sessionData.data.redirectUrl;
                        } else if (sessionData?.redirectUrl) {
                          redirectUrl = sessionData.redirectUrl;
                        } else if (sessionData?.data?.links) {
                          // Check PayPal links structure
                          const approveLink = sessionData.data.links.find(link => link.rel === 'approve');
                          redirectUrl = approveLink?.href;
                        }
                        
                        if (redirectUrl) {
                          console.log('Redirecting to:', redirectUrl);
                          window.location.href = redirectUrl;
                        } else {
                          console.error('No redirect URL found in response:', sessionData);
                          setInitiatingPayment(false);
                        }
                      } catch (error) {
                        console.error('Payment initiation failed:', error);
                        setInitiatingPayment(false);
                      }
                    }}
                  >
                    {(loadingSession || initiatingPayment) ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        {' '}Initializing Payment...
                      </>
                    ) : (
                      'Initiate Payment'
                    )}
                  </Button>
                  {(!order || loading) && (
                    <div className="text-muted small mt-2">
                      Loading order details...
                    </div>
                  )}
                  {order && !userInfo && (
                    <div className="text-muted small mt-2">
                      Please log in to continue.
                    </div>
                  )}
                  {order && userInfo && !order.paymentProvider && (
                    <div className="text-muted small mt-2">
                      No payment method selected for this order.
                    </div>
                  )}
                </ListGroup.Item>
              )}
              {/* {loadingDeliver && <Loader />}
              {userInfo &&
                userInfo.isAdmin &&
                order.isPaid &&
                !order.isDelivered && (
                  <ListGroup.Item>
                    <Button
                      type='button'
                      className='btn btn-block'
                      onClick={deliverHandler}
                    >
                      Mark As Delivered
                    </Button>
                  </ListGroup.Item>
                )} */}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;
