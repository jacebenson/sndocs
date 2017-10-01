/*! RESOURCE: /scripts/sn/common/util/directive.snResizeHeight.js */
angular.module('sn.common.util').directive('snResizeHeight', function($window) {
    'use strict';
    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
            if (typeof $window.autosize === 'undefined') {
                return;
            }
            $window.autosize(elem);

            function _update() {
                $window.autosize.update(elem);
            }

            function _destroy() {
                $window.autosize.destroy(elem);
            }
            if (typeof attrs.disableValueWatcher === "undefined") {
                scope.$watch(function() {
                    return elem.val();
                }, function valueWatcher(newValue, oldValue) {
                    if (newValue === oldValue) {
                        return;
                    }
                    _update();
                });
            }
            elem.on('input.resize', _update());
            scope.$on('$destroy', function() {
                _destroy();
            });
            if (attrs.snTextareaAutosizer === 'trim') {
                elem.on('blur', function() {
                    elem.val(elem.val().trim());
                    _update();
                })
            }
        }
    }
});;