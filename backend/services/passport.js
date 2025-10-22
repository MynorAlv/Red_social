const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
const { createToken } = require("../services/jwt"); // ✅ IMPORTANTE

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value.toLowerCase();

    // Buscar usuario existente
    let user = await User.findOne({ email });

    if (!user) {
      // Crear nuevo usuario
      user = new User({
        name: profile.name.givenName,
        surname: profile.name.familyName || "",
        nick: profile.displayName || email.split("@")[0],
        email,
        googleId: profile.id,  // evita necesidad de password
        role: "role_user",
        image: "default.png"
      });
      user = await user.save();
    }

    // ✅ Adjuntar token al usuario para usarlo en el callback
    user.token = createToken(user);

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

module.exports = passport;
