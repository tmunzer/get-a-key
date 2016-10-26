angular.module("Modals", []);
angular.module("CustomFilters", []);
var gak = angular.module("gak", [
    'Modals',
    'CustomFilters',
    "ngRoute",
    'ui.bootstrap',
    'ngSanitize',
    'ngMaterial',
    'ngMessages',
    'pascalprecht.translate'
]);

gak
    .config(function ($routeProvider) {
        $routeProvider
            .when("/", {
                module: "App",
                controller: "AppCtrl"
            })
            .otherwise({
                redirectTo: "/"
            });
    })
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.definePalette('ahBlue', {
            '50': 'eaf1f4',
            '100': 'daf4ff',
            '200': 'bedaf6',
            '300': '0093d1',
            '400': '0093d1',
            '500': '0093d1',
            '600': '0093d1',
            '700': '0093d1',
            '800': '0093d1',
            '900': '0093d1',
            'A100': '0093d1',
            'A200': '0093d1',
            'A400': '0093d1',
            'A700': '0093d1',
            'contrastDefaultColor': 'light'
        })
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

    });


gak.controller("AppCtrl", function ($scope, $rootScope, $location, $mdDialog, $translate, UserGroupsService, AzureAdService) {
    $scope.translate = function (langKey) {
        $translate.use(langKey);
    }

    $scope.openMenu = function ($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };
    var initialized = false;
    var request;
    $scope.isWorking = false;
    $scope.admin = {
        azureAd: null,
        adfs: null
    };
    $scope.userGroups = [];

    function apiWarning(warning) {
        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: '/web-app/modals/modalWarningContent.html',
            escapeToClose: false,
            locals: {
                items: warning.error
            }
        });
    }
    function reqDone(data) {
        $mdDialog.show({
            controller: 'DialogConfirmController',
            templateUrl: '/web-app/modals/modalConfirmContent.html',
            locals: {
                action: "save"
            }
        })
    }
    function azureAdSaveConfig() {
        $scope.isWorking = true;
        if (request) request.abort();
        request = AzureAdService.post($scope.admin.azureAd);
        request.then(function (promise) {
            $scope.isWorking = false;
            if (promise && promise.error) apiWarning(promise.error);

        })
    }

    $scope.isWorking = true;

    request = UserGroupsService.get();
    request.then(function (promise) {
        if (promise && promise.error) apiWarning(promise.error);
        else {
            $scope.userGroups = promise.data.userGroups;
            request = AzureAdService.get();
            request.then(function (promise) {
                $scope.isWorking = false;
                if (promise && promise.error) apiWarning(promise.error);
                else {
                    if (promise.data.azureAd) {
                        $scope.admin.azureAd = promise.data.azureAd;
                        $scope.admin.azureAd.enabled = true;
                    } else $scope.admin.azureAd = { enabled: false };
                    $scope.admin.azureAd.login = promise.data.login;
                    $scope.admin.azureAd.signin = promise.data.signin;
                    $scope.admin.azureAd.callback = promise.data.callback;
                    $scope.admin.azureAd.logout = promise.data.logout;
                }
            })
        }
    })




    $scope.azureAdValid = function () {
        if (initialized && $scope.admin.azureAd.enabled) {
            if (!$scope.admin.azureAd.userGroup || !$scope.admin.azureAd.userGroup > 0) return false;
            else if (!$scope.admin.azureAd.clientID || $scope.admin.azureAd.clientID == "") return false;
            else if (!$scope.admin.azureAd.clientSecret || $scope.admin.azureAd.clientSecret == "") return false;
            else return true;
        } else return true;
    }

    $scope.azureAdSave = function () {
        if ($scope.admin.azureAd.enabled == false)
            $mdDialog.show({
                controller: 'DialogConfirmController',
                templateUrl: '/web-app/modals/modalAdminConfirmContent.html',
                locals: {
                    items: {
                        type: 'azureAd',
                        action: 'disable'
                    }
                }
            }).then(function () {
                azureAdSaveConfig();
            });
        else azureAdSaveConfig();
    }

});



gak.factory("AzureAdService", function ($http, $q, $rootScope) {

    function get(azureAdConfig) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/aad/",
            method: "GET",
            data: { azureAd: azureAdConfig },
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function post(azureAdConfig) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/aad/",
            method: "POST",
            data: { azureAd: azureAdConfig },
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function httpReq(request) {
        var promise = request.then(
            function (response) {
                return response;
            },
            function (response) {
                return { error: response.data };
            });

        promise.abort = function () {
            canceller.resolve();
        };
        promise.finally(function () {
            console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }

    return {
        get: get,
        post: post
    }
});

gak.factory("UserGroupsService", function ($http, $q, $rootScope) {

    function get() {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/admin/userGroups/",
            method: "GET",
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function httpReq(request) {
        var promise = request.then(
            function (response) {
                return response;
            },
            function (response) {
                return { error: response.data };
            });

        promise.abort = function () {
            canceller.resolve();
        };
        promise.finally(function () {
            console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }

    return {
        get: get
    }
})