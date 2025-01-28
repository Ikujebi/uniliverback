require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes');
const guestRoutes = require('./routes/guestRoutes');
const hostRoutes = require('./routes/hostRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const USERNAME = process.env.USERNAME
const PASS = process.env.PASS

// Middleware
app.use(cors());
app.use(bodyParser.json());

const dbUri = process.env.MONGODB_URI

// Database connection (Replace with your MongoDB URI)
mongoose.connect(dbUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Failed to connect to MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes);  // Authentication routes
app.use('/api/guests', guestRoutes);  // Guest routes for booking appointments
app.use('/api/hosts', hostRoutes);  // Host routes for managing appointments

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
