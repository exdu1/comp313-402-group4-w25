import express from 'express';
import { 
  getUsers, getUser, updateUser, deleteUser 
} from '../controllers/users.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All these routes require authentication
router.use(protect);

// Regular users can only access their own data
router.route('/me')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

// Admin only routes
router.route('/')
  .get(authorize('admin'), getUsers);

router.route('/:id')
  .get(authorize('admin'), getUser)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

export default router;