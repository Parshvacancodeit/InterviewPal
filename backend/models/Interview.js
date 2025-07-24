const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  from: String, // 'user' or 'ai'
  text: String,
  timestamp: { type: Date, default: Date.now },
});

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  skill: String,
  difficulty: String,
  startedAt: { type: Date, default: Date.now },
  messages: [messageSchema],
});

module.exports = mongoose.model("Interview", interviewSchema);
