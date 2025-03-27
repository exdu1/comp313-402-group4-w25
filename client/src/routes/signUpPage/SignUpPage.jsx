// client/src/routes/signUpPage/SignUpPage.jsx
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './signUpPage.css';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const { register, googleLogin, error, clearErrors } = useContext(AuthContext);
  const navigate = useNavigate();

  const { displayName, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear specific error when user starts typing in a field
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!displayName.trim()) {
      errors.displayName = 'Name is required';
    }
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();
    
    if (validateForm()) {
      const success = await register({
        displayName,
        email,
        password
      });
      
      if (success) {
        navigate('/chat');
      }
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1>Create your Account</h1>
        <p>Join Calming Echo - Your AI Active Listening Companion</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">Name</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={displayName}
              onChange={onChange}
              className={formErrors.displayName ? 'error' : ''}
            />
            {formErrors.displayName && <div className="field-error">{formErrors.displayName}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              className={formErrors.email ? 'error' : ''}
            />
            {formErrors.email && <div className="field-error">{formErrors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              className={formErrors.password ? 'error' : ''}
            />
            {formErrors.password && <div className="field-error">{formErrors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              className={formErrors.confirmPassword ? 'error' : ''}
            />
            {formErrors.confirmPassword && <div className="field-error">{formErrors.confirmPassword}</div>}
          </div>
          
          <button type="submit" className="signup-button">Create Account</button>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <button onClick={googleLogin} className="google-button">
          Sign up with Google
        </button>
        
        <p className="signin-link">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;