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

    });


gak.controller("AppCtrl", function ($scope, $rootScope, $location, $mdDialog, $translate, MyKeyService) {

    $scope.translate = function (langKey) {
        $translate.use(langKey);
    }

    $scope.openMenu = function ($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };

    $scope.isWorking = false;

    var request;
    var message = {
        title: "",
        text: "",
    }

    function userNotFound(error) {
        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'modals/modalNotFoundContent.html',
            locals: {
                items: {
                    email: error.email
                }
            }
        })
    }

    function reqDone(data) {
        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'modals/modalDoneContent.html',
            locals: {
                items: data
            }
        })
    }

    function apiWarning(warning) {
        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'modals/modalWarningContent.html',
            escapeToClose: false,
            locals: {
                items: warning.error
            }
        });
    }

    $scope.getMyKey = function () {
        $scope.isWorking = true;
        if (request) request.abort();
        request = MyKeyService.getMyKey();
        request.then(function (promise) {
            $scope.isWorking = false;
            if (promise && promise.error) apiWarning(promise.error);
            else reqDone(promise.data);
        })
    }

    $scope.revoke = function () {
        $mdDialog.show({
            controller: 'DialogConfirmController',
            templateUrl: 'modals/modalConfirmContent.html',
            locals: {
                items: {
                    action: 'delete'
                }
            }
        }).then(function () {
            $scope.isWorking = true;
            if (request) request.abort();
            request = MyKeyService.removeMyKey();
            request.then(function (promise) {
                $scope.isWorking = false;
                if (promise && promise.error) {
                    if (promise.error.status == "not_found") userNotFound(promise.error);
                    else apiWarning(promise.error);
                }
                else reqDone(promise.data);
            })
        });

    }

    $scope.deliver = function () {
        $scope.isWorking = true;
        if (request) request.abort();
        request = MyKeyService.deliverMyKey();
        request.then(function (promise) {
            $scope.isWorking = false;
            if (promise && promise.error) {
                if (promise.error.status == "not_found") userNotFound(promise.error);
                else apiWarning(promise.error);
            }
            else reqDone(promise.data);
        })
    }

    $translate('errorTitle').then(function (errorTitle) {
        $scope.errorTitle = errorTitle;
    }, function (translationId) {
        $scope.errorTitle = translationId;
    });
    $translate('successTitle').then(function (successTitle) {
        $scope.successTitle = successTitle;
    }, function (translationId) {
        $scope.successTitle = translationId;
    });
    $translate('newKeyTitle').then(function (newKey) {
        $scope.newKey = newKey;
    }, function (translationId) {
        $scope.newKey = translationId;
    });
});




gak.factory("MyKeyService", function ($http, $q, $rootScope) {

    function getMyKey() {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/myKey",
            method: "GET",
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function deliverMyKey() {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/myKey/",
            method: "POST",
            timeout: canceller.promise
        });
        return httpReq(request);
    }

    function removeMyKey() {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/myKey",
            method: "DELETE",
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
        getMyKey: getMyKey,
        deliverMyKey: deliverMyKey,
        removeMyKey: removeMyKey
    }
});

