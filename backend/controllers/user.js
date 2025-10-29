// controllers/user.js
const User = require("../models/user");
const s3 = require("../config/s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");


// LISTAR TODOS LOS USUARIOS
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


// OBTENER USUARIO POR ID
exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // 🔧 Normalizar imagen y banner
    const formattedUser = {
      ...user._doc,
      image: user.image
        ? typeof user.image === "string"
          ? { url: user.image }
          : user.image
        : { url: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png" },
      banner: user.banner
        ? typeof user.banner === "string"
          ? { url: user.banner }
          : user.banner
        : {
            url: "https://images.unsplash.com/photo-1517511620798-cec17d428bc0?auto=format&fit=crop&w=1000&q=80",
          },
    };

    return res.json({ status: "success", user: formattedUser });
  } catch (err) {
    console.error("Error obteniendo usuario:", err);
    return res.status(500).json({
      status: "error",
      message: "Error al obtener usuario",
    });
  }
};

// ===============================
// PERFIL DEL USUARIO AUTENTICADO
// ===============================
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // 🔧 Normalizar formato de imagen y banner
    const formattedUser = {
      ...user._doc,
      image: user.image
        ? typeof user.image === "string"
          ? { url: user.image }
          : user.image
        : { url: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png" },
      banner: user.banner
        ? typeof user.banner === "string"
          ? { url: user.banner }
          : user.banner
        : {
            url: "https://images.unsplash.com/photo-1517511620798-cec17d428bc0?auto=format&fit=crop&w=1000&q=80",
          },
    };

    return res.json({ status: "success", user: formattedUser });
  } catch (err) {
    console.error("Error en getMyProfile:", err);
    return res.status(500).json({
      status: "error",
      message: "Error al obtener tu perfil",
    });
  }
};


// ===============================
// ELIMINAR USUARIO
// ===============================
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

// ===============================
// ACTUALIZAR AVATAR EN S3
// ===============================
exports.updateAvatarS3 = async (req, res) => {
  try {
    if (!req.file || !req.file.location) {
      return res.status(400).json({
        status: "error",
        message: "No se subió ninguna imagen",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // Eliminar avatar anterior si estaba en S3
    let oldKey = null;
    if (user.image?.url && user.image.url.includes("amazonaws.com")) {
      oldKey = user.image.url.split(".amazonaws.com/")[1];
    }
    if (oldKey) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: oldKey,
          })
        );
      } catch (err) {
        console.warn("Error eliminando avatar anterior:", err.message);
      }
    }

    // Guardar nueva imagen (objeto con estructura del modelo)
    user.image = { url: req.file.location, public_id: "" };
    await user.save();

    return res.json({
      status: "success",
      message: "Avatar actualizado correctamente",
      user,
    });
  } catch (err) {
    console.error("Error al actualizar avatar:", err);
    return res.status(500).json({
      status: "error",
      message: "Error al actualizar avatar",
    });
  }
};

// ===============================
// ACTUALIZAR BANNER EN S3
// ===============================
exports.updateBannerS3 = async (req, res) => {
  try {
    if (!req.file || !req.file.location) {
      return res.status(400).json({
        status: "error",
        message: "No se subió ninguna imagen",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // Eliminar banner anterior si estaba en S3
    let oldKey = null;
    if (user.banner?.url && user.banner.url.includes("amazonaws.com")) {
      oldKey = user.banner.url.split(".amazonaws.com/")[1];
    }
    if (oldKey) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: oldKey,
          })
        );
      } catch (err) {
        console.warn("Error eliminando banner anterior:", err.message);
      }
    }

    // Guardar nuevo banner (objeto con estructura del modelo)
    user.banner = { url: req.file.location, public_id: "" };
    await user.save();

    return res.json({
      status: "success",
      message: "Banner actualizado correctamente",
      user,
    });
  } catch (err) {
    console.error("Error al actualizar banner:", err);
    return res.status(500).json({
      status: "error",
      message: "Error al actualizar banner",
    });
  }
};
