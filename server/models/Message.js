// server/models/Message.js
import mongoose from 'mongoose';
import { encrypt, decrypt } from '../services/encryptionService.js';

const MessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    set: function(content) {
      // Store the original content for use in the current operation
      this._content = content;
      // Return encrypted content for storage
      return encrypt(content);
    },
    get: function(encryptedContent) {
      // Return original content if it exists (during the same operation)
      if (this._content) return this._content;
      
      // Decrypt content for retrieval
      try {
        return decrypt(encryptedContent);
      } catch (err) {
        console.error('Error decrypting message content:', err);
        return '[Encrypted Content]';
      }
    }
  },
  isUser: {
    type: Boolean,
    required: true,
    index: true
  },
  // For AI responses
  summary: {
    type: String,
    set: function(summary) {
      if (!summary) return null;
      this._summary = summary;
      return encrypt(summary);
    },
    get: function(encryptedSummary) {
      if (!encryptedSummary) return null;
      if (this._summary) return this._summary;
      
      try {
        return decrypt(encryptedSummary);
      } catch (err) {
        console.error('Error decrypting summary:', err);
        return '[Encrypted Summary]';
      }
    }
  },
  question: {
    type: String,
    set: function(question) {
      if (!question) return null;
      this._question = question;
      return encrypt(question);
    },
    get: function(encryptedQuestion) {
      if (!encryptedQuestion) return null;
      if (this._question) return this._question;
      
      try {
        return decrypt(encryptedQuestion);
      } catch (err) {
        console.error('Error decrypting question:', err);
        return '[Encrypted Question]';
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { getters: true }, // Enable getters for JSON serialization
  toObject: { getters: true } // Enable getters for object serialization
});

// Add method to anonymize message content if needed
MessageSchema.methods.anonymize = function() {
  this.content = encrypt('[Anonymized Content]');
  if (this.summary) this.summary = encrypt('[Anonymized Summary]');
  if (this.question) this.question = encrypt('[Anonymized Question]');
  return this;
};

const Message = mongoose.model('Message', MessageSchema);
export default Message;