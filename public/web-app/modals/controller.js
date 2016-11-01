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
        $mdDialog.cancel()
    };
    $scope.confirm = function () {
        $mdDialog.hide();
    }
});