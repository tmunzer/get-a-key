var express = require('express');
var router = express.Router();

function validUser(req, res, next) {
    console.log("=====================");
    console.log(req);
    if (!req.session.passport.user) {
      res.redirect('/adfs/login/');
    } else next();
    
  }

router.get('/', function (req, res, next) {
        console.log("=====================");
    console.log(req);
    res.render('web-app', {
        title: 'Get a Key!',                    
    });            
});
module.exports = router;


