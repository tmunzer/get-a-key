var
  fs = require('fs')
  , passport = require('passport')
  , SamlStrategy = require('passport-saml').Strategy
;

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new SamlStrategy(
  {
    entryPoint: 'https://dc.ah-lab.fr/adfs/ls/',
    issuer: 'get-a-key.ah-lab.fr',
    callbackUrl: 'https://get-a-key.ah-lab.fr/adfs/postResponse',
    privateCert: fs.readFileSync('./../certs/get_a_key.ah_lab.fr.key', 'utf-8'),
    cert: fs.readFileSync('./../certs/get_a_key.ah_lab.fr.cert', 'utf-8'),
  // other authn contexts are available e.g. windows single sign-on
    authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password',
  // not sure if this is necessary?
    acceptedClockSkewMs: -1,
    identifierFormat: null,
  // this is configured under the Advanced tab in AD FS relying party
    signatureAlgorithm: 'sha256'
  },
  function(profile, done) {
    return done(null,
      {
        upn: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'],
        // e.g. if you added a Group claim
        group: profile['http://schemas.xmlsoap.org/claims/Group']
    });
  }
));

module.exports = passport;