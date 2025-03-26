// Step 6: Create Conversation Controller
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import { generateAIResponse } from '../services/geminiService.js';

// @desc    Get all user conversations
// @route   GET /api/conversations
// @access  Private
export const getConversations = asyncHandler(async (req, res, next) => {
  const conversations = await Conversation.find({ user: req.user.id })
    .sort('-lastMessage');

  res.status(200).json({
    success: true,
    count: conversations.length,
    data: conversations
  });
});

// @desc    Create new conversation
// @route   POST /api/conversations
// @access  Private
export const createConversation = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const conversation = await Conversation.create(req.body);

  res.status(201).json({
    success: true,
    data: conversation
  });
});

// @desc    Get single conversation
// @route   GET /api/conversations/:id
// @access  Private
export const getConversation = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(
      new ErrorResponse(`Conversation not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the conversation
  if (conversation.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User not authorized to access this conversation`, 401)
    );
  }

  res.status(200).json({
    success: true,
    data: conversation
  });
});

// @desc    Get messages for a conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
export const getMessages = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(
      new ErrorResponse(`Conversation not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the conversation
  if (conversation.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User not authorized to access this conversation`, 401)
    );
  }

  const messages = await Message.find({ conversation: req.params.id })
    .sort('createdAt');

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages
  });
});

// @desc    Create message in conversation
// @route   POST /api/conversations/:id/messages
// @access  Private
export const createMessage = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(
      new ErrorResponse(`Conversation not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the conversation
  if (conversation.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User not authorized to access this conversation`, 401)
    );
  }

  // Add conversation id to message
  req.body.conversation = req.params.id;
  req.body.isUser = true;

  // Create user message
  const userMessage = await Message.create(req.body);

  // Update conversation last message time
  conversation.lastMessage = Date.now();
  await conversation.save();

  // Get all messages in conversation for context
  const messages = await Message.find({ conversation: req.params.id })
    .sort('createdAt');

  // Generate AI response
  const aiResponse = await generateAIResponse(req.body.content, messages);

  // Create AI message
  const aiMessage = await Message.create({
    conversation: req.params.id,
    content: aiResponse.message || '',
    summary: aiResponse.summary || '',
    question: aiResponse.question || '',
    isUser: false
  });

  res.status(201).json({
    success: true,
    data: {
      userMessage,
      aiMessage
    }
  });
});