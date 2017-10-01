/*! RESOURCE: /scripts/app.ng_chat/queue/directive.snQueueEntryTransferAccepted.js */
angular.module('sn.connect.queue').directive('snQueueEntryTransferAccepted', function(getTemplateUrl) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        templateUrl: getTemplateUrl('snQueueEntryTransferAccepted.xml'),
        scope: {},
        controller: function($scope, $rootScope, $timeout, $filter, activeConversation, conversations, queueEntries,
            profiles) {
            var transferOrder = [];
            $scope.$watchCollection(function() {
                return $filter('transferAccepted')(conversations.all).map(function(conversation) {
                    return conversation.sysID;
                });
            }, function(newCollection) {
                transferOrder = newCollection.sort(function(sysID1, sysID2) {
                    return sortIndex(sysID1) - sortIndex(sysID2);
                });
                if (transferOrder.length > 0)
                    show();
                else
                    hide();
            });

            function sortIndex(sysID) {
                var index = transferOrder.indexOf(sysID);
                return (index < 0) ? 1000 : index;
            }
            $scope.leave = closeModal(true);
            $scope.stay = closeModal(false);

            function closeModal(removeConversation) {
                return function() {
                    var conversation = conversations.indexed[currentSysID];
                    queueEntries.complete(currentSysID);
                    conversation.queueEntry.clearTransferState();
                    if (removeConversation) {
                        conversations.closeSupport(conversation.sysID, true);
                        activeConversation.clear(conversation);
                    }
                    hide();
                }
            }
            var currentSysID;

            function show() {
                var sysID = transferOrder[0];
                if (currentSysID === sysID)
                    return;
                currentSysID = sysID;
                var conversation = conversations.indexed[currentSysID];
                var queueEntry = conversation.queueEntry;
                delete $scope.profileForSession;
                delete $scope.transferToProfile;
                profiles.getAsync('sys_user.' + queueEntry.openedBy).then(function(profile) {
                    $scope.profileForSession = profile;
                    profiles.getAsync('sys_user.' + queueEntry.transferTo).then(function(profile) {
                        $scope.transferToProfile = profile;
                        $scope.$broadcast('dialog.transfer-accepted-modal.show');
                        activeConversation.conversation = conversation;
                    });
                });
            }

            function hide() {
                $scope.$broadcast('dialog.transfer-accepted-modal.close');
                if (currentSysID === transferOrder[0])
                    transferOrder.shift();
                currentSysID = undefined;
                if (transferOrder.length === 0)
                    return;
                $timeout(function() {
                    show();
                }, 400);
            }
        }
    };
});;