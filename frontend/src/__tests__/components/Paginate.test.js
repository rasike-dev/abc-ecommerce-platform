import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Paginate from '../../components/Paginate';

const renderWithRouter = (ui) => {
  return render(<Router>{ui}</Router>);
};

describe('Paginate Component', () => {
  it('should not render when pages is 1 or less', () => {
    const { container } = renderWithRouter(<Paginate pages={1} page={1} />);
    expect(container.querySelector('.pagination')).not.toBeInTheDocument();
  });

  it('should render pagination when pages > 1', () => {
    renderWithRouter(<Paginate pages={3} page={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should mark current page as active', () => {
    renderWithRouter(<Paginate pages={3} page={2} />);
    const page2 = screen.getByText('2').closest('.page-item');
    expect(page2).toHaveClass('active');
  });

  it('should generate correct links for regular pages', () => {
    const { container } = renderWithRouter(<Paginate pages={3} page={1} />);
    
    const links = Array.from(container.querySelectorAll('a'));
    expect(links.some(link => link.getAttribute('href') === '/page/1')).toBe(true);
    expect(links.some(link => link.getAttribute('href') === '/page/2')).toBe(true);
    expect(links.some(link => link.getAttribute('href') === '/page/3')).toBe(true);
  });

  it('should generate correct links with keyword', () => {
    const { container } = renderWithRouter(<Paginate pages={3} page={1} keyword="test" />);
    
    const links = Array.from(container.querySelectorAll('a'));
    expect(links.some(link => link.getAttribute('href') === '/search/test/page/1')).toBe(true);
    expect(links.some(link => link.getAttribute('href') === '/search/test/page/2')).toBe(true);
  });

  it('should generate admin links when isAdmin is true', () => {
    const { container } = renderWithRouter(<Paginate pages={3} page={1} isAdmin={true} />);
    
    const links = Array.from(container.querySelectorAll('a'));
    expect(links.some(link => link.getAttribute('href') === '/admin/productlist/1')).toBe(true);
    expect(links.some(link => link.getAttribute('href') === '/admin/productlist/2')).toBe(true);
  });

  it('should render 5 pages correctly', () => {
    renderWithRouter(<Paginate pages={5} page={3} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    
    const page3 = screen.getByText('3').closest('.page-item');
    expect(page3).toHaveClass('active');
  });
});

