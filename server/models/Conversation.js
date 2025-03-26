import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'New Conversation',
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  lastMessage: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Conversation = mongoose.model('Conversation', ConversationSchema);
export default Conversation;