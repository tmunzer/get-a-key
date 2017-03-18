var express = require('express');
var router = express.Router();
var OAuth = require("../bin/aerohive/api/oauth");
var devApp = require('../config.js').devAccount;

var Account = require('../bin/models/account');
var Customization = require("../bin/models/customization");

var Error = require('../routes/error');
/*================================================================
 ADMIN ACS OAUTH
 ================================================================*/
router.get('/oauth/reg', function (req, res) {
    if (req.query.error) Error.render(
        { status: 401, message: "OAuth process error. The authorization server responded " + req.query.error },
        req.originalUrl,
        req,
        res);
    else if (req.query.authCode) {
        var authCode = req.query.authCode;
        OAuth.getPermanentToken(authCode, devApp.redirectUrl, devApp.clientSecret, devApp.clientID, function (data) {
            if (data.error) Error.render(
                { status: 401, message: "OAuth process error. The authorization didn't validated the authorization code: " + req.query.error },
                req.originalUrl,
                req,
                res);
            else if (data.data) {
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
                    }
                    numAccounts++;
                }
                if (numAccounts == 1) {
                    Account.
                        findOne({ ownerId: account.ownerId, vpcUrl: account.vpcUrl, vhmId: account.vhmId })
                        .exec(function (err, accountInDb) {
                            if (err) Error.render(
                                { status: 500, message: err },
                                req.originalUrl,
                                req,
                                res);
                            else if (accountInDb) {
                                accountInDb.accessToken = account.accessToken;
                                accountInDb.refreshToken = account.refreshToken;
                                accountInDb.expireAt = account.expireAt;
                                accountInDb.save(function (err, account) {
                                    if (err) Error.render(
                                        { status: 500, message: err },
                                        req.originalUrl,
                                        req,
                                        res);
                                    else {
                                        req.session.xapi = {
                                            rejectUnauthorized: true,
                                            vpcUrl: account.vpcUrl,
                                            ownerId: account.ownerId,
                                            accessToken: account.accessToken,
                                            vhmId: account.vhmId,
                                            hmngType: "public"
                                        };
                                        req.session.account = account;
                                        res.redirect('/admin/');
                                    }
                                })
                            }
                            else {
                                Account(account).save(function (err, account) {
                                    if (err) Error.render(
                                        { status: 500, message: err },
                                        req.originalUrl,
                                        req,
                                        res);
                                    else {
                                        req.session.xapi = {
                                            rejectUnauthorized: true,
                                            vpcUrl: account.vpcUrl,
                                            ownerId: account.ownerId,
                                            accessToken: account.accessToken,
                                            vhmId: account.vhmId,
                                            hmngType: "public"
                                        };
                                        req.session.account = account;
                                        res.redirect('/admin/');
                                    }
                                })
                            }
                        })

                } else Error.render(
                    { status: 500, message: "unable to save data..." },
                    req.originalUrl,
                    req,
                    res);
            } else Error.render(
                { status: 500, message: "Unable to retrieve the authorization code from the authorization server" },
                req.originalUrl,
                req,
                res);
        });
    };
});

router.get("/logout/", function (req, res) {
    req.logout();
    req.session.destroy();
    res.redirect("/");
})
/*================================================================
 DASHBOARD
 ================================================================*/
router.get('/', function (req, res, next) {
    if (req.session.xapi)
        res.render('admin', {
            title: 'Get-a-key Parameters'
        });
    else {
        res.redirect("/login/");
    }
});

function getCustom(req, res, next) {
    if (!req.session.xapi && !req.session.passport) {
        res.redirect('/login/');
    } else if (req.session.account.customization)
        Customization
            .findById(req.session.account.customization)
            .exec(function (err, custom) {
                if (!err) req.custom = custom;
                next();
            })
    else next();
}
router.get("/preview/", getCustom, function (req, res, next) {
    res.render('web-app', {
        title: 'Get a Key!',
        custom: req.custom
    });
})
router.get('/help/', function (req, res, next) {
    res.render('help', {
        title: 'Get-a-Key Help'
    });
});
router.get('/logout/', function (req, res, next) {
    console.log("\x1b[32minfo\x1b[0m:", "User " + req.session.passport.user.upn + " is now logged out.");
    req.logout();
    req.session.destroy();
    res.redirect('/login/');
});
module.exports = router;
