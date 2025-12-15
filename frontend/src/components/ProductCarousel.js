import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Carousel, Image } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Loader from './Loader';
import Message from './Message';
import { listTopCarousel } from '../actions/carouselActions';

const ProductCarousel = () => {
  const dispatch = useDispatch();

  const carouselList = useSelector((state) => state.carouselList);
  const { loading, error, carousels } = carouselList;

  useEffect(() => {
    dispatch(listTopCarousel());
  }, [dispatch]);

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : (
    <Carousel pause='hover' className='bg-dark carousel-container'>
      {carousels.map((carousel) => (
        <Carousel.Item key={carousel._id}>
          {/* <Link to={}> */}
          <Image 
            src={carousel.image} 
            alt={carousel.name} 
            fluid 
            className='carousel-image'
          />
          <Carousel.Caption className='carousel-caption'>
            <h2>{carousel.name}</h2>
          </Carousel.Caption>
          {/* </Link> */}
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default ProductCarousel;
