import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isUser: {
    type: Boolean,
    required: true
  },
  // For AI responses
  summary: String,
  question: String
}, {
  timestamps: true
});

const Message = mongoose.model('Message', MessageSchema);
export default Message;