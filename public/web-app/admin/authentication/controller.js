angular.module('Authentication').controller("AuthenticationCtrl", function ($scope, $mdDialog, AzureAdService) {

    var initialized = false;
    var request;
    $scope.isWorking = false;
    $scope.admin = {
        azureAd: null,
        adfs: null
    };

    $scope.method = {
        aad: true,
        adfs: false
    };
    $scope.$watch("method.aad", function () {
        $scope.method.adfs = !$scope.method.aad;
    });
    $scope.$watch("method.adfs", function () {
        $scope.method.aad = !$scope.method.adfs;
    })


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


    request = AzureAdService.get();
    request.then(function (promise) {
        $scope.isWorking = false;
        if (promise && promise.error) apiWarning(promise.error);
        else {
            if (promise.data.azureAd) {
                $scope.admin.azureAd = promise.data.azureAd;
                $scope.method.aad = true;
                $scope.method.adfs = false;
            } else if (promise.data.adfs) {
                $scope.admin.adfs = promise.data.adfs;
                $scope.method.aad = false;
                $scope.method.adfs = true;
            }
            $scope.admin.azureAd.login = promise.data.login;
            $scope.admin.azureAd.signin = promise.data.signin;
            $scope.admin.azureAd.callback = promise.data.callback;
            $scope.admin.azureAd.logout = promise.data.logout;
        }
    })



    $scope.isValid = function () {
        if ($scope.method.aad == true) {
            if (!$scope.admin.azureAd.clientID || $scope.admin.azureAd.clientID == "") return false;
            else if (!$scope.admin.azureAd.clientSecret || $scope.admin.azureAd.clientSecret == "") return false;
            else return true;
        } else return false;
    }

    $scope.save = function () {
        if ($scope.method.aad == true) {
            azureAdSaveConfig();
        }
    }
});



angular.module('Authentication').factory("AzureAdService", function ($http, $q, $rootScope) {

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

