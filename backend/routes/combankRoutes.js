import express from 'express';
const router = express.Router();
import { sendCombankOrder } from '../controllers/combankController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/:id').get(protect, sendCombankOrder);

export default router;
