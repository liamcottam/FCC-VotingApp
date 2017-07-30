const crypto = require('crypto');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

const User = require('../models/User');

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_KEY,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: process.env.CALLBACK_URL,
},
  function (accessToken, refreshToken, profile, done) {
    User.findOne({ github_id: profile.id }, (err, user) => {
      console.log(user);
      if (!user) {
        const username = crypto.randomBytes(64).toString('hex');
        const password = crypto.randomBytes(64).toString('hex');
        var user = new User({
          username: username,
          password_hash: password,
          github_id: profile.id,
          display_name: (profile.displayName) ? profile.displayName.split(' ')[0] : profile.username
        });
        user.save().then(() => {
          done(null, user);
        }).catch(err => done(err));
      } else {
        done(null, user);
      }
    });
  }
));

module.exports = passport;
