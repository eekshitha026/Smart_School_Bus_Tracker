const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    busNumber: { type: String, required: true, unique: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    isActive: { type: Boolean, default: true },
    currentTrip: {
      isActive: { type: Boolean, default: false },
      tripType: { type: String, enum: ['morning', 'afternoon', null], default: null },
      startedAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bus', busSchema);
