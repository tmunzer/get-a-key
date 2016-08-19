var express = require('express');
var router = express.Router();

function validUser(req, res, next) {
    if (!req.session.passport) {
      res.redirect('/adfs/login/');
    } else next();
  }

router.get('/', validUser, function (req, res, next) {
    res.render('web-app', {
        title: 'Get a Key!',                    
    });            
});
module.exports = router;


