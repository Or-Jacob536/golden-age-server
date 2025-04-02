const express = require('express');
const router = express.Router();
const poolController = require('../controllers/poolController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/pool/hours
 * @desc    Get swimming pool hours
 * @access  Public
 */
router.get('/hours', poolController.getPoolHours);

/**
 * @route   PUT /api/pool/hours
 * @desc    Update swimming pool hours
 * @access  Private (Admin/Staff only)
 */
router.put('/hours', protect, restrictTo('admin', 'staff'), poolController.updatePoolHours);

/**
 * @route   POST /api/pool/hours/special
 * @desc    Add special hours for a specific date
 * @access  Private (Admin/Staff only)
 */
router.post('/hours/special', protect, restrictTo('admin', 'staff'), poolController.addSpecialHours);

/**
 * @route   DELETE /api/pool/hours/special/:date
 * @desc    Remove special hours for a specific date
 * @access  Private (Admin/Staff only)
 */
router.delete('/hours/special/:date', protect, restrictTo('admin', 'staff'), poolController.removeSpecialHours);

module.exports = router;
