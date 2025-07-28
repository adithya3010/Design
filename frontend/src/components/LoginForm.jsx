
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
      login(res.data.user);
      toast.success('Login successful!');
      navigate('/app');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-section">
            <div className="logo-icon">⚡</div>
            <h1 className="auth-title">ElectraMap</h1>
          </div>
          <p className="auth-subtitle">Welcome back! Please sign in to your account.</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register" className="auth-link">Sign up here</Link></p>
        </div>
      </div>
      
      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          background: #f8f9fb;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        
        .auth-card {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          padding: 2.5rem;
          width: 100%;
          max-width: 400px;
          border: 1px solid #e0e0e0;
        }
        
        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .logo-icon {
          width: 40px;
          height: 40px;
          background: #4ade80;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          font-weight: bold;
        }
        
        .auth-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #333333;
          margin: 0;
        }
        
        .auth-subtitle {
          color: #666666;
          font-size: 0.9rem;
          margin: 0;
        }
        
        .auth-form {
          margin-bottom: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333333;
          font-size: 0.9rem;
        }
        
        .form-group input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #ffffff;
          color: #333333;
        }
        
        .form-group input:focus {
          border-color: #4ade80;
          outline: none;
          box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.1);
        }
        
        .auth-button {
          width: 100%;
          background: #4ade80;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.8rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .auth-button:hover:not(:disabled) {
          background: #22c55e;
          transform: translateY(-1px);
        }
        
        .auth-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .auth-footer {
          text-align: center;
        }
        
        .auth-footer p {
          color: #666666;
          font-size: 0.9rem;
          margin: 0;
        }
        
        .auth-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }
        
        .auth-link:hover {
          color: #2563eb;
          text-decoration: underline;
        }
        
        @media (max-width: 480px) {
          .auth-card {
            padding: 2rem 1.5rem;
          }
          
          .auth-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginForm;
