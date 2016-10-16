var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var xapi = require('./../config.js').aerohiveXapi;
var AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2').Strategy;

var azureOptions = require("./../config.js").azureAd;

passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use(new AzureAdOAuth2Strategy(
    azureOptions,
    function (accessToken, refresh_token, params, profile, done) {
        // currently we can't find a way to exchange access token by user info (see userProfile implementation), so
        // you will need a jwt-package like https://github.com/auth0/node-jsonwebtoken to decode id_token and get waad profile
        var waadProfile = jwt.decode(params.id_token);
        done(null, waadProfile);
    }
));

/* GET login page. */

router.get('/login',
    passport.authenticate('azure_ad_oauth2', { failureRedirect: '/', failureFlash: true })
);

/* Handle Login POST */
router.get('/callback',
    passport.authenticate('azure_ad_oauth2', { failureRedirect: '/login' }),
    function (req, res) {
        req.session.xapi = xapi;
        req.session.email = req.session.passport.user.email;
        res.redirect('/web-app/');
    }
);

/* Handle Logout */
router.get('/logout/', function (req, res) {
    console.log("User " + req.session.passport.user.upn + " is now logged out.");
    req.logout();
    req.session.destroy();
    res.redirect('/login/');
});

module.exports = router;
