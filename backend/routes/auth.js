const { Router } = require("express");
const ctrl = require("../controllers/auth");
const { auth } = require("../middlewares/auth");
const passport = require("../services/passport");
const jwt = require("../services/jwt");

const router = Router();

// === Registro y Login local ===
router.post("/auth/register", ctrl.register);
router.post("/auth/login", ctrl.login);
router.get("/auth/me", auth, ctrl.profile);

// === Autenticación con Google ===
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: process.env.FRONTEND_URL + "/#/auth", session: false }),
  (req, res) => {
    try {
      const token = jwt.createToken(req.user);
      // Redirigir a frontend con token en la URL
      res.redirect(`${process.env.FRONTEND_URL}/#/feed?token=${token}`);
    } catch (error) {
      console.error("Error al crear token de Google:", error);
      res.redirect(`${process.env.FRONTEND_URL}/#/auth?error=token`);
    }
  }
);

module.exports = router;
