// server.js
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const fs = require("fs");
const Interview = require("./models/Interview");



dotenv.config();
const app = express();
const PORT = 5050;

// Load models
const User = require("./models/Users");

const QUESTIONS_FILE = path.join(__dirname, "questions.json");

// ✅ Connect to MongoDB
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not found in .env!");
  process.exit(1);
}
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
}).then(() => {
  console.log("✅ MongoDB connected");
}).catch(err => {
  console.error("❌ MongoDB connection failed:", err);
});

// ✅ Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
  secret: "mysecretkey",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { secure: false },
}));

app.use((req, res, next) => {
  console.log("📦 Incoming session:", req.session.user);
  next();
});

// ✅ Auth: Register
app.post("/register", async (req, res) => {
  const { username, password, fullName } = req.body;
  if (!username || !password || !fullName)
    return res.status(400).json({ msg: "All fields are required" });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, fullName, password: hashedPassword });
    await newUser.save();

    res.json({ msg: "Registered successfully" });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// ✅ Auth: Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("📥 Login attempt:", { username });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid password" });

    req.session.user = {
      id: user._id,
      username: user.username,
      fullName: user.fullName,
    };

    console.log("✅ Session created:", req.session.user);
    res.json({ msg: "Logged in" });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// ✅ Auth: Logout
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    console.log("👋 Logged out user");
    res.json({ msg: "Logged out" });
  });
});

// ✅ Auth: Session Check
app.get("/session", (req, res) => {
  console.log("🔍 Checking session:", req.session.user);
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ msg: "Not logged in" });
  }
});

// ✅ Interview Start Logic (temporary, random)
app.post("/start", async (req, res) => {
  const { name ,tech, difficulty } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ msg: "Unauthorized. Please login first." });
  }

  try {
    const fileContent = fs.readFileSync(QUESTIONS_FILE, "utf-8");
    const questionsData = JSON.parse(fileContent);

    const questions = questionsData[tech]?.[difficulty];
    if (!questions || questions.length === 0) {
      return res.status(404).json({ msg: "No questions found for selected tech and difficulty." });
    }

    // Pick one question
    const randomIndex = Math.floor(Math.random() * questions.length);
    const selectedQuestion = questions[randomIndex];

    // Save new interview
    const newInterview = new Interview({
      interviewTitle: name,
      userId: req.session.user.id,
      name: req.session.user.fullName,
      skill: tech,
      difficulty: difficulty,
      questions: [], // will be filled during interview
    });

    const savedInterview = await newInterview.save();

    res.json({
      question: selectedQuestion,
      interviewId: savedInterview._id,
    });
  } catch (error) {
    console.error("❌ Error during /start:", error);
    return res.status(500).json({ msg: "Failed to start interview." });
  }
});

// ✅ API Routes
const interviewDataRoutes = require("./routes/interviewData");
const interviewRoutes = require("./routes/interviewroutes");
const transcribeRoutes = require("./routes/transcribe");
const evaluateRoute = require("./routes/evaluate");


app.use("/api/interviews", interviewRoutes);
app.use("/api", transcribeRoutes);
app.use("/api/evaluate", evaluateRoute);
app.use("/api/interview-data", interviewDataRoutes);

// ✅ Root
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

// ❌ 404
app.use((req, res) => {
  res.status(404).json({ msg: "❌ Route not found" });
});

// 🚀 Start
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
