var mongoose = require('mongoose');

var AdfsSchema = new mongoose.Schema({
    metadata: { type: String, required: true },
    entryPoint: { type: String, required: true },
    entityID: { type: String, required: true },
    loginUrl : { type: String, required: true },
    logoutUrl: { type: String, required: true },
    certs: [{ type: String, required: false}],
    created_at    : { type: Date },
    updated_at    : { type: Date }
});

var Adfs = mongoose.model('Adfs', AdfsSchema);


// Pre save
AdfsSchema.pre('save', function(next) {
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

module.exports = Adfs;

