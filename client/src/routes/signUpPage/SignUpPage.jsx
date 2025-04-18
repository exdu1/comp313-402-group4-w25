import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './signUpPage.css';

// Define the SignUpPage component
const SignUpPage = () => {
  // Define state variables for managing the email, password, and a message to display to the user
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Handler for form submission which initiates the sign-up process
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form behavior which would reload the page
    try {
      // Make a POST request to the API endpoint for sign-up with provided email and password
      const response = await fetch('http://localhost:3001/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // Convert email and password state values into a JSON string
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      // Check if the API returned a successful sign-up response
      if (data.success) {
        setMessage('Sign up successful! Redirecting to sign in...');
        // Use a timeout to delay navigation to the sign-in page by 2 seconds
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      // Log the error in the console for debugging purposes
      console.error('Error signing up:', error);
      setMessage('An error occurred. Please try again.');
    }
  };
  // Render the sign-up form and related navigation options in the component UI
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
