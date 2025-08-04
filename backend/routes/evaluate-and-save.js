const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const Interview = require("../models/Interview");

router.post("/", async (req, res) => {
  const { payload, interviewId, question, referenceAnswer, transcript } = req.body;

  // Immediately respond so frontend doesn't wait
  res.json({ status: "Background evaluation started" });

  try {
    const py = spawn("python3", ["evaluation/evaluator.py"]);
    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();

    let result = "";

    py.stdout.on("data", (chunk) => {
      result += chunk.toString();
    });

    py.on("close", async () => {
      try {
        const parsed = JSON.parse(result);

        // Save to MongoDB
        const interview = await Interview.findById(interviewId);
        if (!interview) return;

        interview.questions.push({
          question,
          referenceAnswer,
          userAnswer: payload.user_answer,
          transcript,
          scores: parsed.score,
          feedback: parsed.feedback,
        });

        await interview.save();
        console.log("✅ Answer saved (async) to interview:", interviewId);
      } catch (err) {
        console.error("❌ Failed to parse or save evaluation:", err);
      }
    });
  } catch (err) {
    console.error("❌ Async evaluation error:", err);
  }
});

module.exports = router;
