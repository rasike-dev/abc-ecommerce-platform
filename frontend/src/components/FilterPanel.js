import React from 'react';
import { Form, Card, Button } from 'react-bootstrap';

const FilterPanel = ({ filters, onFilterChange, onClearFilters }) => {
  const handleChange = (filterName, value) => {
    onFilterChange({ ...filters, [filterName]: value });
  };

  return (
    <Card className='mb-3'>
      <Card.Header>
        <strong>
          <i className='fas fa-filter'></i> Filters
        </strong>
        {(filters.grade || filters.subject || filters.minPrice || filters.maxPrice) && (
          <Button
            variant='link'
            size='sm'
            className='float-right'
            onClick={onClearFilters}
            style={{ padding: 0 }}
          >
            Clear All
          </Button>
        )}
      </Card.Header>
      <Card.Body>
        {/* Grade Filter */}
        <Form.Group controlId='grade' className='mb-3'>
          <Form.Label><strong>Grade</strong></Form.Label>
          <Form.Control
            as='select'
            value={filters.grade || ''}
            onChange={(e) => handleChange('grade', e.target.value)}
          >
            <option value=''>All Grades</option>
            <option value='8'>Grade 8</option>
            <option value='9'>Grade 9</option>
            <option value='10'>Grade 10</option>
            <option value='11'>Grade 11</option>
            <option value='12'>Grade 12</option>
          </Form.Control>
        </Form.Group>

        {/* Subject Filter */}
        <Form.Group controlId='subject' className='mb-3'>
          <Form.Label><strong>Subject</strong></Form.Label>
          <Form.Control
            as='select'
            value={filters.subject || ''}
            onChange={(e) => handleChange('subject', e.target.value)}
          >
            <option value=''>All Subjects</option>
            <option value='Mathematics'>Mathematics</option>
            <option value='Physics'>Physics</option>
            <option value='Chemistry'>Chemistry</option>
            <option value='Biology'>Biology</option>
            <option value='English'>English</option>
            <option value='History'>History</option>
            <option value='Computer Science'>Computer Science</option>
            <option value='Business'>Business</option>
            <option value='Arts'>Arts</option>
            <option value='Psychology'>Psychology</option>
          </Form.Control>
        </Form.Group>

        {/* Price Range Filter */}
        <Form.Group className='mb-3'>
          <Form.Label><strong>Price Range (LKR)</strong></Form.Label>
          <div className='d-flex align-items-center'>
            <Form.Control
              type='number'
              placeholder='Min'
              value={filters.minPrice || ''}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              style={{ marginRight: '10px' }}
            />
            <span>-</span>
            <Form.Control
              type='number'
              placeholder='Max'
              value={filters.maxPrice || ''}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              style={{ marginLeft: '10px' }}
            />
          </div>
        </Form.Group>

        {/* Active Filters Display */}
        {(filters.grade || filters.subject || filters.minPrice || filters.maxPrice) && (
          <div className='mt-3 pt-3' style={{ borderTop: '1px solid #dee2e6' }}>
            <small className='text-muted d-block mb-2'><strong>Active Filters:</strong></small>
            {filters.grade && (
              <span className='badge badge-info mr-1 mb-1'>
                Grade {filters.grade}
                <button
                  type='button'
                  className='close ml-1'
                  aria-label='Remove'
                  onClick={() => handleChange('grade', '')}
                  style={{ fontSize: '0.9rem', outline: 'none' }}
                >
                  &times;
                </button>
              </span>
            )}
            {filters.subject && (
              <span className='badge badge-info mr-1 mb-1'>
                {filters.subject}
                <button
                  type='button'
                  className='close ml-1'
                  aria-label='Remove'
                  onClick={() => handleChange('subject', '')}
                  style={{ fontSize: '0.9rem', outline: 'none' }}
                >
                  &times;
                </button>
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className='badge badge-info mr-1 mb-1'>
                Price: {filters.minPrice || '0'} - {filters.maxPrice || '∞'}
                <button
                  type='button'
                  className='close ml-1'
                  aria-label='Remove'
                  onClick={() => {
                    handleChange('minPrice', '');
                    handleChange('maxPrice', '');
                  }}
                  style={{ fontSize: '0.9rem', outline: 'none' }}
                >
                  &times;
                </button>
              </span>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default FilterPanel;

