var express = require('express');
var router = express.Router();
var getAzureAdAccount = require("../bin/azureAd");



/* GET login page. */
router.get('/:account_id/login', getAzureAdAccount,
    passport.authenticate('azure_ad_oauth2', { failureRedirect: '/', failureFlash: true })
);

/* Handle Login POST */
router.get('/:account_id/callback', getAzureAdAccount,
    passport.authenticate('azure_ad_oauth2', { failureRedirect: '/login' }),
    function (req, res) {
        if (req.session.passport.user.email) req.session.email = req.session.passport.user.email;
        else req.session.email = req.session.passport.user.upn;
        console.info("\x1b[32minfo\x1b[0m:", 'User ' + req.session.email + ' logged in');
        res.redirect('/web-app/');
    }
);

/* Handle Logout */
router.get('/:account_id/logout/', function (req, res) {
    console.log("\x1b[32minfo\x1b[0m:", "User " + req.session.email + " is now logged out.");
    req.logout();
    req.session.destroy();
    res.redirect('/login/:account_id/');
});

module.exports = router;
