import express from 'express';
import StationRequest from '../models/StationRequest.js';
import Location from '../models/Location.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all pending station requests
router.get('/station-requests', requireAuth, requireAdmin, async (req, res) => {
  const requests = await StationRequest.find({ status: 'pending' }).populate('submittedBy', 'email');
  res.json(requests);
});

// Approve a request
router.post('/approve/:id', requireAuth, requireAdmin, async (req, res) => {
  const request = await StationRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  // Save to Location collection
  const newLocation = new Location({
    name: request.name,
    latitude: request.latitude,
    longitude: request.longitude,
    sourceType: request.sourceType
  });

  await newLocation.save();
  request.status = 'approved';
  await request.save();

  res.json({ message: 'Request approved and location added', location: newLocation });
});

// Reject a request
router.post('/reject/:id', requireAuth, requireAdmin, async (req, res) => {
  const request = await StationRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  request.status = 'rejected';
  await request.save();
  res.json({ message: 'Request rejected' });
});

export default router;
