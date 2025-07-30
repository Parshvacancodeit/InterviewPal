const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");

router.post("/", (req, res) => {
  const data = req.body;
  console.log("📥 Received payload in evaluate.js:", data);

  const py = spawn("python3", [path.join(__dirname, "../evaluation/evaluator.py")]);

  let result = "";
  let errorOutput = "";

  py.stdin.write(JSON.stringify(data));
  py.stdin.end();

  py.stdout.on("data", (chunk) => {
    const output = chunk.toString();
    console.log("📤 Python stdout:", output);
    result += output;
  });

  py.stderr.on("data", (err) => {
    const errMsg = err.toString();
    console.error("❌ Python stderr:", errMsg);

    // Filter out non-critical logs like "Device set to use CPU"
    if (
      !errMsg.toLowerCase().includes("device set to use") &&
      !errMsg.toLowerCase().includes("json loaded") &&
      !errMsg.toLowerCase().includes("evaluate() received")
    ) {
      errorOutput += errMsg;
    }
  });

  py.on("close", (code) => {
    console.log("⚙️ Python process exited with code:", code);

    if (code !== 0 || errorOutput) {
      console.error("❌ Final error from Python:", errorOutput);
      return res
        .status(500)
        .json({ error: "Python script error", details: errorOutput || "Unknown error" });
    }

    try {
      const parsed = JSON.parse(result);
      console.log("✅ Parsed Python result:", parsed);
      res.json(parsed);
    } catch (err) {
      console.error("❌ JSON parse error:", result);
      res.status(500).json({ error: "Invalid response from Python script" });
    }
  });
});

module.exports = router;
