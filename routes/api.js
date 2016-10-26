var express = require('express');
var router = express.Router();
var API = require("../bin/aerohive/api/main");

var serverHostname = require("../config.js").appServer.vhost;

var Account = require("../bin/models/account");
var AzureAd = require("../bin/models/azureAd");
/* GET users listing. */

function getCredentials(req, callback) {
    var credentials = [];
    var username = req.session.email;
    //module.exports.getCredentials = function (xapi, credentialType, userGroup, memberOf, adUser, creator, userName, firstName, lastName, phone, email, page, pageSize, callback) {
    API.identity.credentials.getCredentials(req.session.xapi, null, null, null, null, null, username, null, null, null, null, null, null, function (err, result) {
        if (err) callback(err, null);
        else {
            var account;
            // If ACS filtering didn't work, we'll get many account. trying to find the right one
            if (result.length > 1) {
                var tempAccount;
                result.forEach(function (tempAccount) {
                    if (tempAccount.userName == req.session.email) account = tempAccount;
                })
                // if ACS filtering returned 1 account
            } else if (result.length == 1) account = result[0];

            callback(null, account);
        }
    });

};
function createCredential(req, callback) {
    var hmCredentialsRequestVo = {
        email: req.session.email,
        groupId: req.session.groupId,
        policy: "PERSONAL",
        deliverMethod: "EMAIL"
    };
    API.identity.credentials.createCredential(req.session.xapi, null, null, hmCredentialsRequestVo, function (err, result) {
        if (err) callback(err, null);
        else callback(null, result);
    })

};
function deleteCredential(req, account, callback) {

    // if we get the account, removing it
    if (account) {
        var id = account.id;
        API.identity.credentials.deleteCredential(req.session.xapi, null, null, id, function (err, result) {
            if (err) callback(err, null);
            else callback(null, result);
        })
    } else callback();
};

function deliverCredential(req, account, callback) {
    if (account) {
        var hmCredentialDeliveryInfoVo = {
            email: req.session.email,
            credentialId: account.id,
            deliverMethod: "EMAIL"
        }
        API.identity.credentials.deliverCredential(req.session.xapi, null, null, hmCredentialDeliveryInfoVo, function (err, result) {
            if (err) callback(err, null);
            else callback(null, result);
        })

    } else callback();
};

router.get("/myKey", function (req, res, next) {
    console.log(req.session);
    if (req.session.hasOwnProperty('passport')) {
        createCredential(req, function (err, result) {
            if (err && err.code == "registration.service.item.already.exist") {
                getCredentials(req, function (err, account) {
                    if (err) res.status(500).json({ action: "create", error: err });
                    else deleteCredential(req, account, function (err, result) {
                        if (err) res.status(500).json({ action: "create", error: err });
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


router.delete("/myKey", function (req, res, next) {
    if (req.session.xapi) {
        getCredentials(req, function (err, account) {
            console.log(account);
            if (err) res.status(500).json({ action: "delete", error: err });
            else if (account) deleteCredential(req, account, function (err, result) {
                if (err) res.status(500).json({ action: "delete", error: err });
                else res.status(200).json({ action: "delete", email: req.session.email, status: 'done' });
            });
            else res.status(404).json({ action: "delete", email: req.session.email, status: 'not_found' });
        });
    } else res.status(403).send('Unknown session');
})


router.post("/myKey", function (req, res, next) {
    if (req.session.xapi) {
        getCredentials(req, function (err, account) {
            if (err) res.status(500).json({ action: "deliver", error: err });
            else if (account) deliverCredential(req, account, function (err, result) {
                if (err) res.status(500).json({ action: "deliver", error: err });
                else res.status(200).json({ action: "deliver", email: req.session.email, status: 'done' });
            });
            else res.status(404).json({ action: "deliver", email: req.session.email, status: 'not_found' });
        });
    } else res.status(403).send('Unknown session');
})


router.get("/aad", function (req, res, next) {
    if (req.session.xapi) {
        Account
            .find({ ownerId: req.session.xapi.ownerId, vpcUrl: req.session.xapi.vpcUrl, vhmId: req.session.xapi.vhmId })
            .populate("azureAd")
            .exec(function (err, account) {
                console.log(req.session.xapi);
                console.log(account);
                if (err) res.status(500).json({ error: err });
                else if (account.length == 0) res.status(200).json({});
                else if (account.length == 1)
                    res.status(200).json({
                        login: "https://"+serverHostname+"/login/" + account[0]._id + "/",
                        signin: "https://"+serverHostname+"/login/" + account[0]._id + "/",
                        callback: "https://"+serverHostname+"/aad/" + account[0]._id + "/callback",
                        logout: "https://"+serverHostname+"/login/" + account[0]._id + "/",
                        azureAd: account[0].azureAd

                    });
                else res.status(500).json({ err: "not able to retrieve the account" });
            })
    } else res.status(403).send('Unknown session');
})

function saveAzureAdEnabled(req, res) {
    Account
        .find({ ownerId: req.session.xapi.ownerId, vpcUrl: req.session.xapi.vpcUrl, vhmId: req.session.xapi.vhmId })
        .exec(function (err, account) {
            if (err) res.status(500).json({ error: err });
            else if (account.length == 1) {
                if (account[0].azureAd) {
                    AzureAd.update({ _id: account[0].azureAd }, req.body.azureAd, function (err, result) {
                        if (err) res.status(500).json({ error: err });
                        else res.status(200).json({ action: "save", status: 'done' });
                    })
                } else AzureAd(req.body.azureAd).save(function (err, result) {
                    if (err) res.status(500).json({ error: err });
                    else {
                        account[0].azureAd = result;
                        account[0].save(function (err, result) {
                            if (err) res.status(500).json({ error: err });
                            else res.status(200).json({ action: "save", status: 'done' });
                        })
                    }
                });
            } else res.status(500).json({ error: "not able to retrieve the account" });
        });
}
function saveAzureAdDisbled(req, res) {
    Account
        .find({ ownerId: req.session.xapi.ownerId, vpcUrl: req.session.xapi.vpcUrl, vhmId: req.session.xapi.vhmId })
        .exec(function (err, account) {
            if (err) res.status(500).json({ error: err });
            else if (account.length == 1) {
                if (account[0].azureAd) AzureAd.findByIdAndRemove(account[0].azureAd, function (err) {
                    if (err) res.status(500).json({ error: "not able to save data" });
                    else {
                        account[0].azureAd = null;
                        account[0].save(function (err, result) {
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

router.post("/aad/", function (req, res, next) {
    if (req.session.xapi) {
        if (req.body.azureAd) {
            if (req.body.azureAd.enabled == true) saveAzureAdEnabled(req, res);
            else if (req.body.azureAd.enabled == false) saveAzureAdDisbled(req, res);
            else res.status(500).send({ error: "missing azureAd" });

        } else res.status(500).send({ error: "missing azureAd" });
    } else res.status(403).send('Unknown session');
})

router.get("/admin/userGroups", function (req, res, next) {
    if (req.session.xapi) {
        API.identity.userGroups.getUserGroups(req.session.xapi, null, null, function (err, result) {
            if (err) res.status(500).json({ error: err });
            else res.status(200).json(result);
        })
    } else res.status(403).send('Unknown session');
})
module.exports = router;
