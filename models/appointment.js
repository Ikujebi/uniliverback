const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  guestEmail: { type: String, required: true },
  hostName: { type: String, required: true },
  appointmentTime: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'cancelled'], default: 'pending' },
  lastUpdated: { type: Date, default: Date.now }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;