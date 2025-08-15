require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Question = require("./models/Question");

// 1. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// 2. Folder containing JSON files
const folderPath = "/Users/parshvapatel/Desktop/interviewpal-ui/backend/questions";

fs.readdir(folderPath, async (err, files) => {
  if (err) return console.error("Unable to scan folder:", err);

  const jsonFiles = files.filter(file => file.endsWith(".json"));
  const allQuestions = [];

  for (const file of jsonFiles) {
    const filePath = path.join(folderPath, file);
    try {
      const data = fs.readFileSync(filePath, "utf-8");
      const jsonArray = JSON.parse(data);

      // Make sure it's an array
      if (Array.isArray(jsonArray)) {
        allQuestions.push(...jsonArray); // Spread to flatten
      } else {
        console.warn(`Skipped ${file}: Not an array`);
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
    }
  }

  try {
    if (allQuestions.length > 0) {
      await Question.insertMany(allQuestions);
      console.log("All JSON files imported successfully!");
    } else {
      console.log("No valid questions to insert.");
    }
  } catch (error) {
    console.error("Error inserting into MongoDB:", error);
  } finally {
    mongoose.connection.close();
  }
});
