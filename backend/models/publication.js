// /models/publication.js
const mongoose = require("mongoose");

const PublicationSchema = new mongoose.Schema({
  text: { type: String, trim: true, maxlength: 500 },
  image: {
    url: { type: String },
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Publication", PublicationSchema);
