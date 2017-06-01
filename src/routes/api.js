/*================================================================
API:
Deal with all the web browser API call:
- users (to create/delete/... keys)
- admins (to retrieve/save the app parameters)
 ================================================================*/
 var express = require('express');
var router = express.Router();
var API = require("../bin/aerohive/api/main");
var serverHostname = require("../config.js").appServer.vhost;
var Account = require("../bin/models/account");
var AzureAd = require("../bin/models/azureAd");
var ADFS = require("../bin/models/azureAd");
var Config = require("../bin/models/configuration");
var Customization = require("../bin/models/customization");
const devAccount = require("../config.js").devAccount;

/*================================================================
 FUNCTIONS
 ================================================================*/
// ACS API call to retrieve Guest accounts based on the username
function getCredentials(req, callback) {
    var credentials = [];
    var username = req.session.email.substr(0,req.session.email.indexOf("@")).substr(0,32);
    // ACS API call
    API.identity.credentials.getCredentials(req.session.xapi, devAccount, null, null, null, null, null, username, null, null, null, null, null, null, function (err, result) {
        if (err) callback(err, null);
        else {
            var account;
            // If ACS filtering didn't work, we'll get many account. trying to find the right one
            if (result.length > 1) {
                var tempAccount;
                result.forEach(function (tempAccount) {
                    if (tempAccount.userName == username) account = tempAccount;
                })
                // if ACS filtering returned 1 account
            } else if (result.length == 1) account = result[0];

            callback(null, account);
        }
    });

};

// ACS API call to create a new Guest account
function createCredential(req, callback) {
    var hmCredentialsRequestVo = {
        userName: req.session.email.substr(0,req.session.email.indexOf("@")).substr(0,32),
        email: req.session.email,
        groupId: req.session.groupId,
        policy: "PERSONAL",
        deliverMethod: "EMAIL"
    };
    API.identity.credentials.createCredential(req.session.xapi, devAccount, null, null, hmCredentialsRequestVo, function (err, result) {
        if (err) callback(err, null);
        else callback(null, result);
    })

};

// ACS API call to delete a Guest account
function deleteCredential(req, account, callback) {
    // if we get the account, removing it
    if (account) {
        var id = account.id;
        API.identity.credentials.deleteCredential(req.session.xapi, devAccount, null, null, id, function (err, result) {
            if (err) callback(err, null);
            else callback(null, result);
        })
    } else callback();
};

// ACS API call to deliver a Guest account
function deliverCredential(req, account, callback) {
    if (account) {
        var hmCredentialDeliveryInfoVo = {
            email: req.session.email,
            credentialId: account.id,
            deliverMethod: "EMAIL"
        }
        API.identity.credentials.deliverCredential(req.session.xapi, devAccount, null, null, hmCredentialDeliveryInfoVo, function (err, result) {
            if (err) callback(err, null);
            else callback(null, result);
        })

    } else callback();
};

/*================================================================
 ROUTES
 ================================================================*/

/*==================   USER API   ===========================*/

// When user wants to get a new key
router.get("/myKey", function (req, res, next) {
    // check if the user is authenticated 
    if (req.session.passport) {
        // try to create a new key with the user information
        createCredential(req, function (err, result) {
            // if the user already has a key
            if (err && err.code == "registration.service.item.already.exist") {
                // retrieve the account details (to have the account_id)
                getCredentials(req, function (err, account) {
                    if (err) res.status(500).json({ action: "create", error: err });
                    // try to delete the current key
                    else deleteCredential(req, account, function (err, result) {
                        if (err) res.status(500).json({ action: "create", error: err });
                        // try to create a new key
                        else createCredential(req, function (err, result) {
                            if (err) res.status(500).json({ action: "create", error: err });
                            else res.status(200).json({ action: "create", email: req.session.email, status: 'deleted_and_done', result: result });
                        })
                    })
                })
            } else if (err) res.status(500).json({ error: err });
            else res.status(200).json({ action: "create", email: req.session.email, status: 'done', result: result });
        })
    } else res.status(403).send('Unknown session');
});

// When user wants to delete its key
router.delete("/myKey", function (req, res, next) {
    // check if the user is authenticated 
    if (req.session.xapi) {
        // retrieve the account details (to have the account_id)
        getCredentials(req, function (err, account) {
            if (err) res.status(500).json({ action: "delete", error: err });
            // try to delete the current key
            else if (account) deleteCredential(req, account, function (err, result) {
                if (err) res.status(500).json({ action: "delete", error: err });
                else res.status(200).json({ action: "delete", email: req.session.email, status: 'done' });
            });
            else res.status(404).json({ action: "delete", email: req.session.email, status: 'not_found' });
        });
    } else res.status(403).send('Unknown session');
})

// When user wants to receive the key one more time (same key sent by email)
router.post("/myKey", function (req, res, next) {
    // check if the user is authenticated 
    if (req.session.xapi) {
        // retrieve the account details (to have the account_id)
        getCredentials(req, function (err, account) {
            if (err) res.status(500).json({ action: "deliver", error: err });
            // try to deliver the key
            else if (account) deliverCredential(req, account, function (err, result) {
                if (err) res.status(500).json({ action: "deliver", error: err });
                else res.status(200).json({ action: "deliver", email: req.session.email, status: 'done' });
            });
            else res.status(404).json({ action: "deliver", email: req.session.email, status: 'not_found' });
        });
    } else res.status(403).send('Unknown session');
})


/*==================   ADMIN API - CONFIG   ===========================*/

// When admin is loading the "config" page (with the user group to use)
router.get("/admin/config", function (req, res, next) {
    var userGroupId;
    // check if the admin is authenticated 
    if (req.session.xapi) {
        // ACS API call to get the list of User Groups
        API.identity.userGroups.getUserGroups(req.session.xapi, devAccount, null, null, function (err, userGroups) {
            if (err) res.status(500).json({ error: err });
            else
                // retrieve the account in DB to get the currently selected user group
                Account
                    .findById(req.session.account._id)
                    .populate("config")
                    .exec(function (err, account) {
                        if (err) res.status(500).json({ error: err });
                        else if (account) {
                            if (account.config) {
                                userGroupId = account.config.userGroupId;
                            }
                            res.status(200).json({
                                loginUrl: "https://" + serverHostname + "/login/" + account._id + "/",
                                userGroups: userGroups,
                                userGroupId: userGroupId
                            });
                        } else res.status(500).json({ error: "not able to retrieve the account" });
                    })
        })
    } else res.status(403).send('Unknown session');
})
// Function to save the admin configuration
function saveConfig(req, res) {
    var newConfig = { userGroupId: req.body.userGroupId };
    // retrieve the current Account in the DB
    Account
        .findById(req.session.account._id)
        .exec(function (err, account) {
            if (err) res.status(500).json({ error: err });
            else if (account) {
                // if the current account already has a configuration
                if (account.config) {
                    // update the account configuration
                    Config.update({ _id: account.config }, newConfig, function (err, savedConfig) {
                        if (err) res.status(500).json({ error: err });
                        else res.status(200).json({ action: "save", status: 'done' });
                    })
                    // if the current account has no configuration, create it
                } else Config(newConfig).save(function (err, savedConfig) {
                    if (err) res.status(500).json({ error: err });
                    else {
                        account.config = savedConfig;
                        account.save(function (err, savedAccount) {
                            if (err) res.status(500).json({ error: err });
                            else res.status(200).json({ action: "save", status: 'done' });
                        })
                    }
                });
            } else res.status(500).json({ error: "not able to retrieve the account" });
        });
}
// Called when admin save the new configuration
router.post("/admin/config", function (req, res, next) {
    // check if the admin is authenticated 
    if (req.session.xapi) {
        if (req.body.userGroupId) saveConfig(req, res);
        else res.status(500).send({ error: "userGroupId value is missing." });
    } else res.status(403).send('Unknown session');
})
/*==================   ADMIN API - AZUREAD   ===========================*/
// Function to save the AzureAD configuration
function saveAzureAd(req, res) {
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


/*==================   ADMIN API - CUSTOMIZATION   ===========================*/
router.get("/admin/custom/", function (req, res, next) {
    // check if the admin is authenticated 
    if (req.session.xapi) {
        // Load the customization from DB
        Customization
            .findById(req.session.account.customization)
            .exec(function (err, custom) {
                if (err) res.status(500).json({ error: err });
                else if (custom)
                    res.status(200).json(custom);
                else res.status(200).json();
            })
    } else res.status(403).send('Unknown session');
})
// Function to save customization
function saveCustomization(custom, req, cb) {
    
    if (req.body.logo) custom.logo = req.body.logo;
    else custom.logo.enable = false;

    if (req.body.colors) {
        if (req.body.colors.color.indexOf("#") == 0) req.body.colors.color = req.body.colors.color.substr(1);
        custom.colors = req.body.colors;
    }
    else custom.colors.enable = false;

    if (req.body.login) custom.login = req.body.login;
    else custom.login.enable = false;

    if (req.body.app) custom.app = req.body.app;
    else custom.app.enable = false;

    if (req.body.app) custom.app = req.body.app;
    else custom.app.enable = false;

    custom.save(function (err, result) {
        if (err) cb(err);
        else cb(err, result);
    })
}
// When admin wants to save the customization
router.post("/admin/custom/", function (req, res, next) {
    // check if the admin is authenticated 
    if (req.session.xapi) {
        // retrieve the current Account in the DB
        Account
            .findById(req.session.account._id)
            .populate("customization")
            .exec(function (err, account) {
                if (err) res.status(500).json({ error: err });
                else if (account) {
                    // update the account
                    var custom;
                    if (account.customization) custom = account.customization;
                    else custom = new Customization;
                    // save the customization
                    saveCustomization(custom, req, function (err, result) {
                        if (err) res.status(500).json({ error: err });
                        else {
                            account.customization = result;
                            // save the account with the customization id
                            account.save(function (err, result) {
                                if (err) res.status(500).json({ error: err });
                                else res.status(200).json({ action: "save", status: 'done' });
                            });
                        }
                    });
                } else res.status(500).json({ err: "not able to retrieve the account" });
            })
    } else res.status(403).send('Unknown session');
})

module.exports = router;
