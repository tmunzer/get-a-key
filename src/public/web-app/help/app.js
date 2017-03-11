var gak = angular.module("gak", [
    "ngRoute",
    'ui.bootstrap',
    'ngSanitize',
    'ngMaterial',
    'ngMessages'
]);

gak
    .config(function ($routeProvider) {
        $routeProvider
            .when("/azureAD", {
                module: "App",
                controller: "AppCtrl"
            })
            .otherwise({
                redirectTo: "/azureAD/"
            });
    })
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.definePalette('ahBlue', colors)
            .theme('default')
            .primaryPalette("ahBlue", {
                'default': '600'
            })
            .accentPalette('ahBlue', {
                'default': '200' // by default use shade 400 from the pink palette for primary intentions
            });
    });


gak.controller("AppCtrl", function ($scope) {
    console.log('help');
});



