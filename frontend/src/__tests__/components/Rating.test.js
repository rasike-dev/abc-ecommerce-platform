import React from 'react';
import { render, screen } from '@testing-library/react';
import Rating from '../../components/Rating';

describe('Rating Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<Rating value={0} />);
    expect(container.querySelector('.rating')).toBeInTheDocument();
  });

  it('should display correct number of full stars', () => {
    const { container } = render(<Rating value={5} />);
    const fullStars = container.querySelectorAll('.fas.fa-star');
    expect(fullStars).toHaveLength(5);
  });

  it('should display half stars correctly', () => {
    const { container } = render(<Rating value={3.5} />);
    const fullStars = container.querySelectorAll('.fas.fa-star');
    const halfStars = container.querySelectorAll('.fas.fa-star-half-alt');
    expect(fullStars).toHaveLength(3);
    expect(halfStars).toHaveLength(1);
  });

  it('should display empty stars for zero rating', () => {
    const { container } = render(<Rating value={0} />);
    const emptyStars = container.querySelectorAll('.far.fa-star');
    expect(emptyStars).toHaveLength(5);
  });

  it('should display text when provided', () => {
    render(<Rating value={4} text="10 reviews" />);
    expect(screen.getByText('10 reviews')).toBeInTheDocument();
  });

  it('should not display text when not provided', () => {
    const { container } = render(<Rating value={4} />);
    const spans = container.querySelectorAll('span');
    // Should have 5 star spans only
    expect(spans).toHaveLength(6); // 5 stars + 1 text span (empty)
  });

  it('should use default color', () => {
    const { container } = render(<Rating value={3} />);
    const star = container.querySelector('i');
    expect(star).toHaveStyle('color: #f8e825');
  });

  it('should use custom color when provided', () => {
    const { container } = render(<Rating value={3} color="#ff0000" />);
    const star = container.querySelector('i');
    expect(star).toHaveStyle('color: #ff0000');
  });

  it('should handle decimal ratings correctly', () => {
    const { container } = render(<Rating value={2.3} />);
    const fullStars = container.querySelectorAll('.fas.fa-star');
    const halfStars = container.querySelectorAll('.fas.fa-star-half-alt');
    expect(fullStars).toHaveLength(2);
    expect(halfStars).toHaveLength(0); // 2.3 rounds down to 2
  });

  it('should render mixed star types for 4.5 rating', () => {
    const { container } = render(<Rating value={4.5} text="100 reviews" />);
    const fullStars = container.querySelectorAll('.fas.fa-star');
    const halfStars = container.querySelectorAll('.fas.fa-star-half-alt');
    expect(fullStars).toHaveLength(4);
    expect(halfStars).toHaveLength(1);
    expect(screen.getByText('100 reviews')).toBeInTheDocument();
  });
});

