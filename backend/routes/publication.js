// /routes/publication.js
const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/publication");
const { auth } = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");

// Configuración de Multer (subida local)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "_" + Math.random().toString(36).substring(2, 8) + ext;
    cb(null, name);
  },
});

const upload = multer({ storage });

// Rutas
router.get("/publications", PublicationController.listAll);
router.get("/publications/mine", auth, PublicationController.listMine);
router.post("/publications", auth, upload.single("image"), PublicationController.create);
router.delete("/publications/:id", auth, PublicationController.remove);

module.exports = router;
