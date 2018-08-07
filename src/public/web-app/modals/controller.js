angular.module('Modals').controller('DialogController', function ($scope, $mdDialog, items) {
    // items is injected in the controller, not its scope!
    $scope.items = items;
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };
});
angular.module('Modals').controller('DialogConfirmController', function ($scope, $mdDialog, items) {    
    $scope.action = items.action;
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
    $scope.confirm = function () {
        $mdDialog.hide();
    };
});

angular.module("Modals").controller("DialogSendBySmsController", function ($scope, $mdDialog, MyKeyService) {
    $scope.isWorking = false;
    $scope.success = false;
    $scope.failed = false;

    $scope.sendBySms = function () {
        MyKeyService.deliverMyKey("sms",{phone: $scope.phone}).then(function (promise) {
            $scope.isWorking = false;
            if (promise && promise.error) $scope.failed = promise.error;
            else $scope.success = true;
        });
    };
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };
});
