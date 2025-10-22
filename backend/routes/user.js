// ===============================
// routes/user.js
// ===============================

const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const { auth } = require("../middlewares/auth");

// === RUTAS DE USUARIOS ===

// Obtener lista de todos los usuarios (público)
router.get("/users", UserController.listAll);

// Obtener perfil de usuario por ID
router.get("/users/:id", UserController.getById);

// Obtener perfil del usuario autenticado (token)
router.get("/users/me", auth, UserController.getMyProfile);

// Eliminar usuario (solo como ejemplo, requiere token)
router.delete("/users/:id", auth, UserController.removeUser);

module.exports = router;
