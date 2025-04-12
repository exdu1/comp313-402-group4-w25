import Conversation from '../models/Conversation.js';
import mongoose from 'mongoose';

export const saveToHistory = async (req, res) => {
    try {
        const { message, sender, conversationId } = req.body;
        const authorId = new mongoose.Types.ObjectId(req.user.id);

        console.log("Here is the message: " + message + " " + typeof message)
        console.log("Here is the sender: " + sender + " " + typeof sender)
        console.log("Here is the authorId: " + authorId + " " + typeof authorId)
        console.log("Here is the conversationId: " + conversationId + " " + typeof conversationId)

        const newMessage = {
            sender,
            message,
            timestamp: new Date()
        };

        if(conversationId !== 'null'){
            const updated = await Conversation.findByIdAndUpdate(
                conversationId,
                {
                    $push: { history: newMessage },
                    $set: { updatedAt: new Date() }
                },
                { new: true }
            );
    
            return res.status(200).json(updated);
        }else{
            const conversation = new Conversation({
                authorId,
                history: [newMessage]
            });

            const savedConversation = await conversation.save();
            return res.status(201).json(savedConversation);
        }
        
    } catch (err) {
        console.error('Error updating conversation:', err);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
};

export const pullHistoryByUser = async (req, res) => {
    try {
        const authorId = new mongoose.Types.ObjectId(req.user.id);
        const conversations = await Conversation.find({ authorId });
        if (!conversations || conversations.length === 0) {
            return res.status(404).json({ message: 'No conversations found for this author.' });
        }

        return res.status(200).json(conversations);
    } catch (err) {
        console.error('Error fetching conversations:', err);
        return res.status(500).json({ error: 'Server error while fetching conversations.' });
    }
}

export const pullHistoryById = async (req, res) => {
    try {
        console.log("Here is the req param: " + req.params.id + " " + typeof req.params.id)
        const conversationId = new mongoose.Types.ObjectId(req.params.id);
        const conversation = await Conversation.findOne({ _id: conversationId });
        if (!conversation) {
            return res.status(404).json({ message: 'No conversation found.' });
        }

        return res.status(200).json(conversation);
    } catch (err) {
        console.error('Error fetching conversation:', err);
        return res.status(500).json({ error: 'Server error while fetching conversation.' });
    }
} 

