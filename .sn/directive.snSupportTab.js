/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snSupportTab.js */
angular.module('sn.connect.conversation').directive('snSupportTab', function(getTemplateUrl) {
    'use strict';
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl('snSupportTab.xml'),
        replace: true,
        scope: {},
        controller: function($scope, $filter, conversations, activeConversation, inFrameSet) {
            if (!inFrameSet) {
                $scope.$watchCollection(function() {
                    return filterConversations();
                }, function(conversationList) {
                    if (!activeConversation.isSupport)
                        return;
                    if (conversationList.length === 0)
                        return;
                    if (activeConversation.isEmpty)
                        activeConversation.conversation = conversationList[0];
                });
            }
            $scope.primarySupportConversationsFilter = function(conversations) {
                return supportConversationsFilter(conversations, true);
            };
            $scope.secondarySupportConversationsFilter = function(conversations) {
                return supportConversationsFilter(conversations, false);
            };

            function supportConversationsFilter(conversations, primary) {
                return $filter('conversation')(conversations, true, true).filter(function(conversation) {
                    var queueEntry = conversation.queueEntry;
                    return primary === (queueEntry.isAssignedToMe || queueEntry.isTransferringToMe);
                });
            };

            function filterConversations() {
                return $scope.primarySupportConversationsFilter(conversations.all)
                    .concat($scope.secondarySupportConversationsFilter(conversations.all));
            }
            $scope.$on('connect.conversation.select', function(unused, tab, conversationID) {
                if (!activeConversation.getTab(tab).isSupport)
                    return;
                if (!activeConversation.isEmpty && activeConversation.sysID === conversationID)
                    return;
                conversationID = conversationID || activeConversation.sysID;
                var conversationList = filterConversations();
                var conversation;
                if (conversationID)
                    conversation = conversations.find(conversationID, conversationList).conversation;
                activeConversation.conversation = conversation || conversationList[0];
            });
            $scope.showNoSupportSession = function() {
                return filterConversations().length === 0;
            };
        }
    };
});;