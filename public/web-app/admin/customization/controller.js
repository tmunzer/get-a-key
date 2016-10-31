
angular.module('Customization').controller('CustomizationCtrl', function ($scope, fileReader, CustomizationService) {

    var request;

    $scope.logo = {
        enable: false,
        status: "disabled",
        img: null
    };
    $scope.color = {
        enable: false,
        status: "disabled"
    }
    $scope.colors = {
        enable: false,
        status: "disabled"
    }
    $scope.login = {
        enable: false,
        status: "disabled",
        title: "",
        text: "",
    }
    $scope.app = {
        enable: false,
        status: "disabled",
        title: "",
        rows: { 0: { icon: "", text: "" } }
    }

    $scope.$watch("logo.enable", function () {
        if ($scope.logo.enable) $scope.logo.status = "enabled";
        else $scope.logo.status = "disabled";
    })
    $scope.$watch("color.enable", function () {
        if ($scope.color.enable) $scope.color.status = "enabled";
        else $scope.color.status = "disabled";
    })
    $scope.$watch("login.enable", function () {
        if ($scope.login.enable) $scope.login.status = "enabled";
        else $scope.login.status = "disabled";
    })

    $scope.$watch("app.enable", function () {
        if ($scope.app.enable) $scope.app.status = "enabled";
        else $scope.app.status = "disabled";
    })


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
        request = CustomizationService.save($scope.logo, $scope.colors, $scope.login, $scope.app);
        request.then(function (promise) {
            if (promise && promise.error) apiWarning(promise.error);
            else console.log("done");
        })
    }

    request = CustomizationService.get();
    request.then(function (promise) {
        if (promise && promise.error) apiWarning(promise.error);
        else {
            $scope.logo = promise.data.logo;
        }
    })
})

angular.module('Customization').directive("ngFileSelectLogo", function () {
    return {
        link: function ($scope, el) {
            el.bind("change", function (e) {
                $scope.logoFile = (e.srcElement || e.target).files[0];
                $scope.getLogo();
            })
        }
    }
})


angular.module('Customization').factory("CustomizationService", function ($http, $q, $rootScope) {

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
            logo: {
                enable: logo.enable,
                img: logo.img            
            },
            colors: {
                enable: colors.enable,
                colors: colors.colors
            },
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
