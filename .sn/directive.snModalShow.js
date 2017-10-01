/*! RESOURCE: /scripts/sn/common/ui/directive.snModalShow.js */
angular.module('sn.common.ui').directive('snModalShow', function() {
    "use strict";
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.click(function() {
                showDialog();
            });

            function showDialog() {
                scope.$broadcast('dialog.' + attrs.snModalShow + '.show');
            }
            if (window.SingletonKeyboardRegistry) {
                SingletonKeyboardRegistry.getInstance().bind('ctrl + alt + i', function() {
                    scope.$broadcast('dialog.impersonate.show');
                }).selector(null, true);
            }
        }
    }
});;