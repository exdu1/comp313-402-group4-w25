import mongoose from 'mongoose';
import messageSchema from './Message.js';

const conversationSchema = new mongoose.Schema({
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    history: [messageSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }, 
}, {
    timestamps: true 
});

export default mongoose.model('Conversation', conversationSchema);