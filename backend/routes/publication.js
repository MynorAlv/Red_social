// routes/publication.js
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const multerS3 = require("multer-s3-v3");
const s3 = require("../config/s3");
const { auth } = require("../middlewares/auth");
const PublicationController = require("../controllers/publication");

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    key: function (req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `publications/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}${ext}`;
      cb(null, filename);
    },
  }),
});

// === RUTAS ===

// Obtener todas las publicaciones
router.get("/publications", PublicationController.listAll);

// Obtener publicaciones del usuario autenticado
router.get("/publications/mine", auth, PublicationController.listMine);

// Crear publicación con imagen (directo a S3)
router.post(
  "/publications",
  auth,
  upload.single("image"),
  PublicationController.create
);

// Eliminar publicación
router.delete("/publications/:id", auth, PublicationController.remove);

module.exports = router;
