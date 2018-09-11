/*! RESOURCE: /scripts/create_favorite/directive.magellanIconPicker.js */
angular.module('Magellan.createFavorite').directive('magellanIconPicker', ['getTemplateUrl', function(getTemplateUrl) {
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('magellan_icon_picker.xml'),
    scope: {
      activeColor: '=',
      activeIcon: '='
    },
    controller: function($scope, $rootScope, $http, $timeout) {
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
      $rootScope.$on("currentFavorite.changed", function(e) {
        $scope.init();
      });
      $scope.init = function() {
        $timeout(function() {
          if (!document.getElementById('magellan-icon-group'))
            return;
          $scope.colorGroup = new RadioGroup(document.getElementById('magellan-icon-group')).init();
          angular.element('.option-icon').each(function(i, e) {
            var $el = angular.element(e);
            $el.attr('tabindex', '-1');
            $el.attr('aria-checked', false);
            if (($el).hasClass('selected'))
              highlightIcon($el);
          });
          if (angular.element('.option-icon.selected').length === 0)
            highlightIcon(angular.element('.option-icon').first());
        }, 150);
      }
      $scope.capitalize = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }
      highlightIcon = function($el) {
        if (!$el.attr)
          $el = angular.element($el);
        $el.attr('tabindex', 0);
        $el.attr('aria-checked', true);
      }
      $scope.init();
      $rootScope.$on('magellanColorPicker:colorSelected', function(evt, color) {
        $scope.activeColor = color;
      });
    }
  }
}]);;