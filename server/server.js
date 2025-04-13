// Import packages
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs, { appendFile } from 'fs';
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js'
import path from 'path';

/* DIRECTORY AND ENVIRONMENT SETUP */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');

// Check for .env file and create it if it doesn't exist
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(
    envPath,
    'GEMINI_API_KEY=your_gemini_api_key_here\nPORT=3001\nMONGODB_URI=mongodb+srv://username:password@cluster0.example.mongodb.net/database_name?retryWrites=true&w=majority\n'
  );
  console.log('.env file created. Please add your Gemini API key.');
}

dotenv.config();                                                // Load environment variables from .env file

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('MongoDB connection test successful');
  })
  .catch(err => {
    console.error('MongoDB connection test failed:', err.message);
  });

/* EXPRESS CONFIGURATION */
const app = express();                                          // Create instance of express app

// Configure CORS for different environment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? true // Allow same-origin requests
    : ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));                                                // Enable cross-origin requests 
app.use(express.json());                                        // Setup automatic json parsing from request bodies

/* GEMINI CONFIGURATION */
let genAI;
let geminiModel;

// Initialize client and model with error handling if .env file is not correctly initialized
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if(!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.error('Warning: Gemini API key is not configured or is the default value.');
  } else {
    genAI = new GoogleGenerativeAI(apiKey);
    geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('Gemini API client successfully initialized.');
  }
} catch (error) {
  console.error('Error encountered while initializing Gemini API client:', error.message);
}



/* API ENDPOINTS */
// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for gemini key
app.get('/api/test-gemini', async (req, res) => {
 try {
  const apiKey = process.env.GEMINI_API_KEY;

  if(!apiKey || apiKey === 'your_gemini_api_key_here') {
    return res.status(500).json({
      success: false,
      message: 'Gemini API key not configured. Please add your key to the .env file'
    });
  }

  if(!geminiModel) {
    return res.status(500).json({
      success: false,
      message: 'Gemini model not initialized. Check server logs for details.'
    });
  }

  // Test the model with a simple prompt
  const prompt = "Hey hows it going";
  const result = await geminiModel.generateContent(prompt);
  const responseText = result.response.text();

  return res.json({
    success: true,
    message: 'Gemini API connection successful',
    modelResponse: responseText
  });

 } catch (error) {
  console.error('Gemini API test failed:', error.message);
  return res.status(500).json({
    success: false,
    message: 'Gemini API test failed',
    error: error.message
  });
 }
});

// Active listener
app.post('/api/active-listener', async(req, res) => {
  try {
    console.log('Received active-listener request:', JSON.stringify(req.body).substring(0, 100) + '...');       // Log incoming requests and truncate for readability

    // NOTE FOR ERIC: fix redundency check for model instantiation
    if(!geminiModel) {
      return res.json(500).json({
        success: false,
        message: 'Gemini model not initialized. Check server logs for details.'
      });
    }

    const { message, history = [] } = req.body;   // Extract message and history (if applicable) from the request body

    // Validate that a message is provided
    if(!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Format conversation history for context
    let conversationContext = "";
    if (history.length > 0) {
      conversationContext = "Previous conversation:\n" + 
        history.map(msg => `${msg.isUser ? 'User' : 'AI'}: ${msg.text}`).join('\n') + 
        "\n\n";
    }

    /* Create a prompot for Gemini to respond and act as an active listener */
    const prompt = `${ conversationContext }
    You are an Active Listener AI. Your goal is to:
    1. Listen carefully to what the user shares
    2. Provide a thoughtful summary that shows you understand their message
    3. Ask a meaningful follow-up question that encourages deeper reflection

    User's message: "${message}"

    Respond in the following format:
    SUMMARY: [A concise summary showing you understand what they've shared. Be empathetic and reflective.]
    QUESTION: [A single, thoughtful follow-up question. Keep it open-ended and focused on the user's sharing.]

    Maintain an empathetic tone, but keep your response concise.`;

    console.log(message);

    // Get response
    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the response with regex to create a summary of the user's input and formulate a follup up question
    const summaryMatch = responseText.match(/SUMMARY:\s*([\s\S]*?)(?=QUESTION: |$)/i);
    const questionMatch = responseText.match(/QUESTION:\s*([\s\S]*?)(?=$)/i);

    const summary = summaryMatch ? summaryMatch[1].trim() : "I understand what you're saying.";
    const question = questionMatch ? questionMatch[1].trim() : "Is there anything else you'd like to talk about?";

    console.log('Response successfully generated.');

    return res.json({
      success: true,
      summary,
      question, 
      isUser: false
    });


  } catch (error) {
    console.error('Active listener request failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error.message
    });
  }
});

// DB connection test endpoint
app.get('/api/db-test', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  
  res.json({
    success: true,
    connection_status: isConnected ? 'connected' : 'disconnected',
    database_name: mongoose.connection.name || 'not connected',
    connection_details: {
      host: mongoose.connection.host || 'not connected',
      port: mongoose.connection.port || 'not connected'
    }
  });
});

// Auth routes
app.use('/api', authRoutes);
// Conversation routes
app.use('/api', conversationRoutes)

if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));
  
  // For any request not handled by the API, send the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Start express server to listen on port 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`));