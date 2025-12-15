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
  const [paymentRetryCount, setPaymentRetryCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(null);
  const [paymentBlocked, setPaymentBlocked] = useState(false);

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

  // Circuit breaker constants
  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_COOLDOWN_MINUTES = 5;
  const QUICK_RETRY_DELAY = 2000; // 2 seconds
  const PAYMENT_TIMEOUT = 30000; // 30 seconds timeout

  // Circuit breaker functions
  const canAttemptPayment = () => {
    if (paymentBlocked) return false;
    
    if (paymentRetryCount >= MAX_RETRY_ATTEMPTS) {
      const timeSinceLastAttempt = lastAttemptTime ? Date.now() - lastAttemptTime : 0;
      const cooldownPeriod = RETRY_COOLDOWN_MINUTES * 60 * 1000;
      
      if (timeSinceLastAttempt < cooldownPeriod) {
        return false;
      } else {
        // Reset retry count after cooldown
        setPaymentRetryCount(0);
        setLastAttemptTime(null);
      }
    }
    
    return true;
  };

  const handlePaymentFailure = (error) => {
    const newRetryCount = paymentRetryCount + 1;
    setPaymentRetryCount(newRetryCount);
    setLastAttemptTime(Date.now());
    
    if (newRetryCount >= MAX_RETRY_ATTEMPTS) {
      setPaymentBlocked(true);
      // Auto-unblock after cooldown
      setTimeout(() => {
        setPaymentBlocked(false);
        setPaymentRetryCount(0);
        setLastAttemptTime(null);
      }, RETRY_COOLDOWN_MINUTES * 60 * 1000);
    }
    
    console.error(`Payment attempt ${newRetryCount} failed:`, error);
  };

  const getRemainingCooldownTime = () => {
    if (!lastAttemptTime) return 0;
    const timeSinceLastAttempt = Date.now() - lastAttemptTime;
    const cooldownPeriod = RETRY_COOLDOWN_MINUTES * 60 * 1000;
    return Math.max(0, cooldownPeriod - timeSinceLastAttempt);
  };

  // Timeout wrapper for payment requests
  const withTimeout = (promise, timeoutMs) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Payment request timeout')), timeoutMs)
      )
    ]);
  };

  // Force reset loading state
  const resetPaymentState = () => {
    setInitiatingPayment(false);
  };

  // Auto-reset loading state after timeout
  const setPaymentTimeout = () => {
    return setTimeout(() => {
      console.warn('Payment request timed out - forcing reset');
      resetPaymentState();
      handlePaymentFailure(new Error('Payment request timed out'));
    }, PAYMENT_TIMEOUT);
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
      return;
    }

    if (!order || order._id !== orderId) {
      dispatch(getOrderDetails(orderId));
      return;
    }

    // This useEffect now only handles initial order loading and user authentication
  }, [dispatch, orderId, userInfo]); // Keep original dependencies

  // Separate useEffect for handling payment returns
  useEffect(() => {
    if (!order || order.isPaid) return;

    const sessionId = query.get('session_id'); // For Stripe
    const token = query.get('token'); // For PayPal
    const payerId = query.get('PayerID'); // For PayPal
    const resultIndicator = query.get('resultIndicator'); // For Combank
    const sessionVersion = query.get('sessionVersion'); // For Combank
    const paymentSuccess = query.get('success'); // Generic success flag from redirect
    const cancelled = query.get('cancelled'); // Generic cancelled flag from redirect

    // Only run if we have payment return parameters
    const hasPaymentParams = sessionId || token || resultIndicator || paymentSuccess || cancelled;
    
    if (hasPaymentParams) {
      console.log('=== PAYMENT RETURN DETECTED ===');
      console.log('URL Query params:', {
        sessionId,
        token,
        payerId,
        resultIndicator,
        sessionVersion,
        paymentSuccess,
        cancelled,
      });
      console.log('Current URL:', window.location.href);

      const handlePaymentReturn = async () => {
        // For Stripe, we need to validate if session_id exists
        if (sessionId) {
          console.log('Stripe return detected, validating payment...');
          const paymentData = { sessionId };
          
          try {
            const result = await dispatch(validatePayment(orderId, paymentData));
            console.log('Stripe validation result:', result);
            
            // Refresh the order to get updated payment status
            await dispatch(getOrderDetails(orderId));
            
            // Clean up URL parameters
            history.replace(`/order/${orderId}`); 
          } catch (validationError) {
            console.error('Stripe validation error:', validationError);
          }
        } else if (paymentSuccess === 'true' && token) {
          console.log('PayPal return detected, validating payment...');
          const paymentData = {
            token,
            ...(payerId && { payerId }),
          };

          try {
            const result = await dispatch(validatePayment(orderId, paymentData));
            console.log('PayPal validation result:', result);
            
            await dispatch(getOrderDetails(orderId));
            history.replace(`/order/${orderId}`); 
          } catch (validationError) {
            console.error('PayPal validation error:', validationError);
          }
        } else if (paymentSuccess === 'true' && resultIndicator) {
          console.log('ComBank return detected, validating payment...');
          const paymentData = {
            resultIndicator,
            ...(sessionVersion && { sessionVersion }),
          };

          try {
            const result = await dispatch(validatePayment(orderId, paymentData));
            console.log('ComBank validation result:', result);
            
            await dispatch(getOrderDetails(orderId));
            history.replace(`/order/${orderId}`); 
          } catch (validationError) {
            console.error('ComBank validation error:', validationError);
          }
        } else if (cancelled === 'true') {
          console.log('Payment was cancelled by user.');
          history.replace(`/order/${orderId}`);
        } else {
          console.log('No recognized payment return parameters found');
          console.log('Available parameters:', { sessionId, token, payerId, resultIndicator, paymentSuccess, cancelled });
        }
      };

      handlePaymentReturn();
    }
  }, [window.location.search, order, orderId, dispatch, history]); // Trigger when URL search params change

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
                    disabled={!order || loading || loadingSession || initiatingPayment || !userInfo || !order.paymentProvider || !canAttemptPayment()}
                    onClick={() => {
                      if (!canAttemptPayment()) {
                        console.log('Payment blocked by circuit breaker');
                        return;
                      }

                      console.log('=== PAYMENT INITIALIZATION STARTED ===');
                      console.log('Order ID:', orderId);
                      console.log('Provider:', order.paymentProvider);
                      console.log('User Info:', !!userInfo);
                      
                      setInitiatingPayment(true);
                      
                      // Force reset after 5 seconds if still loading
                      const forceResetTimeout = setTimeout(() => {
                        console.warn('FORCE RESET: Payment taking too long');
                        setInitiatingPayment(false);
                        handlePaymentFailure(new Error('Payment initialization timed out'));
                      }, 5000);
                      
                      // Check backend connectivity first
                      fetch('/api/payments/providers')
                        .then(response => {
                          console.log('Backend connectivity check:', response.status);
                          if (!response.ok) {
                            throw new Error(`Backend not accessible: ${response.status}`);
                          }
                          return response.json();
                        })
                        .then(() => {
                          console.log('Backend is accessible, proceeding with payment...');
                          
                          // Now try payment creation
                          const providerName = order.paymentProvider || 'combank';
                          console.log('Creating payment session for:', providerName);
                          
                          return dispatch(createPaymentSession(orderId, providerName));
                        })
                        .then(sessionData => {
                          clearTimeout(forceResetTimeout);
                          console.log('=== PAYMENT SESSION RESPONSE ===');
                          console.log('Response received:', !!sessionData);
                          console.log('Session data:', sessionData);
                          
                          if (sessionData && sessionData.error) {
                            console.error('Backend error details:', sessionData.error);
                          }
                          
                          if (!sessionData) {
                            throw new Error('No response from payment service');
                          }
                          
                          // Check for explicit error
                          if (sessionData.success === false) {
                            throw new Error(sessionData.message || 'Payment session creation failed');
                          }
                          
                          // Reset circuit breaker on success
                          setPaymentRetryCount(0);
                          setLastAttemptTime(null);
                          setPaymentBlocked(false);
                          
                          // Find redirect URL
                          let redirectUrl = null;
                          if (sessionData?.data?.redirectUrl) {
                            redirectUrl = sessionData.data.redirectUrl;
                          } else if (sessionData?.redirectUrl) {
                            redirectUrl = sessionData.redirectUrl;
                          } else if (sessionData?.data?.links) {
                            const approveLink = sessionData.data.links.find(link => link.rel === 'approve');
                            redirectUrl = approveLink?.href;
                          }
                          
                          console.log('Redirect URL found:', redirectUrl);
                          
                          if (redirectUrl) {
                            console.log('=== REDIRECTING TO PAYMENT ===');
                            window.location.href = redirectUrl;
                          } else {
                            throw new Error('No redirect URL found in response');
                          }
                        })
                        .catch(error => {
                          clearTimeout(forceResetTimeout);
                          console.error('=== PAYMENT INITIALIZATION FAILED ===');
                          console.error('Error:', error);
                          console.error('Error message:', error.message);
                          console.error('Error stack:', error.stack);
                          
                          setInitiatingPayment(false);
                          handlePaymentFailure(error);
                        });
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
                  
                  {/* Cancel button when payment is taking too long */}
                  {(loadingSession || initiatingPayment) && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="mt-2 w-100"
                      onClick={() => {
                        console.log('=== USER CANCELLED PAYMENT ===');
                        console.log('Force resetting all payment states...');
                        
                        // Force reset all payment states
                        setInitiatingPayment(false);
                        setPaymentRetryCount(0);
                        setLastAttemptTime(null);
                        setPaymentBlocked(false);
                        
                        // Try to reset Redux state as well
                        dispatch({ type: 'ORDER_CREATE_PAYMENT_SESSION_RESET' });
                        
                        console.log('Payment states reset by user');
                      }}
                    >
                      ⚠️ Force Cancel Payment
                    </Button>
                  )}
                  {/* Circuit Breaker Status Messages */}
                  {paymentBlocked && (
                    <div className="text-danger small mt-2">
                      <i className="fas fa-exclamation-triangle"></i>
                      {' '}Too many failed attempts. Payment temporarily blocked for {Math.ceil(getRemainingCooldownTime() / (60 * 1000))} minutes.
                    </div>
                  )}
                  {paymentRetryCount > 0 && paymentRetryCount < MAX_RETRY_ATTEMPTS && !paymentBlocked && (
                    <div className="text-warning small mt-2">
                      <i className="fas fa-info-circle"></i>
                      {' '}Previous attempt failed. Attempt {paymentRetryCount} of {MAX_RETRY_ATTEMPTS}.
                    </div>
                  )}
                  
                  {/* Regular Status Messages */}
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
