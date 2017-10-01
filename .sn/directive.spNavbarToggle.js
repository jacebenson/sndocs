/*! RESOURCE: /scripts/app.$sp/directive.spNavbarToggle.js */
angular.module('sn.$sp').directive('spNavbarToggle', function(cabrillo) {
    return {
        restrict: 'A',
        link: function($scope, element, attrs) {
            $scope.toggleNavMenu = function() {
                $(element).collapse('toggle');
            }
            if (cabrillo.isNative) {
                cabrillo.viewLayout.setNavigationBarButtons([{
                    title: 'Menu'
                }], $scope.toggleNavMenu);
            }
        }
    }
});