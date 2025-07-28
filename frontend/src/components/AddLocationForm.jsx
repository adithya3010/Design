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
  const [images, setImages] = useState([]); // store multiple images

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

    const data = new FormData();
    data.append('name', formData.name);
    data.append('latitude', parseFloat(formData.latitude));
    data.append('longitude', parseFloat(formData.longitude));
    data.append('sourceType', formData.sourceType);

    images.forEach((img, idx) => {
      data.append('images', img);  // append multiple images under the same key 'images'
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
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '10px' }}>
      <input name="name" placeholder="Name" onChange={handleChange} required />
      <input name="latitude" placeholder="Latitude" onChange={handleChange} required />
      <input name="longitude" placeholder="Longitude" onChange={handleChange} required />
      <input
        name="sourceType"
        placeholder="renewable or non-renewable"
        onChange={handleChange}
        required
        pattern="renewable|non-renewable"
      />

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        required
      />
      <small>You can upload up to 3 images.</small>

      <button type="submit">Submit request</button>
    </form>
  );
};

export default AddLocationForm;
