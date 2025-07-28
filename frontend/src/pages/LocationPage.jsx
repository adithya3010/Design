import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const LocationPage = () => {
  const { id } = useParams();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get(`/api/locations/${id}`);
        setLocation(response.data);
      } catch (error) {
        console.error('Error fetching location:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [id]);

  if (loading) {
    return (
      <div className="location-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading station details...</p>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="location-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h2>Station Not Found</h2>
          <p>The charging station you're looking for doesn't exist or has been removed.</p>
          <Link to="/app" className="back-button">← Back to Map</Link>
        </div>
      </div>
    );
  }

  const getSourceTypeColor = (sourceType) => {
    switch (sourceType?.toLowerCase()) {
      case 'solar': return '#fbbf24';
      case 'wind': return '#3b82f6';
      case 'hydro': return '#06b6d4';
      case 'grid': return '#6b7280';
      default: return '#4ade80';
    }
  };

  return (
    <div className="location-container">
      <div className="location-header">
        <Link to="/app" className="back-link">← Back to Map</Link>
        <div className="header-logo">
          <div className="logo-icon">⚡</div>
          <span>ElectraMap</span>
        </div>
      </div>

      <div className="location-content">
        <div className="station-card">
          <div className="station-header">
            <h1 className="station-name">{location.name}</h1>
            <div 
              className="source-badge"
              style={{ backgroundColor: getSourceTypeColor(location.sourceType) }}
            >
              {location.sourceType}
            </div>
          </div>

          <div className="station-details">
            <div className="detail-section">
              <h3>Location Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Latitude:</span>
                  <span className="detail-value">{location.latitude?.toFixed(6)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Longitude:</span>
                  <span className="detail-value">{location.longitude?.toFixed(6)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Energy Source:</span>
                  <span className="detail-value source-type">
                    {location.sourceType}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value status-active">Active</span>
                </div>
              </div>
            </div>

            {location.images && location.images.length > 0 && (
              <div className="images-section">
                <h3>Station Images</h3>
                <div className="images-grid">
                  {location.images.map((image, index) => (
                    <div key={index} className="image-card">
                      <img 
                        src={`/api/uploads/station-requests/${image}`} 
                        alt={`${location.name} - Image ${index + 1}`}
                        className="station-image"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="station-actions">
            <button className="action-button primary">
              🗺️ View on Map
            </button>
            <button className="action-button secondary">
              📍 Get Directions
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .location-container {
          min-height: 100vh;
          background: #f8f9fb;
        }

        .location-header {
          background: #ffffff;
          border-bottom: 1px solid #e0e0e0;
          padding: 1rem 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .location-header {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
        }

        .back-link {
          color: #666666;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .back-link:hover {
          color: #3b82f6;
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          color: #333333;
        }

        .logo-icon {
          width: 28px;
          height: 28px;
          background: #4ade80;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
        }

        .location-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        .station-card {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
          overflow: hidden;
        }

        .station-header {
          padding: 2rem 2rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .station-name {
          font-size: 2rem;
          font-weight: 700;
          color: #333333;
          margin: 0;
          line-height: 1.2;
        }

        .source-badge {
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: capitalize;
          white-space: nowrap;
        }

        .station-details {
          padding: 0 2rem 2rem;
        }

        .detail-section {
          margin-bottom: 2rem;
        }

        .detail-section h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #333333;
          margin-bottom: 1rem;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8f9fb;
          border-radius: 8px;
        }

        .detail-label {
          font-weight: 500;
          color: #666666;
          font-size: 0.9rem;
        }

        .detail-value {
          color: #333333;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .source-type {
          background: #4ade80;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          text-transform: capitalize;
        }

        .status-active {
          color: #22c55e;
          font-weight: 600;
        }

        .images-section h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #333333;
          margin-bottom: 1rem;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .image-card {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
        }

        .station-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .station-image:hover {
          transform: scale(1.05);
        }

        .station-actions {
          padding: 2rem;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 1rem;
        }

        .action-button {
          flex: 1;
          padding: 0.8rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-button.primary {
          background: #4ade80;
          color: white;
        }

        .action-button.primary:hover {
          background: #22c55e;
          transform: translateY(-1px);
        }

        .action-button.secondary {
          background: transparent;
          color: #666666;
          border: 1px solid #e0e0e0;
        }

        .action-button.secondary:hover {
          background: #f8f9fb;
          color: #333333;
          border-color: #3b82f6;
        }

        .loading-state,
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
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

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-state h2 {
          color: #333333;
          margin-bottom: 0.5rem;
        }

        .back-button {
          background: #4ade80;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          margin-top: 1.5rem;
          display: inline-block;
        }

        .back-button:hover {
          background: #22c55e;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .location-content {
            padding: 1rem;
          }

          .station-header {
            padding: 1.5rem 1.5rem 1rem;
            flex-direction: column;
            align-items: flex-start;
          }

          .station-name {
            font-size: 1.5rem;
          }

          .station-details {
            padding: 0 1.5rem 1.5rem;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .station-actions {
            padding: 1.5rem;
            flex-direction: column;
          }

          .images-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default LocationPage;