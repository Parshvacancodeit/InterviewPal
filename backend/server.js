// server.js
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
require("dotenv").config();

const app = express();
const PORT = 5050;

// Validate .env setup
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not found in .env!");
  process.exit(1);
}

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// Middlewares
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(bodyParser.json());
app.use(cookieParser());

// 🧠 Persistent session store
app.use(session({
  secret: "mysecretkey",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { secure: false }, // Set to true if using HTTPS
}));

// 🔍 Log session on every request
app.use((req, res, next) => {
  console.log("📦 Incoming session:", req.session.user);
  next();
});

// File-based user management
const USERS_FILE = path.join(__dirname, "users.json");

const readUsers = () => {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("❌ Error reading users:", err);
    return [];
  }
};

const saveUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log("✅ Users saved");
  } catch (err) {
    console.error("❌ Failed to save users:", err);
  }
};

// 🧾 Register
app.post("/register", async (req, res) => {
  const { username, password, fullName } = req.body;
  if (!username || !password || !fullName)
    return res.status(400).json({ msg: "All fields are required" });

  const users = readUsers();
  const existingUser = users.find(u => u.username === username);
  if (existingUser)
    return res.status(400).json({ msg: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { username, fullName, password: hashedPassword };
  users.push(newUser);
  saveUsers(users);

  res.json({ msg: "Registered successfully" });
});

// 🔐 Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("📥 Login attempt:", { username });

  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (!user) {
    console.log("❌ User not found");
    return res.status(401).json({ msg: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.log("❌ Invalid password");
    return res.status(401).json({ msg: "Invalid password" });
  }

  req.session.user = { username: user.username, fullName: user.fullName };
  console.log("✅ Session created:", req.session.user);

  res.json({ msg: "Logged in" });
});

// 🔓 Logout
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    console.log("👋 Logged out user");
    res.json({ msg: "Logged out" });
  });
});

// 🔎 Check Session
app.get("/session", (req, res) => {
  console.log("🔍 Checking session:", req.session.user);
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ msg: "Not logged in" });
  }
});

// ✅ Routes
const interviewRoutes = require("./routes/interviewroutes");
const transcribeRoutes = require("./routes/transcribe");

app.use("/api/interviews", interviewRoutes);
app.use("/api", transcribeRoutes);

// ✅ Root test
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

// ❌ 404 fallback
app.use((req, res) => {
  res.status(404).json({ msg: "❌ Route not found" });
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
