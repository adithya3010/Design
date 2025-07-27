import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  distance: {
    type: Number,
    default: 0
  },
  sourceType: {
    type: String,
    enum: ['renewable', 'non-renewable'],
    default: 'non-renewable',
    required: true
  },
  travelTime: {
    type: String,
    default: ''
  }
});

const Location = mongoose.model('Location', LocationSchema);
export default Location;
