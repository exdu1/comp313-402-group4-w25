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

// Add this code for proper Gemini initialization
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini model
let geminiModel;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    console.log('Initializing Gemini model...');
    const genAI = new GoogleGenerativeAI(apiKey);
    geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('Gemini model initialized successfully');
  } else {
    console.error('WARNING: Gemini API key not configured properly');
  }
} catch (error) {
  console.error('Failed to initialize Gemini model:', error.message);
}

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
app.use(helmet());                                              // Set security HTTP headers
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));               

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser
app.use(express.json({ limit: '10kb' })); // Setup automatic json parsing from request bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

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


    const { message, history = [] } = req.body;   // Extract message and history (if applicable) from the request body

    // Validate that a message is provided
    if(!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Format conversation history for context
    const formattedHistory = history.map(msg => ({
      content: msg.message || '',
      summary: msg.summary || '',
      question: msg.question || '',
      isUser: msg.isUser
    }));
    
    const response = result.response.text();

    console.log('Response successfully generated');

    return res.json({
      success: true,
      message: response.message,
      summary: response.summary,
      question: response.question, 
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

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server`
  });
});

// Error handling middleware
app.use(errorHandler);


// Start express server to listen on port 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`)); 

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});