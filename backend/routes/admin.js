// routes/admin.js
const express = require('express');
const router = express.Router();
const { adminOnly } = require('../middleware/auth');

router.get('/dashboard', adminOnly, (req, res) => {
res.render('adminDashboard', { user: req.user });
});

module.exports = router;
