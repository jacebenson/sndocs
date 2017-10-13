/*! RESOURCE: /scripts/app.ng_chat/util/directive.snRepeatEventEmitter.js */
angular.module('sn.connect.util').directive('snRepeatEventEmitter', function() {
  'use strict';
  return {
    restrict: 'A',
    link: function(scope) {
      if (scope.$first === true) {
        scope.$evalAsync(function() {
          scope.$emit("ngRepeat.complete");
        });
      }
    }
  };
});;