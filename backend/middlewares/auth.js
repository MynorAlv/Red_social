// ===============================
// middlewares/auth.js
// ===============================

const jwt = require("jwt-simple");
const moment = require("moment");
const { claveSecreta } = require("../services/jwt");

/**
 * Middleware de autenticación JWT.
 * Verifica que el token sea válido, no esté expirado
 * y agrega los datos del usuario al objeto req.user.
 */
exports.auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({
      status: "error",
      message: "Falta la cabecera de autenticación",
    });
  }

  // Quita el prefijo "Bearer "
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  try {
    const payload = jwt.decode(token, claveSecreta);

    // Verifica expiración
    if (payload.exp <= moment().unix()) {
      return res.status(401).json({
        status: "error",
        message: "Token expirado",
      });
    }

    // Inserta el usuario en la request
    req.user = payload;
    next();
  } catch (error) {
    console.error("Error al verificar token:", error.message);
    return res.status(401).json({
      status: "error",
      message: "Token inválido o corrupto",
    });
  }
};
