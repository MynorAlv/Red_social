// controllers/auth.js
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { createToken } = require("../services/jwt");
const axios = require("axios");

/**
 * Limpia y normaliza strings.
 */
const norm = (s = "") => s.toString().trim();

/**
 * Registro de usuario local.
 */
exports.register = async (req, res) => {
  try {
    const { name, surname, nick, email, password } = req.body || {};
    if (!name || !nick || !email || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Faltan campos obligatorios" });
    }

    const exists = await User.findOne({
      $or: [{ email: norm(email) }, { nick: norm(nick) }],
    });
    if (exists) {
      return res.status(409).json({
        status: "error",
        message: "Nick o email ya registrado",
      });
    }

    // Encripta la contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = new User({
      name: norm(name),
      surname: norm(surname),
      nick: norm(nick),
      email: norm(email).toLowerCase(),
      password: passwordHash,
      role: "role_user",
      image: "default.png",
    });

    const saved = await newUser.save();
    const token = createToken(saved);
    const { password: _, ...userSafe } = saved.toObject();

    return res.status(201).json({
      status: "success",
      message: "Usuario registrado correctamente",
      user: userSafe,
      token,
    });
  } catch (err) {
    console.error("Error en registro:", err);
    return res.status(500).json({
      status: "error",
      message: "Error interno en el registro",
      error: err.message,
    });
  }
};

/**
 * Login local por email y contraseña.
 */
/**
 * Login local por email y contraseña con validación reCAPTCHA v2.
 */
exports.login = async (req, res) => {
  try {
    const { email, password, captcha } = req.body || {};

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email y contraseña son obligatorios",
      });
    }

    // Verificar reCAPTCHA
    if (!captcha) {
      return res.status(400).json({
        status: "error",
        message: "Debes completar el reCAPTCHA antes de iniciar sesión",
      });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;
    const { data } = await axios.post(verifyURL);

    if (!data.success) {
      return res.status(400).json({
        status: "error",
        message: "Verificación reCAPTCHA fallida",
      });
    }

    // Buscar usuario
    const user = await User.findOne({ email: norm(email).toLowerCase() });
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Correo no registrado",
      });
    }

    // Validar contraseña
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({
        status: "error",
        message: "Contraseña incorrecta",
      });
    }

    // Generar token
    const token = createToken(user);
    const { password: _, ...userSafe } = user.toObject();

    return res.json({
      status: "success",
      message: "Login correcto",
      user: userSafe,
      token,
    });
  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({
      status: "error",
      message: "Error interno en el login",
      error: err.message,
    });
  }
};


/**
 * Perfil del usuario autenticado (requiere token).
 */
exports.profile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Usuario no encontrado" });
    }

    return res.json({ status: "success", user });
  } catch (err) {
    console.error("Error obteniendo perfil:", err);
    return res.status(500).json({
      status: "error",
      message: "Error obteniendo perfil",
      error: err.message,
    });
  }
};
