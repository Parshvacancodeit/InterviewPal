// routes/transcribe.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' }); // For storing audio temporarily

// POST /api/transcribe
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  console.log("🎤 [STEP 1] Request received at /api/transcribe");
  console.log("📦 File uploaded:", req.file);
  console.log("🔐 Session data:", req.session);

  // Step 2: Check session
  if (!req.session || !req.session.user) {
    console.warn("🚫 No user in session. Rejecting transcription request.");
    return res.status(401).json({ error: 'Unauthorized - please log in' });
  }

  // Step 3: Check file
  if (!req.file) {
    console.error("❌ No file received in request.");
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  try {
    const inputPath = path.join(__dirname, "..", req.file.path);
    const outputPath = inputPath + ".wav";
    console.log("📁 Input audio path:", inputPath);
    console.log("📁 Will convert to:", outputPath);

    const convertCommand = `ffmpeg -i ${inputPath} -ar 16000 -ac 1 -c:a pcm_s16le ${outputPath}`;
    console.log("🎬 Running FFmpeg command:", convertCommand);

    exec(convertCommand, (err) => {
      if (err) {
        console.error("❌ FFmpeg error:", err);
        return res.status(500).json({ error: 'Audio conversion failed' });
      }

      console.log("🔁 Converted to WAV:", outputPath);

      const pythonCommand = `python3 ai/transcribe.py ${outputPath}`;
      console.log("🐍 Running Python command:", pythonCommand);

      exec(pythonCommand, (err, stdout, stderr) => {
        if (err) {
          console.error("🐍 Python error:", err);
          return res.status(500).json({ error: 'Transcription failed' });
        }

        const match = stdout.match(/📃 Transcription result:\s*(.*)/);
        const transcript = match ? match[1].trim() : stdout.trim();

        console.log("📄 Transcription result:", transcript);

        // Cleanup before sending response
        try {
          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
          console.log("🧹 Temp files deleted");
        } catch (cleanupErr) {
          console.warn("⚠️ Error cleaning up files:", cleanupErr);
        }

        // ✅ Send final response only once
        res.json({ text: transcript });
      });
    });
  } catch (err) {
    console.error("🔥 Unexpected server error:", err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

module.exports = router;
