const express = require('express');
const { body } = require('express-validator');
const attendanceController = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/dashboard', authorize('admin'), attendanceController.getDashboardStats);
router.get('/daily', authorize('admin'), attendanceController.getDailyReport);
router.get('/monthly', authorize('admin'), attendanceController.getMonthlyReport);
router.get('/student/:studentId', authorize('admin', 'parent'), attendanceController.getStudentHistory);

router.post(
  '/scan',
  authorize('driver'),
  [body('code').trim().notEmpty(), body('action').optional().isIn(['board', 'drop'])],
  validate,
  attendanceController.scanStudent
);

router.post('/mark', authorize('driver'), attendanceController.markAttendance);
router.post(
  '/trip/start',
  authorize('driver'),
  [body('tripType').isIn(['morning', 'afternoon'])],
  validate,
  attendanceController.startTrip
);
router.post('/trip/end', authorize('driver'), attendanceController.endTrip);

module.exports = router;
