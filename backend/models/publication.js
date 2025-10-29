// ===============================
// models/publication.js
// ===============================

const mongoose = require("mongoose");

const PublicationSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true },
    image: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    // ✅ Relación correcta con el modelo User
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Publication", PublicationSchema);
