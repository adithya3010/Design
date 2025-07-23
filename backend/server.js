const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');



dotenv.config();

const app = express();

// Models and Routes
const chargerRoutes = require('./routes/chargers');
const locationRoutes = require('./routes/locations');
const LocationModel = require('./models/Location');
const Charger = require('./models/charger');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');





// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/mernleaflet', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});
app.use(cookieParser());

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/api/locations', locationRoutes);
app.use('/chargers', chargerRoutes);
app.use('/chargers', require('./routes/chargers'));
app.use('/locations', require('./routes/locations'));  // handles location pages & API
app.use('/api/admin', adminRoutes);
app.use('/auth', authRoutes);


// In server.js or before your routes
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.request = req;
  next();
});

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

// Detail Page Route
app.get('/:id', async (req, res) => {
  try {
    const location = await LocationModel.findById(req.params.id);
    if (!location) return res.status(404).send('Location not found');

    const chargers = await Charger.find({ stationId: req.params.id });

    const statusCounts = {
      available: 0,
      'plugged in': 0,
      faulty: 0
    };

    chargers.forEach(charger => {
      if (statusCounts[charger.status] !== undefined) {
        statusCounts[charger.status]++;
      }
    });

    res.render('location', { location, chargers, statusCounts });

  } catch (err) {
    console.error('Error rendering location page:', err.message);
    res.status(500).send('Server error');
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

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server started on http://localhost:${PORT}`));
