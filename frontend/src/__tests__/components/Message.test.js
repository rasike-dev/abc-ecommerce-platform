import React from 'react';
import { render, screen } from '@testing-library/react';
import Message from '../../components/Message';

describe('Message Component', () => {
  it('should render without crashing', () => {
    render(<Message>Test message</Message>);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should use default variant (info)', () => {
    const { container } = render(<Message>Info message</Message>);
    const alert = container.querySelector('.alert');
    expect(alert).toHaveClass('alert-info');
  });

  it('should apply danger variant', () => {
    const { container } = render(<Message variant="danger">Error message</Message>);
    const alert = container.querySelector('.alert');
    expect(alert).toHaveClass('alert-danger');
  });

  it('should apply success variant', () => {
    const { container } = render(<Message variant="success">Success message</Message>);
    const alert = container.querySelector('.alert');
    expect(alert).toHaveClass('alert-success');
  });

  it('should apply warning variant', () => {
    const { container } = render(<Message variant="warning">Warning message</Message>);
    const alert = container.querySelector('.alert');
    expect(alert).toHaveClass('alert-warning');
  });

  it('should render children correctly', () => {
    render(
      <Message variant="info">
        <strong>Bold text</strong> and normal text
      </Message>
    );
    expect(screen.getByText('Bold text')).toBeInTheDocument();
    expect(screen.getByText(/and normal text/)).toBeInTheDocument();
  });

  it('should render complex children', () => {
    render(
      <Message variant="danger">
        <div>Error occurred</div>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </Message>
    );
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});

