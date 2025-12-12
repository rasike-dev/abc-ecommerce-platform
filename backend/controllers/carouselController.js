import asyncHandler from 'express-async-handler';
import Carousel from '../models/carouselModel.js';

// @desc    Fetch all carousel
// @route   GET /api/carousel
// @access  Public
const getCarousel = asyncHandler(async (req, res) => {
  const carousels = await Carousel.find({});
  res.json(carousels);
});

export { getCarousel };
