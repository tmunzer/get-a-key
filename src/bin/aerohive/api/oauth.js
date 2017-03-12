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
        console.info('\x1b[34mREQUEST QUERY\x1b[0m:', options.path);
        console.info('\x1b[34mREQUEST STATUS\x1b[0m:',res.statusCode);
        res.setEncoding('utf8');
        res.on('data', function (data) {
            callback(JSON.parse(data));
        });
    });

    req.on('error', function(err) {
        console.error("\x1b[31mREQUEST QUERY\x1b[0m:", options.path);
        console.error("\x1b[31mREQUEST ERROR\x1b[0m:", JSON.stringify(err));
        callback(err, null);
    });

// write data to request body
    req.write('data\n');
    req.end();
};

