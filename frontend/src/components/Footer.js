import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--color-backgroundSecondary)',
      color: 'var(--color-textPrimary)',
      borderTop: '1px solid var(--color-borderColor)',
      transition: 'all 0.3s ease'
    }}>
      <Container>
        <Row>
          <Col className='text-center py-3'>
            Copyright &copy; ABC Online School
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
