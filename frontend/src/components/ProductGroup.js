import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';

const ProductGroup = ({ group }) => {
  return (
    <Card className='my-3 p-3 rounded'>
      <Link to={`/products?code=${group.code}`}>
        <Card.Img src={group.image} variant='top' style={{ height: '150px' }} />
      </Link>

      <Card.Body>
        <Link to={`/products?code=${group.code}`}>
          <Card.Title as='h4'>
            <strong>{group.subject}</strong>
          </Card.Title>
        </Link>
        <Card.Text as='h5'>{group.medium}</Card.Text>
        <Card.Text as='h4'>
          {group.teacher.title} {group.teacher.name}
        </Card.Text>
        <Card.Text as='div'>{group.description}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ProductGroup;
