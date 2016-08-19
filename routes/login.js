var express = require('express');
var router = express.Router();

var passport = require('passport');
var SamlStrategy = require('passport-saml').Strategy;

var adfsOptions = require("./../passport/config.js").adfsOptions;

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new SamlStrategy(
  adfsOptions,
  function(profile, done) {
    return done(null,
      {
        upn: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'],
        // e.g. if you added a Group claim
        group: profile['http://schemas.xmlsoap.org/claims/Group']
    });
  }
));



/* GET login page. */
router.get('/', passport.authenticate('saml'));

/* Handle Login POST */
router.post('/postResponse', 
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    function(req, res) {
      res.redirect('/');
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
