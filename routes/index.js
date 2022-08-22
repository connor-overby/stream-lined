const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { getFollowed, getGames, getProfiles, getRefresh } = require('../public/javascripts/requests');

/* GET HOME */
router.get('/', (req, res) => {
    /* CHECK FOR VALIDATED SESSION */
    if (req.session && req.session.passport && req.session.passport.user) {
        /* RESOLVE ALL PROMISES */
        Promise.all([
            getFollowed(req.session.passport.user.data[0].id, process.env.OAUTH_CLIENT_ID, req.session.passport.user.accessToken),
            getGames(24, process.env.OAUTH_CLIENT_ID, req.session.passport.user.accessToken)])
            .then(values => {
            let followed = values[0].data;
            let games = values[1].data;
            let followedIds = '';
            for (let i = 0; i < followed.length; i++) {
                if (i == 0) {
                    followedIds += `id=${followed[i].user_id}`;
                } else {
                    followedIds += `&id=${followed[i].user_id}`;
                }
            }
                if (followedIds != '') {
                    getProfiles(followedIds, process.env.OAUTH_CLIENT_ID, req.session.passport.user.accessToken)
                    .then(data => {
                        let profiles = data.data;
                        res.render('index', { title: 'Home', user: req.session.passport.user.data[0], followed: followed, profiles: profiles, games: games });
                    })
                    .catch(error => { console.log(error) })
                } else {
                    res.render('index', { title: 'Home', user: req.session.passport.user.data[0], followed: followed, games: games });
                }
            })
            .catch(error => {
                if (error.response && error.response.status == 401) {
                    console.log(error.response);
                    getRefresh(process.env.REFRESH_TOKEN, process.env.OAUTH_CLIENT_ID, process.env.OAUTH_CLIENT_SECRET);
                    res.redirect('/');
                }
                console.log(error);
            });

        /* IF SESSION NOT VALIDATED */
      } else {
        res.render('login', { title: 'Log In' });
      }
});

router.get('/login', (req, res, next) => {
    res.render('login', { title: 'Log In' });
});

exports.user_create_post = (req, res) => {
    res.send('NOT IMPLEMENTED: User Create POST');
}

exports.user_update_post = (req, res) => {
    res.send('NOT IMPLEMENTED: User Update POST');
}

module.exports = router;