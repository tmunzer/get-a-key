angular.module("CustomFilters").filter("ssidStringFromArray", function () {
    return function (input) {
        if (!input || input.length === 0) return "";
        else {
            var string = "";
            input.forEach(function (ssid) {
                string += ssid + ", ";
            });
            string = string.trim().slice(0, -1);
            return string;
        }
    }
});