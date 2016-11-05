var mongoose = require('mongoose');

var ConfigSchema = new mongoose.Schema({
    userGroupId: { type: Number, required: true },
    created_at    : { type: Date },
    updated_at    : { type: Date }
});

var Config = mongoose.model('Config', ConfigSchema);


// Pre save
ConfigSchema.pre('save', function(next) {
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

module.exports = Config;

