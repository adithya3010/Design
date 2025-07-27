import express from 'express';
import axios from 'axios';
import Location from '../models/Location.js';
import Charger from'../models/charger.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
const router = express.Router();

// GET location details by ID
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ error: 'Location not found' });

    const chargers = await Charger.find({ stationId: req.params.id });

    const statusCounts = {
      available: chargers.filter(c => c.status === 'available').length,
      'plugged in': chargers.filter(c => c.status === 'plugged in').length,
      faulty: chargers.filter(c => c.status === 'faulty').length
    };

    res.json({
      location,
      chargers,
      statusCounts,
      user: req.user || null
    });
  } catch (err) {
    console.error('Error loading location details:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all locations with charger status + next available ETA
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find();
    const chargers = await Charger.find();

    const chargersByStation = chargers.reduce((acc, charger) => {
      const key = charger.stationId.toString();
      acc[key] = acc[key] || [];
      acc[key].push(charger);
      return acc;
    }, {});

    const locationsWithCounts = locations.map(loc => {
      const chargers = chargersByStation[loc._id.toString()] || [];
      const available = chargers.filter(c => c.status === 'available').length;
      const pluggedIn = chargers.filter(c => c.status === 'plugged in').length;
      const faulty = chargers.filter(c => c.status === 'faulty').length;

      let nextAvailableMessage = null;
      if (available === 0 && pluggedIn > 0) {
        const soonest = chargers
          .filter(c => c.status === 'plugged in' && c.chargingSession?.eta)
          .sort((a, b) => new Date(a.chargingSession.eta) - new Date(b.chargingSession.eta))[0];

        if (soonest) {
          const etaTime = new Date(soonest.chargingSession.eta);
          const timeLeftMs = etaTime.getTime() - Date.now();
          const minutesLeft = Math.ceil(timeLeftMs / 60000);
          nextAvailableMessage = `${soonest.name} will be available after ${minutesLeft} minutes`;
        }
      }

      return {
        ...loc.toObject(),
        chargerStatus: { available, pluggedIn, faulty },
        nextAvailableMessage,
        chargers
      };
    });

    res.json(locationsWithCounts);
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET Google route (for EV trip planning)
router.get('/get-route', requireAuth,async (req, res) => {
  const { origin, destination } = req.query;
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;
    const response = await axios.get(url);

    if (!response.data.routes.length) {
      return res.status(400).json({ error: 'No routes found' });
    }

    const encoded = response.data.routes[0].overview_polyline.points;
    res.json({ encoded });
  } catch (err) {
    console.error('Error fetching route:', err);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

export default router;