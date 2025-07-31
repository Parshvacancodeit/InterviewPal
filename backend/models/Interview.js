const mongoose = require("mongoose");

const qaSchema = new mongoose.Schema({
  question: String,
  referenceAnswer: String,
  userAnswer: String,
  transcript: String, // if different from userAnswer
  scores: {
    semantic: Number,
    keyword_overlap: Number,
    confidence: Number,
    overall: Number,
  },
  feedback: String,
  timestamp: { type: Date, default: Date.now },
});

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  skill: String,
  difficulty: String,
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  questions: [qaSchema],
});

module.exports = mongoose.model("Interview", interviewSchema);
