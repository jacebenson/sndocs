/*! RESOURCE: /scripts/app.ng_chat/queue/directive.snQueueEntryClose.js */
angular.module('sn.connect.queue').directive('snQueueEntryClose', function(
    getTemplateUrl, conversations, activeConversation) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        templateUrl: getTemplateUrl('snQueueEntryClose.xml'),
        scope: {},
        controller: function($scope) {
            var hideConversation = true;
            $scope.$on('connect.support_conversation.close_prompt', function(event, conversation, shouldHide) {
                $scope.conversation = conversation;
                hideConversation = shouldHide;
                $scope.$broadcast('dialog.queue-entry-close-modal.show');
            });
            $scope.close = function() {
                conversations.closeSupport($scope.conversation.sysID, hideConversation);
                if (hideConversation)
                    activeConversation.clear($scope.conversation);
            };
        }
    };
});;