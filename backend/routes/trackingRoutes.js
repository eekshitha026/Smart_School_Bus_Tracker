const express = require('express');
const trackingController = require('../controllers/trackingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/locations', authorize('admin'), trackingController.getAllLocations);
router.get('/active-trips', authorize('admin'), trackingController.getActiveTrips);
router.get('/bus/:busId', authorize('admin', 'parent', 'driver'), trackingController.getBusLocation);
router.get('/parent/bus', authorize('parent'), trackingController.getParentBusLocation);

module.exports = router;
