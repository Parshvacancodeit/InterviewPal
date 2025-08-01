// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  password: { type: String, required: true }, // hashed
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
