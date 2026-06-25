const { Route } = require('../models');

exports.getRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find({ isActive: true }).sort({ routeName: 1 });
    res.json({ success: true, count: routes.length, data: routes });
  } catch (error) {
    next(error);
  }
};

exports.getRoute = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found.' });
    }
    res.json({ success: true, data: route });
  } catch (error) {
    next(error);
  }
};

exports.createRoute = async (req, res, next) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ success: true, data: route });
  } catch (error) {
    next(error);
  }
};

exports.updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found.' });
    }
    res.json({ success: true, data: route });
  } catch (error) {
    next(error);
  }
};

exports.deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found.' });
    }
    res.json({ success: true, message: 'Route deactivated.' });
  } catch (error) {
    next(error);
  }
};
