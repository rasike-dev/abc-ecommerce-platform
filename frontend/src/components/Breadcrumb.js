import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb as BootstrapBreadcrumb } from 'react-bootstrap';

/**
 * Breadcrumb Component
 * @param {Array} items - Array of breadcrumb items [{text: 'Home', link: '/'}, {text: 'Products'}]
 * Note: Last item is active and should not have a link
 */
const Breadcrumb = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <BootstrapBreadcrumb className='my-3'>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <BootstrapBreadcrumb.Item 
            key={index}
            active={isLast}
            linkAs={isLast ? 'span' : Link}
            linkProps={isLast ? {} : { to: item.link }}
          >
            {item.text}
          </BootstrapBreadcrumb.Item>
        );
      })}
    </BootstrapBreadcrumb>
  );
};

export default Breadcrumb;

