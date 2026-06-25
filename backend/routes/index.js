const express = require('express');

const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const driverRoutes = require('./driverRoutes');
const busRoutes = require('./busRoutes');
const routeRoutes = require('./routeRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const notificationRoutes = require('./notificationRoutes');
const trackingRoutes = require('./trackingRoutes');
const parentRoutes = require('./parentRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Smart School Bus API is running', timestamp: new Date() });
});

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/drivers', driverRoutes);
router.use('/buses', busRoutes);
router.use('/routes', routeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/tracking', trackingRoutes);
router.use('/parent', parentRoutes);

module.exports = router;
