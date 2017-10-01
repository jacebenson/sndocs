/*! RESOURCE: /scripts/concourse/directive.elevateRoleIndicator.js */
angular.module('sn.concourse').directive('elevateRoleIndicator', ['snCustomEvent', function(snCustomEvent) {
    "use strict"
    return {
        restrict: 'E',
        replace: true,
        template: '<span ng-show="hasActiveRole" class="icon icon-unlocked elevated-role-indicator"></span>',
        controller: function($scope) {
            $scope.hasActiveRole = false;
            snCustomEvent.on('user.elevatedRoles.updated', function(activeRoles) {
                if (activeRoles.length) {
                    $scope.hasActiveRole = true;
                } else {
                    $scope.hasActiveRole = false;
                }
            });
        }
    }
}]);;