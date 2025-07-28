import React, { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom station icon with brand green color
const stationIcon = new L.DivIcon({
  html: `<div style="
    background: #4ade80;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(74, 222, 128, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 12px;
  ">⚡</div>`,
  className: 'custom-station-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

export default function MapComponent() {
  const [locations, setLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchLocations();
    getUserLocation();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('/api/locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserLocation([28.6139, 77.2090]); // Default to Delhi
        }
      );
    } else {
      setUserLocation([28.6139, 77.2090]); // Default to Delhi
    }
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
  };

  return (
    <div style={{ 
      height: 'calc(100vh - 70px)', 
      width: '100%',
      background: 'var(--light-background)'
    }}>
      {userLocation && (
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* User location marker */}
          <Marker position={userLocation}>
            <Popup>
              <div style={{ 
                padding: '0.5rem',
                fontFamily: 'var(--font-main)',
                color: 'var(--text)'
              }}>
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>

          {/* Station markers */}
          {locations.map((location) => (
            <Marker 
              key={location._id} 
              position={[location.latitude, location.longitude]}
              icon={stationIcon}
              eventHandlers={{
                click: () => handleLocationClick(location)
              }}
            >
              <Popup>
                <div style={{ 
                  padding: '1rem',
                  fontFamily: 'var(--font-main)',
                  color: 'var(--text)',
                  minWidth: '200px'
                }}>
                  <h3 style={{ 
                    margin: '0 0 0.5rem 0', 
                    color: 'var(--brand-green)',
                    fontSize: '1.1rem'
                  }}>
                    {location.name}
                  </h3>
                  <p style={{ 
                    margin: '0 0 0.5rem 0', 
                    color: 'var(--text-light)',
                    fontSize: '0.9rem'
                  }}>
                    {location.address}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ 
                      background: 'var(--brand-green)', 
                      color: 'white',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem'
                    }}>
                      {location.sourceType}
                    </span>
                  </div>
                  <button
                    onClick={() => window.open(`/location/${location._id}`, '_blank')}
                    style={{
                      background: 'var(--brand-blue)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}