/*================================================================
ADMIN:
- ACS Oauth (to authenticate administrators)
- Display Admin Web page
 ================================================================*/
var express = require('express');
var router = express.Router();
var OAuth = require("../bin/aerohive/api/oauth");
var devAccount = require('../config.js').devAccount;
var Account = require('../bin/models/account');
var Customization = require("../bin/models/customization");
var Error = require('../routes/error');

/*================================================================
 ADMIN ACS OAUTH
 ================================================================*/
// the web browser is redirected here from ACS during the OAuth process
// the ACS server will add a query parameter to send an error message or the authorization code (used to request the access token)
router.get('/oauth/reg', function (req, res) {
    // if ACS send an error message, display it
    if (req.query.error) Error.render(
        { status: 401, message: "OAuth process error. The authorization server responded " + req.query.error },
        req.originalUrl,
        req,
        res);
    // otherwise retrieve the authorization code and try to get the access token
    else if (req.query.authCode) {
        var authCode = req.query.authCode;
        OAuth.getPermanentToken(authCode, devAccount, function (data) {
            // if ACS send an error message when trying to get the access token, display it
            if (data.error) Error.render(
                { status: 401, message: "OAuth process error. The authorization didn't validated the authorization code: " + req.query.error },
                req.originalUrl,
                req,
                res);
            // otherwise
            else if (data.data) {
                // because admin can select many HMNG account (and the App can only manage one), count the number of selected accounts
                var numAccounts = 0;
                for (var owner in data.data) {
                    var account = {
                        ownerId: data.data[owner].ownerId,
                        accessToken: data.data[owner].accessToken,
                        refreshToken: data.data[owner].refreshToken,
                        vpcUrl: data.data[owner].vpcUrl.replace("https://", ""),
                        vhmId: data.data[owner].vhmId,
                        expireAt: data.data[owner].expireAt,
                        userGroupId: 0
                    };
                    numAccounts++;
                }
                // if the admin selected only one account, continue
                if (numAccounts == 1) {
                    // try to find this HMNG account in the DB to update it
                    Account.
                        findOne({ ownerId: account.ownerId, vpcUrl: account.vpcUrl, vhmId: account.vhmId })
                        .exec(function (err, accountInDb) {
                            if (err) Error.render(
                                { status: 500, message: err },
                                req.originalUrl,
                                req,
                                res);
                            // if this HMNG account is in the DB, update it
                            else if (accountInDb) {
                                accountInDb.accessToken = account.accessToken;
                                accountInDb.refreshToken = account.refreshToken;
                                accountInDb.expireAt = account.expireAt;
                                // save the updated account
                                accountInDb.save(function (err, account) {
                                    if (err) Error.render(
                                        { status: 500, message: err },
                                        req.originalUrl,
                                        req,
                                        res);
                                    else {
                                        // add the HMNG account info into the session
                                        req.session.xapi = {
                                            rejectUnauthorized: true,
                                            vpcUrl: account.vpcUrl,
                                            ownerId: account.ownerId,
                                            accessToken: account.accessToken,
                                            vhmId: account.vhmId,
                                            hmngType: "public"
                                        };
                                        req.session.account = JSON.parse(JSON.stringify(account));
                                        req.session.save(function (err) {
                                            res.redirect('/admin/');
                                        });
                                    }
                                });
                            }
                            // else create a new entry in the DB
                            else {
                                // save the new account
                                Account(account).save(function (err, account) {
                                    if (err) Error.render(
                                        { status: 500, message: err },
                                        req.originalUrl,
                                        req,
                                        res);
                                    else {
                                        // add the HMNG account info into the session
                                        req.session.xapi = {
                                            rejectUnauthorized: true,
                                            vpcUrl: account.vpcUrl,
                                            ownerId: account.ownerId,
                                            accessToken: account.accessToken,
                                            vhmId: account.vhmId,
                                            hmngType: "public"
                                        };
                                        req.session.account = JSON.parse(JSON.stringify(account));
                                        req.session.save(function (err) {
                                            res.redirect('/admin/');
                                        });
                                    }
                                });
                            }
                        });
                    // if the admin selected many HMNG account, raise an error
                } else Error.render(
                    { status: 500, message: "Please select only one Aerohive account." },
                    req.originalUrl,
                    req,
                    res);
            } else Error.render(
                { status: 500, message: "Unable to retrieve the authorization code from the authorization server" },
                req.originalUrl,
                req,
                res);
        });
    }
});

router.get('/logout/', function (req, res, next) {
    console.log("\x1b[32minfo\x1b[0m:", "Admin for ownerId " + req.session.xapi.ownerId + " is now logged out.");
    req.logout();
    req.session.destroy();
    res.redirect('/login/');
});
/*================================================================
 DASHBOARD
 ================================================================*/
// when the user try to access the admin dashboard URL
router.get('/', function (req, res, next) {
    // if a session exists (ie: if the user is authenticated)
    if (req.session.xapi)
        // display the admin page
        res.render('admin', {
            title: 'Get-a-key Parameters'
        });
    // else redirect to the login page
    else {
        res.redirect("/login/");
    }
});

// called to load the customized data (colors, logo, ...)
function getCustom(req, res, next) {
    if (!req.session.xapi && !req.session.passport) {
        res.redirect('/login/');
    } else if (req.session.account.customization)
        Customization
            .findById(req.session.account.customization)
            .exec(function (err, custom) {
                if (!err) req.custom = custom;
                next();
            });
    else next();
}

// when user wants to display the customization preview (this will call the "getCustom" function to load custom values)
router.get("/preview/", getCustom, function (req, res, next) {
    res.render('web-app', {
        title: 'Get a Key!',
        custom: req.custom
    });
});
// when user wants to see the help page
router.get('/help/:method', function (req, res, next) {
    if (req.params.method == "azureAd")
        res.render('help_azure', {
            title: 'Get-a-Key Help'
        });
    else if (req.params.method == "adfs")
        res.render('help_adfs', {
            title: 'Get-a-Key Help'
        });
    else {        
        const message = "The requested url " + req.originalUrl + " was not found on this server.";
        res.status(404);
        res.render('error', {
            status: 404,
            message: message,
            stack: {}
        });
    }
});

module.exports = router;
