import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiConfig from '../../config/api';
import './signinPage.css';

const SigninPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiConfig.baseURL}${apiConfig.endpoints.signin}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Sign in successful!');
        localStorage.setItem('token', data.token);
        navigate('/chat');
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-box">
        <h1>Sign In</h1>
        <form onSubmit={handleSubmit} className="signin-form">
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

          <button type="submit">Sign In</button>
        </form>
        {message && <p className="message">{message}</p>}
        <div className="signup-prompt">
          <p>Don't have an account yet? Create one!</p>
          <Link to="/signup" className="signup-button">Sign Up</Link>
        </div>
        <div className="signup-prompt">
          <p>Don't want an account? Continue as guest!</p>
          <Link to="/chat" className="signup-button">Continue as Guest</Link>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
