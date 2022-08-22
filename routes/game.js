const express = require('express');
const router = express.Router();
const { getFollowed, getDirectory, getProfiles, getRefresh } = require('../public/javascripts/requests');

router.get('/:gameId', (req, res) => {
    /* CHECK FOR VALIDATED SESSION */
    if (req.session && req.session.passport && req.session.passport.user) {
        /* RESOLVE ALL PROMISES */
        Promise.all([
            getFollowed(req.session.passport.user.data[0].id, process.env.OAUTH_CLIENT_ID, req.session.passport.user.accessToken),
            getDirectory(req.params.gameId, process.env.OAUTH_CLIENT_ID, req.session.passport.user.accessToken)])
            .then(values => {
            let followed = values[0].data;
            let directory = values[1].data;
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
                        res.render('directory', { title: directory[0].game_name, user: req.session.passport.user.data[0], followed: followed, profiles: profiles, directory: directory });
                    })
                    .catch(error => { console.log(error) })
                } else {
                    res.render('directory', { title: directory[0].game_name, user: req.session.passport.user.data[0], followed: followed, directory: directory });
                }
            })
            .catch(error => {
                if (error.response && error.response.status == 401) {
                    console.log(error.response);
                    getRefresh(process.env.REFRESH_TOKEN, process.env.OAUTH_CLIENT_ID, process.env.OAUTH_CLIENT_SECRET);
                    res.redirect(`/game/${req.params.gameId}`);
                }
                console.log(error);
            });

        /* IF SESSION NOT VALIDATED */
      } else {
        res.render('login', { title: 'Log In' });
      }
})

module.exports = router;