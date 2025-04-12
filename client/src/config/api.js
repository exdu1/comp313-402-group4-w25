// API configuration for different environments
const API_URL = import.meta.env.VITE_API_URL 
  ? `https://${import.meta.env.VITE_API_URL}`  // Production URL from environment
  : 'http://localhost:3001';                   // Default to localhost for development

export default {
  baseURL: API_URL,
  endpoints: {
    activeListener: '/api/active-listener',
    signin: '/api/signin',
    signup: '/api/signup',
    saveToHistory: '/api/saveToHistory',
    pullHistoryByUser: '/api/pullHistoryByUser',
    pullHistoryById: id => `/api/pullHistoryById/${id}`,
    testGemini: '/api/test-gemini',
    health: '/api/health'
  }
};