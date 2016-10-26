var express = require('express');
var router = express.Router();

var config = require("./../config.js");

var Account = require("./../bin/models/account");

function getAccount(req, res, next) {
    Account
        .findById(req.params.account_id)
        .populate("azureAd")
        .exec(function (err, result) {
            if (err) res.render('error', { error: { message: err } });
            else {
                req.session.account = result;
                req.session.xapi = {
                    vpcUrl: result.vpcUrl,
                    accessToken: result.accessToken,
                    ownerId: result.ownerId
                };
                req.session.uurl = result._id;
                req.session.groupId = result.azureAd.userGroup;
                next();
            }
        })
}

router.get("/login/:account_id/", getAccount, function (req, res) {
    var method = "";
    if (req.session.account.azureAd) method = "/aad/" + req.params.account_id + "/login";
    else if (req.session.account.adfs) method = "/adfs/" + req.params.account_id + "/login";
    res.render("login", {
        title: 'Get a Key!',
        oauthUrl: "https://cloud.aerohive.com/thirdpartylogin?client_id=" + config.aerohiveApp.clientID + "&redirect_uri=" + config.aerohiveApp.redirectUrl,
        method: method
    });
})

router.get("/login", function (req, res) {
    res.render("login", {
        title: 'Get a Key!',
        oauthUrl: "https://cloud.aerohive.com/thirdpartylogin?client_id=" + config.aerohiveApp.clientID + "&redirect_uri=" + config.aerohiveApp.redirectUrl,
        method: null
    });
})
router.get("/logout/", function (req, res) {
    if (req.session.account.azureAd) {
        res.redirect("https://login.windows.net/" + req.session.account.azureAd.tenant + "/oauth2/logout?post_logout_redirect_uri=" + req.session.account.azureAd.logoutURL);
    } else res.redirect("/");
    req.logout();
    req.session.destroy();
    console.lgo(req.session);
})
module.exports = router;