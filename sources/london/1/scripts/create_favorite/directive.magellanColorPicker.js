/*! RESOURCE: /scripts/create_favorite/directive.magellanColorPicker.js */
angular.module('Magellan.createFavorite').directive('magellanColorPicker', ['getTemplateUrl', function(getTemplateUrl) {
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('magellan_color_picker.xml'),
    scope: {
      activeColor: '='
    },
    controller: function($scope, $rootScope, $http, $timeout) {
      if (window.top && window.top.Magellan && window.top.Magellan.globals && window.top.Magellan.globals.navColors) {
        $scope.colors = window.top.Magellan.globals.navColors;
      } else {
        $http.get('/api/now/ui/favorite/iconsandcolors').then(function(response) {
          if (response && response.data && response.data.result) {
            if (response.data.result.colors) {
              window.top.Magellan = window.top.Magellan || {};
              window.top.Magellan.globals = window.top.Magellan.globals || {};
              window.top.Magellan.globals.navColors = JSON.parse(response.data.result.colors);
              $scope.colors = window.top.Magellan.globals.navColors;
            }
          }
        });
      }
      $rootScope.$on("currentFavorite.changed", function(e) {
        $scope.init();
      });
      $scope.capitalize = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }
      $scope.init = function() {
        $timeout(function() {
          if (!document.getElementById('magellan-color-group'))
            return;
          $scope.colorGroup = new RadioGroup(document.getElementById('magellan-color-group')).init();
          angular.element('.color-option').each(function(i, e) {
            deSelectColor(e);
          });
          if (!$scope.activeColor)
            selectColor(angular.element('.color-option').first());
          if ($scope.activeColor === "normal")
            selectColor(angular.element('.color-option')[1]);
          else
            selectColor(angular.element('.color-bg-' + $scope.activeColor).first());
        }, 150);
      }
      selectColor = function($el) {
        if (!$el.attr)
          $el = angular.element($el);
        $el.attr('tabindex', 0);
        $el.attr('aria-checked', true);
        if (!$el.hasClass('icon-check'))
          $el.addClass('icon-check');
      }
      deSelectColor = function($el) {
        if (!$el.attr)
          $el = angular.element($el);
        $el.attr('tabindex', '-1');
        $el.attr('aria-checked', false);
        $el.removeClass('icon-check');
      }
      $scope.init();
      $scope.changeColor = function(newValue, oldValue) {
        var previousValue = oldValue ? oldValue : $scope.activeColor;
        if (newValue != previousValue) {
          angular.element('.color-option').each(function(i, e) {
            deSelectColor(e);
          });
          $rootScope.$broadcast('magellanColorPicker:colorSelected', newValue);
        }
      };
    }
  }
}]);;