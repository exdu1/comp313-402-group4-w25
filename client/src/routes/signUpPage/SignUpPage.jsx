import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiConfig from '../../config/api';
import './signUpPage.css';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiConfig.baseURL}${apiConfig.endpoints.signup}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Sign up successful! Redirecting to sign in...');
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1>Sign Up</h1>
        <form onSubmit={handleSubmit} className="signup-form">
          <label htmlFor="email">Email:</label>
          <input 
            type="email" 
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />

          <label htmlFor="password">Password:</label>
          <input 
            type="password" 
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />

          <button type="submit">Sign Up</button>
        </form>
        {message && <p className="message">{message}</p>}
        <div className="signin-prompt">
          <p>Already signed up? Please Sign in!</p>
          <Link to="/signin" className="signin-button">Sign In</Link>
        </div>
        <div className="signup-prompt">
          <p>Don't want an account? Continue as guest!</p>
          <Link to="/chat" className="signup-button">Continue as Guest</Link>
        </div>        
      </div>
    </div>
  );
};

export default SignUpPage;
