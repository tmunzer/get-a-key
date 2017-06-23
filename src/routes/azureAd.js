/*================================================================
AZUREAD:
deals with azure authentication for users
the req param "account_id" in the URL is used to identify the app account (so the Azure configuration)
================================================================*/
var express = require('express');
var router = express.Router();
var getAzureAdAccount = require("../bin/azureAd");

/*================================================================
 USER AZURE OAUTH
 ================================================================*/
/* GET login page. Passport will redirect to Azure authentication page */
router.get('/:account_id/login', getAzureAdAccount,
    passport.authenticate('azure_ad_oauth2', { failureRedirect: '/', failureFlash: true })
);

/* GET callback page. Azure is sending the Authorizaton Code. Passport will deal with that */
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
    res.redirect('/login/'+req.params.account_id);
});

module.exports = router;
