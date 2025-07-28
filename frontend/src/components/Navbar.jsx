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
        <Link to="/"><img src="/logo.png" alt="Logo" /></Link>
        <span>Electra Map</span>
      </div>
      <div>
        {user ? (
          <>
            <button onClick={onAddStation}>Add Station</button>
            <span className="user-info">Welcome, {user.email}</span>
            <button onClick={handleLogout}>Logout</button>
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
