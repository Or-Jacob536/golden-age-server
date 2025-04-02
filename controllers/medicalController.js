// File: server/controllers/medicalController.js
const { Op } = require('sequelize');
const asyncHandler = require('../middleware/asyncHandler');
const { 
  MedicalAppointment, 
  MedicalRecord,
  Medication,
  Allergy,
  User 
} = require('../models');
const AppError = require('../utils/appError');

/**
 * @desc    Get user's medical appointments
 * @route   GET /api/medical/appointments
 * @access  Private
 */
exports.getAppointments = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  // Get upcoming appointments
  const upcomingAppointments = await MedicalAppointment.findAll({
    where: {
      userId,
      date: {
        [Op.gte]: today
      }
    },
    order: [['date', 'ASC'], ['time', 'ASC']]
  });

  // Get past appointments
  const pastAppointments = await MedicalAppointment.findAll({
    where: {
      userId,
      date: {
        [Op.lt]: today
      }
    },
    order: [['date', 'DESC'], ['time', 'ASC']]
  });

  res.json({
    upcoming: upcomingAppointments,
    past: pastAppointments
  });
});

/**
 * @desc    Get appointment details
 * @route   GET /api/medical/appointments/:appointmentId
 * @access  Private
 */
exports.getAppointmentDetails = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const userId = req.user.id;

  // Get appointment
  const appointment = await MedicalAppointment.findOne({
    where: {
      id: appointmentId,
      userId
    }
  });

  if (!appointment) {
    throw new AppError('Appointment not found', 404, 'NOT_FOUND');
  }

  res.json(appointment);
});

/**
 * @desc    Request a new appointment
 * @route   POST /api/medical/appointments
 * @access  Private
 */
exports.requestAppointment = asyncHandler(async (req, res) => {
  const {
    doctorName,
    specialty,
    date,
    time,
    notes
  } = req.body;
  const userId = req.user.id;

  // Validate required fields
  if (!doctorName || !date || !time) {
    throw new AppError('Doctor name, date, and time are required', 400, 'VALIDATION_ERROR');
  }

  // Create appointment
  const appointment = await MedicalAppointment.create({
    userId,
    doctorName,
    specialty,
    date,
    time,
    notes,
    duration: 30, // Default duration
    location: 'מרפאה', // Default location
    completed: false
  });

  res.status(201).json({
    success: true,
    message: 'בקשת תור נשלחה בהצלחה',
    appointment
  });
});

/**
 * @desc    Update an appointment (staff only)
 * @route   PUT /api/medical/appointments/:appointmentId
 * @access  Private (Admin/Staff only)
 */
exports.updateAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const {
    doctorName,
    specialty,
    date,
    time,
    duration,
    location,
    notes,
    completed,
    summary
  } = req.body;

  // Find appointment
  const appointment = await MedicalAppointment.findByPk(appointmentId);

  if (!appointment) {
    throw new AppError('Appointment not found', 404, 'NOT_FOUND');
  }

  // Update appointment fields
  if (doctorName) appointment.doctorName = doctorName;
  if (specialty !== undefined) appointment.specialty = specialty;
  if (date) appointment.date = date;
  if (time) appointment.time = time;
  if (duration) appointment.duration = duration;
  if (location !== undefined) appointment.location = location;
  if (notes !== undefined) appointment.notes = notes;
  if (completed !== undefined) appointment.completed = completed;
  if (summary !== undefined) appointment.summary = summary;

  // Save updates
  await appointment.save();

  res.json({
    success: true,
    message: 'תור עודכן בהצלחה',
    appointment
  });
});

/**
 * @desc    Cancel an appointment
 * @route   DELETE /api/medical/appointments/:appointmentId
 * @access  Private
 */
exports.cancelAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const userId = req.user.id;

  // Find appointment
  const appointment = await MedicalAppointment.findOne({
    where: {
      id: appointmentId,
      userId
    }
  });

  if (!appointment) {
    throw new AppError('Appointment not found', 404, 'NOT_FOUND');
  }

  // Check if appointment is in the past
  const today = new Date();
  const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
  
  if (appointmentDate < today) {
    throw new AppError('Cannot cancel past appointments', 400, 'PAST_APPOINTMENT');
  }

  // Delete appointment
  await appointment.destroy();

  res.json({
    success: true,
    message: 'תור בוטל בהצלחה'
  });
});

/**
 * @desc    Get user's medical records
 * @route   GET /api/medical/records
 * @access  Private
 */
exports.getMedicalRecords = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get medical records
  const records = await MedicalRecord.findAll({
    where: { userId },
    order: [['date', 'DESC']]
  });

  res.json(records);
});

/**
 * @desc    Get medical record details
 * @route   GET /api/medical/records/:recordId
 * @access  Private
 */
exports.getMedicalRecordDetails = asyncHandler(async (req, res) => {
  const { recordId } = req.params;
  const userId = req.user.id;

  // Get record
  const record = await MedicalRecord.findOne({
    where: {
      id: recordId,
      userId
    }
  });

  if (!record) {
    throw new AppError('Medical record not found', 404, 'NOT_FOUND');
  }

  res.json(record);
});

/**
 * @desc    Get user's medications
 * @route   GET /api/medical/medications
 * @access  Private
 */
exports.getMedications = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get medications
  const medications = await Medication.findAll({
    where: { 
      userId,
      active: true
    },
    order: [['name', 'ASC']]
  });

  res.json(medications);
});

/**
 * @desc    Get user's allergies
 * @route   GET /api/medical/allergies
 * @access  Private
 */
exports.getAllergies = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get allergies
  const allergies = await Allergy.findAll({
    where: { userId },
    order: [['name', 'ASC']]
  });

  res.json(allergies);
});

/**
 * @desc    Add medical record (staff only)
 * @route   POST /api/medical/records
 * @access  Private (Admin/Staff only)
 */
exports.addMedicalRecord = asyncHandler(async (req, res) => {
  const {
    userId,
    recordType,
    title,
    content,
    date,
    doctorName,
    attachmentUrl
  } = req.body;

  // Validate required fields
  if (!userId || !recordType || !title || !content || !date) {
    throw new AppError('User ID, record type, title, content, and date are required', 400, 'VALIDATION_ERROR');
  }

  // Check if user exists
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  // Create medical record
  const record = await MedicalRecord.create({
    userId,
    recordType,
    title,
    content,
    date,
    doctorName,
    attachmentUrl
  });

  res.status(201).json({
    success: true,
    message: 'רשומה רפואית נוספה בהצלחה',
    record
  });
});
