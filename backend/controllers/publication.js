// /controllers/publication.js
const Publication = require("../models/publication");
const path = require("path");
const fs = require("fs");

/**
 * Crear publicación (texto + imagen local)
 */
exports.create = async (req, res) => {
  try {
    const text = (req.body?.text || "").trim();

    // Ni texto ni imagen → error
    if (!text && !req.file) {
      return res.status(400).json({
        status: "error",
        message: "Debes enviar texto o una imagen",
      });
    }

    // Guardar ruta local de la imagen si se sube
    let imageData = null;
    if (req.file) {
      imageData = { url: `/uploads/${req.file.filename}` };
    }

    const pub = new Publication({
      text: text || undefined,
      image: imageData || undefined,
      user: req.user.id,
      createdAt: new Date(),
    });

    const saved = await pub.save();

    return res.status(201).json({
      status: "success",
      message: "Publicación creada correctamente",
      publication: saved,
    });
  } catch (err) {
    console.error("Error creando publicación:", err);
    return res.status(500).json({
      status: "error",
      message: "Error al crear publicación",
      error: err.message,
    });
  }
};

/**
 * Listar todas las publicaciones
 */
exports.listAll = async (req, res) => {
  try {
    const publications = await Publication.find()
      .populate("user", "nick email")
      .sort({ createdAt: -1 });
    return res.json({ status: "success", publications });
  } catch (err) {
    console.error("Error listando publicaciones:", err);
    return res.status(500).json({ status: "error", message: "Error al listar publicaciones" });
  }
};

/**
 * Listar publicaciones del usuario autenticado
 */
exports.listMine = async (req, res) => {
  try {
    const publications = await Publication.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    return res.json({ status: "success", publications });
  } catch (err) {
    console.error("Error obteniendo publicaciones del usuario:", err);
    return res.status(500).json({ status: "error", message: "Error al obtener publicaciones" });
  }
};

/**
 * Eliminar publicación propia
 */
exports.remove = async (req, res) => {
  try {
    const pub = await Publication.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!pub) {
      return res.status(404).json({ status: "error", message: "No encontrada o no autorizada" });
    }

    // Eliminar imagen local si existe
    if (pub.image?.url) {
      const imgPath = path.join(__dirname, `..${pub.image.url}`);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    return res.json({ status: "success", message: "Publicación eliminada" });
  } catch (err) {
    console.error("Error eliminando publicación:", err);
    return res.status(500).json({ status: "error", message: "Error al eliminar publicación" });
  }
};
