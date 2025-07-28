
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [stationRequests, setStationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/unauthorized');
      return;
    }
    fetchStationRequests();
  }, [user, navigate]);

  const fetchStationRequests = async () => {
    try {
      const response = await axios.get('/api/admin/station-requests', {
        withCredentials: true
      });
      setStationRequests(response.data);
    } catch (error) {
      toast.error('Failed to fetch station requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.patch(`/api/admin/station-requests/${requestId}/approve`, {}, {
        withCredentials: true
      });
      toast.success('Station request approved!');
      fetchStationRequests();
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.patch(`/api/admin/station-requests/${requestId}/reject`, {}, {
        withCredentials: true
      });
      toast.success('Station request rejected');
      fetchStationRequests();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleLogout = async () => {
    await axios.post('/api/auth/logout', {}, { withCredentials: true });
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">⚡</div>
            <h1 className="dashboard-title">ElectraMap Admin</h1>
          </div>
          <div className="header-actions">
            <span className="welcome-text">Welcome, {user?.email}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-header">
          <h2 className="section-title">Station Requests</h2>
          <div className="stats-card">
            <span className="stats-number">{stationRequests.length}</span>
            <span className="stats-label">Pending Requests</span>
          </div>
        </div>

        {stationRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No pending requests</h3>
            <p>All station requests have been processed.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {stationRequests.map((request) => (
              <div key={request._id} className="request-card">
                <div className="card-header">
                  <h3 className="station-name">{request.name}</h3>
                  <span className="status-badge pending">Pending</span>
                </div>
                
                <div className="card-content">
                  <div className="location-info">
                    <div className="info-item">
                      <span className="info-label">Location:</span>
                      <span className="info-value">
                        {request.latitude?.toFixed(4)}, {request.longitude?.toFixed(4)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Energy Source:</span>
                      <span className="info-value source-type">
                        {request.sourceType}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Submitted:</span>
                      <span className="info-value">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {request.images && request.images.length > 0 && (
                    <div className="images-section">
                      <span className="images-label">Images ({request.images.length}):</span>
                      <div className="images-grid">
                        {request.images.map((image, index) => (
                          <img
                            key={index}
                            src={`/api/uploads/station-requests/${image}`}
                            alt={`Station ${index + 1}`}
                            className="station-image"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button
                    onClick={() => handleApprove(request._id)}
                    className="action-button approve"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleReject(request._id)}
                    className="action-button reject"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: #f8f9fb;
        }

        .dashboard-header {
          background: #ffffff;
          border-bottom: 1px solid #e0e0e0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          padding: 1rem 0;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
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

        .dashboard-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333333;
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .welcome-text {
          color: #666666;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .logout-button {
          background: transparent;
          color: #666666;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-button:hover {
          background: #f8f9fb;
          color: #333333;
          border-color: #3b82f6;
        }

        .dashboard-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #333333;
          margin: 0;
        }

        .stats-card {
          background: #4ade80;
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 16px rgba(74, 222, 128, 0.2);
        }

        .stats-number {
          display: block;
          font-size: 2rem;
          font-weight: 700;
        }

        .stats-label {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          color: #666666;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e0e0e0;
          border-top: 3px solid #4ade80;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666666;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: #333333;
          margin-bottom: 0.5rem;
        }

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .request-card {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          border: 1px solid #e0e0e0;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .request-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 1.5rem 0;
        }

        .station-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: #333333;
          margin: 0;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-badge.pending {
          background: #fbbf24;
          color: #333333;
        }

        .card-content {
          padding: 1.5rem;
        }

        .location-info {
          margin-bottom: 1.5rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .info-label {
          font-weight: 500;
          color: #666666;
          font-size: 0.9rem;
        }

        .info-value {
          color: #333333;
          font-size: 0.9rem;
        }

        .source-type {
          background: #22c55e;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          text-transform: capitalize;
        }

        .images-section {
          margin-top: 1rem;
        }

        .images-label {
          display: block;
          font-weight: 500;
          color: #666666;
          font-size: 0.9rem;
          margin-bottom: 0.75rem;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 0.5rem;
        }

        .station-image {
          width: 100%;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
        }

        .card-actions {
          display: flex;
          gap: 0.75rem;
          padding: 0 1.5rem 1.5rem;
        }

        .action-button {
          flex: 1;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-button.approve {
          background: #4ade80;
          color: white;
        }

        .action-button.approve:hover {
          background: #22c55e;
        }

        .action-button.reject {
          background: #ef4444;
          color: white;
        }

        .action-button.reject:hover {
          background: #dc2626;
        }

        @media (max-width: 768px) {
          .header-content {
            padding: 0 1rem;
            flex-direction: column;
            gap: 1rem;
          }

          .dashboard-content {
            padding: 1rem;
          }

          .content-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .requests-grid {
            grid-template-columns: 1fr;
          }

          .welcome-text {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
