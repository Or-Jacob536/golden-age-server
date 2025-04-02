// File: server/routes/activitiesRoutes.js
const express = require('express');
const router = express.Router();
const activitiesController = require('../controllers/activitiesController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/activities
 * @desc    Get activities for a specific date
 * @access  Public
 */
router.get('/', activitiesController.getActivities);

/**
 * @route   GET /api/activities/weekly
 * @desc    Get weekly activities
 * @access  Public
 */
router.get('/weekly', activitiesController.getWeeklyActivities);

/**
 * @route   GET /api/activities/:activityId
 * @desc    Get activity details
 * @access  Public
 */
router.get('/:activityId', activitiesController.getActivityDetails);

/**
 * @route   POST /api/activities
 * @desc    Create a new activity
 * @access  Private (Admin/Staff only)
 */
router.post('/', protect, restrictTo('admin', 'staff'), activitiesController.createActivity);

/**
 * @route   PUT /api/activities/:activityId
 * @desc    Update an activity
 * @access  Private (Admin/Staff only)
 */
router.put('/:activityId', protect, restrictTo('admin', 'staff'), activitiesController.updateActivity);

/**
 * @route   DELETE /api/activities/:activityId
 * @desc    Delete an activity
 * @access  Private (Admin/Staff only)
 */
router.delete('/:activityId', protect, restrictTo('admin', 'staff'), activitiesController.deleteActivity);

/**
 * @route   POST /api/activities/:activityId/register
 * @desc    Register for an activity
 * @access  Private
 */
router.post('/:activityId/register', protect, activitiesController.registerForActivity);

/**
 * @route   DELETE /api/activities/:activityId/register
 * @desc    Cancel activity registration
 * @access  Private
 */
router.delete('/:activityId/register', protect, activitiesController.cancelActivityRegistration);

/**
 * @route   GET /api/activities/my-activities
 * @desc    Get user's registered activities
 * @access  Private
 */
router.get('/my-activities', protect, activitiesController.getMyActivities);

module.exports = router;
