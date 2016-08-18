var express = require('express');
var router = express.Router();

function validUser(req, res, next) {
    //if (!req.user) {
    //  res.redirect('http://get-a-key.ah-lab.fr:3000/adfs/');
    //} else next();
    next();
  }

router.get('/', validUser, function(req, res, next) {
    res.render('web-app', {
        title: 'Get a Key!',                    
    });            
});
module.exports = router;


