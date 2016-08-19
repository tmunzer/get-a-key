var fs = require('fs');

module.exports.adfsOptions = {
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
};