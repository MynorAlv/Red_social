
// services/jwt.js

// Dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

// Clave secreta del proyecto
// Usa una variable de entorno en producción para mayor seguridad.
// Si no existe, usa esta por defecto.
const claveSecreta =
  process.env.JWT_SECRET ||
  "CLAVE_SECRETA_del_proyecto_DE_LA_RED_soCIAL_987987";

//  Crear token JWT

/**
 * Genera un token JWT con los datos esenciales del usuario.
 * Este formato unificado permite usar el mismo token para:
 *  - Usuarios con login local (email/contraseña)
 *  - Usuarios autenticados con Google OAuth
 *
 * @param {Object} user - Documento de usuario de MongoDB.
 * @returns {string} - Token JWT firmado.
 */
const createToken = (user) => {
  // Siempre aseguramos que el token tenga un campo "id" válido
  const payload = {
    id: user._id?.toString?.() || user.id, 
    name: user.name || "",
    surname: user.surname || "",
    nick: user.nick || "",
    email: user.email || "",
    role: user.role || "role_user",
    image: user.image || "default.png",
    banner: user.banner || null, // opcional (portada)
    iat: moment().unix(), // fecha de emisión
    exp: moment().add(30, "days").unix(), // expira en 30 días
  };

  // Retorna el token firmado
  return jwt.encode(payload, claveSecreta);
};

// ===============================
// 🧩 Decodificar token JWT
// ===============================
/**
 * Decodifica un token JWT y devuelve su payload.
 * Si el token es inválido, devuelve null y muestra el error en consola.
 *
 * @param {string} token - JWT codificado.
 * @returns {Object|null} - Payload decodificado o null si falla.
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token, claveSecreta);
  } catch (err) {
    console.error("Error decodificando token JWT:", err.message);
    return null;
  }
};

// ===============================
// 📦 Exportar funciones y clave
// ===============================
module.exports = {
  claveSecreta,
  createToken,
  decodeToken,
};
