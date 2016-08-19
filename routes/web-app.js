var express = require('express');
var router = express.Router();

function validUser(req, res, next) {
    console.log("=====================");
    console.log(req);
    if (!req.user) {
      res.redirect('/adfs/login/');
    } else next();
    
  }

router.get('/', validUser, function(req, res, next) {
    res.render('web-app', {
        title: 'Get a Key!',                    
    });            
});
module.exports = router;


