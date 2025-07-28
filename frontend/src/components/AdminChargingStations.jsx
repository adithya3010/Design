import { useEffect, useState } from 'react';
import axios from 'axios';
import AddChargerForm from './AddChargerForm';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export default function AdminChargingStations() {
  const [stations, setStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await axios.get('/api/locations');
        setStations(res.data);
      } catch (err) {
        console.error('Error fetching stations:', err);
      }
    };

    fetchStations();
  }, []);

  const handleOpenForm = (locationId) => {
    setSelectedLocationId(locationId);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedLocationId(null);
  };

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Charging Stations</h2>
      
      <input
        type="text"
        placeholder="Search by station name..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ padding: '8px', width: '300px', marginBottom: '16px' }}
      />

      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {filteredStations.map(station => (
          <li key={station._id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc' }}>
            <Link
              to={`/locations/${station._id}`}
              style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}
            >
              {station.name}
            </Link>

            <button
              style={{ marginLeft: '15px', padding: '5px 10px' }}
              onClick={() => handleOpenForm(station._id)}
            >
              ➕ Add Charger
            </button>
          </li>
        ))}
      </ul>

      {filteredStations.length === 0 && <p>No stations found.</p>}

      {/* Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px' }}>
            <h3>Add Charger</h3>
            <AddChargerForm locationId={selectedLocationId} onClose={handleCloseForm} />
            <button
              onClick={handleCloseForm}
              style={{ marginTop: '10px', color: 'gray' }}
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
