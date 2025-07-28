
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import LoginForm from './LoginForm';
import Modal from './Modal';
import { AuthContext } from '../context/AuthContext';
import './ChargerList.css';

export default function ChargerList({ chargers }) {
  const [showFormId, setShowFormId] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({
    batteryCapacity: '',
    currentCharge: '',
    targetCharge: '',
    chargingPower: '',
  });

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date().getTime();
      document.querySelectorAll('.remaining-countdown').forEach(span => {
        const eta = new Date(span.dataset.eta).getTime();
        const chargerId = span.dataset.chargerId;
        const diff = eta - now;

        if (diff <= 0) {
          span.textContent = "Available now";
          autoPlugOut(chargerId);
        } else {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          span.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
      });
    };

    const autoPlugOut = async (chargerId) => {
      try {
        await axios.post(`/api/chargers/${chargerId}/plug-out`);
        window.location.reload();
      } catch (err) {
        console.error('Auto plug out failed', err);
      }
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePlugIn = async (e, chargerId) => {
    e.preventDefault();
    try {
      await axios.post(`/api/chargers/${chargerId}/plug-in`, formData, { withCredentials: true });
      window.location.reload();
    } catch (err) {
      console.error("Plug in failed:", err);
    }
  };

  const handlePlugOut = async (chargerId) => {
    try {
      await axios.post(`/api/chargers/${chargerId}/plug-out`);
      window.location.reload();
    } catch (err) {
      console.error("Plug out failed:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      batteryCapacity: '',
      currentCharge: '',
      targetCharge: '',
      chargingPower: '',
    });
    setShowFormId(null);
  };

  if (chargers.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚡</div>
        <h3>No Charging Stations Available</h3>
        <p>Check back later or add a new charging station to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="charger-list">
        {chargers.map(charger => (
          <div className="charger-card" key={charger._id}>
            <div className="charger-header">
              <h3 className="charger-name">{charger.name}</h3>
              <div className={`status-badge ${charger.status.replace(' ', '-')}`}>
                <span className={`status-indicator ${charger.status.replace(' ', '-')}`}></span>
                {charger.status}
              </div>
            </div>
            
            <div className="charger-specs">
              <div className="spec-item">
                <span className="spec-label">Type:</span>
                <span>{charger.type}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Power:</span>
                <span>{charger.power} kW</span>
              </div>
            </div>

            {charger.status === 'plugged in' && charger.chargingSession ? (
              <div className="charging-session">
                <div className="session-info">
                  <div className="session-item">
                    <span className="session-label">Charging Time</span>
                    <span className="session-value">{charger.chargingSession.chargingTime} min</span>
                  </div>
                  <div className="session-item">
                    <span className="session-label">ETA</span>
                    <span className="session-value">{new Date(charger.chargingSession.eta).toLocaleTimeString()}</span>
                  </div>
                </div>
                
                <div className="countdown-display">
                  <span
                    className="remaining-countdown"
                    data-eta={new Date(charger.chargingSession.eta).toISOString()}
                    data-charger-id={charger._id}
                  >
                    Calculating...
                  </span>
                </div>
                
                <div className="charger-actions">
                  <button 
                    className="action-button plug-out"
                    onClick={() => handlePlugOut(charger._id)}
                  >
                    🔌 Unplug
                  </button>
                </div>
              </div>
            ) : (
              <div className="charger-actions">
                <button
                  className="action-button"
                  onClick={() => {
                    if (!user) {
                      setShowLogin(true);
                    } else {
                      setShowFormId(charger._id);
                    }
                  }}
                >
                  ⚡ Start Charging
                </button>
              </div>
            )}

            {showFormId === charger._id && (
              <div className="plug-in-form">
                <h4 className="form-title">
                  ⚡ Configure Charging Session
                </h4>
                <form onSubmit={(e) => handlePlugIn(e, charger._id)}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Battery Capacity (kWh)</label>
                      <input
                        type="number"
                        name="batteryCapacity"
                        placeholder="e.g., 75"
                        value={formData.batteryCapacity}
                        onChange={handleInputChange}
                        required
                        min="1"
                        max="200"
                      />
                    </div>
                    <div className="form-group">
                      <label>Current Charge (%)</label>
                      <input
                        type="number"
                        name="currentCharge"
                        placeholder="e.g., 25"
                        value={formData.currentCharge}
                        onChange={handleInputChange}
                        required
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="form-group">
                      <label>Target Charge (%)</label>
                      <input
                        type="number"
                        name="targetCharge"
                        placeholder="e.g., 80"
                        value={formData.targetCharge}
                        onChange={handleInputChange}
                        required
                        min="1"
                        max="100"
                      />
                    </div>
                    <div className="form-group">
                      <label>Charging Power (kW)</label>
                      <input
                        type="number"
                        name="chargingPower"
                        placeholder="e.g., 50"
                        value={formData.chargingPower}
                        onChange={handleInputChange}
                        required
                        min="1"
                        max="350"
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="submit-button">
                      Start Charging
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>

      {showLogin && (
        <Modal onClose={() => setShowLogin(false)}>
          <LoginForm onSuccess={() => setShowLogin(false)} />
        </Modal>
      )}
    </>
  );
}
