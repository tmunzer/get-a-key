var https = require('https');

module.exports.getPermanentToken = function(authCode, redirectUrl, clientSecret, clientID, callback){
    var options = {
        host: 'cloud.aerohive.com',
        port: 443,
        path: '/services/acct/thirdparty/accesstoken?authCode='+authCode+'&redirectUri='+redirectUrl,
        method: 'POST',
        headers: {
            'X-AH-API-CLIENT-SECRET' : clientSecret,
            'X-AH-API-CLIENT-ID':clientID,
            'X-AH-API-CLIENT-REDIRECT-URI': redirectUrl
        }
    };

    var req = https.request(options, function(res) {
        console.info('STATUS: ' + res.statusCode);
        console.info('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (data) {
            callback(JSON.parse(data));
        });
    });

    req.on('error', function(err) {
        callback(err);
    });

// write data to request body
    req.write('data\n');
    req.write('data\n');
    req.end();
};

