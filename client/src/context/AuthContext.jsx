// Step 9: Frontend Integration
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/auth/me', {
          withCredentials: true
        });
        
        if (res.data.success) {
          setUser(res.data.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // User is not logged in
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };
    
    checkLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      const res = await axios.post('http://localhost:3001/api/auth/register', userData, {
        withCredentials: true
      });
      
      if (res.data.success) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Something went wrong');
      return false;
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      setError(null);
      const res = await axios.post('http://localhost:3001/api/auth/login', userData, {
        withCredentials: true
      });
      
      if (res.data.success) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid credentials');
      return false;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.get('http://localhost:3001/api/auth/logout', {
        withCredentials: true
      });
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Google login
  const googleLogin = () => {
    window.location.href = 'http://localhost:3001/api/auth/google';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        googleLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};