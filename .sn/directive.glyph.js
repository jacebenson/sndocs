/*! RESOURCE: /scripts/directive.glyph.js */
angular.module('sn.$sp').directive("glyph", function() {
    "use strict";
    return {
        restrict: 'E',
        replace: true,
        scope: {
            snChar: "@",
        },
        template: '<span class="glyphicon glyphicon-{{snChar}}" />',
        link: function(scope) {}
    }
});