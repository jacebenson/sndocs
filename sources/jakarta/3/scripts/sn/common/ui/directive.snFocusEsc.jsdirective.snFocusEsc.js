/*! RESOURCE: /scripts/sn/common/ui/directive.snFocusEsc.js */
angular.module('sn.common.ui').directive('snFocusEsc', function($document) {
  'use strict';
  return {
    restrict: 'A',
    scope: false,
    link: function(scope, element, attrs) {
      $document.on('keyup', function($event) {
        if ($event.keyCode === 27) {
          var focusedElement = $event.target;
          if (focusedElement && element[0].contains(focusedElement)) {
            scope.$eval(attrs.snFocusEsc);
          }
        }
      });
    }
  };
});;