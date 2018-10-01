angular
    .module("Configuration")
    .controller("ConfigurationCtrl", function ($scope, $mdDialog, ConfigurationService) {
        var initialized = false;
        var request;
        $scope.isWorking = false;
        $scope.config = {
            corpEnabled: true,
            userGroupId: 0,
            guestEnabled: false,
            guestGroupId: 0,
            phoneCountry: "fr"
        };
        $scope.userGroups = [];
        $scope.loginUrl = "https://";
        $scope.loginUrlDefault = "https://";  
        $scope.loginUrlUnique = "https://";  
        $scope.displayDefault = false;

        function apiWarning(warning) {
            isWorking = false;
            $mdDialog.show({
                controller: LocalModal,
                templateUrl: '/web-app/modals/modalWarningContent.html',
                escapeToClose: false,
                locals: {
                    items: warning.error
                }
            });
        }
        function reqDone() {
            $mdDialog.show({
                controller: LocalModal,
                templateUrl: '/web-app/modals/modalAdminDoneContent.html',
                locals: {
                    items: "modal.save.configuration"
                }
            });
        }
        function LocalModal($scope, $mdDialog, items) {
            $scope.items = items;
            $scope.close = function () {
                $mdDialog.hide();
            };
        }

        $scope.$watch("config.isDefault", function(){
            if ($scope.config.isDefault == true) $scope.loginUrl = $scope.loginUrlDefault;
            else $scope.loginUrl = $scope.loginUrlUnique;
        })

        request = ConfigurationService.get();
        request.then(function (promise) {
            if (promise && promise.error) apiWarning(promise.error);
            else {
                $scope.config = promise.data.config;
                $scope.userGroups = promise.data.userGroups.userGroups;
                $("#phone").intlTelInput("setCountry", $scope.config.phoneCountry);
                $scope.displayDefault = promise.data.displayDefault;
                $scope.loginUrlUnique = promise.data.loginUrl;
                $scope.loginUrlDefault = promise.data.loginUrlDefault;
                isWorking = false;
            }
        });

        $scope.save = function () {
            $scope.config.phoneCountry = $("#phone").intlTelInput("getSelectedCountryData").iso2;
            request = ConfigurationService.save($scope.config);
            request.then(function (promise) {
                if (promise && promise.error) apiWarning(promise.error);
                else reqDone();
            });
        };
    })
    .factory("ConfigurationService", function ($http, $q, $rootScope) {

        function get() {
            var canceller = $q.defer();
            var request = $http({
                url: "/api/admin/config/",
                method: "GET",
                timeout: canceller.promise
            });
            return httpReq(request);
        }

        function save(config) {
            var canceller = $q.defer();
            var request = $http({
                url: "/api/admin/config",
                method: "POST",
                data: config,
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
            save: save
        };
    });
