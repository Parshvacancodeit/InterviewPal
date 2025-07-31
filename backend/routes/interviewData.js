// backend/routes/interviewData.js
const express = require("express");
const router = express.Router();
const Interview = require("../models/Interview");

// Route to save a Q&A with feedback/scores into interview
router.post("/save-answer", async (req, res) => {
  try {
    const {
      interviewId,
      question,
      referenceAnswer,
      userAnswer,
      transcript,
      scores,
      feedback,
    } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ error: "Interview not found" });

    interview.questions.push({
      question,
      referenceAnswer,
      userAnswer,
      transcript,
      scores,
      feedback,
    });

    await interview.save();
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error saving answer:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Mark interview as complete
router.post("/complete", async (req, res) => {
  try {
    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json({ error: "Interview ID is required" });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    interview.completed = true;
    interview.completedAt = new Date();

    await interview.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Error ending interview:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/save-question", async (req, res) => {
  const { interviewId, question, userAnswer, evaluation } = req.body;

  if (!interviewId || !question || !userAnswer) {
    return res.status(400).json({ msg: "Missing data" });
  }

  try {
    const updated = await Interview.findByIdAndUpdate(
      interviewId,
      {
        $push: {
          questions: {
            question,
            userAnswer,
            evaluation: evaluation || "",
          },
        },
      },
      { new: true }
    );

    res.json({ msg: "✅ Question saved", interview: updated });
  } catch (err) {
    console.error("❌ Error saving question:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


module.exports = router;
