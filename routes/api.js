var express = require('express');
var router = express.Router();
var API = require("./../bin/aerohive/api/main");
var groupId = require("./../config.js").groupId;
/* GET users listing. */

function getCredentials(req, callback) {
    var credentials = [];
    var username = req.session.passport.user.upn;
    //module.exports.getCredentials = function (xapi, credentialType, userGroup, memberOf, adUser, creator, loginName, firstName, lastName, phone, email, page, pageSize, callback) {
    API.identity.credentials.getCredentials(req.session.xapi, null, null, null, null, null, username, null, null, null, null, null, null, function (err, result) {
        if (err) callback(err, null);
        else callback(null, result);
    });

};
function createCredential(req, groupId, callback) {
    var hmCredentialsRequestVo = {
        email: req.session.passport.user.upn,
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
    console.log(account);
    if (account.length > 0) {
        var id = account[0].id;
        API.identity.credentials.deleteCredential(req.session.xapi, null, null, id, function (err, result) {
            if (err) callback(err, null);
            else callback(null, result);
        })
    } else callback();
};

function deliverCredential(req, res, next) {
    if (account.length > 0) {
        var hmCredentialDeliveryInfoVo = {
            email: req.session.passport.user.upn,
            groupId: groupId,
            deliverMethod: "EMAIL"
        }
        if (req.body.hasOwnProperty("hmCredentialDeliveryInfoVo")) {
            var hmCredentialDeliveryInfoVo = req.body.hmCredentialDeliveryInfoVo;
            console.log(req.query);
            if (req.query.hasOwnProperty("id")) id = req.query.id;
            API.identity.credentials.deliverCredential(req.session.xapi, null, null, hmCredentialDeliveryInfoVo, function (err, result) {
                if (err) callback(err, null);
                else callback(null, result);
            })
        }
    } else callback();
};

router.get("/myKey", function (req, res, next) {
    if (req.session.hasOwnProperty('passport')) {
        createCredential(req, groupId, function (err, result) {
            if (err && err.code == "registration.service.item.already.exist") {
                getCredentials(req, function (err, account) {
                    if (err) res.status(400).json({action:"create",error: err });
                    else deleteCredential(req, account, function (err, result) {
                        if (err) res.status(400).json({ action:"create",error: err });
                        else createCredential(req, groupId, function (err, result) {
                            if (err) res.status(400).json({action:"create", error: err });
                            else res.json({action:"create", email: req.session.passport.user.upn });
                        })
                    })
                })
            } else if (err) res.status(400).json({ error: err });
            else res.json({action:"create", email: req.session.passport.user.upn });
        })
    } else res.status(403).send('Unknown session');
});


router.delete("/myKey", function (req, res, next) {
    if (req.session.xapi) {
        getCredentials(req, function (err, account) {
            if (err) res.status(400).json({ action:"delete", error: err });
            else deleteCredential(req, account, function (err, result) {
                if (err) res.status(400).json({ action:"delete", error: err });
                else res.json({ action:"delete", email: req.session.passport.user.upn });
            });
        });
    } else res.status(403).send('Unknown session');        
})


router.post("/myKey", function (req, res, next) {
    if (req.session.xapi) {
        getCredentials(req, function (err, account) {
            if (err) res.status(400).json({action:"deliver", error: err });                            
            else deliverCredential(req, account, function (err, result) {
                if (err) res.status(400).json({action:"deliver", error: err });
                else res.json({action:"deliver", email: req.session.passport.user.upn});
            });
        });
    } else res.status(403).send('Unknown session');  
})
module.exports = router;
