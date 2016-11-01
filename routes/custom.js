var express = require('express');
var router = express.Router();

var Account = require("../bin/models/account");

function defaultColors() {
    return "var colors = {" +
        "'50': 'FF0000'," +
        "'100': '0000FF'," +
        "'200': '00FF00'," +
        "'300': '444444'," +
        "'400': '444444'," +
        "'500': '444444'," +
        "'600': '444444'," +
        "'700': '444444'," +
        "'800': '444444'," +
        "'900': '444444'," +
        "'A100': '444444'," +
        "'A200': '444444'," +
        "'A400': '444444'," +
        "'A700': '444444'," +
        "'contrastDefaultColor': 'dark'" +
        "}";
}

function getColors(req, res, next) {
    if (req.params.account_id) {
        Account
            .findById(req.params.account_id)
            .populate("customization")
            .exec(function (err, result) {
                if (err) eq.colors = defaultColors();
                else if (result && result.customization.colors)
                    req.colors = "var colors = {" +
                        "'50': '"+result.customization.colors.colors1+"'," +
                        "'100': '"+result.customization.colors.colors2+"'," +
                        "'200': '"+result.customization.colors.colors3+"'," +
                        "'300': '"+result.customization.colors.colors4+"'," +
                        "'400': '"+result.customization.colors.colors4+"'," +
                        "'500': '"+result.customization.colors.colors4+"'," +
                        "'600': '"+result.customization.colors.colors4+"'," +
                        "'700': '"+result.customization.colors.colors4+"'," +
                        "'800': '"+result.customization.colors.colors4+"'," +
                        "'900': '"+result.customization.colors.colors4+"'," +
                        "'A100': '"+result.customization.colors.colors4+"'," +
                        "'A200': '"+result.customization.colors.colors4+"'," +
                        "'A400': '"+result.customization.colors.colors4+"'," +
                        "'A700': '"+result.customization.colors.colors4+"'," +
                        "'contrastDefaultColor': 'light'" +
                        "}";
                else eq.colors = defaultColors();
            })
    } else req.colors = defaultColors();
}

router.get("/colors/", function (req, res) {
    res.send(defaultColors());
})
router.get("/colors/:account_id", getColors, function (req, res) {
    res.send(req.colors);
})


module.exports = router;