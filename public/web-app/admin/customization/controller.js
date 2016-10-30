
angular.module('Customization').controller('CustomizationCtrl', function ($scope, fileReader) {
    console.log('ok');
    $scope.headerLogo;
    $scope.loginLogo;

    $scope.color = {
        enable: false,
        status: "disabled"
    }
    $scope.login = {
            enable: false,
            status: "disabled"
    }
    $scope.app = {
        enable: false,
        status: "disabled"
    }


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


    $scope.getHeaderLogo = function () {
        fileReader.readAsDataUrl($scope.headerLogoFile, $scope)
            .then(function (result) {
                $scope.headerLogo = result;
            });
    };
        $scope.getLoginLogo = function () {
        fileReader.readAsDataUrl($scope.loginLogoFile, $scope)
            .then(function (result) {
                $scope.loginLogo = result;
            });
    };
})
angular.module('Customization').directive("ngFileSelectHeader", function () {
    return {
        link: function ($scope, el) {
            el.bind("change", function (e) {
                $scope.headerLogoFile = (e.srcElement || e.target).files[0];
                $scope.getHeaderLogo();
            })
        }
    }
})
angular.module('Customization').directive("ngFileSelectLogin", function () {
    return {
        link: function ($scope, el) {
            el.bind("change", function (e) {
                $scope.loginLogoFile = (e.srcElement || e.target).files[0];
                $scope.getLoginLogo();
            })
        }
    }
})