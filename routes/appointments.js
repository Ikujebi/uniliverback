const express = require('express');
const jwt = require('jsonwebtoken');
const Appointment = require('../models/appointment');
const router = express.Router();

// Static credentials (Email and Password)
const STATIC_EMAIL = 'ayanfeeledumare@gmail.com'; // Change to your desired static email
const STATIC_PASSWORD = 'password123'; // Change to your desired static password

// Middleware to authenticate the token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer token
  if (!token) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Invalid or expired token' });
    }
    req.user = decoded; // Add user data to the request
    next();
  });
};

// Login route (Static email and password)
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === STATIC_EMAIL && password === STATIC_PASSWORD) {
    // Valid credentials, issue JWT token
    const token = jwt.sign({ userId: email }, 'your_secret_key', { expiresIn: '1h' });

    return res.status(200).send({ message: 'Login successful', token });
  } else {
    return res.status(401).send({ message: 'Invalid email or password' });
  }
});

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

// Accept an appointment (by host) - Protected route
router.put('/appointments/:id/accept', authenticate, async (req, res) => {
  const appointmentId = req.params.id;
  const currentTime = new Date();

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (appointment) {
      appointment.status = 'accepted';
      appointment.lastUpdated = currentTime;
      appointment.acceptedBy = req.user.userId; // Save who accepted

      await appointment.save();
      res.status(200).send({ message: 'Appointment accepted successfully' });
    } else {
      res.status(404).send({ message: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error accepting appointment' });
  }
});

// Reschedule an appointment (within 24 hours) - Protected route
router.put('/appointments/:id/reschedule', authenticate, async (req, res) => {
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

// Cancel an appointment - Protected route
router.delete('/appointments/:id', authenticate, async (req, res) => {
  const appointmentId = req.params.id;

  try {
    await Appointment.findByIdAndDelete(appointmentId);
    res.status(200).send({ message: 'Appointment canceled successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error canceling appointment' });
  }
});

// Get all appointments (with optional filters) - Protected route
router.get('/appointments', authenticate, async (req, res) => {
  const { status, hostName, guestName, guestEmail, appointmentTime } = req.query;

  try {
    // Build the query object based on filters
    const query = {};

    if (status) {
      query.status = status; // Filter by status (e.g., pending, accepted, canceled)
    }

    if (hostName) {
      query.hostName = hostName; // Filter by host name
    }

    if (guestName) {
      query.guestName = guestName; // Filter by guest name
    }

    if (guestEmail) {
      query.guestEmail = guestEmail; // Filter by guest email
    }

    if (appointmentTime) {
      const appointmentDate = new Date(appointmentTime); 
      query.appointmentTime = { $eq: appointmentDate }; // Match exact appointment date and time
    }

    const appointments = await Appointment.find(query).sort({ appointmentTime: 1 }); // Sort by appointment time
    console.log(appointments);
    res.status(200).send({ appointments });
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving appointments', error: error.message });
  }
});


module.exports = router;
