// routes/intro.js

const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

router.post("/", async (req, res) => {
  const { text, name } = req.body;

  console.log("📥 Incoming data to /api/intro:", { text, name });

  let result = "";

  const process = spawn(
    'python3',
    ['evaluation/intro_feedback.py', text, name]
  );

  process.stdout.on('data', (data) => {
    result += data.toString();
  });

  process.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  process.on('close', (code) => {
    if (code === 0) {
      try {
        const parsed = JSON.parse(result);
        console.log("🧠 Parsed Intro:", parsed.parsed);
        console.log("📢 Feedback:", parsed.message);
        res.json(parsed);
      } catch (err) {
        console.error("❌ JSON parse error:", err);
        res.status(500).json({ error: 'Failed to parse Python output.' });
      }
    } else {
      res.status(500).json({ error: 'Python script failed.' });
    }
  });
});

module.exports = router;
