// backend/routes/interviewroutes.js
const express = require('express');
const router = express.Router(); // ✅ THIS WAS MISSING
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

router.post('/transcribe', upload.single('audio'), async (req, res) => {
  console.log("🎙️ Received audio for transcription");
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  const inputPath = path.join(__dirname, '..', req.file.path);
  const outputPath = inputPath.replace('.webm', '.wav');

  // Convert to .wav using ffmpeg
  const convertCommand = `ffmpeg -i ${inputPath} -ar 16000 -ac 1 -c:a pcm_s16le ${outputPath}`;
  exec(convertCommand, (err) => {
    if (err) {
      console.error("❌ ffmpeg error:", err);
      return res.status(500).json({ error: 'Failed to convert audio' });
    }

    console.log("🔁 Converted to WAV, starting Python script");

    // Call Python script
    const pythonCommand = `python3 ai/transcribe.py ${outputPath}`;
    exec(pythonCommand, (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Python script error:", err);
        return res.status(500).json({ error: 'Transcription failed' });
      }

      console.log("✅ Transcription result:", stdout.trim());
      res.json({ text: stdout.trim() });

      // Optional cleanup
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});

module.exports = router;
