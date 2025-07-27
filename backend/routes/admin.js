const express = require("express");
const router = express.Router();
const isAdmin = require("../middleware/isAdmin");

router.get("/dashboard", isAdmin, (req, res) => {
  res.json({ message: "Welcome Admin!", user: req.dbUser });
});

module.exports = router;
