const express = require('express');
const Appointment = require('../models/appointment');
const router = express.Router();

// Book an appointment (by guest)
router.post('/appointments', async (req, res) => {
  const { guestName, guestEmail, hostName, appointmentTime } = req.body;

  try {
    const newAppointment = new Appointment({
      guestName,
      guestEmail,
      hostName,
      appointmentTime
    });
    await newAppointment.save();
    res.status(201).send({ message: 'Appointment booked successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error booking appointment' });
  }
});

// Accept an appointment (by host)
router.put('/appointments/:id/accept', async (req, res) => {
  const appointmentId = req.params.id;
  const currentTime = new Date();

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (appointment) {
      appointment.status = 'accepted';
      appointment.lastUpdated = currentTime;

      await appointment.save();
      res.status(200).send({ message: 'Appointment accepted successfully' });
    } else {
      res.status(404).send({ message: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error accepting appointment' });
  }
});

// Reschedule an appointment (within 24 hours)
router.put('/appointments/:id/reschedule', async (req, res) => {
  const appointmentId = req.params.id;
  const newAppointmentTime = new Date(req.body.appointmentTime);
  const currentTime = new Date();
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return res.status(404).send({ message: 'Appointment not found' });
  }

  const timeDifference = (newAppointmentTime - currentTime) / (1000 * 60 * 60); // in hours

  if (timeDifference < 24) {
    return res.status(400).send({ message: 'Cannot reschedule within 24 hours' });
  }

  appointment.appointmentTime = newAppointmentTime;
  appointment.status = 'pending'; // Reset to pending for reapproval
  appointment.lastUpdated = currentTime;

  await appointment.save();

  res.status(200).send({ message: 'Appointment rescheduled successfully' });
});

// Cancel an appointment
router.delete('/appointments/:id', async (req, res) => {
  const appointmentId = req.params.id;

  try {
    await Appointment.findByIdAndDelete(appointmentId);
    res.status(200).send({ message: 'Appointment canceled successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error canceling appointment' });
  }
});

module.exports = router;
