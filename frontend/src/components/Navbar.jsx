import React from 'react';
import MapComponent from './components/MapComponent';
import AddLocationForm from './components/AddLocationForm';

const App = () => {
  return (
    <div>
      {/* Navbar with EJS links */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '20px',
        zIndex: 1000
      }}>
        <a href="http://localhost:5000/auth/login" style={{ marginRight: '10px' }}>Login</a>
        <a href="http://localhost:5000/auth/register">Register</a>
      </div>

      <h2 style={{ textAlign: 'center' }}>Find Your Charging Station</h2>
      <AddLocationForm />
      <MapComponent />
    </div>
  );
};

export default App;
