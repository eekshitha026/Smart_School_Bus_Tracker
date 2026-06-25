const { Student, Attendance, Notification } = require('../models');
const { getTodayDate } = require('../utils/helpers');

exports.getMyChildren = async (req, res, next) => {
  try {
    const children = await Student.find({
      $or: [{ parentId: req.user._id }, { parentEmail: req.user.email }],
      isActive: true,
    }).populate({ path: 'assignedBus', populate: { path: 'routeId' } });

    res.json({ success: true, data: children });
  } catch (error) {
    next(error);
  }
};

exports.getChildAttendance = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const isParent =
      student.parentId?.toString() === req.user._id.toString() ||
      student.parentEmail === req.user.email;

    if (!isParent && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const limit = parseInt(req.query.limit || '30', 10);
    const records = await Attendance.find({ studentId: req.params.studentId })
      .populate('busId', 'busNumber')
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

exports.getTodayStatus = async (req, res, next) => {
  try {
    const today = getTodayDate();
    const children = await Student.find({
      $or: [{ parentId: req.user._id }, { parentEmail: req.user.email }],
      isActive: true,
    });

    const statuses = await Promise.all(
      children.map(async (child) => {
        const morning = await Attendance.findOne({ studentId: child._id, date: today, tripType: 'morning' });
        const afternoon = await Attendance.findOne({ studentId: child._id, date: today, tripType: 'afternoon' });
        return { child, morning, afternoon };
      })
    );

    res.json({ success: true, data: statuses });
  } catch (error) {
    next(error);
  }
};

exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ parentId: req.user._id })
      .populate('studentId', 'name class')
      .sort({ sentAt: -1 })
      .limit(50);

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};
