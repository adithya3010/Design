const mongoose = require('mongoose');

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

module.exports = mongoose.model('Location', LocationSchema);
