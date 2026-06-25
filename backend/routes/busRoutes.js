const express = require('express');
const { body } = require('express-validator');
const busController = require('../controllers/busController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin', 'parent'), busController.getBuses);
router.get('/:id', authorize('admin', 'driver', 'parent'), busController.getBus);
router.get('/:id/students', authorize('admin', 'driver'), busController.getBusStudents);

router.post(
  '/',
  authorize('admin'),
  [body('busNumber').trim().notEmpty(), body('capacity').isInt({ min: 1 })],
  validate,
  busController.createBus
);

router.put('/:id', authorize('admin'), busController.updateBus);
router.delete('/:id', authorize('admin'), busController.deleteBus);

module.exports = router;
