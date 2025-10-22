const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const { findOrCreate } = require("../models/user")

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreate(profile)
          done(null, user)
        } catch (err) {
          done(err, null)
        }
      },
    ),
  )
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// Deserialize user from session
passport.deserializeUser((id, done) => {
  done(null, { id })
})

module.exports = passport
