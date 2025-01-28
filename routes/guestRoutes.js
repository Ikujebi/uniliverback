const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment');

// Book an appointment (by guest)
router.post('/appointments', async (req, res) => {
  const { guestName, guestEmail, hostName, appointmentTime } = req.body;

  try {
    const newAppointment = new Appointment({ guestName, guestEmail, hostName, appointmentTime });
    await newAppointment.save();
    res.status(201).send({ message: 'Appointment booked successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error booking appointment', error: error.message });
  }
});

module.exports = router;
