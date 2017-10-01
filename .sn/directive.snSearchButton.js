/*! RESOURCE: /scripts/app.ng_chat/search/directive.snSearchButton.js */
angular.module('sn.connect').directive('snSearchButton', function(getTemplateUrl) {
    'use strict';
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl('snSearchButton.xml'),
        replace: true,
        scope: {
            blockAside: '=',
            conversation: '='
        },
        controller: function($scope) {
            $scope.isActive = false;
            var asideView = {
                template: "<sn-aside-search></sn-aside-search>"
            };
            $scope.openAside = function() {
                if (!$scope.buttons)
                    $scope.buttons = angular.element('#conversationAsideButtons');
                if ($scope.blockAside || !$scope.conversation.sysID || $scope.conversation.isPending)
                    return;
                if ($scope.isActive)
                    $scope.$emit("sn.aside.close");
                else
                    $scope.$emit("sn.aside.open", asideView, false, $scope.buttons.width());
            };
            $scope.$on("sn.aside.controls.active", function(e, data) {
                $scope.isActive = (data === "search");
            });
            $scope.$on("sn.aside.close", function() {
                $scope.isActive = false;
            });
        }
    };
});;