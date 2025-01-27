const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const appointmentRoutes = require('./routes/appointments');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection (Replace with your MongoDB URI)
mongoose.connect('mongodb://localhost:27017/appointments', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Failed to connect to MongoDB:', err));

// Routes
app.use('/api', appointmentRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
