// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/AppointmentController');

// POST /api/appointment/appointment
router.post('/appointment', appointmentController.submitAppointmentForm);

module.exports = router;
