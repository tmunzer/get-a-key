var express = require('express');
var router = express.Router();
var API = require("./../bin/aerohive/api/main");
var groupId = require("./../config.js").groupId;
/* GET users listing. */

function getCredentials(req, username, callback) {
    var credentials = [];

    //module.exports.getCredentials = function (xapi, credentialType, userGroup, memberOf, adUser, creator, loginName, firstName, lastName, phone, email, page, pageSize, callback) {
    API.identity.credentials.getCredentials(req.session.xapi, null, null, null, null, null, username, null, null, null, null, null, null, function (err, result) {
        if (err) callback(err, null);
        else callback(null, credentials);
    });

};
function createCredential(req, username, groupId, callback) {
    var hmCredentialsRequestVo = {
        email: username,
        groupId: groupId,
        policy: "PERSONAL",
        deliverMethod: "EMAIL"
    };
    API.identity.credentials.createCredential(req.session.xapi, null, null, hmCredentialsRequestVo, function (err, result) {
        if (err) callback(err, null);
        else callback(null, result);
    })
    
};
function deleteCredential(req, ids, callback) {

    for (var i = 0; i < ids.length; i++){
        API.identity.credentials.deleteCredential(req.session.xapi, null, null, id, function (err, result) {
            if (err) {
                i = ids.length;
                callback(err, null);
            }
            else {
                if (i == ids.length) callback(null, result);
            }
        })        
    }
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
    if (req.session.hasOwnProperty('passport')) {
        var username = req.session.passport.user.upn;
        createCredential(req, username, groupId, function (err, result) {
            console.log(result);
            if (err && err.code == "registration.service.item.already.exist") {
                getCredentials(req, username, function (err, ids) {
                    if (err) res.status(400).json({ error: err });
                    else deleteCredential(req, ids, function (err, result) {
                        if (err) res.status(400).json({ error: err });
                        else createCredential(req, username, gorupId, next, function (err, result) {
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
    if (req.session.xapi) {
        getCredentials(req, username, function (err, result) {
            if (err) res.status(400).json({ error: err });
            else deleteCredential(req, id, function (err, result) {
                if (err) res.status(400).json({ error: err });
                else res.json({});
            });
        });
    } else res.status(403).send('Unknown session');        
})


router.post("/myKey", function (req, res, next) {
    var username = req.session.passport.user;
    if (req.session.xapi) {
        getCredentials(req, username, function (err, result) {
            if (err) res.status(400).json({ error: err });
                
                //TODO
            else deliverCredential(req, id, function (err, result) {
                if (err) res.status(400).json({ error: err });
                else res.json({});
            });
        });
    } else res.status(403).send('Unknown session');  
})
module.exports = router;
