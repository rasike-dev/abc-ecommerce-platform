import React from 'react';
import { Form } from 'react-bootstrap';

/**
 * Sort Dropdown Component
 * Provides sorting options for product lists
 */
const SortDropdown = ({ sortBy, onSortChange }) => {
  return (
    <div className='d-flex align-items-center mb-3'>
      <Form.Label className='mb-0 mr-2' style={{ whiteSpace: 'nowrap' }}>
        <strong>Sort by:</strong>
      </Form.Label>
      <Form.Control
        as='select'
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        style={{ width: 'auto', minWidth: '200px' }}
      >
        <option value='default'>Default</option>
        <option value='name-asc'>Name (A-Z)</option>
        <option value='name-desc'>Name (Z-A)</option>
        <option value='price-asc'>Price (Low to High)</option>
        <option value='price-desc'>Price (High to Low)</option>
        <option value='rating-desc'>Rating (High to Low)</option>
        <option value='rating-asc'>Rating (Low to High)</option>
        <option value='reviews-desc'>Most Reviewed</option>
      </Form.Control>
    </div>
  );
};

export default SortDropdown;

