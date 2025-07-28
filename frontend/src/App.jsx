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
import './styles/main.css';

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

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
                <div className="fade-in">
                  <div className="scale-in">
                    <MapComponent />
                  </div>
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

export default App;