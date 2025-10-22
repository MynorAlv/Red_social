// ===============================
// controllers/user.js
// ===============================

const User = require("../models/user");

/**
 * Listar todos los usuarios registrados.
 */
exports.listAll = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.json({ status: "success", users });
  } catch (err) {
    console.error("Error listando usuarios:", err);
    return res.status(500).json({
      status: "error",
      message: "Error al listar usuarios",
    });
  }
};

/**
 * Obtener usuario por ID.
 */
exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }
    return res.json({ status: "success", user });
  } catch (err) {
    console.error("Error obteniendo usuario:", err);
    return res.status(500).json({
      status: "error",
      message: "Error al obtener usuario",
    });
  }
};

/**
 * Obtener perfil del usuario autenticado (token).
 */
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }
    return res.json({ status: "success", user });
  } catch (err) {
    console.error("Error en getMyProfile:", err);
    return res.status(500).json({
      status: "error",
      message: "Error al obtener tu perfil",
    });
  }
};

/**
 * Eliminar usuario (ejemplo básico).
 */
exports.removeUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado o ya eliminado",
      });
    }
    return res.json({ status: "success", message: "Usuario eliminado" });
  } catch (err) {
    console.error("Error eliminando usuario:", err);
    return res.status(500).json({
      status: "error",
      message: "Error al eliminar usuario",
    });
  }
};
