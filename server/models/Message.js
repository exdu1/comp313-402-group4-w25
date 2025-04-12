import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: { type: String, enum: ['user', 'bot'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
}, { _id: false});

export default messageSchema;