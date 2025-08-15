const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  tech: { type: String, required: true },        // e.g. "frontend", "backend", "python"
  difficulty: { type: String, required: true },  // "Easy", "Medium", "Hard"
  question: { type: String, required: true },
  reference_answer: { type: String, required: true },
  keywords: [{ type: String }]
});

module.exports = mongoose.model("Question", QuestionSchema);
