// routes/interviewFetch.js
const express = require("express");
const router = express.Router();
const Interview = require("../models/Interview");

// GET /api/interview-fetch
router.get("/", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ msg: "Not logged in" });
    }

    const userId = req.session.user.id;
    const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });

    res.json(interviews);
  } catch (err) {
    console.error("❌ Error fetching interviews:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;
