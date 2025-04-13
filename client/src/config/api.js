const API_URL = process.env.NODE_ENV === 'production' 
  ? '' // Empty string for same-origin requests in production
  : 'http://localhost:3001'; 

export default {
  baseURL: API_URL,
  endpoints: {
    // Keep your existing endpoints
  }
};