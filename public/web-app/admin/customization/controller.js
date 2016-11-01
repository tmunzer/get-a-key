angular
    .module('Customization')
    .controller('CustomizationCtrl', function ($scope, $mdDialog, fileReader, CustomizationService) {

        var request;

        $scope.status = {
            logo: "disabled",
            colors: "disabled",
            login: "disabled",
            app: "disabled"
        };
        $scope.logo = {
            enable: false,
            img: null
        };
        $scope.colors = {
            enable: false,
            color: "#000000",
            contrastDefaultColor: "light"
        }
        $scope.login = {
            enable: false,
            title: "",
            text: "",
        }
        $scope.app = {
            enable: false,
            title: "",
            rows: { 0: { icon: "", text: "" } }
        }


        $scope.$watch("logo.enable", function () {
            if ($scope.logo.enable) $scope.status.logo = "enabled";
            else $scope.status.logo = "disabled";
        })
        $scope.$watch("colors.enable", function () {
            if ($scope.colors.enable) $scope.status.colors = "enabled";
            else $scope.status.colors = "disabled";
        })
        $scope.$watch("login.enable", function () {
            if ($scope.login.enable) $scope.status.login = "enabled";
            else $scope.status.login = "disabled";
        })
        $scope.$watch("app.enable", function () {
            if ($scope.app.enable) $scope.status.app = "enabled";
            else $scope.status.app = "disabled";
        })

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
            $scope.isWorking = false;
            $mdDialog.show({
                controller: LocalModal,
                templateUrl: '/web-app/modals/modalAdminDoneContent.html',
                locals: {
                    items: "modal.save.customization"
                }
            })
        }
        function LocalModal($scope, $mdDialog, items) {
            $scope.items = items;
            $scope.close = function () {
                $mdDialog.hide();
            };
        }


        $scope.getLogo = function () {
            fileReader.readAsDataUrl($scope.logoFile, $scope)
                .then(function (result) {
                    if (result) {
                        $scope.logo.img = result;
                    }
                });
        };

        $scope.isValid = function () {
            if ($scope.logo.enable && !$scope.logo.img) return false;
            else if ($scope.login.enable && !$scope.loginForm.$valid) return false;

            else return true;
        }

        $scope.save = function () {
            $scope.isWorking = true;
            request = CustomizationService.save($scope.logo, $scope.colors, $scope.login, $scope.app);
            request.then(function (promise) {
                if (promise && promise.error) apiWarning(promise.error);
                else reqDone();
            })
        }

        request = CustomizationService.get();
        request.then(function (promise) {
            if (promise && promise.error) apiWarning(promise.error);
            else {
                $scope.logo = promise.data.logo;
                $scope.colors = promise.data.colors;
                if ($scope.colors.color.indexOf("#" < 0)) $scope.colors.color = "#" + $scope.colors.color;
            }
        })
    })

    .directive("ngFileSelectLogo", function ($mdDialog) {

        function logoSizeErrorContent(logoFile) {
            var name = logoFile.name;
            var size = logoFile.size;
            var unitIndex = 0;
            var units = ["B", "kB", "MB", "GB", "TB"];
            while (size >= 1024) {
                size = size / 1024;
                unitIndex++;
            }
            size = size.toFixed(2);
            var unit = units[unitIndex];
            $mdDialog.show({
                controller: 'DialogController',
                templateUrl: '/web-app/modals/modalErrorContent.html',
                escapeToClose: false,
                locals: {
                    items: {
                        logo: {
                            name: name,
                            size: size,
                            unit: unit
                        },
                        type: "logoFileTooLarge"
                    }
                }
            });
        }

        return {
            link: function ($scope, el) {
                el.bind("change", function (e) {
                    var tmpFile = (e.srcElement || e.target).files[0];
                    if (tmpFile.size >= 1048576) logoSizeErrorContent(tmpFile);
                    else {
                        $scope.logoFile = tmpFile;
                        $scope.getLogo();
                    }
                })
            }
        }
    })
    .factory("CustomizationService", function ($http, $q, $rootScope) {

        function get() {
            var canceller = $q.defer();
            var request = $http({
                url: "/api/admin/custom/",
                method: "GET",
                timeout: canceller.promise
            });
            return httpReq(request);
        }

        function save(logo, colors, login, app) {
            var data = {
                logo: logo,
                colors: colors,
                login: {
                    enable: login.enable,
                    title: login.title,
                    text: login.text
                },
                app: {
                    enable: login.enable,
                    title: login.title,
                    rows: login.rows
                }
            }
            var canceller = $q.defer();
            var request = $http({
                url: "/api/admin/custom",
                method: "POST",
                data: data,
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
        }
    })
