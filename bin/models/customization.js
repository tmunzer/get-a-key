var mongoose = require('mongoose');

var CustomizationSchema = new mongoose.Schema({
    logoTop: { data: Buffer, contentType: String },
    logo: { data: Buffer, contentType: String },
    color1: { type: Number, required: true },
    color2: { type: Number, required: true },
    color3: { type: Number, required: true },
    color4: { type: Number, required: true },
    messages: [ 
        {
            icon: { type: String, required: false },
            text: { type: String, required: true}
        }
    ],
    created_at    : { type: Date },
    updated_at    : { type: Date }
});

var Customization = mongoose.model('Customization', CustomizationSchema);


// Pre save
CustomizationSchema.pre('save', function(next) {
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

module.exports = Customization;

