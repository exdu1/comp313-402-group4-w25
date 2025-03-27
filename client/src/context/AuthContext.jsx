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

  // Microsoft login
  const microsoftLogin = () => {
    window.location.href = 'http://localhost:3001/api/auth/microsoft';
  };

  // Reset password request
  const forgotPassword = async (email) => {
    try {
      setError(null);
      const res = await axios.post('http://localhost:3001/api/auth/forgot-password', { email });
      
      return { success: true, message: res.data.message };
    } catch (error) {
      setError(error.response?.data?.error || 'Error sending password reset email');
      return { success: false, message: error.response?.data?.error || 'Error sending password reset email' };
    }
  };

  // Reset password with token
  const resetPassword = async (password, token) => {
    try {
      setError(null);
      const res = await axios.put(`http://localhost:3001/api/auth/reset-password/${token}`, { password });
      
      return { success: true, message: res.data.message };
    } catch (error) {
      setError(error.response?.data?.error || 'Error resetting password');
      return { success: false, message: error.response?.data?.error || 'Error resetting password' };
    }
  };

   // Update user profile
   const updateProfile = async (userData) => {
    try {
      setError(null);
      const res = await axios.put('http://localhost:3001/api/users/me', userData, {
        withCredentials: true
      });
      
      if (res.data.success) {
        setUser({...user, ...res.data.data});
        return { success: true, message: 'Profile updated successfully' };
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error updating profile');
      return { success: false, message: error.response?.data?.error || 'Error updating profile' };
    }
  };

  // Clear errors
   const clearErrors = () => {
    setError(null);
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
        googleLogin,
        microsoftLogin,
        forgotPassword,
        resetPassword,
        updateProfile,
        clearErrors
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;