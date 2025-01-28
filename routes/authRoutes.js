const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const STATIC_EMAIL = 'ayanfeeledumare@gmail.com'; // Change this for production
const STATIC_PASSWORD = 'password123'; // Use environment variables in production

// Login route (Static email and password)
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === STATIC_EMAIL && password === STATIC_PASSWORD) {
    const token = jwt.sign({ userId: email }, 'your_secret_key', { expiresIn: '1h' });
    return res.status(200).send({ message: 'Login successful', token });
  }

  res.status(401).send({ message: 'Invalid email or password' });
});

module.exports = router;
