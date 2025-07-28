
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddLocationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    sourceType: '',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length > 3) {
      toast.error('You can upload a maximum of 3 images');
      return;
    }
    setImages(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('latitude', parseFloat(formData.latitude));
    data.append('longitude', parseFloat(formData.longitude));
    data.append('sourceType', formData.sourceType);

    images.forEach((img, idx) => {
      data.append('images', img);
    });

    try {
      await axios.post('/api/locations', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      toast.success('Add Location request submitted successfully!');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to submit request');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-location-form">
      <div className="form-header">
        <h2 className="form-title">Add New Charging Station</h2>
        <p className="form-subtitle">Help expand the EV charging network by adding a new station location</p>
      </div>

      <form onSubmit={handleSubmit} className="location-form">
        <div className="form-group">
          <label htmlFor="name">Station Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter station name"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="latitude">Latitude</label>
            <input
              id="latitude"
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="e.g., 28.6139"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="longitude">Longitude</label>
            <input
              id="longitude"
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="e.g., 77.2090"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="sourceType">Energy Source Type</label>
          <select
            id="sourceType"
            name="sourceType"
            value={formData.sourceType}
            onChange={handleChange}
            required
          >
            <option value="">Select energy source</option>
            <option value="solar">Solar Power</option>
            <option value="wind">Wind Power</option>
            <option value="hydro">Hydro Power</option>
            <option value="grid">Grid Power</option>
            <option value="mixed">Mixed Renewable</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="images">Station Images (Max 3)</label>
          <input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
            required
          />
          <div className="file-info">
            {images.length > 0 && (
              <p className="file-count">{images.length} image(s) selected</p>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Submitting Request...' : 'Submit Station Request'}
        </button>
      </form>

      <style jsx>{`
        .add-location-form {
          max-width: 500px;
          margin: 0 auto;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .form-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333333;
          margin-bottom: 0.5rem;
        }

        .form-subtitle {
          color: #666666;
          font-size: 0.9rem;
          margin: 0;
          line-height: 1.5;
        }

        .location-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333333;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group select {
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #ffffff;
          color: #333333;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #4ade80;
          outline: none;
          box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.1);
        }

        .file-input {
          padding: 0.5rem !important;
          cursor: pointer;
        }

        .file-info {
          margin-top: 0.5rem;
        }

        .file-count {
          color: #4ade80;
          font-size: 0.85rem;
          font-weight: 500;
          margin: 0;
        }

        .submit-button {
          background: #4ade80;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.8rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }

        .submit-button:hover:not(:disabled) {
          background: #22c55e;
          transform: translateY(-1px);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AddLocationForm;
