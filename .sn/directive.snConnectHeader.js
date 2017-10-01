/*! RESOURCE: /scripts/app.ng_chat/util/directive.snConnectHeader.js */
angular.module('sn.connect').directive('snConnectHeader', function(getTemplateUrl, activeConversation) {
    'use strict';
    return {
        templateUrl: getTemplateUrl('snConnectHeader.xml'),
        restrict: 'E',
        replace: true,
        controller: function($scope) {
            var asideTab = 'members';
            $scope.toggleAside = function(side) {
                $scope.$root.$broadcast('connect.pane.toggle.' + side);
                if (side === 'right') {
                    $scope.$root.$broadcast('sn.aside.trigger_control', asideTab);
                }
            };
            $scope.$on('sn.aside.trigger_control', function(event, newAsideTab) {
                asideTab = newAsideTab;
            });
        }
    };
});;