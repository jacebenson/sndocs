/*! RESOURCE: /scripts/sn/common/util/directive.snFocus.js */
angular.module('sn.common.util').directive('snFocus', function($timeout) {
    'use strict';
    return function(scope, element, attrs) {
        scope.$watch(attrs.snFocus, function(value) {
            if (value !== true)
                return;
            $timeout(function() {
                element[0].focus();
            });
        });
    };
});;