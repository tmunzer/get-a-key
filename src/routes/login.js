var express = require('express');
var router = express.Router();

var devAccount = require("../config.js").devAccount;

var serverHostname = require("../config.js").appServer.vhost;
var Account = require("../bin/models/account");
var Customization = require("../bin/models/customization");

function getAccount(req, res, next) {
    Account
        .findById(req.params.account_id)
        .populate("azureAd")
        .populate("adfs")
        .populate("config")
        .exec(function (err, account) {
            if (err) res.render('error', { error: { message: err } });
            else if (account) {
                req.session.account = account;
                req.session.xapi = {
                    vpcUrl: account.vpcUrl,
                    accessToken: account.accessToken,
                    ownerId: account.ownerId
                };
                req.session.uurl = account._id;
                req.session.groupId = account.config.userGroupId;
                getCustom(req, next);
            } else res.redirect("/login/");
        })
}

function getCustom(req, next) {
    if (req.session.account.customization)
        Customization
            .findById(req.session.account.customization)
            .exec(function (err, custom) {
                if (!err) req.custom = custom;
                next();
            })
    else next();
}

router.get("/login/:account_id/", getAccount, function (req, res) {
    var method = "";
    if (req.session.account.azureAd) method = "/aad/" + req.params.account_id + "/login";
    else if (req.session.account.adfs) method = "/adfs/" + req.params.account_id + "/login";
    res.render("login", {
        title: 'Get a Key!',
        oauthUrl: "https://cloud.aerohive.com/thirdpartylogin?client_id=" + devAccount.clientID + "&redirect_uri=" + devAccount.redirectUrl,
        method: method,
        custom: req.custom
    });
})

router.get("/login/:account_id/callback", function (req, res) {
    res.render('error', { error: { message: "It seems the callback URL is misconfigured on your AzureAD or ADFS. Please be sure to use the callback url from the configuration interface." } });
})

router.get("/login", function (req, res) {
    res.render("login", {
        title: 'Get a Key!',
        oauthUrl: "https://cloud.aerohive.com/thirdpartylogin?client_id=" + devAccount.clientID + "&redirect_uri=" + devAccount.redirectUrl,
        method: null
    });
})
router.get("/logout/", function (req, res) {
    if (req.session.account.azureAd) {
        res.redirect("https://login.windows.net/" + req.session.account.azureAd.tenant + "/oauth2/logout?post_logout_redirect_uri=https://" + serverHostname + "/login/" + req.session.account._id + "/");
    } else res.redirect("/");
    req.logout();
    req.session.destroy();
})
module.exports = router;