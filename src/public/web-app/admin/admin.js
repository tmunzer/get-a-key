
angular.module("Modals", []);
angular.module("Authentication", []);
angular.module("Configuration", []);
angular.module("Customization", []);
angular.module("CustomFilters", []);

var gak = angular.module("gak", [
    'Modals',
    'CustomFilters',
    "ngRoute",
    'ui.bootstrap',
    'ngSanitize',
    'ngMaterial',
    'ngMessages',
    'mdColorPicker',
    'pascalprecht.translate',
    'Authentication',
    'Configuration',
    'Customization'
]);

gak
    .config(function ($routeProvider) {
        $routeProvider
            .when("/configuration", {
                templateUrl: "/web-app/admin/configuration/view.html",
                module: "Configuration",
                controller: "ConfigurationCtrl"
            })
            .when("/authentication", {
                templateUrl: "/web-app/admin/authentication/view.html",
                module: "Authentication",
                controller: "AuthenticationCtrl"
            })
            .when("/customization", {
                templateUrl: "/web-app/admin/customization/view.html",
                module: "customization",
                controller: "CustomizationCtrl"
            })
            .otherwise({
                redirectTo: "/configuration"
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
    }).config(['$httpProvider', function ($httpProvider) {
        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }

        // Answer edited to include suggestions from comments
        // because previous version of code introduced browser-related errors

        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
        // extra
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    }]).config(function ($translateProvider) {
        $translateProvider.useMissingTranslationHandlerLog();
        $translateProvider
            .translations('en', en)
            .translations('fr', fr)
            .registerAvailableLanguageKeys(['en', 'fr'], {
                'en_*': 'en',
                'fr_*': 'fr'
            })
            .determinePreferredLanguage()
            .fallbackLanguage('en')
            .usePostCompiling(true)
            .useSanitizeValueStrategy("escapeParameters");
    }).config(function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|ftp|blob):|data:image\//);
    });



gak.controller('AppCtrl', function ($scope, $translate, $location) {
    $scope.translate = function (langKey) {
        $translate.use(langKey);
    }

    $scope.openMenu = function ($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };

    $scope.active = function (tab) {
        if ($location.path() == '/' + tab) return true;
        else return false;
    }
    $scope.select = function (tab) {
        $location.path('/'+tab);
    };

});

