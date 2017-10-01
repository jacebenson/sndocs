/*! RESOURCE: /scripts/app.ng_chat/util/directive.snEscape.js */
angular.module('sn.connect.util').directive('snEscape', function() {
    'use strict';
    return function(scope, element, attrs) {
        element.bind("keyup", function(event) {
            if (event.which !== 27)
                return;
            scope.$apply(function() {
                scope.$eval(attrs.snEscape);
            });
            event.preventDefault();
        });
    };
});;