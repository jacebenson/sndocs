/*! RESOURCE: /scripts/app.ng_chat/util/directive.snConnectContent.js */
angular.module('sn.connect').directive('snConnectContent', function(getTemplateUrl) {
    'use strict';
    return {
        templateUrl: getTemplateUrl('snConnectContent.xml'),
        restrict: 'E',
        replace: true,
        transclude: true,
        link: function(scope) {
            function togglePane(pane) {
                return function() {
                    if (scope.activePane !== pane)
                        scope.activePane = pane;
                    else
                        delete scope.activePane;
                };
            }

            function closePane() {
                delete scope.activePane;
            }
            scope.$on('connect.pane.toggle.left', togglePane('left'));
            scope.$on('connect.pane.toggle.right', togglePane('right'));
            scope.$on('connect.pane.close', closePane);
        }
    };
});;