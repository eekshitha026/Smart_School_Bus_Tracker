const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    type: {
      type: String,
      enum: ['boarded', 'dropped', 'absent', 'alert', 'general'],
      required: true,
    },
    message: { type: String, required: true },
    channels: {
      push: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
    },
    deliveryStatus: {
      push: { type: String, enum: ['sent', 'failed', 'skipped'], default: 'skipped' },
      email: { type: String, enum: ['sent', 'failed', 'skipped'], default: 'skipped' },
    },
    sentAt: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

notificationSchema.index({ parentId: 1, sentAt: -1 });
notificationSchema.index({ studentId: 1, sentAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
