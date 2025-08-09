const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const Interview = require("../models/Interview");

router.get("/", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ msg: "Not logged in" });
    }
    const userId = req.session.user.id;

    // Fetch reports
    const reports = await Report.find({ userId }).sort({ createdAt: -1 });

    // For each report, fetch interview title
    const reportsWithInterviewTitles = await Promise.all(
      reports.map(async (report) => {
        const interview = await Interview.findById(report.interviewId).select("interviewTitle");
        return {
          ...report.toObject(),
          interviewTitle: interview ? interview.interviewTitle : "Unknown Interview",
        };
      })
    );

    res.json(reportsWithInterviewTitles);
  } catch (err) {
    console.error("❌ Error fetching reports:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;
