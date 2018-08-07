/*================================================================
API:
Deal with all the web browser API call:
- users (to create/delete/... keys)
- admins (to retrieve/save the app parameters)
 ================================================================*/
var express = require('express');
var router = express.Router();
var serverHostname = require("../config.js").appServer.vhost;
var Account = require("../bin/models/account");
var Azure = require("../bin/models/azureAd");
var Adfs = require("../bin/models/adfs");
var fs = require('fs');
var exec = require('child_process').exec;

/*================================================================
 FUNCTIONS
 ================================================================*/
// Generate x509 certificate for ADFS 
function genCertificate(account_id) {
    var files = [
        global.appPath + "/certs/" + account_id + "." + serverHostname + ".cert",
        global.appPath + "/certs/" + account_id + "." + serverHostname + ".key",
        global.appPath + "/certs/" + account_id + "." + serverHostname + ".xml"
    ];
    done = 0;
    var error;
    var cmd = global.appPath + '/bin/generate_app_certificate.sh ' + account_id + "." + serverHostname + ' https://' + serverHostname + "/adfs/" + account_id + '/ ' + global.appPath + '/certs/';

    for (var i = 0; i < files.length; i++)
        fs.access(files[i], fs.F_OK, function (err) {
            done++;
            if (err) error = err;
            if (done == files.length)
                if (!error) console.log("ADFS Ceritificates for " + serverHostname + "/" + account_id + " present.");
                else {
                    exec(cmd, {
                        cwd: global.appPath + '/certs/'
                    }, function (error, stdout, stderr) {
                        if (error) {
                            console.log(error);
                            console.log(stderr);
                            console.log(stdout);
                        } else {
                            console.log("ADFS Certificates created for " + serverHostname + "/" + account_id);
                            i = files.length;
                        }
                    });
                }
        });
}



/*==================  AZUREAD   ===========================*/
// Function to save the AzureAD configuration
function saveAzureAd(req, res) {
    // retrieve the current Account in the DB
    Account
        .findById(req.session.account._id)
        .populate("azureAd")
        .exec(function (err, account) {
            if (err) res.status(500).json({
                error: err
            });
            else if (account) {
                // if the current account already has a AzureAd configuration
                if (account.azureAd)
                    // update it
                    azureAd.update({
                        _id: account.azureAd
                    }, req.body.config, function (err, result) {
                        if (err) res.status(500).json({
                            error: err
                        });
                        else res.status(200).json({
                            action: "save",
                            status: 'done',
                            result: result
                        });
                    });
                // if the current account has no AzureAd aconfiguration, create it
                else azureAd(req.body.config).save(function (err, result) {
                    if (err) res.status(500).json({
                        error: err
                    });
                    else {
                        account.azureAd = result;
                        account.adfs = null;
                        account.save(function (err, result) {
                            if (err) res.status(500).json({
                                error: err
                            });
                            else res.status(200).json({
                                action: "save",
                                status: 'done',
                                result: result
                            });
                        });
                    }
                });
            } else res.status(500).json({
                error: "not able to retrieve the account"
            });
        });
}

/*==================  ADFS   ===========================*/
// Function to save the ADFS configuration
function saveAdfs(req, res) {
    // retrieve the current Account in the DB
    Account
        .findById(req.session.account._id)
        .populate("adfs")
        .exec(function (err, account) {
            if (err) res.status(500).json({
                error: err
            });
            else if (account) {
                // if the current account already has a ADFS configuration
                if (account.adfs)
                    // update it
                    Adfs.update({
                        _id: account.adfs
                    }, req.body.config, function (err, result) {
                        if (err) res.status(500).json({
                            error: err
                        });
                        else res.status(200).json({
                            action: "save",
                            status: 'done',
                            result: result
                        });
                    });
                // if the current account has no ADFS aconfiguration, create it
                else Adfs(req.body.config).save(function (err, result) {
                    if (err) res.status(500).json({
                        error: err
                    });
                    else {
                        account.adfs = result;
                        account.azureAd = null;
                        account.save(function (err, result) {
                            if (err) res.status(500).json({
                                error: err
                            });
                            else res.status(200).json({
                                action: "save",
                                status: 'done',
                                result: result
                            });
                        });
                    }
                });
            } else res.status(500).json({
                error: "not able to retrieve the account"
            });
        });
}
/*================================================================
 ROUTES
 ================================================================*/
/*==================   AUTH API - COMMON   ===========================*/
// When to admin loads the AUTH configuration page
router.get("/", function (req, res, next) {
    // check if the admin is authenticated 
    if (req.session.xapi) {
        // generate the x509 certifiate if needed
        genCertificate(req.session.account._id);
        // retrieve the current Account in the DB
        Account
            .findById(req.session.account._id)
            .populate("azureAd")
            .populate("adfs")
            .exec(function (err, account) {
                if (err) res.status(500).json({
                    error: err
                });
                else if (account)
                    // return values to web server
                    res.status(200).json({
                        azureAd: account.azureAd,
                        adfs: account.adfs,
                        signin: "https://" + serverHostname + "/login/" + account._id + "/",
                        callback: "https://" + serverHostname + "/azure/" + account._id + "/callback",
                        logout: "https://" + serverHostname + "/login/" + account._id + "/",
                    });
                else res.status(200).json();
            });
    } else res.status(403).send('Unknown session');
});

/*==================   AUTH API - AZUREAD   ===========================*/
// When the admin save the AzureAD configuration
router.post("/aad/", function (req, res, next) {
    // check if the admin is authenticated 
    if (req.session.xapi) {
        if (req.body.config) saveAzureAd(req, res);
        else res.status(500).send({
            error: "missing azureAd"
        });
    } else res.status(403).send('Unknown session');
});
/*==================   AUTH API - ADFS   ===========================*/

router.post("/adfs/", function (req, res, next) {
    if (req.session.xapi) {
        if (req.body.config) saveAdfs(req, res);
        else res.status(500).send({
            error: "missing adfs"
        });
    } else res.status(403).send('Unknown session');
});

router.get("/cert", function (req, res) {
    var vhost = require("../config").appServer.vhost;
    var file = '../certs/' + req.session.account._id + "." + vhost + ".xml";
    res.download(file);
});

module.exports = router;