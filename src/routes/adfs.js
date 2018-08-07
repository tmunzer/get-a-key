var express = require('express');
var router = express.Router();

var Account = require("../bin/models/account");
var xapi = require('../config.js').aerohiveXapi;
var vhost = require("../config").appServer.vhost;
var SamlStrategy = require('passport-saml').Strategy;
var fs = require('fs');

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

function getAccount(req, res, next) {
  Account
    .findById(req.params.account_id)
    .populate("adfs")
    .exec(function (err, account) {
      if (err) res.status(500).json({ error: err });
      else {
        req.account = account;
       passport.use(new SamlStrategy(
          {
            entryPoint: account.adfs.entryPoint,
            issuer: req.params.account_id+"."+vhost,
            callbackUrl: 'https://' + vhost + '/adfs/' + req.params.account_id + '/postResponse',
            privateCert: fs.readFileSync('../certs/' + req.params.account_id+"."+vhost + '.key', 'utf-8'),
            cert: account.adfs.certs,
            // other authn contexts are available e.g. windows single sign-on
            authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password',
            // not sure if this is necessary?
            acceptedClockSkewMs: -1,
            identifierFormat: null,
            // this is configured under the Advanced tab in AD FS relying party
            signatureAlgorithm: 'sha256',
            //forceAuthn: true,
            additionalParams: {}
          },
          function (profile, done) {
            return done(null,
              {
                email: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                upn: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn']
                // e.g. if you added a Group claim
                // group: profile['http://schemas.xmlsoap.org/claims/Group']
              });
          }
        ));
        next();
      }
    });
}

/* GET login page. */

router.get('/:account_id/login', getAccount,
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true })
);

/* Handle Login POST */
router.post('/:account_id/postResponse', getAccount,
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
  function (req, res) {
    if (req.user.email) req.session.email = req.user.email;
    else if (req.user.upn) req.session.email = req.user.upn;
    else req.session.email = "unknown";
    console.info("\x1b[32minfo\x1b[0m:", 'User ' + req.session.email + ' logged in');    
    res.redirect('/web-app/');
  }
);

/* Handle Logout */
router.get('/:account_id/logout/', function (req, res) {
  if (req.session.user) console.log("User " + req.session.passport.user.upn + " is now logged out.");
  else console.log('user logged out.');
  req.logout();
  req.session.destroy();
  res.redirect('/login/'+req.params.account_id);
});

module.exports = router;
