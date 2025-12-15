import React from 'react';
import { render } from '@testing-library/react';
import Loader from '../../components/Loader';

describe('Loader Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<Loader />);
    expect(container.querySelector('.spinner-border')).toBeInTheDocument();
  });

  it('should have correct spinner classes', () => {
    const { container } = render(<Loader />);
    const spinner = container.querySelector('.spinner-border');
    expect(spinner).toHaveClass('spinner-border');
  });

  it('should have screen reader text', () => {
    const { container } = render(<Loader />);
    const srText = container.querySelector('.sr-only');
    expect(srText).toBeInTheDocument();
    expect(srText.textContent).toBe('Loading...');
  });

  it('should be centered', () => {
    const { container } = render(<Loader />);
    const spinner = container.querySelector('.spinner-border');
    expect(spinner).toHaveStyle('width: 100px');
    expect(spinner).toHaveStyle('height: 100px');
  });
});

