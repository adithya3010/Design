import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <div className="error-icon">🚫</div>
        <h1 className="error-title">Access Denied</h1>
        <p className="error-message">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        <div className="error-actions">
          <Link to="/" className="back-button">
            ← Back to Home
          </Link>
          <Link to="/login" className="login-button">
            Login
          </Link>
        </div>
      </div>

      <style jsx>{`
        .unauthorized-container {
          min-height: 100vh;
          background: #f8f9fb;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .unauthorized-content {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          padding: 3rem 2rem;
          text-align: center;
          max-width: 500px;
          width: 100%;
          border: 1px solid #e0e0e0;
        }

        .error-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }

        .error-title {
          font-size: 2rem;
          font-weight: 700;
          color: #333333;
          margin-bottom: 1rem;
        }

        .error-message {
          color: #666666;
          line-height: 1.6;
          margin-bottom: 2rem;
          font-size: 1rem;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .back-button,
        .login-button {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .back-button {
          background: transparent;
          color: #666666;
          border: 1px solid #e0e0e0;
        }

        .back-button:hover {
          background: #f8f9fb;
          color: #333333;
          border-color: #3b82f6;
        }

        .login-button {
          background: #4ade80;
          color: white;
          border: 1px solid #4ade80;
        }

        .login-button:hover {
          background: #22c55e;
          border-color: #22c55e;
          transform: translateY(-1px);
        }

        @media (max-width: 480px) {
          .unauthorized-content {
            padding: 2rem 1.5rem;
          }

          .error-title {
            font-size: 1.5rem;
          }

          .error-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Unauthorized;