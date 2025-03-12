const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  sex: String,
  otp: String,
  otpExpires: Date,
  verified: { type: Boolean, default: false }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
