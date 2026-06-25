const mongoose = require('mongoose');

const routeStopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const routeSchema = new mongoose.Schema(
  {
    routeName: { type: String, required: true, trim: true },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    stops: [routeStopSchema],
    estimatedDuration: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Route', routeSchema);
