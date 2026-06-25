const express = require('express');
const parentController = require('../controllers/parentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('parent'));

router.get('/children', parentController.getMyChildren);
router.get('/today', parentController.getTodayStatus);
router.get('/notifications', parentController.getMyNotifications);
router.get('/attendance/:studentId', parentController.getChildAttendance);

module.exports = router;
