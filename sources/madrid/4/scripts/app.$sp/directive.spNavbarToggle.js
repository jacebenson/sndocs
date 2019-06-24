/*! RESOURCE: /scripts/app.$sp/directive.spNavbarToggle.js */
angular.module('sn.$sp').directive('spNavbarToggle', function($rootScope, $window, cabrillo) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      $scope.toggleNavMenu = function() {
        $(element).collapse('toggle');
      };
      $rootScope.$on('sp-navbar-collapse', function() {
        $(element).collapse('hide');
      });
      if (cabrillo.isNative && $window.innerWidth < 767) {
        cabrillo.viewLayout.setNavigationBarButtons([{
          title: 'Menu'
        }], $scope.toggleNavMenu);
      }
    }
  }
});