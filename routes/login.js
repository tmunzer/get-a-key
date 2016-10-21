var express = require('express');
var router = express.Router();

var config = require("./../config.js");
var auth = config.auth;

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
    if (auth == 'aad') {
        res.redirect("https://login.windows.net/" + config.azureAd.tenant + "/oauth2/logout?post_logout_redirect_uri=" + config.azureAd.logoutURL);
    } else res.redirect("/");
})
module.exports = router;