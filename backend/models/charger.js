import mongoose from 'mongoose';

const ChargerSchema = new mongoose.Schema({
  chargerId: String,
  name: String,
  status: {
    type: String,
    enum: ['available', 'plugged in', 'faulty'],
    default: 'available'
  },
  type: {
    type: String,
    enum: ['AC', 'DC', 'Type2', 'CCS', 'CHAdeMO'],
    default: 'AC'
  },
  power: Number,
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  chargingSession: {
    batteryCapacity: Number,
    currentCharge: Number,
    targetCharge: Number,
    power: Number,
    pluggedInAt: Date,
    chargingTime: Number, // in minutes
    eta: Date             // calculated ETA
  }
});

const Charger = mongoose.model('Charger', ChargerSchema);
export default Charger;