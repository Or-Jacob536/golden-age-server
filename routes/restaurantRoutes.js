const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/restaurant/hours
 * @desc    Get restaurant hours
 * @access  Public
 */
router.get('/hours', restaurantController.getRestaurantHours);

/**
 * @route   PUT /api/restaurant/hours
 * @desc    Update restaurant hours
 * @access  Private (Admin/Staff only)
 */
router.put('/hours', protect, restrictTo('admin', 'staff'), restaurantController.updateRestaurantHours);

/**
 * @route   GET /api/restaurant/menu
 * @desc    Get daily menu for a specific date
 * @access  Public
 */
router.get('/menu', restaurantController.getDailyMenu);

/**
 * @route   GET /api/restaurant/menu/weekly
 * @desc    Get weekly menu
 * @access  Public
 */
router.get('/menu/weekly', restaurantController.getWeeklyMenu);

/**
 * @route   POST /api/restaurant/menu/upload
 * @desc    Upload menu XML
 * @access  Private (Admin/Staff only)
 */
router.post('/menu/upload', protect, restrictTo('admin', 'staff'), restaurantController.uploadMenu);

module.exports = router;
