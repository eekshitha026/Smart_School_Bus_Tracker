const express = require('express');
const { body } = require('express-validator');
const studentController = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin', 'driver'), studentController.getStudents);
router.get('/:id', authorize('admin', 'driver', 'parent'), studentController.getStudent);

router.post(
  '/',
  authorize('admin'),
  [
    body('name').trim().notEmpty(),
    body('class').trim().notEmpty(),
    body('parentName').trim().notEmpty(),
    body('parentEmail').isEmail(),
  ],
  validate,
  studentController.createStudent
);

router.put('/:id', authorize('admin'), studentController.updateStudent);
router.delete('/:id', authorize('admin'), studentController.deleteStudent);
router.put('/:id/assign-bus', authorize('admin'), studentController.assignBus);

module.exports = router;
