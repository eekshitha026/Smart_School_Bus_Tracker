const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
    status: {
      type: String,
      enum: [
        'Present',
        'Boarded',
        'Reached School',
        'Boarded Return Trip',
        'Reached Home',
        'Absent',
      ],
      required: true,
    },
    tripType: { type: String, enum: ['morning', 'afternoon'], required: true },
    timestamp: { type: Date, default: Date.now },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    date: { type: String, required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
  },
  { timestamps: true }
);

attendanceSchema.index({ studentId: 1, date: 1, tripType: 1 });
attendanceSchema.index({ busId: 1, date: 1 });
attendanceSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
