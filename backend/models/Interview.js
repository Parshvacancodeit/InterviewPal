// backend/models/Interview.js
const mongoose = require("mongoose");

const qaSchema = new mongoose.Schema({
  question: String,
  referenceAnswer: String,
  userAnswer: String,
  transcript: String,
  scores: {
    overall: Number,
    relevance: Number,
    completeness: Number,
    grammar: Number,
  },
  feedback: String,
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  skill: String,
  difficulty: String,
  questions: [qaSchema], // 🧠 Holds all Q&As with scores/feedback
  completed: { type: Boolean, default: false },
  completedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model("Interview", interviewSchema);
