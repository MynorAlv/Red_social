const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
const { createToken } = require("../services/jwt");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // se define en .env
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) return done(new Error("No se recibió un correo de Google"), null);

        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            name: profile.name?.givenName || "Usuario",
            surname: profile.name?.familyName || "",
            nick: profile.displayName || email.split("@")[0],
            email,
            googleId: profile.id,
            role: "role_user",
            image: profile.photos?.[0]?.value || "default.png",
          });
          await user.save();
        }

        // Crear token JWT
        const token = createToken(user);
        user.token = token;

        return done(null, user);
      } catch (err) {
        console.error("Error en autenticación Google:", err);
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
