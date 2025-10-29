// middlewares/auth.js
const jwt = require("jwt-simple");
const moment = require("moment");
const { claveSecreta } = require("../services/jwt");

/**
 * Middleware de autenticación JWT.
 * Verifica que el token sea válido, no esté expirado
 * y agrega los datos del usuario en req.user.
 */
exports.auth = (req, res, next) => {

  // 1️⃣ Verificar cabecera Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({
      status: "error",
      message: "Falta la cabecera de autenticación",
    });
  }

  // Elimina el prefijo "Bearer " (si existe)
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  try {
    // ===============================
    // 2️⃣ Decodificar el token
    // ===============================
    const payload = jwt.decode(token, claveSecreta);

    // ===============================
    // 3️⃣ Verificar expiración
    // ===============================
    if (!payload.exp || payload.exp <= moment().unix()) {
      return res.status(401).json({
        status: "error",
        message: "Token expirado o inválido",
      });
    }

    // ===============================
// 4️⃣ Normalizar los datos del usuario
// ===============================
const mongoose = require("mongoose");
let userId = payload.id || payload._id;

try {
  if (mongoose.Types.ObjectId.isValid(userId)) {
    userId = new mongoose.Types.ObjectId(userId);
  }
} catch (e) {
  console.warn("ID no convertible a ObjectId:", userId);
}

req.user = {
  id: userId, // ✅ ahora siempre ObjectId válido
  email: payload.email || "",
  nick: payload.nick || "",
  name: payload.name || "",
  role: payload.role || "role_user",
  image: payload.image || "default.png",
  banner: payload.banner || null,
};


    // ===============================
    // 5️⃣ Continuar al siguiente middleware/controlador
    // ===============================
    next();
  } catch (error) {
    console.error("❌ Error al verificar token JWT:", error.message);
    return res.status(401).json({
      status: "error",
      message: "Token inválido o corrupto",
    });
  }
};
