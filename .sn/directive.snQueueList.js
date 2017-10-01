/*! RESOURCE: /scripts/app.ng_chat/queue/directive.snQueueList.js */
angular.module('sn.connect.queue').directive('snQueueList', function(getTemplateUrl) {
    'use strict';
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl('snQueueList.xml'),
        replace: true,
        scope: {},
        controller: function($scope, $filter, queues, conversations, supportConversationLimit) {
            $scope.agents = queues.agents;
            $scope.hasQueues = queues.hasQueues;
            $scope.isLimitReached = function() {
                if (supportConversationLimit === -1)
                    return false;
                var supportConversations = $filter('conversation')(conversations.all, true, true)
                    .filter(function(conversation) {
                        var queueEntry = conversation.queueEntry;
                        return queueEntry.isAssignedToMe && !queueEntry.isPermanentlyClosed;
                    });
                return supportConversationLimit <= supportConversations.length;
            };
            $scope.$on('dialog.queue-error.show', function(evt, data) {
                $scope.queueErrorData = data;
            });
        }
    };
});;