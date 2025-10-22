// ===============================
// models/user.js
// ===============================

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  surname: { type: String, trim: true },
  nick: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, trim: true },
  googleId: { type: String },
  role: { type: String, default: "role_user" },
  image: { type: String, default: "default.png" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
