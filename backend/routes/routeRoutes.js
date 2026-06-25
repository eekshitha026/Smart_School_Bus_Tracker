const express = require('express');
const { body } = require('express-validator');
const routeController = require('../controllers/routeController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin', 'driver', 'parent'), routeController.getRoutes);
router.get('/:id', authorize('admin', 'driver', 'parent'), routeController.getRoute);

router.post(
  '/',
  authorize('admin'),
  [
    body('routeName').trim().notEmpty(),
    body('source').trim().notEmpty(),
    body('destination').trim().notEmpty(),
  ],
  validate,
  routeController.createRoute
);

router.put('/:id', authorize('admin'), routeController.updateRoute);
router.delete('/:id', authorize('admin'), routeController.deleteRoute);

module.exports = router;
