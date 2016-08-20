var gak = angular.module("gak", [
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
                redirectTo: "/classroom/"
            });
    })
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette("blue", {
                'default': '600'
            })
            .accentPalette('green', {
                'default': '400' // by default use shade 400 from the pink palette for primary intentions
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
    $scope.translate = function (langKey){
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

    
    $scope.getMyKey = function () {
        $scope.isWorking = true;
        if (request) request.abort();
        request = MyKeyService.getMyKey();
        request.then(function (promise) {
            $scope.isWorking = false;
            if (promise && promise.error) {
                console.log(promise);
            } else {
                console.log(promise);
            } 
        })
    }    

    $scope.revoke = function () {
        $scope.isWorking = true;
        if (request) request.abort();
        request = MyKeyService.removeMyKey();
        request.then(function (promise) {
            $scope.isWorking = false;
            if (promise && promise.error) console.log(promise);
            else console.log(promise);
        })
    }

        $scope.deliver = function () {
        $scope.isWorking = true;
        if (request) request.abort();
        request = MyKeyService.deliverMyKey();
        request.then(function (promise) {
            $scope.isWorking = false;
            if (promise && promise.error) console.log(promise);
            else console.log(promise);
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
        var promise = request.then(
            function (response) {
                if (response && response.data && response.data.error) return response.data;
                else return response;
            },
            function (response) {
                if (response.status && response.status >= 0) {
                    $rootScope.$broadcast('serverError', response);
                    return ($q.reject("error"));
                }
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

    function deliverMyKey() {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/myKey/",
            method: "POST",
            timeout: canceller.promise
        });
        var promise = request.then(
            function (response) {
                if (response && response.data && response.data.error) return response.data;
                else return response;
            },
            function (response) {
                if (response.status && response.status >= 0) {
                    $rootScope.$broadcast('serverError', response);
                    return ($q.reject("error"));
                }
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

    function removeMyKey() {

        var canceller = $q.defer();
        var request = $http({
            url: "/api/myKey",
            method: "DELETE",
            timeout: canceller.promise
        });
        var promise = request.then(
            function (response) {
                if (response && response.data && response.data.error) return response.data;
                else return response;
            },
            function (response) {
                if (response.status && response.status >= 0) {
                    $rootScope.$broadcast('serverError', response);
                    return ($q.reject("error"));
                }
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

