const express = require('express');
const router = express.Router();
const Charger = require('../models/charger');
const calculateChargingTime = require('../utils/calculateChargingTime');
const { auth, adminOnly } = require('../middleware/auth');


// POST /chargers/:stationId
router.post('/:stationId',adminOnly, async (req, res) => {
  try {
    const { name, type } = req.body;

    const newCharger = new Charger({
      stationId: req.params.stationId,
      name,
      type,
      status: 'available',
      chargingSession: null
    });

    await newCharger.save();
    res.redirect(`/locations/${req.params.stationId}`);
  } catch (err) {
    console.error('Error adding new charger:', err.message);
    res.status(500).send('Server error while adding charger');
  }
});

router.get('/:id/plug-in-form', async (req, res) => {
  try {
    const charger = await Charger.findById(req.params.id).populate('stationId');
    if (!charger) return res.status(404).send('Charger not found');
    res.render('plugIn', { charger });
  } catch (err) {
    console.error('Failed to load plug-in form:', err.message);
    res.status(500).send('Error loading plug-in form');
  }
});
// POST /chargers/:id/plug-in
router.post('/:id/plug-in', auth, async (req, res) => {
  try {
    const {
      batteryCapacity,
      currentCharge,
      targetCharge,
      chargingPower
    } = req.body;

    console.log('Received form data:', {
      batteryCapacity,
      currentCharge,
      targetCharge,
      chargingPower
    });

    const battery = Number(batteryCapacity);
    const current = Number(currentCharge);
    const target = Number(targetCharge);
    const power = Number(chargingPower);

    const chargingTimeMinutes = calculateChargingTime({
      batteryCapacity: battery,
      currentCharge: current,
      targetCharge: target,
      chargingPower: power,
      includeLoss: true,
      outputUnit: 'minutes'
    });

    if (chargingTimeMinutes === "Invalid input") {
      return res.status(400).send('Invalid charging inputs');
    }

    const plugOutTime = new Date(Date.now() + chargingTimeMinutes * 60000);

    const charger = await Charger.findById(req.params.id);
    if (!charger) return res.status(404).send('Charger not found');

    charger.status = 'plugged in';
    charger.chargingSession = {
      startTime: new Date(),
      eta: plugOutTime
    };

    await charger.save();

    res.redirect(`/locations/${charger.stationId}`);
  } catch (err) {
    console.error('❌ Plug-in route error:', err);
    res.status(500).send('Server error while plugging in');
  }
});

// POST /chargers/:id/plug-out
router.post('/:id/plug-out', async (req, res) => {
  try {
    const charger = await Charger.findById(req.params.id);
    if (!charger) return res.status(404).send('Charger not found');

    charger.status = 'available';
    charger.chargingSession = null;

    await charger.save();

    res.redirect(`/locations/${charger.stationId}`);
  } catch (err) {
    console.error('❌ Plug-out error:', err.message);
    res.status(500).send('Server error while plugging out');
  }
});

module.exports = router;
