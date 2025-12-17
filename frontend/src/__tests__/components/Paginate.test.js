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
    
    // LinkContainer creates links with href attributes
    const links = Array.from(container.querySelectorAll('a'));
    const hrefs = links.map(link => link.getAttribute('href')).filter(Boolean);
    // Check that pagination links are generated (may not include current page)
    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.some(href => href.includes('/page/'))).toBe(true);
  });

  it('should generate correct links with keyword', () => {
    const { container } = renderWithRouter(<Paginate pages={3} page={1} keyword="test" />);
    
    const links = Array.from(container.querySelectorAll('a'));
    const hrefs = links.map(link => link.getAttribute('href')).filter(Boolean);
    // Check that search pagination links are generated
    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.some(href => href.includes('/search/test/page/'))).toBe(true);
  });

  it('should generate admin links when isAdmin is true', () => {
    const { container } = renderWithRouter(<Paginate pages={3} page={1} isAdmin={true} />);
    
    const links = Array.from(container.querySelectorAll('a'));
    const hrefs = links.map(link => link.getAttribute('href')).filter(Boolean);
    // Check that admin pagination links are generated
    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.some(href => href.includes('/admin/productlist/'))).toBe(true);
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

