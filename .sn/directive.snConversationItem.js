/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationItem.js */
angular.module('sn.connect.conversation').directive('snConversationItem', function(
    getTemplateUrl, inSupportClient, conversations, activeConversation) {
    'use strict';
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl(inSupportClient ? 'snConversationItem-SupportClient.xml' : 'snConversationItem.xml'),
        replace: true,
        scope: {
            conversation: '='
        },
        controller: function($scope, $rootScope) {
            $scope.isBadgeVisible = function() {
                return ($scope.conversation.unreadCount > 0) && !$scope.isTransferPending();
            };
            $scope.getUserFromProfile = function(conversation) {
                return conversation.isGroup ? conversation.lastMessage.profileData : conversation.peer;
            };
            $scope.remove = function($event) {
                if ($event && $event.keyCode === 9)
                    return;
                $event.stopPropagation();
                closeConversation();
            };

            function closeConversation() {
                if (conversations.close($scope.conversation.sysID)) {
                    $rootScope.$broadcast("sn.aside.clearCache", $scope.conversation.sysID);
                    activeConversation.clear($scope.conversation);
                }
            }
            return {
                closeConversation: closeConversation
            }
        }
    };
});;