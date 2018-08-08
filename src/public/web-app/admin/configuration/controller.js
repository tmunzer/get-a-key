angular
    .module("Configuration")
    .controller("ConfigurationCtrl", function ($scope, $mdDialog, ConfigurationService) {
        var initialized = false;
        var request;
        $scope.isWorking = false;
        $scope.config = {
            userGroupId: 0
        };
        $scope.userGroups = [];
        $scope.loginUrl = "https://";

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

        request = ConfigurationService.get();
        request.then(function (promise) {
            if (promise && promise.error) apiWarning(promise.error);
            else {
                $scope.userGroups = promise.data.userGroups.userGroups;
                if (promise.data.phoneCountry) $("#phone").intlTelInput("setCountry", promise.data.phoneCountry);
                $scope.loginUrl = promise.data.loginUrl;
                $scope.config.userGroupId = promise.data.userGroupId;
                isWorking = false;
            }
        });

        $scope.save = function () {
            var phoneCountry = $("#phone").intlTelInput("getSelectedCountryData").iso2;
            request = ConfigurationService.save($scope.config.userGroupId, phoneCountry);
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

        function save(userGroupId, phoneCountry) {
            var canceller = $q.defer();
            var request = $http({
                url: "/api/admin/config",
                method: "POST",
                data: ({ userGroupId: userGroupId, phoneCountry: phoneCountry}),
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
