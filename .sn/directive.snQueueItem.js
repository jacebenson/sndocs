/*! RESOURCE: /scripts/app.ng_chat/queue/directive.snQueueItem.js */
angular.module('sn.connect.queue').directive('snQueueItem', function(getTemplateUrl, $timeout, i18n) {
    'use strict';
    var acceptButtonLabel = "Accept Ticket From {0}";
    i18n.getMessages([acceptButtonLabel], function(translations) {
        acceptButtonLabel = translations[acceptButtonLabel];
    });
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl('snQueueItem.xml'),
        replace: true,
        scope: {
            queue: '=',
            canAnswer: '='
        },
        link: function(scope, element) {
            var flashCoolDown = 1000;
            var onCoolDown = false;
            var queueItem = element.find('.queue-item');
            scope.flashQueue = function() {
                if (onCoolDown)
                    return;
                onCoolDown = true;
                queueItem.addClass("highlight-flash");
                $timeout(function() {
                    queueItem.removeClass("highlight-flash");
                }, 250);
                $timeout(function() {
                    onCoolDown = false;
                }, flashCoolDown);
            }
        },
        controller: function($scope, $rootScope, queueEntries, queueNotifier, conversations, activeConversation) {
            $scope.isEmpty = function() {
                return $scope.queue.waitingCount == 0;
            };
            $scope.getAcceptAriaLabel = function() {
                return i18n.format(acceptButtonLabel, $scope.queue.name);
            };
            $scope.answer = function() {
                if ($scope.isEmpty())
                    return;
                if (!$scope.canAnswer)
                    return;
                queueEntries.requestNext($scope.queue.id).then(function(queueEntry) {
                    conversations.get(queueEntry.conversationID).then(function(conversation) {
                        activeConversation.conversation = conversation;
                    });
                }, function(response) {
                    if (response.status !== 404 || !response.data || !response.data.result || !response.data.result.error)
                        return;
                    $rootScope.$broadcast('dialog.queue-error.show', {
                        queue: $scope.queue,
                        message: response.data.result.error
                    });
                })
            };
            $scope.$watch('queue.waitingCount', function() {
                $scope.flashQueue();
                queueNotifier.notify($scope.queue);
            });
        }
    };
});;