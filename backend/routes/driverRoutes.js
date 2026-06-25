const express = require('express');
const { body } = require('express-validator');
const driverController = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/me', authorize('driver'), driverController.getMyProfile);
router.get('/', authorize('admin'), driverController.getDrivers);
router.get('/:id', authorize('admin'), driverController.getDriver);

router.post(
  '/',
  authorize('admin'),
  [
    body('name').trim().notEmpty(),
    body('phone').trim().notEmpty(),
    body('email').isEmail(),
  ],
  validate,
  driverController.createDriver
);

router.put('/:id', authorize('admin'), driverController.updateDriver);
router.delete('/:id', authorize('admin'), driverController.deleteDriver);

module.exports = router;
