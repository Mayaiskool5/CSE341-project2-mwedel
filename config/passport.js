const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
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

  const googleClientID = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!googleClientID || !googleClientSecret) {
    throw new Error('Missing GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET environment variables.');
  }

  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const db = dbConnection.getDb();
        const users = db.collection('users');
        const user = await users.findOne({ provider: 'local', email: email.toLowerCase() });
        if (!user || !user.passwordHash) {
          return done(null, false, { message: 'Incorrect email or password.' });
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
          return done(null, false, { message: 'Incorrect email or password.' });
        }

        await users.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.use(new GoogleStrategy({
      clientID: googleClientID,
      clientSecret: googleClientSecret,
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
