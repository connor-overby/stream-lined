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
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const User = require('./models/user');


// EXPRESS
var app = express();
app.use(session({ secret: crypto.randomBytes(20).toString("hex"), store: MongoStore.create({mongoUrl: process.env.MONGODB_URL}), resave: false, saveUninitialized: false }));
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', indexRouter);
app.use('/game', gameRouter);


// VIEWS
app.set('views', 'views');
app.set('view engine', 'pug');

// MONGOOSE
const mongoDB = process.env.MONGODB_URL;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB Connection Error: '));


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
    process.env.ACCESS_TOKEN = accessToken;
    process.env.REFRESH_TOKEN = refreshToken;
    const user = await User.findOneAndUpdate({ id: profile.data[0].id }, {
      id: profile.data[0].id,
      name: profile.data[0].display_name,
      pfp: profile.data[0].profile_image_url,
      type: profile.data[0].broadcaster_type
    }, {
      new: true,
      upsert: true
    });
    done(null, profile);
  }
));


// AUTHORIZE
app.get('/auth/twitch', passport.authenticate('twitch', { scope: 'user_read user:read:follows' }));

// CALLBACK
app.get('/auth/twitch/callback', passport.authenticate('twitch', { successRedirect: '/', failureRedirect: '/login' }));

module.exports = app;
