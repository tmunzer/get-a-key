const mongoose = require('mongoose');

const AzureAdSchema = new mongoose.Schema({
    clientID: { type: String, required: true },
    clientSecret: { type: String, required: true },
    tenant: { type: String, required: false },
    resource: { type: String, required: false },
    allowExternalUsers: { type: Boolean, default: false },
    userGroupsFilter: {type: Boolean, default: false},
    unlicensedFilter: {type: Boolean, default: false},
    userGroups: [{type: String}],
    created_at: { type: Date },
    updated_at: { type: Date }
});

const AzureAd = mongoose.model('AzureAd', AzureAdSchema);


// Pre save
AzureAdSchema.pre('save', function (next) {
    const now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = AzureAd;

