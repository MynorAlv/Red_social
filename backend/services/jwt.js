// ===============================
// services/jwt.js
// ===============================

// Dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

// Clave secreta del proyecto (se recomienda mover a .env)
const claveSecreta = process.env.JWT_SECRET || "CLAVE_SECRETA_del_proyecto_DE_LA_RED_soCIAL_987987";

/**
 * Crea un token JWT a partir de un usuario.
 * @param {Object} user - Objeto usuario de MongoDB.
 * @returns {string} token codificado.
 */
const createToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix(), // expira en 30 días
  };
  return jwt.encode(payload, claveSecreta);
};

/**
 * Decodifica un token JWT y devuelve su payload.
 * @param {string} token - JWT a decodificar.
 * @returns {Object} payload decodificado.
 */
const decodeToken = (token) => {
  return jwt.decode(token, claveSecreta);
};

module.exports = {
  claveSecreta,
  createToken,
  decodeToken,
};
