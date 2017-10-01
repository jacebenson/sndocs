/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideNotifications.js */
angular.module('sn.connect.resource').directive('snAsideNotifications', function(getTemplateUrl, $timeout) {
    'use strict';
    return {
        replace: true,
        restrict: 'E',
        templateUrl: getTemplateUrl('snAsideNotifications.xml'),
        link: function(scope, element) {
            scope.$on("sn.aside.open", function() {
                $timeout(function() {
                    if (element.is(":visible"))
                        scope.$emit("sn.aside.controls.active", "notifications");
                }, 0, false);
            });
        },
        controller: function($scope, notificationPreferences) {
            $scope.$emit("sn.aside.controls.active", "notifications");
            $scope.showSystemMessage = function() {
                return !$scope.conversation.isDirectMessage &&
                    notificationPreferences.globalPreferences.mobile &&
                    $scope.conversation.preferences.mobile === "all";
            };
        }
    }
});;