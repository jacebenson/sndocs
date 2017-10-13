/*! RESOURCE: /scripts/app.$sp/directive.spAutosize.js */
angular.module('sn.$sp').directive('spAutosize', function() {
  'use strict';

  function link($scope, $element, attr) {
    autosize($element);
  }
  return {
    restrict: 'A',
    replace: false,
    link: link
  }
});;