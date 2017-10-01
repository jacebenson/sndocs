/*! RESOURCE: /scripts/sn/common/util/directive.snBlurOnEnter.js */
angular.module('sn.common.util').directive('snBlurOnEnter', function() {
    'use strict';
    return function(scope, element) {
        element.bind("keydown keypress", function(event) {
            if (event.which !== 13)
                return;
            element.blur();
            event.preventDefault();
        });
    };
});;