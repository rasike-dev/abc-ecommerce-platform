import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import CheckoutSteps from '../../components/CheckoutSteps';

const renderWithRouter = (ui) => {
  return render(<Router>{ui}</Router>);
};

describe('CheckoutSteps Component', () => {
  it('should render all four steps', () => {
    renderWithRouter(<CheckoutSteps />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
    expect(screen.getByText('Place Order')).toBeInTheDocument();
  });

  it('should enable only step1 when passed', () => {
    renderWithRouter(<CheckoutSteps step1 />);
    const signInLink = screen.getByText('Sign In').closest('a');
    const billingLink = screen.getByText('Billing').closest('a');
    
    expect(signInLink).not.toHaveClass('disabled');
    expect(billingLink).toHaveClass('disabled');
  });

  it('should enable steps 1 and 2 when both passed', () => {
    renderWithRouter(<CheckoutSteps step1 step2 />);
    const signInLink = screen.getByText('Sign In').closest('a');
    const billingLink = screen.getByText('Billing').closest('a');
    const paymentLink = screen.getByText('Payment').closest('a');
    
    expect(signInLink).not.toHaveClass('disabled');
    expect(billingLink).not.toHaveClass('disabled');
    expect(paymentLink).toHaveClass('disabled');
  });

  it('should enable all steps when all props passed', () => {
    renderWithRouter(<CheckoutSteps step1 step2 step3 step4 />);
    const signInLink = screen.getByText('Sign In').closest('a');
    const billingLink = screen.getByText('Billing').closest('a');
    const paymentLink = screen.getByText('Payment').closest('a');
    const placeOrderLink = screen.getByText('Place Order').closest('a');
    
    expect(signInLink).not.toHaveClass('disabled');
    expect(billingLink).not.toHaveClass('disabled');
    expect(paymentLink).not.toHaveClass('disabled');
    expect(placeOrderLink).not.toHaveClass('disabled');
  });

  it('should have correct navigation links', () => {
    renderWithRouter(<CheckoutSteps step1 step2 step3 step4 />);
    
    expect(screen.getByText('Sign In').closest('a')).toHaveAttribute('href', '/login');
    expect(screen.getByText('Billing').closest('a')).toHaveAttribute('href', '/shipping');
    expect(screen.getByText('Payment').closest('a')).toHaveAttribute('href', '/payment');
    expect(screen.getByText('Place Order').closest('a')).toHaveAttribute('href', '/placeorder');
  });

  it('should disable all steps when no props passed', () => {
    renderWithRouter(<CheckoutSteps />);
    
    expect(screen.getByText('Sign In').closest('a')).toHaveClass('disabled');
    expect(screen.getByText('Billing').closest('a')).toHaveClass('disabled');
    expect(screen.getByText('Payment').closest('a')).toHaveClass('disabled');
    expect(screen.getByText('Place Order').closest('a')).toHaveClass('disabled');
  });
});

