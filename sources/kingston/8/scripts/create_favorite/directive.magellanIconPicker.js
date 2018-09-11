/*! RESOURCE: /scripts/create_favorite/directive.magellanIconPicker.js */
angular.module('Magellan.createFavorite').directive('magellanIconPicker', ['getTemplateUrl', function(getTemplateUrl) {
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('magellan_icon_picker.xml'),
    scope: {
      activeColor: '=',
      activeIcon: '='
    },
    controller: function($scope, $rootScope, $http) {
      if (window.top && window.top.Magellan && window.top.Magellan.globals && window.top.Magellan.globals.navIcons) {
        $scope.icons = window.top.Magellan.globals.navIcons;
      } else {
        $http.get('/api/now/ui/favorite/iconsandcolors').then(function(response) {
          if (response && response.data && response.data.result) {
            if (response.data.result.icons) {
              window.top.Magellan = window.top.Magellan || {};
              window.top.Magellan.globals = window.top.Magellan.globals || {};
              window.top.Magellan.globals.navIcons = JSON.parse(response.data.result.icons);
              $scope.icons = window.top.Magellan.globals.navIcons;
            }
          }
        });
      }
      $scope.updateIcon = function($event, icon) {
        $event.preventDefault();
        $event.stopImmediatePropagation();
        $scope.activeIcon = icon;
        $rootScope.$broadcast('magellanIconPicker:iconSelected', icon);
      };
      $rootScope.$on('magellanColorPicker:colorSelected', function(evt, color) {
        $scope.activeColor = color;
      });
    }
  }
}]);;