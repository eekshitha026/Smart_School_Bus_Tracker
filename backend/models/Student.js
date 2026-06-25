const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    class: { type: String, required: true, trim: true },
    rollNumber: { type: String, trim: true },
    parentName: { type: String, required: true, trim: true },
    parentEmail: { type: String, required: true, lowercase: true, trim: true },
    parentPhone: { type: String, trim: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
    qrCode: { type: String, unique: true, sparse: true },
    rfidTag: { type: String, unique: true, sparse: true },
    pickupStop: { type: String },
    dropStop: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

studentSchema.index({ assignedBus: 1 });
studentSchema.index({ parentId: 1 });

module.exports = mongoose.model('Student', studentSchema);
