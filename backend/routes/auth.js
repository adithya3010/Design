const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Location = require('../models/Location');

// ✅ GET /login → show login form
router.get('/login', (req, res) => {
  const redirectTo = req.query.redirect || '/locations';
  res.render('login', { redirectTo });
});

// ✅ GET /register → show register form
router.get('/register', (req, res) => {
  const redirectTo = req.query.redirect || '/locations';
  res.render('register', { redirectTo });
});

// ✅ POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password, role, redirectTo } = req.body;
  try {
    const user = new User({ email, password, role: role || 'user' });
    await user.save();
    res.redirect(redirectTo || '/locations');
  } catch (err) {
    console.error(err);
    res.status(400).send('Registration failed');
  }
});

// ✅ POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password, redirectTo } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send('Invalid credentials');
    }

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, { httpOnly: true });

    // ✅ Redirect to original page if present
    res.redirect(redirectTo || '/locations');
  } catch (err) {
    console.error('Login failed:', err.message);
    res.status(500).send('Login failed');
  }
});

// ✅ POST /auth/logout
router.post('/logout', async (req, res) => {
  res.clearCookie('token');
  const redirectTo = req.headers.referer || '/locations';
  res.redirect(redirectTo);
});

module.exports = router;
