const https = require('https');
const qs = require("querystring");

module.exports.getPermanentToken = function (authCode, redirectUrl, clientSecret, clientId, callback) {
    const options = {
        host: 'cloud.aerohive.com',
        port: 443,
        path: '/services/acct/thirdparty/accesstoken?authCode=' + authCode + '&redirectUri=' + redirectUrl,
        method: 'POST',
        headers: {
            'X-AH-API-CLIENT-SECRET': clientSecret,
            'X-AH-API-CLIENT-ID': clientId,
            'X-AH-API-CLIENT-REDIRECT-URI': redirectUrl,
            "cache-control": "no-cache",
        }
    };

    req(options, "\n", callback);
};

module.exports.refreshToken = function (accessToken, refreshToken, clientSecret, clientId, callback) {
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
        client_secret: clientSecret,
        client_id: clientId
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