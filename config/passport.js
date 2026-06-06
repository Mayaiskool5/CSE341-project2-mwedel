const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dbConnection = require('./db');
const { ObjectId } = require('mongodb');

const initializePassport = () => {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const db = dbConnection.getDb();
      const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL || 'http://localhost:8080'}/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const db = dbConnection.getDb();
        const users = db.collection('users');
        const providerData = {
          provider: profile.provider,
          providerId: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value || null,
          picture: profile.photos?.[0]?.value || null,
          role: 'user',
          lastLogin: new Date()
        };

        const existing = await users.findOne({ provider: profile.provider, providerId: profile.id });
        if (existing) {
          await users.updateOne({ _id: existing._id }, { $set: providerData });
          return done(null, { ...existing, ...providerData, _id: existing._id });
        }

        const result = await users.insertOne({
          ...providerData,
          createdAt: new Date()
        });
        return done(null, { ...providerData, _id: result.insertedId });
      } catch (err) {
        done(err, null);
      }
    }
  ));
};

module.exports = initializePassport;
