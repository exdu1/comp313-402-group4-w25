import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './signinPage.css';

// Define the SigninPage component
const SigninPage = () => {
  // Define local state variables for email, password, and message using the useState hook
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Event handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    try {
      // Make a POST request to the sign-in API endpoint with email and password
      const response = await fetch('http://localhost:3001/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // Convert email and password state values into a JSON string
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      // Check if the sign-in was successful based on API response
      if (data.success) {
        setMessage('Sign in successful!');
        // Save the token to local storage for future authentication purposes
        localStorage.setItem('token', data.token);
        // Redirect the user to the chat page after successful sign-in
        navigate('/chat');
      } else {
        // If sign-in failed, update the message state with the error message provided by the server
        setMessage(data.message);
      }
    } catch (error) {
      // Log any errors to the console for debugging
      console.error('Error signing in:', error);
      setMessage('An error occurred. Please try again.');
    }
  };
  // Render the sign-in page component
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
