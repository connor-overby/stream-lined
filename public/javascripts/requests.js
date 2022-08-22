const axios = require('axios');

// GET FOLLOWED STREAMS
function getFollowed(userId, clientId, accessToken) {
    return new Promise((resolve, reject) => {
        axios.get(`https://api.twitch.tv/helix/streams/followed?user_id=${userId}`, {
            headers: {
                'Client-ID': clientId,
                'Authorization': 'Bearer ' + accessToken
            }
        })
            .then(result => { resolve(result.data); })
            .catch(() => { reject(); });
    });
}


// GET TOP GAMES
function getGames(numGames, clientId, accessToken) {
    return new Promise((resolve, reject) => {
        axios.get(`https://api.twitch.tv/helix/games/top?first=${numGames}`, {
            headers: {
                'Client-ID': clientId,
                'Authorization': 'Bearer ' + accessToken
            }
        })
            .then(result => { resolve(result.data); })
            .catch(() => { reject() });
    });
}


// GET FOLLOWED PROFILES
function getProfiles(ids, clientId, accessToken) {
    return new Promise((resolve, reject) => {
         axios.get(`https://api.twitch.tv/helix/users?${ids}`, {
             headers: {
                'Client-ID': clientId,
                'Authorization': 'Bearer ' + accessToken
            }
        })
            .then(result => { resolve(result.data); })
            .catch(error => { reject(error); });
    });
}


// GET GAME STREAMS
function getDirectory(gameId, clientId, accessToken) {
    return new Promise((resolve, reject) => {
        axios.get(`https://api.twitch.tv/helix/streams?game_id=${gameId}`, {
            headers: {
                'Client-ID': clientId,
                'Authorization': 'Bearer ' + accessToken
            }
        })
            .then(result => { resolve(result.data); })
            .catch(error => { reject(error); });
    });
}

// REFRESH TOKEN
function getRefresh(refreshToken, clientId, clientSecret) {
    return new Promise((resolve, reject) => {
        axios.post(`https://id.twitch.tv/oauth2/token`, {
            headers: {
                'client_id': clientId,
                'client_secret': clientSecret,
                'grant_type': 'refresh_token',
                'refresh_token': refreshToken
            }
        })
            .then(result => {
                process.env.REFRESH_TOKEN = result.refresh_token;
                console.log('REFRESH TOKEN: ' + process.env.REFRESH_TOKEN);
                process.env.ACCESS_TOKEN = result.access_token;
                console.log('ACCESS TOKEN: ' + process.env.ACCESS_TOKEN);
                resolve();
            })
            .catch(error => { reject(error); })
    })
}

module.exports = {
    getFollowed,
    getGames,
    getProfiles,
    getDirectory,
    getRefresh
}