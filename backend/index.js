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
const puerto = 3900;

// Middleware CORS
app.use(cors({
  origin: "http://localhost:3900",
  credentials: true
}));

// Body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session + Passport
app.use(session({
  secret: "claveSecretaParaSession",
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

app.use("/api", AuthRoutes);
app.use("/api", UserRoutes);
app.use("/api", PublicationRoutes);
app.use("/api", FollowRoutes);

// ================= FRONTEND =================
// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "../frontend")));

// Ruta raíz → Login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

// Ruta directa a register.html
app.get("/register.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "register.html"));
});

// Servir carpeta de uploads

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ================= INICIAR SERVIDOR =================
app.listen(puerto, () => {
  console.log(`✅ Servidor corriendo en: http://localhost:${puerto}`);
  console.log("JWT en uso:", process.env.JWT_SECRET);

});
