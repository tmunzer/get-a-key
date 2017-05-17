const https = require('https');
const qs = require("querystring");

/**
 * HTTP GET Request
 * @param {String} authCode - Code sent by ACS during OAuth process
 * @param {Object} devAccount - information about the Aerohive developper account to user
 * @param {String} devAccount.clientID - Aerohive Developper Account ClientID
 * @param {String} devAccount.clientSecret - Aerohive Developper Account secret
 * @param {String} devAccount.redirectUrl - Aerohive Developper Account redirectUrl
 *  */
module.exports.getPermanentToken = function (authCode, devAccount, callback) {
    const options = {
        host: 'cloud.aerohive.com',
        port: 443,
        path: '/services/acct/thirdparty/accesstoken?authCode='+authCode+'&redirectUri='+devAccount.redirectUrl,
        method: 'POST',
        headers: {
            'X-AH-API-CLIENT-SECRET' : devAccount.clientSecret,
            'X-AH-API-CLIENT-ID': devAccount.clientID,
            'X-AH-API-CLIENT-REDIRECT-URI': devAccount.redirectUrl
        }
    };

    req(options, "\n", callback);
};

/**
 * HTTP GET Request
 * @param {String} accessToken - HMNG API access_token to refresh
 * @param {String} refreshToken - HMNG API refresh code 
 * @param {Object} devAccount - information about the Aerohive developper account to user
 * @param {String} devAccount.clientID - Aerohive Developper Account ClientID
 * @param {String} devAccount.clientSecret - Aerohive Developper Account secret
 * @param {String} devAccount.redirectUrl - Aerohive Developper Account redirectUrl
 *  */
module.exports.refreshToken = function (refreshToken, devAccount, callback) {
    const options = {
        host: 'cloud.aerohive.com',
        port: 443,
        path: '/services/oauth2/token',
        method: 'POST',
        headers: {
            'content-type': "application/x-www-form-urlencoded",
            "cache-control": "no-cache"
        }
    };
    const body = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_secret: devAccount.clientSecret,
        client_id: devAccount.clientID
    };
    req(options, qs.stringify(body), callback);
}

function req(options, body, callback) {
    let chunks = [];
    const req = https.request(options, function (res) {
        console.info('\x1b[34mREQUEST QUERY\x1b[0m:', options.path);
        console.info('\x1b[34mREQUEST STATUS\x1b[0m:', res.statusCode);
        res.setEncoding('utf8');
        res.on('data', function (data) {
            callback(JSON.parse(data));
        });
    });

    req.on('error', function (err) {
        console.error("\x1b[31mREQUEST QUERY\x1b[0m:", options.path);
        console.error("\x1b[31mREQUEST ERROR\x1b[0m:", JSON.stringify(err));
        callback(err, null);
    });

    // write data to request body
    req.write(body);
    req.end();
}