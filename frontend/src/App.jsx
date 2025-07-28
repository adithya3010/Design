// App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MapComponent from './components/MapComponent';
import AddLocationForm from './components/AddLocationForm';
import LocationPage from './pages/LocationPage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar'; // ✅ Import Navbar
import { AuthProvider, AuthContext } from './context/AuthContext';
import Unauthorized from './pages/Unauthorized';
import './styles/main.css';
import Modal from './components/Modal'; // If you have a Modal component
import AdminStationRequests from './components/AdminStationRequests'; // Admin requests page
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import MapComponent from './components/MapComponent';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import LocationPage from './pages/LocationPage';
import Unauthorized from './pages/Unauthorized';
import AdminStationRequests from './components/AdminStationRequests';
import Modal from './components/Modal';
import AddLocationForm from './components/AddLocationForm';

function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user && user.role === 'admin' ? children : <Navigate to="/unauthorized" />;
}

const App = () => {
  const [showAddStation, setShowAddStation] = React.useState(false);

  return (
    <>
      <ToastContainer position="top-right" autoClose={7000} />
      <AuthProvider>
        <Router>
          <Navbar onAddStation={() => setShowAddStation(true)} />
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route
              path="/dashboard"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route
              path="/"
              element={
                <div>
                  <h2 style={{ textAlign: 'center' }}>Find Your Charging Station</h2>
                  <MapComponent />
                </div>
              }
            />
            <Route path="/admin/requests" element={<AdminStationRequests />} />
            <Route path="/location/:id" element={<LocationPage />} />
          </Routes>
          {showAddStation && (
            <Modal onClose={() => setShowAddStation(false)}>
              <AddLocationForm />
            </Modal>
          )}
        </Router>
      </AuthProvider>
    </>
  );
};

export default App;p;
