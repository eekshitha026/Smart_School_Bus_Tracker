const { LiveLocation, Bus, Student } = require('../models');

exports.getAllLocations = async (req, res, next) => {
  try {
    const locations = await LiveLocation.find()
      .populate('busId', 'busNumber currentTrip')
      .sort({ timestamp: -1 });

    res.json({ success: true, count: locations.length, data: locations });
  } catch (error) {
    next(error);
  }
};

exports.getBusLocation = async (req, res, next) => {
  try {
    const location = await LiveLocation.findOne({ busId: req.params.busId }).populate(
      'busId',
      'busNumber currentTrip routeId'
    );

    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not available for this bus.' });
    }

    res.json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
};

exports.getParentBusLocation = async (req, res, next) => {
  try {
    const students = await Student.find({ parentId: req.user._id, isActive: true });
    const busIds = [...new Set(students.map((s) => s.assignedBus?.toString()).filter(Boolean))];

    const locations = await LiveLocation.find({ busId: { $in: busIds } })
      .populate({ path: 'busId', populate: { path: 'routeId' } });

    res.json({ success: true, data: locations, students });
  } catch (error) {
    next(error);
  }
};

exports.getActiveTrips = async (req, res, next) => {
  try {
    const buses = await Bus.find({ 'currentTrip.isActive': true })
      .populate('routeId')
      .populate('driverId');

    const locations = await LiveLocation.find({
      busId: { $in: buses.map((b) => b._id) },
    });

    const trips = buses.map((bus) => ({
      bus,
      location: locations.find((l) => l.busId.toString() === bus._id.toString()),
    }));

    res.json({ success: true, data: trips });
  } catch (error) {
    next(error);
  }
};
