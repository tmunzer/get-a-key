var https = require('https');
var devAccount = require("../../../config.js").devAccount;


module.exports.GET = function (xapi, path, callback) {
    var rejectUnauthorized = true;
    if (xapi.rejectUnauthorized) rejectUnauthorized = xapi.rejectUnauthorized;

    var options = {
        rejectUnauthorized: rejectUnauthorized,
        host: xapi.vpcUrl,
        port: 443,
        path: path,
        method: "GET",
        headers: {
            'X-AH-API-CLIENT-SECRET': devAccount.clientSecret,
            'X-AH-API-CLIENT-ID': devAccount.clientID,
            'X-AH-API-CLIENT-REDIRECT-URI': devAccount.redirectUrl,
            'Authorization': "Bearer " + xapi.accessToken
        }
    };
    httpRequest(options, callback);
};

module.exports.POST = function (xapi, path, data, callback) {
    var rejectUnauthorized = true;
    if (xapi.rejectUnauthorized) rejectUnauthorized = xapi.rejectUnauthorized;
    var options = {
        rejectUnauthorized: rejectUnauthorized,
        host: xapi.vpcUrl,
        port: 443,
        path: path,
        method: "POST",
        headers: {
            'X-AH-API-CLIENT-SECRET': devAccount.clientSecret,
            'X-AH-API-CLIENT-ID': devAccount.clientID,
            'X-AH-API-CLIENT-REDIRECT-URI': devAccount.redirectUrl,
            'Authorization': "Bearer " + xapi.accessToken,
            'Content-Type': 'application/json'
        }
    };
    var body = JSON.stringify(data);
    httpRequest(options, callback, body);
};
module.exports.PUT = function (xapi, path, callback) {
    var rejectUnauthorized = true;
    if (xapi.rejectUnauthorized) rejectUnauthorized = xapi.rejectUnauthorized;
    var options = {
        rejectUnauthorized: rejectUnauthorized,
        host: xapi.vpcUrl,
        port: 443,
        path: path,
        method: "PUT",
        headers: {
            'X-AH-API-CLIENT-SECRET': devAccount.clientSecret,
            'X-AH-API-CLIENT-ID': devAccount.clientID,
            'X-AH-API-CLIENT-REDIRECT-URI': devAccount.redirectUrl,
            'Authorization': "Bearer " + xapi.accessToken,
            'Content-Type': 'application/json'
        }
    };
    httpRequest(options, callback);
};
module.exports.DELETE = function (xapi, path, callback) {
    var rejectUnauthorized = true;
    if (xapi.rejectUnauthorized) rejectUnauthorized = xapi.rejectUnauthorized;
    var options = {
        rejectUnauthorized: rejectUnauthorized,
        host: xapi.vpcUrl,
        port: 443,
        path: path,
        method: "DELETE",
        headers: {
            'X-AH-API-CLIENT-SECRET': devAccount.clientSecret,
            'X-AH-API-CLIENT-ID': devAccount.clientID,
            'X-AH-API-CLIENT-REDIRECT-URI': devAccount.redirectUrl,
            'Authorization': "Bearer " + xapi.accessToken
        }
    };
    httpRequest(options, callback);
};

function httpRequest(options, callback, body){
    var result = {};
    result.request = {};
    result.result = {};

    result.request.options = options;
    var req = https.request(options, function (res) {
        result.result.status = res.statusCode;
        console.info('STATUS: ' + result.result.status);
        result.result.headers = JSON.stringify(res.headers);
        console.info('HEADERS: ' + result.result.headers);
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            if (data != '') {
                var dataJSON = JSON.parse(data);
                result.data = dataJSON.data;
                result.error = dataJSON.error;
            }
            switch (result.result.status) {
                case 200:
                    callback(null, result.data);
                    break;
                default:
                    var error = {};
                    if (result.error.status) error.status = result.error.status;
                    else error.status = result.result.status;
                    if (result.error.message) error.message = result.error.message;
                    else error.message = result.error;
                    if (result.error.code) error.code = result.error.code;
                    else error.code = "";
                    callback(error, result.data);
                    break;

            }
        });
    });
    req.on('error', function (err) {
        console.log(err);
        callback(err, null);
    });


// write data to request body
    req.write(body + '\n');
    req.end();


}