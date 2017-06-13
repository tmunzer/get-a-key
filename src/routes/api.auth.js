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
var Azure = require("../bin/models/azure");
var Adfs = require("../bin/models/adfs");
var fs = require('fs');
var exec = require('child_process').exec;

/*================================================================
 FUNCTIONS
 ================================================================*/
// Generate x509 certificate for ADFS 
function genCertificate(account_id) {
    var files = [
        "../certs/" + account_id + "." + serverHostname + ".cert",
        "../certs/" + account_id + "." + serverHostname + ".key",
        "../certs/" + account_id + "." + serverHostname + ".xml"
    ];
    done = 0;
    var error;
    var cmd = 'cd ../certs && pwd && ./generate_app_certificate.sh ' +
        account_id + "." + serverHostname + ' https://' + serverHostname + "/adfs/" + account_id + '/';

    for (var i = 0; i < files.length; i++)
        fs.access(files[i], fs.F_OK, function (err) {
            done++;
            if (err) error = err;
            if (done == files.length)
                if (!error) console.log("ADFS Ceritificates for " + serverHostname + "/" + account_id + " present.");
                else {
                    exec(cmd, function (error, stdout, stderr) {
                        if (error) console.log(error);
                        else {
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
        .exec(function (err, account) {
            if (err) res.status(500).json({ error: err });
            else if (account) {
                // if the current account already has a ADFS configuration
                if (account.adfs)
                    // update it
                    Adfs.update({ _id: account.adfs }, req.body.adfs, function (err, result) {
                        if (err) res.status(500).json({ error: err });
                        else res.status(200).json({ action: "save", status: 'done' });
                    })
                // if the current account has no ADFS aconfiguration, create it
                else Adfs(req.body.adfs).save(function (err, result) {
                    if (err) res.status(500).json({ error: err });
                    else {
                        // @TODO: improve migration from ADFS to Azure
                        account.adfs = result;
                        account.azureAd = null;
                        account.save(function (err, result) {
                            if (err) res.status(500).json({ error: err });
                            else res.status(200).json({ action: "save", status: 'done' });
                        })
                    }
                });
            } else res.status(500).json({ error: "not able to retrieve the account" });
        });
}

/*==================  ADFS   ===========================*/
// Function to save the AzureAD configuration
function saveAdfs(req, res) {
    // retrieve the current Account in the DB
    Account
        .findById(req.session.account._id)
        .exec(function (err, account) {
            if (err) res.status(500).json({ error: err });
            else if (account) {
                // if the current account already has a AzureAD configuration
                if (account.azureAd)
                    // update it
                    AzureAd.update({ _id: account.azureAd }, req.body.azureAd, function (err, result) {
                        if (err) res.status(500).json({ error: err });
                        else res.status(200).json({ action: "save", status: 'done' });
                    })
                // if the current account has no AzureAD aconfiguration, create it
                else AzureAd(req.body.azureAd).save(function (err, result) {
                    if (err) res.status(500).json({ error: err });
                    else {
                        // @TODO: improve migration from ADFS to Azure
                        account.azureAd = result;
                        account.adfs = null;
                        account.save(function (err, result) {
                            if (err) res.status(500).json({ error: err });
                            else res.status(200).json({ action: "save", status: 'done' });
                        })
                    }
                });
            } else res.status(500).json({ error: "not able to retrieve the account" });
        });
}
/*================================================================
 ROUTES
 ================================================================*/
router.get("/", function (req, res, next) {
    genCertificate(req.session.account._id);
    if (req.session.xapi) {
        Account
            .findById(req.session.account._id)
            .populate("azure")
            .populate("adfs")
            .exec(function (err, account) {
                if (err) res.status(500).json({ error: err });
                else if (account)
                    res.status(200).json({
                        method: account.method,
                        azure: account.azure,
                        adfs: account.adfs,
                        signin: "https://" + serverHostname + "/login/" + account._id + "/",
                        callback: "https://" + serverHostname + "/azure/" + account._id + "/callback",
                        logout: "https://" + serverHostname + "/login/" + account._id + "/",
                    });
                else res.status(200).json();
            })
    } else res.status(403).send('Unknown session');
})

router.get("/cert", function (req, res) {
    var vhost = require("../config").appServer.vhost;
    var file = '../certs/' + vhost + "_" + req.session.account._id + ".xml";
    res.download(file);
})

// When to admin loads the AzureAD configuration page
router.get("/aad", function (req, res, next) {
    // check if the admin is authenticated 
    if (req.session.xapi) {
        // retrieve the current Account in the DB
        Account
            .findById(req.session.account._id)
            .populate("azureAd")
            .exec(function (err, account) {
                if (err) res.status(500).json({ error: err });
                // return values to web server
                else if (account)
                    res.status(200).json({
                        signin: "https://" + serverHostname + "/login/" + account._id + "/",
                        callback: "https://" + serverHostname + "/aad/" + account._id + "/callback",
                        logout: "https://" + serverHostname + "/login/" + account._id + "/",
                        azureAd: account.azureAd
                    });
                else res.status(500).json({ err: "not able to retrieve the account" });
            })
    } else res.status(403).send('Unknown session');
})
// When the admin save the AzureAD configuration
router.post("/aad/", function (req, res, next) {
    // check if the admin is authenticated 
    if (req.session.xapi) {
        if (req.body.azureAd) saveAzureAd(req, res);
        else res.status(500).send({ error: "missing azureAd" });
    } else res.status(403).send('Unknown session');
})
/*==================   ADMIN API - ADFS   ===========================*/
// Function to save the ADFS configuration
function saveAdfs(req, res) {
    // retrieve the current Account in the DB
    Account
        .findById(req.session.account._id)
        .exec(function (err, account) {
            if (err) res.status(500).json({ error: err });
            else if (account) {
                // if the current account already has a ADFS configuration
                // @TODO
                if (account.azureAd)
                    AzureAd.findByIdAndRemove(account.azureAd, function (err) {
                        if (err) res.status(500).json({ error: "not able to save data" });
                        else {
                            account.azureAd = null;
                            account.save(function (err, result) {
                                if (err) res.status(500).json({ error: "not able to save data" });
                                else res.status(200).json({ action: "save", status: 'done' });
                            })
                        }
                    });
                else res.status(200).json({ action: "save", status: 'done' });
            }
            else res.status(500).json({ error: "not able to retrieve the account" });
        });
}



router.post("/azure", function (req, res, next) {
    if (req.session.xapi) {
        if (req.body.config) saveAzure(req, res);
        else res.status(500).send({ error: "missing azure" });
    } else res.status(403).send('Unknown session');
})



function saveAdfs(req, res) {
    Account
        .findById(req.session.account._id)
        .exec(function (err, account) {
            if (err) res.status(500).json({ error: err });
            else if (account) {
                account.method = "adfs";
                account.save(function (err, result) {
                    if (account.adfs) {
                        Adfs.update({ _id: account.adfs }, req.body.config, function (err, result) {
                            if (err) res.status(500).json({ error: err });
                            else res.status(200).json({ action: "save", status: 'done' });
                        })
                    } else Adfs(req.body.config).save(function (err, result) {
                        if (err) res.status(500).json({ error: err });
                        else {
                            account.adfs = result;
                            account.save(function (err, result) {
                                if (err) res.status(500).json({ error: err });
                                else res.status(200).json({ action: "save", status: 'done' });
                            })
                        }
                    });
                })
            } else res.status(500).json({ error: "not able to retrieve the account" });
        });
}

router.post("/adfs", function (req, res, next) {
    if (req.session.xapi) {
        if (req.body.config) saveAdfs(req, res);
        else res.status(500).send({ error: "missing adfs" });
    } else res.status(403).send('Unknown session');
})

module.exports = router;