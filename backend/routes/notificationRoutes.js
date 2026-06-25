const express = require('express');
const notificationController = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'parent'));

router.get('/', notificationController.getNotifications);
router.get('/:id', notificationController.getNotification);

module.exports = router;
