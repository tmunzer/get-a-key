angular
    .module('Authentication')
    .controller("AuthenticationCtrl", function ($scope, $mdDialog, $mdConstant, ConfigService) {
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
            adfs: {
                server: "",
                entityID: "",
                loginUrl: "",
                logoutUrl: "",
                entryPoint: "",
                metadata: undefined
            },
            method: "adfs"
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
        $scope.$watch("admin.adfs.metadata", function (a, b) {
            if ($scope.admin.adfs.metadata) {
                var start, stop, temp;

                start = $scope.admin.adfs.metadata.indexOf("entityID=") + 10;
                console.log(start);
                if (start) $scope.admin.adfs.entityID = $scope.admin.adfs.metadata.substring(start, $scope.admin.adfs.metadata.indexOf("\"", start));
                start = -1;

                start = $scope.admin.adfs.metadata.indexOf("SingleSignOnService Binding=\"urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect\"");
                console.log(start);
                if (start) start = $scope.admin.adfs.metadata.indexOf("Location=", start) + 10;
                console.log(start);
                if (start) $scope.admin.adfs.loginUrl = $scope.admin.adfs.metadata.substring(start, $scope.admin.adfs.metadata.indexOf("\"", start));

                start = -1;
                start = $scope.admin.adfs.metadata.indexOf("SingleLogoutService Binding=\"urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect\"");
                console.log(start);
                if (start) start = $scope.admin.adfs.metadata.indexOf("Location=", start) + 10;
                console.log(start);
                if (start) $scope.admin.adfs.logoutUrl = $scope.admin.adfs.metadata.substring(start, $scope.admin.adfs.metadata.indexOf("\"", start));
            }
        })
        $scope.adfsCert = function () {
            if ($scope.admin.adfs.server) return "https://" + $scope.admin.adfs.server + "/FederationMetadata/2007-06/FederationMetadata.xml";
            else return false;
        }

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

        function azureSaveConfig() {
            $scope.isWorking = true;
            if (request) request.abort();
            request = ConfigService.post("azure", $scope.admin.azure);
            request.then(function (promise) {
                $scope.isWorking = false;
                if (promise && promise.error) apiWarning(promise.error);
                else reqDone();
            })
        }
        function adfsSaveConfig() {
            $scope.isWorking = true;
            $scope.admin.adfs.entryPoint = $scope.admin.adfs.loginUrl;
            if (request) request.abort();
            request = ConfigService.post("adfs", $scope.admin.adfs);
            request.then(function (promise) {
                $scope.isWorking = false;
                if (promise && promise.error) apiWarning(promise.error);
                else reqDone();
            })
        }

        $scope.isWorking = true;
        request = ConfigService.get();
        request.then(function (promise) {
            $scope.isWorking = false;
            if (promise && promise.error) apiWarning(promise.error);
            else {
                if (promise.data.method) $scope.admin.method = promise.data.method;
                if (promise.data.azure) $scope.admin.azure = promise.data.azure;
                if (promise.data.adfs) $scope.admin.adfs = promise.data.adfs;
                $scope.admin.azure.signin = promise.data.signin;
                $scope.admin.azure.callback = promise.data.callback;
                $scope.admin.azure.logout = promise.data.logout;

            }
        })




        $scope.isValid = function () {
            if ($scope.admin.method == 'azure') {
                if (!$scope.admin.azureAd.clientID || $scope.admin.azureAd.clientID == "") return false;
                else if (!$scope.admin.azureAd.clientSecret || $scope.admin.azureAd.clientSecret == "") return false;
                else if (!$scope.admin.azureAd.tenant || $scope.admin.azureAd.tenant == "") return false;
                else if (!$scope.admin.azureAd.resource || $scope.admin.azureAd.resource == "") return false;
                else return true;
            }
            else if ($scope.admin.method == "adfs") {
                if (!$scope.admin.adfs.entityID || $scope.admin.adfs.entityID == "") return false;
                else if (!$scope.admin.adfs.loginUrl || $scope.admin.adfs.loginUrl == "") return false;
                else if (!$scope.admin.adfs.logoutUrl || $scope.admin.adfs.logoutUrl == "") return false;
                else return true;
            }
            else if (isWorking) return true;
            else return false;
        }

        $scope.save = function () {
            console.log($scope.admin.method);
            $scope.isWorking = true;
            if ($scope.admin.method == 'azure') {
                azureAdSaveConfig();
            } else if ($scope.admin.method == "adfs") {
                adfsSaveConfig();
            }
        }
    })


    .factory("ConfigService", function ($http, $q, $rootScope) {

        function get() {
            var canceller = $q.defer();
            var request = $http({
                url: "/api/auth/",
                method: "GET",
                timeout: canceller.promise
            });
            return httpReq(request);
        }

        function post(method, config) {
            var canceller = $q.defer();
            var request = $http({
                url: "/api/auth/" + method + "/",
                method: "POST",
                data: { config: config },
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
