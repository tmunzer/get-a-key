const jwt = require('jsonwebtoken');
const AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2').Strategy;
const Account = require("../bin/models/account");
const https = require('https');

passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});


function getUserDetails(organization, oid, access_token, callback) {
    const path = "/" + organization + "/users/" + oid + "?api-version=1.6";
    const options = {
        host: "graph.windows.net",
        port: 443,
        path: path,
        method: "GET",
        headers: {
            'Authorization': "Bearer " + access_token
        }
    };
    let result = {};
    result.request = {};
    result.result = {};

    result.request.options = options;
    const req = https.request(options, function (res) {
        result.result.status = res.statusCode;
        console.info('\x1b[34mREQUEST QUERY\x1b[0m:', options.path);
        console.info('\x1b[34mREQUEST STATUS\x1b[0m:', result.result.status);
        result.result.headers = JSON.stringify(res.headers);
        res.setEncoding('utf8');
        let data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            let dataJSON;
            if (data != '') {
                if (data.length > 400) console.info("\x1b[34mRESPONSE DATA\x1b[0m:", data.substr(0, 400) + '...');
                else console.info("\x1b[34mRESPONSE DATA\x1b[0m:", data);
                dataJSON = JSON.parse(data);
            }
            switch (result.result.status) {
                case 200:
                    callback(null, dataJSON);
                    break;
                default:
                    let error = {};
                    if (result.error.status) error.status = result.result.status;
                    else error.status = result.result.status;
                    if (dataJSON.odata.error.message) error.message = dataJSON.odata.error.message;
                    else error.message = result.error;
                    if (dataJSON.odata.error.code) error.code = dataJSON.odata.error.code;
                    else error.code = "";
                    console.error("\x1b[31mRESPONSE ERROR\x1b[0m:", JSON.stringify(error));
                    callback(error, null);
                    break;

            }
        });
    });
    req.on('error', function (err) {
        console.error("\x1b[31mREQUEST QUERY\x1b[0m:", options.path);
        console.error("\x1b[31mREQUEST ERROR\x1b[0m:", JSON.stringify(err));
        callback(err, null);
    });

    // write data to request body
    req.write('\n');
    req.end();
}

function checkIfExternalUser(organization, oid, access_token, callback) {
    getUserDetails(organization, oid, access_token, function (err, user) {
        if (err) console.log(err);
        else {
            callback(user.userType == "Guest", user.mail);
        }
    })
}
function renderError(error, user, req, res) {
    if (error == "external") {
        console.error("\x1b[31mERROR\x1b[0m:", "User " + user + " is not allowed to access to this network because the account is an external account");
        res.status(401).render("error_azureAd", {
            user: user
        });
    }
}

module.exports = function (req, res, next) {
    if (req.query.error) {
        console.error("\x1b[31mERROR\x1b[0m:", "AzureAD error: " + req.query.error);
        if (req.query.error_description) console.error("\x1b[31mERROR\x1b[0m:", "AzureAD message: " + req.query.error_description.replace(/\+/g, " "));
        res.render('error', {
            status: req.query.error,
            message: req.query.error_description.replace(/\+/g, " ")
        });
    } else Account
        .findById(req.params.account_id)
        .populate("azureAd")
        .exec(function (err, account) {
            if (err) res.status(500).json({ error: err });
            else if (!account) res.status(500).json({ error: "unknown error" });
            else {
                req.account = account;
                passport.use(new AzureAdOAuth2Strategy(
                    account.azureAd,
                    function (accessToken, refresh_token, params, profile, done) {
                        // currently we can't find a way to exchange access token by user info (see userProfile implementation), so
                        // you will need a jwt-package like https://github.com/auth0/node-jsonwebtoken to decode id_token and get waad profile
                        var waadProfile = jwt.decode(params.id_token);
                        console.log("==========");
                        console.log(params);
                        console.log(profile);
                        console.log(waadProfile);
                        if (account.azureAd.allowExternalUsers) done(null, waadProfile);
                        else checkIfExternalUser(account.azureAd.tenant, waadProfile.oid, params.access_token, function (isExternal, email) {
                            if (isExternal) renderError("external", email, req, res);
                            else done(null, waadProfile);
                        })
                    }
                ));
                next();
            }
        })
}