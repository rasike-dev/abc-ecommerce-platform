import React, { useState, useEffect } from 'react';
import { Form, Button, Col, Card, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { savePaymentMethod } from '../actions/cartActions';
import axios from '../utils/axios';

const PaymentScreen = ({ history }) => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  if (!shippingAddress.address) {
    history.push('/shipping');
  }

  const [paymentMethod, setPaymentMethod] = useState('Stripe Payment');
  const [paymentProvider, setPaymentProvider] = useState('stripe');
  const [availableProviders, setAvailableProviders] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPaymentProviders = async () => {
      try {
        const { data } = await axios.get('/payments/providers');
        setAvailableProviders(data.providers);
      } catch (error) {
        console.error('Failed to fetch payment providers:', error);
        // Fallback to default providers with stripe first
        setAvailableProviders(['stripe', 'paypal', 'combank']);
      }
    };

    fetchPaymentProviders();
  }, []);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod({
      method: paymentMethod,
      provider: paymentProvider
    }));
    history.push('/placeorder');
  };

  const getProviderDisplayName = (provider) => {
    switch (provider) {
      case 'combank':
        return 'Commercial Bank';
      case 'paypal':
        return 'PayPal';
      case 'stripe':
        return 'Stripe';
      default:
        return provider;
    }
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'combank':
        return '🏦';
      case 'paypal':
        return '🅿️';
      case 'stripe':
        return '💳';
      default:
        return '💳';
    }
  };

  const getProviderDescription = (provider) => {
    switch (provider) {
      case 'combank':
        return 'Pay securely with your debit or credit card through Commercial Bank';
      case 'paypal':
        return 'Pay with your PayPal account or credit card';
      case 'stripe':
        return 'Fast and secure payment processing';
      default:
        return 'Secure payment processing';
    }
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <h1>Payment Method</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group>
          <Form.Label as='legend'>Select Payment Method</Form.Label>

          {availableProviders.map((provider) => (
            <Card key={provider} className={`mb-3 ${paymentProvider === provider ? 'border-primary' : ''}`}>
              <Card.Body>
                <Row className='align-items-center'>
                  <Col xs={2} className='text-center'>
                    <span style={{ fontSize: '2rem' }}>{getProviderIcon(provider)}</span>
                  </Col>
                  <Col xs={8}>
                    <Form.Check
                      type='radio'
                      label={
                        <div>
                          <strong>{getProviderDisplayName(provider)}</strong>
                          <div className='text-muted small'>{getProviderDescription(provider)}</div>
                        </div>
                      }
                      id={provider}
                      name='paymentProvider'
                      value={provider}
                      checked={paymentProvider === provider}
                      onChange={(e) => {
                        setPaymentProvider(e.target.value);
                        setPaymentMethod(`${getProviderDisplayName(e.target.value)} Payment`);
                      }}
                    />
                  </Col>
                  <Col xs={2} className='text-right'>
                    {paymentProvider === provider && (
                      <i className='fas fa-check-circle text-primary'></i>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}

          {/* Legacy payment method selection (hidden but maintained for compatibility) */}
          <div style={{ display: 'none' }}>
            <Form.Control
              type='text'
              value={paymentMethod}
              readOnly
            />
          </div>
        </Form.Group>

        <Button type='submit' variant='primary' className='mt-3'>
          Continue
        </Button>
      </Form>
    </FormContainer>
  );
};

export default PaymentScreen;
