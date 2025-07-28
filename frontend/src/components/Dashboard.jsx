import { useNavigate } from 'react-router-dom';
import AdminChargingStations from './AdminChargingStations';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleViewRequests = () => {
    navigate('/admin/requests');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>

      {/* Button to view pending station requests */}
      <button
        onClick={handleViewRequests}
        
      >
        🚧 View Station Requests
      </button>

      {/* Existing charging stations section */}
      <AdminChargingStations />
    </div>
  );
}
