const express = require("express");
const router = express.Router();
const Interview = require("../models/Interview");

// Route to save a Q&A with feedback/scores into interview
router.post("/save-answer", async (req, res) => {
  try {
    console.log("📥 /save-answer request body:", req.body);

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
    if (!interview) {
      console.warn("⚠️ Interview not found for ID:", interviewId);
      return res.status(404).json({ error: "Interview not found" });
    }

    interview.questions.push({
      question,
      referenceAnswer,
      userAnswer,
      transcript,
      scores,
      feedback,
    });

    console.log("📝 Adding question to interview:", {
      question,
      referenceAnswer,
      userAnswer,
      transcript,
      scores,
      feedback,
    });

    await interview.save();
    console.log("✅ Answer saved to interview:", interview._id);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error in /save-answer:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Mark interview as complete
router.post("/complete", async (req, res) => {
  try {
    console.log("📥 /complete request body:", req.body);

    const { interviewId } = req.body;

    if (!interviewId) {
      console.warn("⚠️ No interview ID provided");
      return res.status(400).json({ error: "Interview ID is required" });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      console.warn("⚠️ Interview not found for ID:", interviewId);
      return res.status(404).json({ error: "Interview not found" });
    }

    interview.completed = true;
    interview.completedAt = new Date();

    await interview.save();
    console.log("✅ Interview marked as complete:", interview._id);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error in /complete:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Save a simplified question (optional older route)
router.post("/save-question", async (req, res) => {
  console.log("📥 /save-question request body:", req.body);

  const { interviewId, question, userAnswer, evaluation } = req.body;

  if (!interviewId || !question || !userAnswer) {
    console.warn("⚠️ Missing data in /save-question:", req.body);
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

    console.log("✅ Question pushed to interview:", updated?._id);
    res.json({ msg: "✅ Question saved", interview: updated });
  } catch (err) {
    console.error("❌ Error in /save-question:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
