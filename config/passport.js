const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = function (passport) {
  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          providerId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
          authProvider: 'google',
        };

        try {
          let user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            // If user exists but logs in with a new provider, update their provider info
            if (!user.providerId || user.authProvider !== 'google') {
                user.authProvider = 'google';
                user.providerId = profile.id;
                user.avatar = profile.photos[0].value;
                await user.save();
            }
            done(null, user);
          } else {
            user = await User.create(newUser);
            done(null, user);
          }
        } catch (err) {
          console.error(err);
          done(err, null);
        }
      }
    )
  );

  // GitHub OAuth Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/api/auth/github/callback',
        scope: ['user:email']
      },
      async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;
        const newUser = {
            providerId: profile.id,
            name: profile.displayName || profile.username,
            email,
            avatar: profile.photos[0].value,
            authProvider: 'github',
        };

        try {
          let user = await User.findOne({ email });
          if (user) {
            if (!user.providerId || user.authProvider !== 'github') {
                user.authProvider = 'github';
                user.providerId = profile.id;
                user.avatar = profile.photos[0].value;
                await user.save();
            }
            done(null, user);
          } else {
            user = await User.create(newUser);
            done(null, user);
          }
        } catch (err) {
          console.error(err);
          done(err, null);
        }
      }
    )
  );
  
  // Passport needs to serialize and deserialize users to support sessions
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
  });
};