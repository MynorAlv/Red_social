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

  // Imagen de perfil (avatar)
  image: {
    url: { type: String, default: "/uploads/avatars/default.png" },
    public_id: { type: String, default: "" }, // útil si luego usas Cloudinary
  },

  //  Banner o portada del perfil
  banner: {
    url: { type: String, default: "/uploads/avatars/default-banner.jpg" },
    public_id: { type: String, default: "" },
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
