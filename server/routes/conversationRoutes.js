// routes/conversationRoutes.js
import express from 'express';
import { saveToHistory, pullHistoryByUser, pullHistoryById } from '../controllers/conversationController.js';
import { verifyToken } from '../config/auth.js'

const router = express.Router();

router.post('/saveToHistory', verifyToken, saveToHistory);
router.get('/pullHistoryByUser', verifyToken, pullHistoryByUser)
router.get('/pullHistoryById/:id', verifyToken, pullHistoryById)

export default router;
