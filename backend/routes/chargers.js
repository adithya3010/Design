import express from 'express';
import Charger from '../models/charger.js';
import calculateChargingTime from '../utils/calculateChargingTime.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';


const router = express.Router();

// POST /chargers/:stationId — Add a new charger
router.post('/:stationId', requireAdmin,async (req, res) => {
  try {
    const { name, type, power } = req.body;

    const newCharger = new Charger({
      stationId: req.params.stationId,
      name,
      power,
      type,
      status: 'available',
      chargingSession: null
    });

    await newCharger.save();
    res.json({ message: 'Charger added successfully', charger: newCharger });
  } catch (err) {
    console.error('Error adding new charger:', err.message);
    res.status(500).json({ error: 'Server error while adding charger' });
  }
});

// GET /chargers/:id/plug-in-form — Get charger details for plug-in form
router.get('/:id/plug-in-form', async (req, res) => {
  try {
    const charger = await Charger.findById(req.params.id).populate('stationId');
    if (!charger) return res.status(404).json({ error: 'Charger not found' });
    res.json({ charger });
  } catch (err) {
    console.error('Failed to load plug-in form:', err.message);
    res.status(500).json({ error: 'Error loading plug-in form' });
  }
});

// POST /chargers/:id/plug-in — Plug in and start session
router.post('/:id/plug-in', requireAuth, async (req, res) => {
  try {
    const {
      batteryCapacity,
      currentCharge,
      targetCharge,
      chargingPower
    } = req.body;

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
      return res.status(400).json({ error: 'Invalid charging inputs' });
    }

    const plugOutTime = new Date(Date.now() + chargingTimeMinutes * 60000);

    const charger = await Charger.findById(req.params.id);
    if (!charger) return res.status(404).json({ error: 'Charger not found' });

    charger.status = 'plugged in';
    charger.chargingSession = {
      startTime: new Date(),
      eta: plugOutTime
    };

    await charger.save();

    res.json({ message: 'Charger plugged in successfully', eta: plugOutTime });
  } catch (err) {
    console.error('❌ Plug-in route error:', err);
    res.status(500).json({ error: 'Server error while plugging in' });
  }
});

// POST /chargers/:id/plug-out — End charging session
router.post('/:id/plug-out', requireAuth, async (req, res) => {
  try {
    const charger = await Charger.findById(req.params.id);
    if (!charger) return res.status(404).json({ error: 'Charger not found' });

    charger.status = 'available';
    charger.chargingSession = null;

    await charger.save();

    res.json({ message: 'Charger unplugged successfully' });
  } catch (err) {
    console.error('❌ Plug-out error:', err.message);
    res.status(500).json({ error: 'Server error while plugging out' });
  }
});

export default router;