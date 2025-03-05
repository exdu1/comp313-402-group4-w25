// Import packages
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs, { appendFile } from 'fs';
import { GoogleGenerativeAI } from "@google/generative-ai";
// import path from 'path';

// Directory and environment setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');

// Check for .env file and create it if it doesn't exist
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(
    envPath,
    'GEMINI_API_KEY=your_gemini_api_key_here\nPORT=3001\n'
  );
  console.log('.env file created. Please add your Gemini API key.');
}

dotenv.config();                                                // Load environment variables from .env file

// Express app configuration
const app = express();                                          // Create instance of express app
app.use(cors());                                                // Enable cross-origin requests 
app.use(express.json());                                        // Setup automatic json parsing from request bodies

// Variables for the Gemini client and model
let genAI;
let geminiModel;

/* NOTE FOR ERIC: Look into 'lazy initialization alternative to create client only when needed for first request */
// Initialize client and model with error handling if .env file is not correctly initialized
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if(!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.error('Warning: Gemini API key is not configured or is the default value.');
  } else {
    genAI = GoogleGenerativeAI(apiKey);
    geminiModel = genAI.generativeModel({ model: "gemini-1.5-flash" });
    console.log('Gemini API client successfully initialized.');
  }
} catch (error) {
  console.error('Error encountered while initializing Gemini API client:', error.message);
}

/* API Endpoints */
// Health check
app.get('/api/test-gemini', async (req, res) => {

});

// Active listener
app.post('./api/active-listener', async(req, res) => {

});

/* Create a prompot for Gemini to respond and act as an active listener */
const prompt = ''


// Start express server to listen on port 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`));