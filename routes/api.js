var express = require('express');
var router = express.Router();
var API = require("./../bin/aerohive/api/main");
var groupId = require("./../config.js").groupId;
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
function createCredential(req, groupId, callback) {
    var hmCredentialsRequestVo = {
        email: req.session.email,
        groupId: groupId,
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
    if (req.session.hasOwnProperty('passport')) {
        createCredential(req, groupId, function (err, result) {
            if (err && err.code == "registration.service.item.already.exist") {
                getCredentials(req, function (err, account) {
                    if (err) res.status(400).json({ action: "create", error: err });
                    else deleteCredential(req, account, function (err, result) {
                        if (err) res.status(400).json({ action: "create", error: err });
                        else createCredential(req, groupId, function (err, result) {
                            if (err) res.status(400).json({ action: "create", error: err });
                            else res.status(200).json({ action: "create", email: req.session.email, status: 'deleted_and_done' });
                        })
                    })
                })
            } else if (err) res.status(400).json({ error: err });
            else res.status(200).json({ action: "create", email: req.session.email, status: 'done' });
        })
    } else res.status(403).send('Unknown session');
});


router.delete("/myKey", function (req, res, next) {
    if (req.session.xapi) {
        getCredentials(req, function (err, account) {
            console.log(account);
            if (err) res.status(400).json({ action: "delete", error: err });
            else if (account) deleteCredential(req, account, function (err, result) {
                if (err) res.status(400).json({ action: "delete", error: err });
                else res.status(200).json({ action: "delete", email: req.session.email, status: 'done' });
            });
            else res.status(404).json({ action: "delete", email: req.session.email, status: 'not_found' });
        });
    } else res.status(403).send('Unknown session');
})


router.post("/myKey", function (req, res, next) {
    if (req.session.xapi) {
        getCredentials(req, function (err, account) {
            if (err) res.status(400).json({ action: "deliver", error: err });
            else if (account) deliverCredential(req, account, function (err, result) {
                if (err) res.status(400).json({ action: "deliver", error: err });
                else res.status(200).json({ action: "deliver", email: req.session.email, status: 'done' });
            });
            else res.status(404).json({ action: "deliver", email: req.session.email, status: 'not_found' });
        });
    } else res.status(403).send('Unknown session');
})
module.exports = router;
