import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Row,
  Col,
  ListGroup,
  Image,
  Card,
  Button,
  Form,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  getOrderDetails,
  payOrder,
  deliverOrder,
  getSessionDetails,
} from '../actions/orderActions';
import {
  ORDER_PAY_RESET,
  ORDER_DELIVER_RESET,
} from '../constants/orderConstants';

const OrderScreen = ({ match, history }) => {
  const orderId = match.params.id;

  const [sdkReady, setSdkReady] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const dispatch = useDispatch();

  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;

  const orderPay = useSelector((state) => state.orderPay);
  const { loading: loadingPay, success: successPay } = orderPay;

  const orderDeliver = useSelector((state) => state.orderDeliver);
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const sessionDetails = useSelector((state) => state.sessionDetails);
  const { session, loading: loadingSession } = sessionDetails;

  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  if (!loading) {
    //   Calculate prices
    order.itemsPrice = addDecimals(
      order.orderItems.reduce((acc, item) => acc + item.price, 0)
    );
  }

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };

  let query = useQuery();
  let resultIndicator = query.get('resultIndicator');
  let sessionVersion = query.get('sessionVersion');

  console.log(resultIndicator, sessionVersion);

  useEffect(() => {
    if (!userInfo) {
      history.push('/login');
    }

    const addPayPalScript = async () => {
      // const { data: clientId } = await axios.get('/api/config/paypal');
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://cbcmpgs.gateway.mastercard.com/checkout/version/56/checkout.js`;
      script.async = true;
      script.onload = () => {
        setSdkReady(true);
      };
      document.body.appendChild(script);
    };

    if (!order || successPay || order._id !== orderId) {
      dispatch({ type: ORDER_PAY_RESET });
      // dispatch({ type: ORDER_DELIVER_RESET });
      dispatch(getOrderDetails(orderId));
    } else if (!order.isPaid) {
      if (!window.Checkout) {
        addPayPalScript();
      } else {
        setSdkReady(true);
      }

      if (!session && !resultIndicator) {
        dispatch(getSessionDetails(orderId));
      } else if (resultIndicator && !loading) {
        const paymentResult = {
          resultIndicator: resultIndicator,
          sessionVersion: sessionVersion,
        };

        dispatch(payOrder(orderId, paymentResult));
      }
    } else if (order.isPaid) {
      console.log('order paid');
    }
  }, [
    dispatch,
    orderId,
    successPay,
    order,
    session,
    resultIndicator,
    userInfo,
  ]);

  const successPaymentHandler = (paymentResult) => {
    console.log(paymentResult);
    dispatch(payOrder(orderId, paymentResult));
  };

  const deliverHandler = () => {
    dispatch(deliverOrder(order));
  };

  const showLightBoxView = () => {
    dispatch({ type: ORDER_PAY_RESET });
    console.log(session.sessionId);
    window.Checkout.configure({
      session: {
        id: session.sessionId
          ? session.sessionId
          : order.paymentResult.sessionId,
      },
      merchant: 'TESTIMESCHOOLLKR',
      order: {
        amount: order.totalPrice,
        currency: 'LKR',
        description: 'Ordered goods',
        id: order._id,
      },
      interaction: {
        displayControl: {
          // you may change these settings as you prefer
          billingAddress: 'HIDE',
          customerEmail: 'HIDE',
          orderSummary: 'SHOW',
          shipping: 'HIDE',
        },
        merchant: {
          name: 'IME Online School',
          address: {
            line1: 'Kotte',
            line2: 'Sri Lanka',
          },
        },
        operation: 'PURCHASE',
      },
    });
    window.Checkout.showLightbox();
  };

  const showPaymentPage = () => {
    dispatch({ type: ORDER_PAY_RESET });
    window.Checkout.configure({
      session: {
        id: session.sessionId
          ? session.sessionId
          : order.paymentResult.sessionId,
      },
      interaction: {
        displayControl: {
          // you may change these settings as you prefer
          billingAddress: 'HIDE',
          customerEmail: 'HIDE',
          orderSummary: 'SHOW',
          shipping: 'HIDE',
        },
        merchant: {
          name: 'IME Online School',
          address: {
            line1: 'Kotte',
            line2: 'Sri Lanka',
          },
        },
      },
    });
    window.Checkout.showPaymentPage();
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
    }
  };

  const handleCheck = (e) => {
    setIsActive(e);
    console.log(isActive);
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
              {/* {order.isDelivered ? (
                <Message variant='success'>
                  Delivered on {order.deliveredAt}
                </Message>
              ) : (
                <Message variant='danger'>Not Delivered</Message>
              )} */}
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
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={2}>{getMonth(item.month)}</Col>
                        <Col md={2} className='px-0'>
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
                  <Form.Check
                    type='checkbox'
                    label='Agreed to terms and conditions'
                    id='termsConditons'
                    name='termsConditons'
                    onChange={(e) => handleCheck(!e.target.checked)}
                  ></Form.Check>
                </ListGroup.Item>
              )}
              {!order.isPaid && (
                <ListGroup.Item>
                  {loadingSession && <Loader />}
                  {!sdkReady ? (
                    <Loader />
                  ) : (
                    <Button
                      type='button'
                      className='btn-block'
                      value='Pay with Lightbox'
                      onClick={showLightBoxView}
                    >
                      Pay with Lightbox
                    </Button>
                    // <PayPalButton
                    //   amount={order.totalPrice}
                    //   onSuccess={successPaymentHandler}
                    // />
                  )}
                </ListGroup.Item>
              )}
              {!order.isPaid && (
                <ListGroup.Item>
                  {loadingSession && <Loader />}
                  {!sdkReady ? (
                    <Loader />
                  ) : (
                    <Button
                      type='button'
                      className='btn-block'
                      value='Pay with Payment Page'
                      onClick={showPaymentPage}
                    >
                      Pay with Payment Page
                    </Button>
                    // <PayPalButton
                    //   amount={order.totalPrice}
                    //   onSuccess={successPaymentHandler}
                    // />
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
              {!order.isPaid && (
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <Image
                        src='/images/bank-logo.jpg'
                        alt='Bank logos'
                        fluid
                      />
                    </Col>
                  </Row>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;
