import express from 'express';
const router = express.Router();
import {
  getGroups,
  getGroupById,
  deleteGroup,
  createGroup,
  updateGroup,
} from '../controllers/groupController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(getGroups).post(protect, admin, createGroup);
router
  .route('/:id')
  .get(getGroupById)
  .delete(protect, admin, deleteGroup)
  .put(protect, admin, updateGroup);

export default router;
