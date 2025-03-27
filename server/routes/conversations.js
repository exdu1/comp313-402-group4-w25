// server/routes/conversations.js
import express from 'express';
import {
  getConversations,
  createConversation,
  getConversation,
  updateConversation,
  deleteConversation,
  getMessages,
  createMessage
} from '../controllers/conversations.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All conversation routes require authentication
router.use(protect);

router.route('/')
  .get(getConversations)
  .post(createConversation);

router.route('/:id')
  .get(getConversation)
  .put(updateConversation)
  .delete(deleteConversation);

router.route('/:id/messages')
  .get(getMessages)
  .post(createMessage);

export default router;