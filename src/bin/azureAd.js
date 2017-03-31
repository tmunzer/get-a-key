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
    req(options, callback);
}
function getUserGroups(organization, oid, access_token, callback) {
    const path = "/" + organization + "/users/" + oid + "/memberOf?api-version=1.6";
    const options = {
        host: "graph.windows.net",
        port: 443,
        path: path,
        method: "GET",
        headers: {
            'Authorization': "Bearer " + access_token
        }
    };
    req(options, callback);
}
function req(options, callback) {
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


function checkUserAccount(azureAccount, oid, params, callback) {
    getUserDetails(azureAccount.tenant, oid, params.access_token, function (err, user) {
        console.log(user);
        if (err) console.log(err);
        else if (!azureAccount.allowExternalUsers && user.userType != "Member")
            callback("external", user.mail);
        else if (azureAccount.userGroupsFilter && params.scope.indexOf("Directory.AccessAsUser.All") < 0)
            callback("permissions", user.mail);
        else if (azureAccount.userGroupsFilter)
            getUserGroups(azureAccount.tenant, oid, params.access_token, function (err, memberOf) {
                let isMemberOf = false;
                const userGroups = [];
                azureAccount.userGroups.forEach(function(group){
                    userGroups.push(group.toLowerCase());
                })
                memberOf.value.forEach(function (group) {
                    if (group.objectType == "Group" && userGroups.indexOf(group.displayName.toLowerCase()) > -1) isMemberOf = true;
                })
                if (isMemberOf) callback(null, user.mail);
                else callback("memberOf", user.mail);
            });
        else callback(null, user.mail);
    });
}
function renderError(error, user, req, res) {
    let message;
    if (error == "external")
        message = "User " + user + " is not allowed to access to this network because the account is an external account";
    else if (error == "memberOf")
        message = "User " + user + " does not belong to the required user groups";
    else if (error == "permissions")
        message = "Unable to retrieve memberOf information for user " + user + ". Please check the application permission in your Azure portal.";
    console.error("\x1b[31mERROR\x1b[0m:", message);
    res.status(401).render("error_azureAd", {
        exeption: error,
        user: user
    });
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
                        checkUserAccount(account.azureAd, waadProfile.oid, params, function (error, email) {
                            if (error) renderError(error, email, req, res);
                            else done(null, waadProfile);
                        })
                    }
                ));
                next();
            }
        })
}