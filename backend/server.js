// /backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import passport from 'passport';

import chargerRoutes from './routes/chargers.js';
import locationRoutes from './routes/locations.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';


import LocationModel from './models/Location.js';
import Charger from './models/charger.js';
import configurePassport from './config/passport.js';

dotenv.config();
const app = express();

// Configure passport strategies
configurePassport(passport);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mernleaflet', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// JWT Cookie Middleware
app.use((req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  res.locals.user = req.user;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/chargers', chargerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static('uploads'));


// Get location by ID
// Only match valid ObjectId
app.get('/:id', async (req, res, next) => {
  const objectIdPattern = /^[a-fA-F0-9]{24}$/;
  const { id } = req.params;

  if (!objectIdPattern.test(id)) {
    return res.status(400).json({ error: 'Invalid ObjectId' });
  }

  try {
    const location = await LocationModel.findById(id);
    if (!location) return res.status(404).json({ error: 'Location not found' });

    const chargers = await Charger.find({ stationId: id });

    const statusCounts = { available: 0, 'plugged in': 0, faulty: 0 };
    chargers.forEach(charger => {
      if (statusCounts[charger.status] !== undefined) {
        statusCounts[charger.status]++;
      }
    });

    res.json({ location, chargers, statusCounts });
  } catch (err) {
    console.error('Error fetching location:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});


// Update travel times
app.post('/update-travel-times', async (req, res) => {
  const { userLat, userLng } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    const locations = await LocationModel.find();

    for (let loc of locations) {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${userLat},${userLng}&destinations=${loc.latitude},${loc.longitude}&mode=driving&key=${apiKey}`;
      const response = await axios.get(url);
      const element = response.data?.rows?.[0]?.elements?.[0];

      if (element?.status === 'OK') {
        loc.distance = element.distance.value / 1000;
        loc.travelTime = element.duration.text;
        await loc.save();
      }
    }

    res.json({ message: '✅ Travel times updated.' });
  } catch (err) {
    console.error('❌ Failed to update travel times:', err.message);
    res.status(500).json({ error: 'Failed to update travel times' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
