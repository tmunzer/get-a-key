angular
    .module('Authentication')
    .controller("AuthenticationCtrl", function ($scope, $mdDialog, $mdConstant, AzureAdService) {
        $scope.customKeys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA, $mdConstant.KEY_CODE.SEMICOLON, $mdConstant.KEY_CODE.TAB];

        const initialized = false;
        let request;
        $scope.isWorking = false;
        $scope.admin = {
            azureAd: {
                clientId: "",
                clientSecret: "",
                tenant: "",
                resource: "",
                allowExternalUsers: false,
                userGroupsFilter: false,
                userGroups: []
            },
            adfs: {}
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
                    items: "modal.save.authentication"
                }
            })
        }
        function LocalModal($scope, $mdDialog, items) {
            $scope.items = items;
            $scope.close = function () {
                $mdDialog.hide();
                $scope.isWorking = false;
            };
        }


        function azureAdSaveConfig() {
            $scope.isWorking = true;
            if (request) request.abort();
            request = AzureAdService.post($scope.admin.azureAd);
            request.then(function (promise) {
                $scope.isWorking = false;
                if (promise && promise.error) apiWarning(promise.error);
                else reqDone();
            })
        }

        $scope.isWorking = true;
        request = AzureAdService.get();
        request.then(function (promise) {
            $scope.isWorking = false;
            if (promise && promise.error) apiWarning(promise.error);
            else {
                $scope.method.aad = true;
                $scope.method.adfs = false;
                if (promise.data.azureAd) {
                    $scope.admin.azureAd = promise.data.azureAd;
                    if (!$scope.admin.azureAd.userGroupsFilter) $scope.admin.azureAd.userGroupsFilter = false;
                    if (!$scope.admin.azureAd.userGroups) $scope.admin.azureAd.userGroups = [];
                } else {
                    $scope.admin = {
                        azureAd: {
                            clientId: "",
                            clientSecret: "",
                            tenant: "",
                            resource: "",
                            allowExternalUsers: false,
                            userGroupsFilter: false,
                            userGroups: []
                        },
                        adfs: {}
                    };
                }
                $scope.admin.azureAd.signin = promise.data.signin;
                $scope.admin.azureAd.callback = promise.data.callback;
                $scope.admin.azureAd.logout = promise.data.logout;
            }
        })



        $scope.isValid = function () {
            if ($scope.method.aad == true) {
                if (!$scope.admin.azureAd.clientID || $scope.admin.azureAd.clientID == "") return false;
                else if (!$scope.admin.azureAd.clientSecret || $scope.admin.azureAd.clientSecret == "") return false;
                else if (!$scope.admin.azureAd.tenant || $scope.admin.azureAd.tenant == "") return false;
                else if (!$scope.admin.azureAd.resource || $scope.admin.azureAd.resource == "") return false;
                else return true;
            }
            else if (isWorking) return true;
            else return false;
        }

        $scope.save = function () {
            $scope.isWorking = true;
            if ($scope.method.aad == true) {
                azureAdSaveConfig();
            }
        }
    })

    .factory("AzureAdService", function ($http, $q, $rootScope) {
        function get(azureAdConfig) {
            const canceller = $q.defer();
            const request = $http({
                url: "/api/aad/",
                method: "GET",
                data: { azureAd: azureAdConfig },
                timeout: canceller.promise
            });
            return httpReq(request);
        }

        function post(azureAdConfig) {
            const canceller = $q.defer();
            const request = $http({
                url: "/api/aad/",
                method: "POST",
                data: { azureAd: azureAdConfig },
                timeout: canceller.promise
            });
            return httpReq(request);
        }

        function httpReq(request) {
            let promise = request.then(
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

