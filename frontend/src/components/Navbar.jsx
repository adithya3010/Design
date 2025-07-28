
// src/components/Navbar.jsx
import axios from 'axios';
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar({ onAddStation }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
  await axios.post('/api/auth/logout', {}, { withCredentials: true });
  logout();           // properly clears context
  navigate('/login');
};


  return (
    <nav>
      <div className="logo">
        <Link to="/">
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#4ade80',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>⚡</span>
          </div>
        </Link>
        <span>Electra Map</span>
      </div>
      <div className="nav-actions">
        {user ? (
          <>
            <button onClick={onAddStation}>+ Add Station</button>
            <span className="user-info">Welcome, {user.email}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
