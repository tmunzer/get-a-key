var express = require('express');
var router = express.Router();

var xapi = require('../config.js').aerohiveXapi;
var SamlStrategy = require('passport-saml').Strategy;

var adfsOptions = require("../config.js").adfs;

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
    .exec(function (err, result) {
      if (err) res.status(500).json({ error: err });
      else {
        req.account = result;
        passport.use(new SamlStrategy(
          adfsOptions,
          function (profile, done) {
            return done(null,
              {
                upn: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'],
                // e.g. if you added a Group claim
                group: profile['http://schemas.xmlsoap.org/claims/Group']
              });
          }
        ));
        next();
      }
    })
}

/* GET login page. */

router.get('/:account_id/login', getAccount,
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true })
);

/* Handle Login POST */
router.post('/postResponse', getAccount,
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
  function (req, res) {
    req.session.xapi = xapi;
    req.session.email = req.session.passport.user.upn;
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
