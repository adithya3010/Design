
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import * as turf from '@turf/turf';
import polyline from '@mapbox/polyline';

const blueDotIcon = new L.DivIcon({
  html: '<div style="width: 16px; height: 16px; background: rgba(0,123,255,0.7); border-radius: 50%; box-shadow: 0 0 12px rgba(0,123,255,0.5);"></div>',
  className: ''
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redDotIcon = new L.DivIcon({
  html: '<div style="width: 12px; height: 12px; background: red; border-radius: 50%; box-shadow: 0 0 6px red;"></div>',
  className: ''
});

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapComponent = () => {
  const [locations, setLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [sortedLocations, setSortedLocations] = useState([]);
  const [showList, setShowList] = useState(false);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [chargingStops, setChargingStops] = useState([]);
  const [lowBatteryPoints, setLowBatteryPoints] = useState([]);
  const [batteryPercent, setBatteryPercent] = useState(80);
  const [efficiency, setEfficiency] = useState(5.2);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getSoonestETA = (chargers) => {
    if (!chargers || chargers.length === 0) return null;
    const busyChargers = chargers.filter(c => c.status === 'plugged in' && c.plugInTime && c.estimatedTime);
    if (busyChargers.length === 0) return null;
    const etas = busyChargers.map(c => new Date(c.plugInTime).getTime() + (c.estimatedTime * 60 * 1000));
    return new Date(Math.min(...etas));
  };

  useEffect(() => {
    axios.get('http://localhost:5000/api/locations')
      .then((res) => {
        setLocations(res.data);
      });

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        const initAutocomplete = (id, setter) => {
          const input = document.getElementById(id);
          if (!input) return;
          const autocomplete = new window.google.maps.places.Autocomplete(input);
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
              setter({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                name: place.formatted_address
              });
            }
          });
        };

        initAutocomplete('start-location', setStart);
        initAutocomplete('end-location', setEnd);
      });
    }
  }, []);

  const findNearest = () => {
    if (!userLocation || locations.length === 0) return;

    const level = batteryPercent;
    if (isNaN(level) || level < 0 || level > 100) {
      alert("Enter a valid percentage between 0 and 100.");
      return;
    }

    const updated = locations.map((loc) => {
      const actualDist = getDistance(userLocation.lat, userLocation.lng, Number(loc.latitude), Number(loc.longitude));
      const isRenewable = loc.sourceType === 'renewable';
      const adjustedDistance = isRenewable ? Math.max(actualDist - 5, 0) : actualDist;
      return {
        ...loc,
        actualDistance: actualDist,
        adjustedDistance
      };
    });

    if (level > 20) {
      updated.sort((a, b) => a.adjustedDistance - b.adjustedDistance);
    } else {
      updated.sort((a, b) => a.actualDistance - b.actualDistance);
    }

    setSortedLocations(updated);
    setShowList(true);
  };

  const handleRoute = async () => {
    if (!start || !end || locations.length === 0) return;

    const battery = batteryPercent;
    const vehicleEfficiency = efficiency;

    if (isNaN(battery) || isNaN(vehicleEfficiency) || battery <= 0 || battery > 100 || vehicleEfficiency <= 0) {
      alert("Please enter valid battery percentage and efficiency.");
      return;
    }

    const stops = [];

    try {
      const waypointStr = stops.map(stop => `${stop.latitude},${stop.longitude}`).join('|');

      const res = await axios.get('http://localhost:5000/api/locations/get-route', {
        params: {
          origin: `${start.lat},${start.lng}`,
          destination: `${end.lat},${end.lng}`,
          waypoints: waypointStr
        }
      });

      const encoded = res.data.encoded;
      if (!encoded) {
        alert("No route received from server.");
        return;
      }

      const path = polyline.decode(encoded).map(([lat, lng]) => ({ lat, lng }));
      if (!path || path.length === 0) {
        alert("Failed to decode route.");
        return;
      }

      setRoutePoints(path);

      let currentBattery = battery;
      let cumulativeDistance = 0;
      const lowBatteryMarkers = [];

      for (let i = 1; i < path.length; i++) {
        const segmentDistance = getDistance(
          path[i - 1].lat, path[i - 1].lng,
          path[i].lat, path[i].lng
        );

        cumulativeDistance += segmentDistance;

        const usedBattery = cumulativeDistance / vehicleEfficiency;
        const remainingBattery = currentBattery - usedBattery;

        if (remainingBattery <= 20) {
          lowBatteryMarkers.push(path[i]);

          const pt = turf.point([path[i].lng, path[i].lat]);
          const nearbyStations = locations.filter(loc => {
            const stationPt = turf.point([Number(loc.longitude), Number(loc.latitude)]);
            const dist = turf.distance(pt, stationPt, { units: 'kilometers' });
            return dist <= 5;
          });

          if (nearbyStations.length > 0) {
            const nearest = nearbyStations.reduce((a, b) => {
              const da = getDistance(path[i].lat, path[i].lng, a.latitude, a.longitude);
              const db = getDistance(path[i].lat, path[i].lng, b.latitude, b.longitude);
              return da < db ? a : b;
            });

            stops.push(nearest);
            currentBattery = 100;
            cumulativeDistance = 0;
          }
        }
      }

      if (stops.length === 0) {
        alert("No charging stations found within 5 km of route at low battery points.");
      }

      setChargingStops(stops);
      setLowBatteryPoints(lowBatteryMarkers);
    } catch (err) {
      console.error("Error fetching route:", err);
      alert("Failed to fetch route.");
    }
  };

  const openGoogleDirections = () => {
    if (!start || !end) {
      alert("Please set both start and end locations.");
      return;
    }

    const waypointStr = chargingStops
      .map(stop => `${stop.latitude},${stop.longitude}`)
      .join('|');

    const url = `https://www.google.com/maps/dir/?api=1&origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&travelmode=driving${waypointStr ? `&waypoints=${encodeURIComponent(waypointStr)}` : ''}`;

    window.open(url, '_blank');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'var(--font-main)' }}>
      {/* Sidebar */}
      <div style={{
        width: '300px',
        backgroundColor: '#ffffff',
        padding: '20px',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        overflowY: 'auto',
        borderRight: '1px solid #e0e0e0'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '25px',
          paddingBottom: '15px',
          borderBottom: '2px solid #f0f0f0'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#2e7d32',
            borderRadius: '4px',
            marginRight: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>⚡</span>
          </div>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#333'
          }}>Plan Your Trip</h2>
        </div>

        {/* Start Location */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#333',
            fontSize: '14px'
          }}>Start Location</label>
          <input
            id="start-location"
            placeholder="Enter starting point"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2e7d32'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        {/* End Location */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#333',
            fontSize: '14px'
          }}>End Location</label>
          <input
            id="end-location"
            placeholder="Enter destination"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2e7d32'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        {/* Battery and Efficiency */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333',
              fontSize: '14px'
            }}>Battery %</label>
            <input
              type="number"
              value={batteryPercent}
              onChange={(e) => setBatteryPercent(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2e7d32'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333',
              fontSize: '14px'
            }}>Efficiency (km/kWh)</label>
            <input
              type="number"
              step="0.1"
              value={efficiency}
              onChange={(e) => setEfficiency(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2e7d32'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginBottom: '25px' }}>
          <button
            onClick={handleRoute}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#2e7d32',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '12px',
              transition: 'background-color 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1b5e20'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2e7d32'}
          >
            ✓ Plan Route
          </button>

          <button
            onClick={findNearest}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: 'transparent',
              color: '#2e7d32',
              border: '2px solid #2e7d32',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#2e7d32';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#2e7d32';
            }}
          >
            📍 Find Nearest Stations
          </button>
        </div>

        {/* Google Maps Button */}
        {chargingStops.length > 0 && (
          <button
            onClick={openGoogleDirections}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1565c0'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1976d2'}
          >
            🗺️ Open in Google Maps
          </button>
        )}

        {/* Quick Actions Section */}
        <div style={{
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '15px'
          }}>Quick Actions</h3>
          
          {/* Charging Stops List */}
          {chargingStops.length > 0 && (
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '10px'
              }}>Recommended Stops ({chargingStops.length})</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {chargingStops.map((stop, index) => (
                  <div key={index} style={{
                    padding: '8px 0',
                    borderBottom: index < chargingStops.length - 1 ? '1px solid #e0e0e0' : 'none'
                  }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#333'
                    }}>{index + 1}. {stop.name}</div>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      marginTop: '2px'
                    }}>{stop.sourceType}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={[22.9734, 78.6569]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
          maxBounds={[
            [6.0, 68.0],
            [38.0, 97.0]
          ]}
          maxBoundsViscosity={1.0}
          minZoom={4}
          maxZoom={18}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={blueDotIcon}>
              <Popup>Your Location</Popup>
            </Marker>
          )}

          {locations.map(loc => (
            <Marker key={loc._id} position={[loc.latitude, loc.longitude]} icon={greenIcon}>
              <Popup>
                <strong>{loc.name}</strong><br />
                Source: {loc.sourceType}<br />
                <p><strong>Available:</strong> {loc.chargerStatus?.available || 0}</p>
                <Link to={`/location/${loc._id}`}>Details</Link>
              </Popup>
            </Marker>
          ))}

          {chargingStops.map((loc, i) => (
            <Marker key={`stop-${i}`} position={[loc.latitude, loc.longitude]} icon={greenIcon}>
              <Popup>
                <strong>{loc.name}</strong><br />
                Recharge Stop #{i + 1}<br />
                <a href={`/location/${loc._id}`} target="_blank">Details</a>
              </Popup>
            </Marker>
          ))}

          {lowBatteryPoints.map((point, index) => (
            <Marker
              key={`low-battery-${index}`}
              position={[point.lat, point.lng]}
              icon={redDotIcon}
            >
              <Popup>Battery dropped below 20%</Popup>
            </Marker>
          ))}

          {routePoints.length > 0 && (
            <Polyline positions={routePoints.map(p => [p.lat, p.lng])} color="#2e7d32" weight={4} />
          )}
        </MapContainer>
      </div>

      {/* Modal for nearest stations */}
      {showList && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 999
        }}>
          <div style={{
            backgroundColor: '#fff', padding: '30px', borderRadius: '12px',
            width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginTop: 0, color: '#2e7d32' }}>Nearest Charging Stations</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {sortedLocations.slice(0, 10).map((loc, index) => (
                <div key={loc._id} style={{
                  padding: '15px',
                  marginBottom: '10px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa'
                }}>
                  <strong style={{ color: '#2e7d32' }}>{index + 1}. {loc.name}</strong><br />
                  <div style={{ marginTop: '5px', fontSize: '14px', color: '#666' }}>
                    Source: {loc.sourceType}<br />
                    Distance: {loc.actualDistance.toFixed(2)} km<br />
                    {loc.chargerStatus?.available === 0 ? (
                      <span style={{ color: '#f44336', fontWeight: '600' }}>
                        {(() => {
                          if (!loc.chargers || loc.chargers.length === 0) return "No chargers are added.";
                          const soonest = getSoonestETA(loc.chargers);
                          if (!soonest) return "All chargers busy. No ETA.";
                          const minutes = Math.max(Math.round((new Date(soonest) - new Date()) / 60000), 0);
                          return `Charger will be available in ${minutes} minutes`;
                        })()}
                      </span>
                    ) : (
                      <span style={{ color: '#4caf50', fontWeight: '600' }}>
                        Available: {loc.chargerStatus?.available || 0} chargers
                      </span>
                    )}
                  </div>
                  <Link 
                    to={`/location/${loc._id}`} 
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#2e7d32',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      textDecoration: 'none'
                    }}
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowList(false)}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
