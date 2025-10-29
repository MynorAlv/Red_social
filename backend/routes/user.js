// routes/user.js
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const multerS3 = require("multer-s3-v3");
const s3 = require("../config/s3");
const UserController = require("../controllers/user");
const { auth } = require("../middlewares/auth");

// === Configuración de subida a S3 (sin ACLs) ===
const uploadAvatar = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    key: function (req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `avatars/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}${ext}`;
      cb(null, filename);
    },
  }),
});

const uploadBanner = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    key: function (req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `banners/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}${ext}`;
      cb(null, filename);
    },
  }),
});

// === RUTAS DE USUARIOS ===

// Obtener lista de todos los usuarios
router.get("/users", UserController.listAll);

// 🔹 Obtener perfil del usuario autenticado (token)
router.get("/users/me", auth, UserController.getMyProfile);

// 🔹 Obtener perfil de usuario por ID (debe ir DESPUÉS)
router.get("/users/:id", UserController.getById);

// Eliminar usuario
router.delete("/users/:id", auth, UserController.removeUser);

// Cambiar avatar (subida a S3)
router.put(
  "/users/avatar",
  auth,
  uploadAvatar.single("avatar"),
  UserController.updateAvatarS3
);

// Cambiar banner (subida a S3)
router.put(
  "/users/banner",
  auth,
  uploadBanner.single("banner"),
  UserController.updateBannerS3
);


module.exports = router;
