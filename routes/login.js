var express = require('express');
var router = express.Router();

/* GET login page. */

  router.get('/',
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    function(req, res) {
      res.redirect('/web-app/');
    }
);
  
/* Handle Login POST */
router.post('/postResponse', 
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    function(req, res) {
      res.redirect('/web-app/');
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
