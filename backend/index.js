// /backend/index.js
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("./services/passport");
const path = require("path");
const cors = require("cors");
const connection = require("./database/connection");

// Conexión a MongoDB
connection();

const app = express();
const puerto = process.env.PORT || 3900;

// ================= CONFIGURACIÓN CORS =================
app.use(cors({
  origin: ["http://localhost:3900", "http://127.0.0.1:3900", "*"], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ================= MIDDLEWARES =================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ================= SESIÓN Y PASSPORT =================
app.use(session({
  secret: process.env.SESSION_SECRET || "claveSecretaParaSession",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// ================= RUTAS API =================
const AuthRoutes = require("./routes/auth");
const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");
const visionRoutes = require("./routes/vision");

app.use("/api", AuthRoutes);
app.use("/api", UserRoutes);
app.use("/api", PublicationRoutes);
app.use("/api", FollowRoutes);
app.use("/vision", visionRoutes);

// ================= FRONTEND =================
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// Redirigir todas las rutas desconocidas al frontend (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ================= UPLOADS =================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= INICIAR SERVIDOR =================
app.listen(puerto, "0.0.0.0", () => {
  const host = process.env.HOST || "localhost";
  console.log(`Servidor corriendo en: http://${host}:${puerto}`);
  console.log("JWT en uso:", process.env.JWT_SECRET);
});
