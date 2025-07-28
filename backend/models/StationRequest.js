// models/StationRequest.js
import mongoose from 'mongoose';

const StationRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  sourceType: { type: String, enum: ['renewable', 'non-renewable'], required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
  images: [String]
});

const StationRequest = mongoose.model('StationRequest', StationRequestSchema);
export default StationRequest;
