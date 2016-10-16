var express = require('express');
var router = express.Router();

var auth = require("./../config.js").auth;

router.get("/login/", function (req, res) {
    var method = "";
    if (auth == 'aad') method = "/aad/login";
    else if (auth == "adfs") method = "/adfs/login";
    res.render("login", {
        title: 'Get a Key!', 
        method: method
    });
})

router.get("/logout/", function (req, res) {
    req.logout();
    req.session.destroy();
    res.redirect("/");
})
module.exports = router;