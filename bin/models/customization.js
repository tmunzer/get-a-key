var mongoose = require('mongoose');

var CustomizationSchema = new mongoose.Schema({
    logo: {
        enable: { type: Boolean, required: true },
        img: {type: String }
    },
    colors: {
        enable: { type: Boolean, required: true },
        color1: { type: Number },
        color2: { type: Number },
        color3: { type: Number },
        color4: { type: Number }
    },
    login: {
        enable: { type: Boolean, required: true },
        text: { type: String },
        text: { type: String }
    },
    app:
    {
        enable: { type: Boolean, required: true },
        text: { type: String },
        rows: {
            index: {
                icon: { type: String},
                text: { type: String }
            }
        }
    },
    created_at: { type: Date },
    updated_at: { type: Date }
});

var Customization = mongoose.model('Customization', CustomizationSchema);


// Pre save
CustomizationSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = Customization;

