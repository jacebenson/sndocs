/*! RESOURCE: /scripts/app.ng_chat/queue/directive.snQueueEntryTransfer.js */
angular.module('sn.connect.queue').directive('snQueueEntryTransfer', function(getTemplateUrl) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        templateUrl: getTemplateUrl('snQueueEntryTransfer.xml'),
        scope: {},
        controller: function($scope, queues, queueEntries, userID, supportConversationLimit) {
            $scope.queues = [];

            function reset() {
                $scope.queue = {};
                $scope.agents = [];
            }
            $scope.$on('connect.support.conversation.transfer', function(event, conversation) {
                reset();
                $scope.conversation = conversation;
                $scope.queues.length = 0;
                queueEntries.requestByConversation(conversation.sysID).then(function(queueEntry) {
                    queues.getQueue(queueEntry.queueID).then(function(queue) {
                        $scope.queue = queue;
                    });
                    queues.getAgents(queueEntry.queueID).then(function(agents) {
                        $scope.agents = agents.filter(function(agent) {
                            return (agent.userID !== queueEntry.openedBy) &&
                                (agent.userID !== userID);
                        }).sort(function(a, b) {
                            return a.name.localeCompare(b.name);
                        });
                    });
                    queues.refresh().then(function() {
                        angular.forEach(queues.all, function(value, key) {
                            if (key !== queueEntry.queueID)
                                $scope.queues.push(value)
                        });
                    });
                    $scope.$broadcast('dialog.transfer-modal.show');
                });
            });
            $scope.close = reset;
            $scope.startsWith = function(actual, expected) {
                return actual.toLowerCase().indexOf(expected.toLowerCase()) > -1;
            };
            $scope.canTransferToAgent = function(agent) {
                if (supportConversationLimit === -1)
                    return true;
                if (!agent.supportConversationCount)
                    return true;
                return agent.supportConversationCount < supportConversationLimit;
            };
            $scope.transferToAgent = function(agent) {
                queueEntries.transfer($scope.conversation.sysID, agent.userID);
                $scope.$broadcast('dialog.transfer-modal.close');
                reset();
            };
            $scope.transferToQueue = function(queue) {
                $scope.transferQueue = queue;
                $scope.$broadcast('dialog.transfer-modal.close');
                reset();
                $scope.$broadcast('dialog.queue-transfer-confirm.show');
            };
            $scope.transferQueueOk = function() {
                queueEntries.escalate($scope.conversation, $scope.transferQueue.id);
            };
            $scope.cancelTransfer = function() {
                queueEntries.cancel($scope.conversation.sysID);
            };
        }
    };
});;