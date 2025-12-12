import express from 'express';
const router = express.Router();
import { getCarousel } from '../controllers/carouselController.js';

router.get('/', getCarousel);

export default router;
