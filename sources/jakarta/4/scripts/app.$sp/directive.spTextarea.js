/*! RESOURCE: /scripts/app.$sp/directive.spTextarea.js */
angular.module('sn.$sp').directive('spTextarea', function() {
  'use strict';
  return {
    scope: {
      field: '='
    },
    require: '^ngModel',
    template: '<textarea ng-attr-placeholder="{{field.placeholder}}" />',
    restrict: 'E',
    replace: true,
    link: function(scope, element, attr, ngModel) {
      autosize(element);
      var render0 = ngModel.$render;
      ngModel.$render = function() {
        render0();
        autosize.update(element);
      }
    }
  }
});;