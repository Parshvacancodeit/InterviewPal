// backend/routes/interview.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

// setup file upload
const upload = multer({ dest: "uploads/" });

router.post("/transcribe", upload.single("audio"), (req, res) => {
  const audioPath = req.file.path;

  const pythonScript = path.join(__dirname, "../ai/transcribe.py");

  // spawn Whisper transcription
  exec(`python3 "${pythonScript}" "${audioPath}"`, (error, stdout, stderr) => {
    // delete file after processing
    fs.unlink(audioPath, () => {});

    if (error) {
      console.error("❌ Whisper error:", stderr);
      return res.status(500).json({ error: "Failed to transcribe audio" });
    }

    console.log("✅ Whisper output:", stdout);
    
  });
});

module.exports = router;
