var express = require('express');
var router = express.Router();
var API = require("./../bin/aerohive/api/main");
/* GET users listing. */

function getCredentials(username, callback) {
    var credentials = [];

    //module.exports.getCredentials = function (xapi, credentialType, userGroup, memberOf, adUser, creator, loginName, firstName, lastName, phone, email, page, pageSize, callback) {
    API.identity.credentials.getCredentials(req.session.xapi, null, null, null, null, null, userName, null, null, null, null, null, null, function (err, result) {
        if (err) callback(err, null);
        else callback(null, credentials);
    });

};
function createCredential(username, groupId, callback) {
    console.log("create");
    console.log(username, groupId);
    var hmCredentialsRequestVo = {
        email: username,
        groupId: groupId,
        policy: "PERSONAL"
        };
        API.identity.credentials.createCredential(req.session.xapi, null, null, hmCredentialsRequestVo, function (err, result) {
            if (err) callback(err, null);
            else callback(null, result);
        })
    
};
function deleteCredential(id, callback) {

        API.identity.credentials.deleteCredential(req.session.xapi, null, null, id, function (err, result) {
            if (err) callback(err, null);
            else callback(null, result);
        })
    
};
function deliverCredential(req, res, next) {
    
        if (req.body.hasOwnProperty("hmCredentialDeliveryInfoVo")) {
            var hmCredentialDeliveryInfoVo = req.body.hmCredentialDeliveryInfoVo;
            console.log(req.query);
            if (req.query.hasOwnProperty("id")) id = req.query.id;
            API.identity.credentials.deliverCredential(req.session.xapi, null, null, hmCredentialDeliveryInfoVo, function (err, result) {
                if (err) callback(err, null);
                else callback(null, result);
            })
        }
    
};

router.get("/myKey", function (req, res, next) {
    var groupId = 5145371753562;
    console.log(req.session);
    if (req.session.hasOwnProperty('passport')) {
        var username = req.session.passport.user.upn;
        console.log(username);
        createCredential(username, groupId, function (err, result) {
            console.log(result);
            if (err && err.code == "registration.service.item.already.exist") {
                getCredentials(username, function (err, result) {
                    if (err) res.status(400).json({ error: err });
                    else deleteCredential(id, function (err, result) {
                        if (err) res.status(400).json({ error: err });
                        else createCredential(username, gorupId, next, function (err, result) {
                            if (err) res.status(400).json({ error: err });
                            else res.json(result);
                        })
                    })
                })
            } else if (err) res.status(400).json({ error: err });
            else res.json(result);
        })
    } else res.status(403).send('Unknown session');
});


router.delete("/myKey", function (req, res, next) {
    var username = req.session.passport.user;
    var groupId = 5145371753562;
    if (req.session.xapi) {
        getCredentials(username, function (err, result) {
            if (err) res.status(400).json({ error: err });
            else deleteCredential(id, function (err, result) {
                if (err) res.status(400).json({ error: err });
                else res.json({});
            });
        });
    } else res.status(403).send('Unknown session');        
})


router.post("/myKey", function (req, res, next) {
    var username = req.session.passport.user;
    var groupId = 5145371753562;
    if (req.session.xapi) {
        getCredentials(username, function (err, result) {
            if (err) res.status(400).json({ error: err });
                
                //TODO
            else deliverCredential(id, function (err, result) {
                if (err) res.status(400).json({ error: err });
                else res.json({});
            });
        });
    } else res.status(403).send('Unknown session');  
})
module.exports = router;
