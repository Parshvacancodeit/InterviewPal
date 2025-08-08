const Report = require("../models/Report");
const Interview = require("../models/Interview");

// ✅ Generate a report after interview is complete
exports.generateReport = async (req, res) => {
  const { interviewId } = req.params;

  try {
    let interview;
    let attempts = 0;
    const maxAttempts = 10;
    const delay = 1500; // 1.5s delay to wait for evaluation completion

    while (attempts < maxAttempts) {
      interview = await Interview.findById(interviewId);

      if (!interview || !interview.questions || interview.questions.length === 0) {
        return res.status(404).json({ error: "Interview or answers not found" });
      }

      const allEvaluated = interview.questions.every(
        q => q.scores && typeof q.scores.overall === "number"
      );

      if (allEvaluated) break;

      await new Promise(resolve => setTimeout(resolve, delay));
      attempts++;
    }

    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    const answers = interview.questions;
    const scoreChart = answers.map(a => a.scores.overall || 0);
    const averageScore = scoreChart.reduce((a, b) => a + b, 0) / scoreChart.length;

    let best = answers[0];
    let worst = answers[0];

    for (const a of answers) {
      if (a.scores.overall > best.scores.overall) best = a;
      if (a.scores.overall < worst.scores.overall) worst = a;
    }

    let feedback = "Great work!";
    if (averageScore < 6) feedback = "Needs improvement.";
    else if (averageScore < 8) feedback = "Good job, but there’s room to improve.";

    const newReport = await Report.create({
      interviewId,
      userId: interview.userId,
      topic: interview.skill,
      averageScore,
      bestQuestion: {
        question: best.question,
        userAnswer: best.userAnswer,
        expectedAnswer: best.referenceAnswer,
        score: best.scores.overall,
      },
      worstQuestion: {
        question: worst.question,
        userAnswer: worst.userAnswer,
        expectedAnswer: worst.referenceAnswer,
        score: worst.scores.overall,
      },
      scoreChart,
      feedback,
    });

    res.json(newReport);
  } catch (err) {
    console.error("❌ Report generation failed:", err);
    res.status(500).json({ error: "Report generation failed" });
  }
};

// ✅ Get report by interview ID
exports.getReportByInterviewId = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const report = await Report.findOne({ interviewId });

    if (!report) return res.status(404).json({ error: "Report not found" });

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching report" });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);

    if (!report) return res.status(404).json({ error: "Report not found" });

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching report" });
  }
};
