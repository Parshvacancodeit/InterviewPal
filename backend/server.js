// server.js
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5050;

// ✅ Load models
const User = require("./models/Users");
const Interview = require("./models/Interview");
const Question = require("./models/Question");

// ================= MongoDB =================
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not found in .env!");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection failed:", err));

// ================= Middleware =================
app.use(helmet());
const allowedOrigins = ["http://localhost:5173", process.env.CLIENT_URL].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// ✅ Session config
app.use(session({
  secret: process.env.SESSION_SECRET || "fallbacksecret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
}));

// Debug session
app.use((req, res, next) => {
  console.log("📦 Session user:", req.session.user);
  next();
});

// ✅ Rate limiting for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many attempts, try later",
});
app.use(["/login", "/register"], authLimiter);

// ================= Auth Routes =================

// Register
app.post("/register", async (req, res) => {
  const { username, password, fullName } = req.body;
  if (!username || !password || !fullName)
    return res.status(400).json({ msg: "All fields are required" });

  try {
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, fullName, password: hashedPassword });
    await newUser.save();

    res.json({ msg: "Registered successfully" });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ msg: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ msg: "Invalid password" });

    req.session.user = { id: user._id, username: user.username, fullName: user.fullName };
    res.json({ msg: "Logged in", user: req.session.user });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ msg: "Logout failed" });
    res.clearCookie("connect.sid", { path: "/", httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
    res.json({ msg: "Logged out" });
  });
});

// Session check
app.get("/session", (req, res) => {
  if (req.session.user) return res.json({ user: req.session.user });
  res.status(401).json({ msg: "Not logged in" });
});

// ================= Interview =================
app.post("/start", async (req, res) => {
  const { name, tech, difficulty } = req.body;
  if (!req.session.user) return res.status(401).json({ msg: "Please login first" });

  try {
    const questions = await Question.find({ tech, difficulty });
    if (!questions.length) return res.status(404).json({ msg: "No questions found" });

    const selectedQuestion = questions[Math.floor(Math.random() * questions.length)];

    const newInterview = new Interview({
      interviewTitle: name,
      userId: req.session.user.id,
      name: req.session.user.fullName,
      skill: tech,
      difficulty,
      questions: [],
    });

    const savedInterview = await newInterview.save();
    res.json({ question: selectedQuestion, interviewId: savedInterview._id });
  } catch (err) {
    console.error("❌ /start error:", err);
    res.status(500).json({ msg: "Failed to start interview" });
  }
});

// ================= Routes =================
const interviewDataRoutes = require("./routes/interviewData");
const transcribeRoutes = require("./routes/transcribe");
const evaluateRoute = require("./routes/evaluate");
const interviewFetchRoutes = require("./routes/interviewFetch");
const introRoutes = require("./routes/intro");
const reportFetch = require("./routes/reportFetch");
const evaluateAndSaveRoute = require("./routes/evaluate-and-save");
const reportRoutes = require("./routes/report");
const { getReportById } = require("./controllers/reportController");

app.use("/api", reportRoutes);
app.use("/api/evaluate-and-save", evaluateAndSaveRoute);
app.get("/report/:id", getReportById);
app.use("/api/report-fetch", reportFetch);
app.use("/api", transcribeRoutes);
app.use("/api/evaluate", evaluateRoute);
app.use("/api/interview-data", interviewDataRoutes);
app.use("/api/interview-fetch", interviewFetchRoutes);
app.use("/api/intro", introRoutes);

// ✅ Root
app.get("/", (req, res) => res.send("✅ Backend is running securely"));

// ❌ 404
app.use((req, res) => res.status(404).json({ msg: "Route not found" }));

// 🚀 Start
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
