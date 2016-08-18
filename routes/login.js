var express = require('express');
var router = express.Router();
var passport = require('passport');
require('./../passport/config.js');

/* GET login page. */
router.get('/', function (req, res) {
   passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    function(req, res) {
      res.redirect('https://get-a-key.ah-lab.fr/web-app/');
    }
});

/* Handle Login POST */
router.post('/postResponse', 
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    function(req, res) {
      res.redirect('https://get-a-key.ah-lab.fr');
    }
);

/* Handle Logout */
router.get('/logout/', function (req, res) {
    logger.info("User " + req.user.username + " is now logged out.");
    req.logout();
    req.session.destroy();
    res.redirect('/login/');
});


module.exports = router;
