/*! RESOURCE: /scripts/app.$sp/directive.spTextarea.js */
angular.module('sn.$sp').directive('spTextarea', function($window, $rootScope) {
  'use strict';

  function autosizeAsync(scope, element) {
    scope.$applyAsync(function() {
      if (scope.field.isVisible()) {
        $window.requestAnimationFrame(function() {
          $window.autosize.update(element);
        })
      }
    })
  }
  return {
    scope: {
      field: '='
    },
    require: '^ngModel',
    template: '<textarea ng-attr-placeholder="{{field.placeholder}}" style="resize:vertical;" aria-required="{{field.mandatory_filled()}}"/>',
    restrict: 'E',
    replace: true,
    link: function(scope, element, attr, ngModel) {
      $window.autosize(element);
      var render0 = ngModel.$render;
      ngModel.$render = function() {
        render0();
        autosizeAsync(scope, element);
      }
      var isHiddenOnRender = !scope.field.isVisible();
      if (isHiddenOnRender) {
        $rootScope.$on('field.change', function() {
          if (scope.field.isVisible()) {
            autosizeAsync(scope, element);
          }
        })
      }
    }
  }
});;