const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
    userGroupId: { type: Number, required: false },
    phoneCountry: { type: String, required: true},
    corpEnabled: { type: Boolean, default: true},
    guestEnabled: { type: Boolean, default: false},
    guestGroupId: { type: Number, required: false},
    created_at    : { type: Date },
    updated_at    : { type: Date }
});

const Config = mongoose.model('Config', ConfigSchema);


// Pre save
ConfigSchema.pre('save', function(next) {
    const now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

module.exports = Config;

