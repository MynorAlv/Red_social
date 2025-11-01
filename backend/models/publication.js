const mongoose = require("mongoose");

const PublicationSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true },
    image: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    descripcion_ia: { type: String, trim: true, default: "" },
    emocion_ia: { type: String, trim: true, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Publication", PublicationSchema);
