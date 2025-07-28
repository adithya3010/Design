import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminStationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/api/admin/station-requests', { withCredentials: true });
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching station requests:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(`/api/admin/approve/${id}`, {}, { withCredentials: true });
      setRequests(prev => prev.filter(req => req._id !== id));
      setSelectedRequest(null);
    } catch (err) {
      console.error('Error approving request:', err.response?.data || err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`/api/admin/reject/${id}`, {}, { withCredentials: true });
      setRequests(prev => prev.filter(req => req._id !== id));
      setSelectedRequest(null);
    } catch (err) {
      console.error('Error rejecting request:', err.response?.data || err.message);
    }
  };

  if (loading) return <p>Loading station requests...</p>;
  if (!selectedRequest && requests.length === 0) return <p>No pending station requests.</p>;

  if (selectedRequest) {
    const { name, latitude, longitude, sourceType, submittedBy, images } = selectedRequest;

    return (
      <div style={{ padding: '20px' }}>
        {/* Sticky Approve/Reject buttons */}
        <div style={{
          position: 'sticky',
          top: '70px',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          backgroundColor: '#fff',
          padding: '10px 0'
        }}>
          <button onClick={() => handleApprove(selectedRequest._id)} style={{ backgroundColor: '#4CAF50', color: 'white' }}>✅ Approve</button>
          <button onClick={() => handleReject(selectedRequest._id)} style={{ backgroundColor: '#f44336', color: 'white' }}>❌ Reject</button>
        </div>

        <h2>Review Charging Station Request</h2>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Latitude:</strong> {latitude}</p>
        <p><strong>Longitude:</strong> {longitude}</p>
        <p><strong>Source Type:</strong> {sourceType}</p>
        <p><strong>Submitted By:</strong> {submittedBy?.email || 'Unknown'}</p>

        {/* Google Map */}
        <iframe
          title="Google Map"
          width="100%"
          height="350"
          frameBorder="0"
          style={{ border: 0 }}
          src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
          allowFullScreen
        ></iframe>

        {/* Image Previews */}
        <div style={{ marginTop: '20px' }}>
          <h4>Uploaded Images:</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {images?.length > 0 ? (
              images.map((imgPath, idx) => (
                <img key={idx} src={`/${imgPath}`} alt={`Upload ${idx}`} style={{ width: '200px', borderRadius: '6px' }} />
              ))
            ) : (
              <p>No images uploaded.</p>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div style={{ marginTop: '30px' }}>
          <button onClick={() => setSelectedRequest(null)}>← Back to all requests</button>
        </div>
      </div>
    );
  }

  // List of requests
  return (
    <div style={{ padding: '20px' }}>
      <h2>Pending Charging Station Requests</h2>
      {requests.map((req) => (
        <div key={req._id} style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '12px',
          backgroundColor: '#f9f9f9'
        }}>
          <p><strong>Name:</strong> {req.name}</p>
          <p><strong>Latitude:</strong> {req.latitude}</p>
          <p><strong>Longitude:</strong> {req.longitude}</p>
          <p><strong>Source Type:</strong> {req.sourceType}</p>
          <p><strong>Submitted By:</strong> {req.submittedBy?.email || 'Unknown'}</p>
          <button onClick={() => setSelectedRequest(req)}>🔍 Review</button>
        </div>
      ))}
    </div>
  );
}
