const express = require('express');
const router = express.Router();
const medicalController = require('../controllers/medicalController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/medical/appointments
 * @desc    Get user's medical appointments
 * @access  Private
 */
router.get('/appointments', protect, medicalController.getAppointments);

/**
 * @route   GET /api/medical/appointments/:appointmentId
 * @desc    Get appointment details
 * @access  Private
 */
router.get('/appointments/:appointmentId', protect, medicalController.getAppointmentDetails);

/**
 * @route   POST /api/medical/appointments
 * @desc    Request a new appointment
 * @access  Private
 */
router.post('/appointments', protect, medicalController.requestAppointment);

/**
 * @route   PUT /api/medical/appointments/:appointmentId
 * @desc    Update an appointment (staff only)
 * @access  Private (Admin/Staff only)
 */
router.put('/appointments/:appointmentId', protect, restrictTo('admin', 'staff'), medicalController.updateAppointment);

/**
 * @route   DELETE /api/medical/appointments/:appointmentId
 * @desc    Cancel an appointment
 * @access  Private
 */
router.delete('/appointments/:appointmentId', protect, medicalController.cancelAppointment);

/**
 * @route   GET /api/medical/records
 * @desc    Get user's medical records
 * @access  Private
 */
router.get('/records', protect, medicalController.getMedicalRecords);

/**
 * @route   GET /api/medical/records/:recordId
 * @desc    Get medical record details
 * @access  Private
 */
router.get('/records/:recordId', protect, medicalController.getMedicalRecordDetails);

/**
 * @route   GET /api/medical/medications
 * @desc    Get user's medications
 * @access  Private
 */
router.get('/medications', protect, medicalController.getMedications);

/**
 * @route   GET /api/medical/allergies
 * @desc    Get user's allergies
 * @access  Private
 */
router.get('/allergies', protect, medicalController.getAllergies);

/**
 * @route   POST /api/medical/records
 * @desc    Add medical record (staff only)
 * @access  Private (Admin/Staff only)
 */
router.post('/records', protect, restrictTo('admin', 'staff'), medicalController.addMedicalRecord);

module.exports = router;
