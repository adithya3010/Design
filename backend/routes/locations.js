import express from 'express';
import axios from 'axios';
import Location from '../models/Location.js';
import Charger from '../models/charger.js';
import StationRequest from '../models/StationRequest.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// ---------- Multer Setup ----------
const uploadDir = path.join('uploads/station-requests');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { files: 3 }, // Max 3 images
  fileFilter: function (req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  }
});

// ---------- Routes ----------

// GET Google route (for EV trip planning)
router.get('/get-route', async (req, res) => {
  try {
    const { origin, destination, waypoints } = req.query;

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/directions/json',
      {
        params: {
          origin,
          destination,
          key: process.env.GOOGLE_MAPS_API_KEY,
          waypoints
        }
      }
    );

    if (!response.data.routes || response.data.routes.length === 0) {
      return res.status(500).json({ error: 'No route found from Google API.' });
    }

    const encoded = response.data.routes[0].overview_polyline.points;
    res.json({ encoded });

  } catch (err) {
    console.error('Google Directions API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch directions.' });
  }
});

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

// GET all locations
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

// POST new station request with images
router.post('/', requireAuth, upload.array('images', 3), async (req, res) => {
  const { name, latitude, longitude, sourceType } = req.body;

  if (!name || !latitude || !longitude || !sourceType) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const imagePaths = req.files.map(file => file.path);

    const newRequest = new StationRequest({
      name,
      latitude,
      longitude,
      sourceType,
      images: imagePaths,
      submittedBy: req.user._id
    });

    await newRequest.save();
    res.status(201).json({ message: '✅ Request with images submitted for admin approval' });
  } catch (error) {
    console.error('❌ Error saving station request:', error.message);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});

export default router;
