const { User, Driver, Student } = require('../models');
const { generateToken } = require('../utils/helpers');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (role === 'admin' && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can create admin accounts.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, role, phone });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

exports.registerParent = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, role: 'parent', phone });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Parent registration successful',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    const token = generateToken(user._id);
    let profile = null;

    if (user.role === 'driver') {
      profile = await Driver.findOne({ userId: user._id }).populate({
        path: 'assignedBus',
        populate: { path: 'routeId' },
      });
    } else if (user.role === 'parent') {
      profile = await Student.find({ parentId: user._id }).populate('assignedBus');
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: { user, token, profile },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    let profile = null;

    if (req.user.role === 'driver') {
      profile = await Driver.findOne({ userId: req.user._id }).populate({
        path: 'assignedBus',
        populate: { path: 'routeId' },
      });
    } else if (req.user.role === 'parent') {
      profile = await Student.find({ parentId: req.user._id }).populate('assignedBus');
    }

    res.json({ success: true, data: { user: req.user, profile } });
  } catch (error) {
    next(error);
  }
};

exports.updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    req.user.fcmToken = fcmToken;
    await req.user.save();
    res.json({ success: true, message: 'FCM token updated.' });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};
