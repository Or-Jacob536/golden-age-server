// File: server/controllers/activitiesController.js
const { Op } = require('sequelize');
const asyncHandler = require('../middleware/asyncHandler');
const { Activity, ActivityRegistration, User } = require('../models');
const AppError = require('../utils/appError');

/**
 * @desc    Get activities for a specific date
 * @route   GET /api/activities
 * @access  Public
 */
exports.getActivities = asyncHandler(async (req, res) => {
  // Get date from query parameter or use today's date
  const date = req.query.date || new Date().toISOString().split('T')[0];

  // Get activities for the specified date
  const activities = await Activity.findAll({
    where: { date },
    order: [['startTime', 'ASC']]
  });

  res.json({
    date,
    activities
  });
});

/**
 * @desc    Get weekly activities
 * @route   GET /api/activities/weekly
 * @access  Public
 */
exports.getWeeklyActivities = asyncHandler(async (req, res) => {
  // Get start date from query parameter or use today's date
  let startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
  
  // Adjust to the beginning of the week (Sunday)
  const day = startDate.getDay();
  startDate.setDate(startDate.getDate() - day);
  
  // Format date as YYYY-MM-DD
  const formattedStartDate = startDate.toISOString().split('T')[0];
  
  // Calculate end date (Saturday)
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  const formattedEndDate = endDate.toISOString().split('T')[0];

  // Get activities for the week
  const activities = await Activity.findAll({
    where: {
      date: {
        [Op.between]: [formattedStartDate, formattedEndDate]
      }
    },
    order: [['date', 'ASC'], ['startTime', 'ASC']]
  });

  // Group activities by date
  const activitiesByDate = {};
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    const formattedDate = currentDate.toISOString().split('T')[0];
    activitiesByDate[formattedDate] = [];
  }

  activities.forEach(activity => {
    const activityDate = activity.date;
    if (!activitiesByDate[activityDate]) {
      activitiesByDate[activityDate] = [];
    }
    activitiesByDate[activityDate].push(activity);
  });

  // Convert to array format
  const activitiesArray = Object.keys(activitiesByDate).sort().map(date => ({
    date,
    activities: activitiesByDate[date]
  }));

  res.json({
    startDate: formattedStartDate,
    endDate: formattedEndDate,
    activities: activitiesArray
  });
});

/**
 * @desc    Get activity details
 * @route   GET /api/activities/:activityId
 * @access  Public
 */
exports.getActivityDetails = asyncHandler(async (req, res) => {
  const { activityId } = req.params;

  // Get activity details
  const activity = await Activity.findByPk(activityId);

  if (!activity) {
    throw new AppError('Activity not found', 404, 'NOT_FOUND');
  }

  // Get registration count
  const registrationCount = await ActivityRegistration.count({
    where: { activityId }
  });

  // Check if user is registered (if authenticated)
  let isRegistered = false;
  if (req.user) {
    const registration = await ActivityRegistration.findOne({
      where: {
        activityId,
        userId: req.user.id
      }
    });
    isRegistered = !!registration;
  }

  // Return activity with additional information
  res.json({
    ...activity.toJSON(),
    currentParticipants: registrationCount,
    isRegistered
  });
});

/**
 * @desc    Create a new activity
 * @route   POST /api/activities
 * @access  Private (Admin/Staff only)
 */
exports.createActivity = asyncHandler(async (req, res) => {
  const { 
    title, 
    description, 
    location, 
    date, 
    startTime, 
    endTime, 
    instructor, 
    maxParticipants, 
    equipment, 
    imageUrl 
  } = req.body;

  // Validate required fields
  if (!title || !date || !startTime || !endTime) {
    throw new AppError('Title, date, start time, and end time are required', 400, 'VALIDATION_ERROR');
  }

  // Create activity
  const activity = await Activity.create({
    title,
    description,
    location,
    date,
    startTime,
    endTime,
    instructor,
    maxParticipants,
    equipment,
    imageUrl
  });

  res.status(201).json({
    success: true,
    message: 'Activity created successfully',
    activity
  });
});

/**
 * @desc    Update an activity
 * @route   PUT /api/activities/:activityId
 * @access  Private (Admin/Staff only)
 */
exports.updateActivity = asyncHandler(async (req, res) => {
  const { activityId } = req.params;
  const { 
    title, 
    description, 
    location, 
    date, 
    startTime, 
    endTime, 
    instructor, 
    maxParticipants, 
    equipment, 
    imageUrl 
  } = req.body;

  // Find activity
  const activity = await Activity.findByPk(activityId);

  if (!activity) {
    throw new AppError('Activity not found', 404, 'NOT_FOUND');
  }

  // Update activity fields
  if (title) activity.title = title;
  if (description !== undefined) activity.description = description;
  if (location !== undefined) activity.location = location;
  if (date) activity.date = date;
  if (startTime) activity.startTime = startTime;
  if (endTime) activity.endTime = endTime;
  if (instructor !== undefined) activity.instructor = instructor;
  if (maxParticipants !== undefined) activity.maxParticipants = maxParticipants;
  if (equipment !== undefined) activity.equipment = equipment;
  if (imageUrl !== undefined) activity.imageUrl = imageUrl;

  // Save updates
  await activity.save();

  res.json({
    success: true,
    message: 'Activity updated successfully',
    activity
  });
});

/**
 * @desc    Delete an activity
 * @route   DELETE /api/activities/:activityId
 * @access  Private (Admin/Staff only)
 */
exports.deleteActivity = asyncHandler(async (req, res) => {
  const { activityId } = req.params;

  // Find activity
  const activity = await Activity.findByPk(activityId);

  if (!activity) {
    throw new AppError('Activity not found', 404, 'NOT_FOUND');
  }

  // Delete activity
  await activity.destroy();

  res.json({
    success: true,
    message: 'Activity deleted successfully'
  });
});

/**
 * @desc    Register for an activity
 * @route   POST /api/activities/:activityId/register
 * @access  Private
 */
exports.registerForActivity = asyncHandler(async (req, res) => {
  const { activityId } = req.params;
  const userId = req.user.id;

  // Find activity
  const activity = await Activity.findByPk(activityId);

  if (!activity) {
    throw new AppError('Activity not found', 404, 'NOT_FOUND');
  }

  // Check if user is already registered
  const existingRegistration = await ActivityRegistration.findOne({
    where: {
      activityId,
      userId
    }
  });

  if (existingRegistration) {
    throw new AppError('You are already registered for this activity', 400, 'ALREADY_REGISTERED');
  }

  // Check if activity is full
  if (activity.maxParticipants) {
    const registrationCount = await ActivityRegistration.count({
      where: { activityId }
    });

    if (registrationCount >= activity.maxParticipants) {
      throw new AppError('This activity is full', 400, 'ACTIVITY_FULL');
    }
  }

  // Register user for activity
  const registration = await ActivityRegistration.create({
    activityId,
    userId,
    registeredAt: new Date()
  });

  res.status(201).json({
    success: true,
    message: 'נרשמת בהצלחה לפעילות',
    registration: {
      userId,
      activityId,
      registeredAt: registration.registeredAt
    }
  });
});

/**
 * @desc    Cancel activity registration
 * @route   DELETE /api/activities/:activityId/register
 * @access  Private
 */
exports.cancelActivityRegistration = asyncHandler(async (req, res) => {
  const { activityId } = req.params;
  const userId = req.user.id;

  // Find registration
  const registration = await ActivityRegistration.findOne({
    where: {
      activityId,
      userId
    }
  });

  if (!registration) {
    throw new AppError('You are not registered for this activity', 404, 'NOT_REGISTERED');
  }

  // Delete registration
  await registration.destroy();

  res.json({
    success: true,
    message: 'ביטול הרשמה לפעילות בוצע בהצלחה'
  });
});

/**
 * @desc    Get user's registered activities
 * @route   GET /api/activities/my-activities
 * @access  Private
 */
exports.getMyActivities = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user's activity registrations
  const registrations = await ActivityRegistration.findAll({
    where: { userId },
    include: [{
      model: Activity,
      attributes: ['id', 'title', 'description', 'location', 'date', 'startTime', 'endTime', 'instructor']
    }],
    order: [[{ model: Activity }, 'date', 'ASC'], [{ model: Activity }, 'startTime', 'ASC']]
  });

  // Extract activities from registrations
  const activities = registrations.map(registration => registration.Activity);

  res.json(activities);
});
