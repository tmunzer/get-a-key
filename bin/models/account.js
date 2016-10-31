var mongoose = require('mongoose');
var AzureAd = require('./azureAd');
var Config = require('./configuration');
var Customization = require('./customization');

var AccountSchema = new mongoose.Schema({
    ownerId: {type: String, required: true},
    accessToken: {type: String, required: true},
    refreshToken: {type: String, required: true},
    vpcUrl: {type: String, required: true},
    vhmId: {type: String, required: true},
    expireAt: { type: String, required: true },
    config: {type: mongoose.Schema.ObjectId, ref:"Config"},
    customization: {type: mongoose.Schema.ObjectId, ref:"Customization"},
    azureAd: {type: mongoose.Schema.ObjectId, ref:"AzureAd"},
    created_at    : { type: Date },
    updated_at    : { type: Date }
});

var Account = mongoose.model('Account', AccountSchema);


// Pre save
AccountSchema.pre('save', function(next) {
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

module.exports = Account;

