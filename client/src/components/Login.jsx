import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (isRegister) {
      if (!formData.username.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
        setError('All fields are required');
        return false;
      }

      if (formData.username.length < 3) {
        setError('Username must be at least 3 characters long');
        return false;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    } else {
      if (!formData.login || !formData.password) {
        setError('Email/Username and password are required');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form before sending to server
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        // Registration
        const response = await axios.post('/api/auth/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password
        });

        if (response.data.success) {
          setIsRegister(false);
          setError('Registration successful! Please login.');
          setFormData({ 
            username: '', 
            email: '', 
            password: '', 
            confirmPassword: '',
            login: ''
          });
        }
      } else {
        // Login
        const response = await axios.post('/api/auth/login', {
          login: formData.login, // Can be email or username
          password: formData.password
        });

        if (response.data.success) {
          login(response.data.user, response.data.token);
          navigate('/dashboard');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      login: ''
    });
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1 className="login-title">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="login-subtitle">
          {isRegister ? 'Sign up to get started' : 'Sign in to your account'}
        </p>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className={`alert ${error.includes('successful') ? 'alert-success' : 'alert-error'}`}>
              {error}
            </div>
          )}
          
          {isRegister ? (
            <>
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username (min. 3 characters)
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your username"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password (min. 6 characters)
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Confirm your password"
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="login" className="form-label">
                  Email or Username
                </label>
                <input
                  id="login"
                  name="login"
                  type="text"
                  required
                  value={formData.login}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email or username"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p className="toggle-text">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              clearForm();
            }}
            className="toggle-btn"
          >
            {isRegister ? ' Sign in' : ' Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;