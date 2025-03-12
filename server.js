require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
const sendOTP = require("./utils/sendOtp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Signup Route
app.post("/api/signup", async (req, res) => {
  try {
    const { name, age, email, phone, password, sex } = req.body;

    if (!name || !age || !email || !phone || !password || !sex) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists. Please log in." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const user = new User({
      name,
      age,
      email,
      phone,
      password: hashedPassword,
      sex,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000, // OTP valid for 5 minutes
    });

    await user.save();
    await sendOTP(email, otp);

    res.status(200).json({ message: "OTP sent. Verify to complete signup." });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

// OTP Verification Route
app.post("/api/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.verified = true;
  user.otp = null;
  await user.save();

  res.status(200).json({ message: "OTP verified. You can now log in." });
});

// Login Route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  if (!user.verified) {
    return res.status(400).json({ message: "Please verify your OTP first" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1m" }); // 1 minute expiration
  res.status(200).json({ message: "Login successful", token });
});

// Forgot Password - Send OTP
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "User not found" });

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = Date.now() + 5 * 60 * 1000;
  await user.save();

  await sendOTP(email, otp);
  res.status(200).json({ message: "OTP sent to email" });
});

// Verify OTP & Reset Password
app.post("/api/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = null;
  await user.save();

  res.status(200).json({ message: "Password updated successfully!" });
});

// Fetch User Info Route
app.get("/api/user-info", async (req, res) => {
  try {
    const email = req.query.email;
    const user = await User.findOne({ email }).select("-password -otp"); // Exclude password & OTP

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data", error: error.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
