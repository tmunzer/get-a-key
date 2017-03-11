var api = require("../../req");


module.exports.GET = function (xapi, folderId, callback) {
    var path = "/xapi/v1/configuration/apLocationFolders?ownerId=" + xapi.ownerId;
    if (folderId) path += "folderId=" + folderId;
    api.GET(xapi, path, function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result) {
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};