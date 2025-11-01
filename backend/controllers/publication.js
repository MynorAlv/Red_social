// controllers/publication.js
const Publication = require("../models/publication");
const mongoose = require("mongoose");
const s3 = require("../config/s3"); // conexión con AWS S3
const visionClient = require("../config/visionClient");


// Crear publicación (con análisis de Google Vision)
exports.create = async (req, res) => {
  try {
    const text = (req.body?.text || "").trim();

    // Validar contenido
    if (!text && !req.file) {
      return res.status(400).json({
        status: "error",
        message: "Debes enviar texto o una imagen",
      });
    }

    // ===============================
    // 1️⃣ Subida de imagen a S3
    // ===============================
    let imageData = null;
    if (req.file && req.file.location) {
      imageData = { url: req.file.location };
    }

    // ===============================
    // 2️⃣ Detectar objetos con Google Vision (solo etiquetas traducidas)
    // ===============================
    let visionDescription = "";

    if (req.file && req.file.location) {
      try {
        // === Detección de etiquetas ===
        const [labelResult] = await visionClient.labelDetection(req.file.location);
        const labels = labelResult.labelAnnotations.map((l) => l.description);

        // Diccionario extendido de traducciones
        const traducciones = {
          dog: "perro",
          cat: "gato",
          person: "persona",
          man: "hombre",
          woman: "mujer",
          people: "personas",
          smile: "sonrisa",
          face: "rostro",
          sky: "cielo",
          cloud: "nube",
          tree: "árbol",
          mountain: "montaña",
          landscape: "paisaje",
          nature: "naturaleza",
          outdoor: "exterior",
          building: "edificio",
          water: "agua",
          sea: "mar",
          beach: "playa",
          food: "comida",
          drink: "bebida",
          phone: "teléfono",
          laptop: "computadora portátil",
          vehicle: "vehículo",
          car: "auto",
          people_in_nature: "personas al aire libre",
          happiness: "felicidad",
          facial_expression: "expresión facial",
          evening: "atardecer",
          wind: "viento",
          furniture: "mueble",
          technology: "tecnología",
          room: "habitación",
          light: "luz",
          dark: "oscuridad",
          shadow: "sombra",
        };

        // Traducir las 5 etiquetas principales
        const traducidas = labels
          .slice(0, 5)
          .map((label) => {
            const lower = label.toLowerCase().replace(/\s+/g, "_");
            return traducciones[lower] || label;
          })
          .filter((val, i, arr) => arr.indexOf(val) === i); // evitar duplicados

        // Generar descripción final
        visionDescription =
          traducidas.length > 0
            ? traducidas.join(", ")
            : "no se detectaron elementos destacados";
      } catch (err) {
        console.warn("Error analizando imagen con Vision:", err.message);
        visionDescription = "no se pudo analizar la imagen";
      }
    }

    // ===============================
    // 3️⃣ Guardar publicación
    // ===============================
    const userId = mongoose.Types.ObjectId.isValid(req.user.id)
      ? new mongoose.Types.ObjectId(req.user.id)
      : req.user.id;

    const pub = new Publication({
      text,
      image: imageData,
      user: userId,
      descripcion_ia: visionDescription, // ✅ solo este campo IA
    });

    const saved = await pub.save();
    const populated = await Publication.findById(saved._id).populate(
      "user",
      "nick email image"
    );

    return res.status(201).json({
      status: "success",
      message: "Publicación creada correctamente",
      publication: populated,
    });
  } catch (err) {
    console.error("Error creando publicación:", err);
    return res.status(500).json({
      status: "error",
      message: "Error al crear publicación",
    });
  }
};

// ===============================
// Feed general
// ===============================
exports.listAll = async (req, res) => {
  try {
    const publications = await Publication.find()
      .populate("user", "nick email image")
      .sort({ createdAt: -1 });

    return res.json({ status: "success", publications });
  } catch (err) {
    console.error("Error listando publicaciones:", err);
    return res.status(500).json({
      status: "error",
      message: "Error al listar publicaciones",
    });
  }
};

// ===============================
// Publicaciones del usuario autenticado
// ===============================
exports.listMine = async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId.isValid(req.user.id)
      ? new mongoose.Types.ObjectId(req.user.id)
      : req.user.id;

    const publications = await Publication.find({ user: userId })
      .populate("user", "nick email image")
      .sort({ createdAt: -1 });

    return res.json({ status: "success", publications });
  } catch (err) {
    console.error("Error obteniendo publicaciones del usuario:", err);
    return res.status(500).json({
      status: "error",
      message: "Error al obtener publicaciones del usuario",
    });
  }
};

// ===============================
// Eliminar publicación
// ===============================
exports.remove = async (req, res) => {
  try {
    const pub = await Publication.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!pub) {
      return res.status(404).json({
        status: "error",
        message: "Publicación no encontrada o no autorizada",
      });
    }

    // Si la publicación tiene imagen en S3, eliminarla también
    if (pub.image?.url && pub.image.url.includes("amazonaws.com")) {
      try {
        const key = pub.image.url.split(".amazonaws.com/")[1];
        await s3
          .deleteObject({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
          })
          .promise();
        console.log("Imagen eliminada de S3:", key);
      } catch (err) {
        console.warn("Error eliminando imagen de S3:", err.message);
      }
    }

    return res.json({ status: "success", message: "Publicación eliminada" });
  } catch (err) {
    console.error("Error eliminando publicación:", err);
    return res.status(500).json({
      status: "error",
      message: "Error al eliminar publicación",
    });
  }
};
