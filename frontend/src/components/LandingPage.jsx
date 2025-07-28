
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  };

  const handleLoginSignup = () => {
    navigate('/login');
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <span>⚡</span>
            </div>
            <span className="logo-text">ElectraMap</span>
          </div>
          <button className="login-signup-btn" onClick={handleLoginSignup}>
            Login / Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Find EV Charging Stations<br />
            Across India
          </h1>
          <p className="hero-description">
            Plan your electric vehicle journey with confidence. Discover charging
            stations, plan optimal routes, and charge sustainably with renewable
            energy.
          </p>
          <button className="start-journey-btn" onClick={handleGetStarted}>
            Start Your Journey
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <h3 className="feature-title">Interactive Map</h3>
            <p className="feature-description">
              Real-time station availability across
              India with live status updates
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"/>
              </svg>
            </div>
            <h3 className="feature-title">Smart Trip Planning</h3>
            <p className="feature-description">
              Optimized routes with charging
              stops based on your vehicle's range
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.06.52C6.16 17.4 7.96 13.4 17 10zm-5-3.5c7.37 2.39 9.83 8.07 11.91 13.27l1.04-.55C22.72 12.13 20.46 6.8 14 4.5z"/>
              </svg>
            </div>
            <h3 className="feature-title">Renewable Energy</h3>
            <p className="feature-description">
              Find stations powered by clean,
              sustainable energy sources
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16.3V16.7H7.7V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
              </svg>
            </div>
            <h3 className="feature-title">Reliable Network</h3>
            <p className="feature-description">
              Verified stations with real-time
              availability and session management
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Go Electric?</h2>
          <p className="cta-description">
            Join thousands of EV drivers using ElectraMap for seamless charging experiences
          </p>
          <button className="get-started-btn" onClick={handleGetStarted}>
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
