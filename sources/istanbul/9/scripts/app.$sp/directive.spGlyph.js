/*! RESOURCE: /scripts/app.$sp/directive.spGlyph.js */
angular.module('sn.$sp').directive("spGlyph", function() {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      char: "@",
    },
    template: '<span class="glyphicon glyphicon-{{char}}" />',
    link: function(scope) {}
  }
});