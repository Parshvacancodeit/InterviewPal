// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  averageScore: { type: Number },
  bestQuestion: {
    question: String,
    userAnswer: String,
    expectedAnswer: String,
    score: Number
  },
  worstQuestion: {
    question: String,
    userAnswer: String,
    expectedAnswer: String,
    score: Number
  },
  scoreChart: [Number], // array of 5 numbers (score per question)
  feedback: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
