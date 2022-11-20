// DEPENDENCIES
var express = require('express');
const indexRouter = require('./routes/index');
const gameRouter = require('./routes/game');
const dotenv = require('dotenv').config();
var session = require('express-session');
var crypto = require('crypto');
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var request = require('request');
const User = require('./models/user');


// EXPRESS
var app = express();
app.use(session({ secret: crypto.randomBytes(20).toString("hex"), resave: false, saveUninitialized: false }));
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', indexRouter);
app.use('/game', gameRouter);


// VIEWS
app.set('views', 'views');
app.set('view engine', 'pug');


// OAUTH2 USER PROTOTYPE
OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
  var options = {
    url: 'https://api.twitch.tv/helix/users',
    method: 'GET',
    headers: {
      'Client-ID': process.env.OAUTH_CLIENT_ID,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Authorization': 'Bearer ' + accessToken
    }
  };

  request(options, function (error, response, body) {
    if (response && response.statusCode == 200) {
      done(null, JSON.parse(body));
    } else {
      done(JSON.parse(body));
    }
  });
}

// SAVE USER
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});


// OAUTH2 STRATEGY
passport.use('twitch', new OAuth2Strategy({
  authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
  tokenURL: 'https://id.twitch.tv/oauth2/token',
  clientID: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  callbackURL: process.env.OAUTH_REDIRECT_URL,
  state: true
},
  async (accessToken, refreshToken, profile, done) => {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    done(null, profile);
  }
));


// AUTHORIZE
app.get('/auth/twitch', passport.authenticate('twitch', { scope: 'user_read user:read:follows' }));

// CALLBACK
app.get('/auth/twitch/callback', passport.authenticate('twitch', { successRedirect: '/', failureRedirect: '/login' }));

module.exports = app;
