// Import packages
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Import application components
import connectDB from './config/db.js';
import { generateAIResponse } from './services/geminiService.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import conversationRoutes from './routes/conversations.js';
import errorHandler from './middleware/error.js';

/* DIRECTORY AND ENVIRONMENT SETUP */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');

// Check for .env file and create it if it doesn't exist
if (!fs.existsSync(envPath)) {
  const defaultEnv = `
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/calmingecho
JWT_SECRET=replace_with_a_secure_random_string
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
# Add OAuth credentials for SSO
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
REDIRECT_URL=http://localhost:3001/api/auth/google/callback
`;

  fs.writeFileSync(envPath, defaultEnv);
  console.log('\x1b[33m%s\x1b[0m', 'A new .env file has been created');
  console.log('\x1b[31m%s\x1b[0m', 'IMPORTANT: Update the .env file with your actual credentials before proceeding');
}

dotenv.config();                                                // Load environment variables from .env file

// Validate required environment variables
const requiredEnvVars = [
  'GEMINI_API_KEY',
  'MONGO_URI',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', 'ERROR: Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  console.error('Please check your .env file and restart the server.');
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.error('GEMINI_API_KEY is not set or has the default value.');
  }
}

connectDB();

/* EXPRESS CONFIGURATION */
const app = express();                                          // Create instance of express app
app.use(cors());                                                // Enable cross-origin requests 
app.use(express.json());                                        // Setup automatic json parsing from request bodies


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
        history.map(msg => {
          const content = msg.isUser ? msg.message : `${msg.summary || ''}\n${msg.question || ''}`;
          return `${msg.isUser ? 'User' : 'AI'}: ${content}`;
        }).join('\n') + 
        "\n\n";
    }

    /* Create a prompt for Gemini to respond and act as an active listener */
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

    //console.log(prompt);

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

// Authentication

// Conversations

// Messages


/* TBD: Deal with unhandelled GET requests */

// Start express server to listen on port 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`)); 