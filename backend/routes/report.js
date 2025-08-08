const express = require("express");
const router = express.Router();
const {
  generateReport,
  getReportByInterviewId,
} = require("../controllers/reportController");

router.post("/report/generate/:interviewId", generateReport); // to generate report
router.get("/report/interview/:interviewId", getReportByInterviewId); // to fetch it


module.exports = router;
