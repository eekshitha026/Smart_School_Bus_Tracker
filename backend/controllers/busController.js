const { Bus, Student } = require('../models');

exports.getBuses = async (req, res, next) => {
  try {
    const buses = await Bus.find({ isActive: true })
      .populate('routeId')
      .populate({ path: 'driverId', populate: { path: 'userId', select: 'name email phone' } })
      .sort({ busNumber: 1 });

    res.json({ success: true, count: buses.length, data: buses });
  } catch (error) {
    next(error);
  }
};

exports.getBus = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate('routeId')
      .populate('driverId');

    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found.' });
    }

    res.json({ success: true, data: bus });
  } catch (error) {
    next(error);
  }
};

exports.createBus = async (req, res, next) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json({ success: true, data: bus });
  } catch (error) {
    next(error);
  }
};

exports.updateBus = async (req, res, next) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found.' });
    }

    res.json({ success: true, data: bus });
  } catch (error) {
    next(error);
  }
};

exports.deleteBus = async (req, res, next) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found.' });
    }
    res.json({ success: true, message: 'Bus deactivated.' });
  } catch (error) {
    next(error);
  }
};

exports.getBusStudents = async (req, res, next) => {
  try {
    const students = await Student.find({ assignedBus: req.params.id, isActive: true }).sort({ name: 1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};
