var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var xapi = require('../config.js').aerohiveXapi;
var AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2').Strategy;

//var azureOptions = require("../config.js").azureAd;

var Account = require("../bin/models/account");


passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});


function getAccount(req, res, next) {
    Account
        .findById(req.params.account_id)
        .populate("azureAd")
        .exec(function (err, account) {
            if (err) res.status(500).json({ error: err });
            else if (!account) res.status(500).json({ error: "unknown error" });
            else {
                console.log(account);
                req.account = account;
                passport.use(new AzureAdOAuth2Strategy(
                    account.azureAd,
                    function (accessToken, refresh_token, params, profile, done) {
                        // currently we can't find a way to exchange access token by user info (see userProfile implementation), so
                        // you will need a jwt-package like https://github.com/auth0/node-jsonwebtoken to decode id_token and get waad profile
                        var waadProfile = jwt.decode(params.id_token);
                        done(null, waadProfile);
                    }
                ));
                next();
            }
        })
}
/* GET login page. */

router.get('/:account_id/login', getAccount,
    passport.authenticate('azure_ad_oauth2', { failureRedirect: '/', failureFlash: true })
);

/* Handle Login POST */
router.get('/:account_id/callback', getAccount,
    passport.authenticate('azure_ad_oauth2', { failureRedirect: '/login' }),
    function (req, res) {
        if (req.session.passport.user.email) req.session.email = req.session.passport.user.email;
        else req.session.email = req.session.passport.user.upn;
        res.redirect('/web-app/');
    }
);

/* Handle Logout */
router.get('/:account_id/logout/', function (req, res) {
    console.log("User " + req.session.passport.user.upn + " is now logged out.");
    req.logout();
    req.session.destroy();
    res.redirect('/login/:account_id/');
});

module.exports = router;
