const { Notification } = require('../models');

exports.getNotifications = async (req, res, next) => {
  try {
    const filter = {};
    const limit = parseInt(req.query.limit || '50', 10);

    if (req.user.role === 'parent') {
      filter.parentId = req.user._id;
    }
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.type) filter.type = req.query.type;

    const notifications = await Notification.find(filter)
      .populate('studentId', 'name class')
      .populate('parentId', 'name email')
      .sort({ sentAt: -1 })
      .limit(limit);

    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    next(error);
  }
};

exports.getNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('studentId', 'name class')
      .populate('parentId', 'name email');

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    if (req.user.role === 'parent' && notification.parentId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};
