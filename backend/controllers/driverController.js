const { Driver, User, Bus } = require('../models');

exports.getDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find({ isActive: true })
      .populate('assignedBus', 'busNumber')
      .populate('userId', 'name email phone')
      .sort({ name: 1 });

    res.json({ success: true, count: drivers.length, data: drivers });
  } catch (error) {
    next(error);
  }
};

exports.getDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate('assignedBus')
      .populate('userId', 'name email phone');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }

    res.json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

exports.createDriver = async (req, res, next) => {
  try {
    const { name, phone, licenseNumber, email, password, assignedBus } = req.body;

    const user = await User.create({
      name,
      email,
      password: password || 'driver123',
      role: 'driver',
      phone,
    });

    const driver = await Driver.create({
      name,
      phone,
      licenseNumber,
      assignedBus,
      userId: user._id,
    });

    if (assignedBus) {
      await Bus.findByIdAndUpdate(assignedBus, { driverId: driver._id });
    }

    const populated = await Driver.findById(driver._id)
      .populate('assignedBus')
      .populate('userId', 'name email phone');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedBus')
      .populate('userId', 'name email phone');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }

    if (req.body.assignedBus) {
      await Bus.findByIdAndUpdate(req.body.assignedBus, { driverId: driver._id });
    }

    res.json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

exports.deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }
    await User.findByIdAndUpdate(driver.userId, { isActive: false });
    res.json({ success: true, message: 'Driver deactivated.' });
  } catch (error) {
    next(error);
  }
};

exports.getMyProfile = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id })
      .populate({ path: 'assignedBus', populate: { path: 'routeId' } });

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver profile not found.' });
    }

    res.json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};
