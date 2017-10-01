/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideAttachments.js */
angular.module('sn.connect.resource').directive('snAsideAttachments', function(getTemplateUrl, $timeout) {
    'use strict';
    return {
        replace: true,
        restrict: 'E',
        templateUrl: getTemplateUrl('snAsideAttachments.xml'),
        link: function(scope, element) {
            scope.$on("sn.aside.open", function() {
                $timeout(function() {
                    if (element.is(":visible"))
                        scope.$emit("sn.aside.controls.active", "attachments");
                }, 0, false);
            });
        },
        controller: function($scope, $rootScope) {
            $scope.$emit("sn.aside.controls.active", "attachments");
            $scope.$watch("conversation.sysID", rawifyAttachments);
            $scope.$watchCollection("conversation.resources.attachments", rawifyAttachments);

            function rawifyAttachments() {
                $scope.attachments = $scope.conversation.resources.attachments.map(function(attachment) {
                    return attachment.rawData;
                });
            }
            rawifyAttachments();
            $scope.attachFiles = function(evt) {
                if (evt.keyCode === 9)
                    return;
                if ($scope.conversation.amMember)
                    $rootScope.$broadcast("connect.attachment_dialog.open", $scope.conversation.sysID);
            };
            $scope.isAddButtonShowing = function() {
                return !$scope.conversation.isHelpDesk || !$scope.conversation.queueEntry.isClosedByAgent;
            }
        }
    }
});;