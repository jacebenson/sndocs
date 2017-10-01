/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationListContainer.js */
angular.module('sn.connect.conversation').directive('snConversationListContainer', function(
    getTemplateUrl, conversations, i18n) {
    'use strict';
    var supportTabAriaLabel = "Support Conversations - {0} Unread Messages";
    i18n.getMessages([supportTabAriaLabel], function(results) {
        supportTabAriaLabel = results[supportTabAriaLabel];
    });
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl('snConversationListContainer.xml'),
        replace: true,
        scope: {},
        link: function(scope, element) {
            conversations.loaded.then(function() {
                element.removeClass("loading");
            })
        },
        controller: function($scope, $rootScope, $filter, snCustomEvent, conversationFactory, queues,
            activeConversation, supportEnabled, inFrameSet, chatEnabled) {
            $scope.inFrameSet = inFrameSet;
            $scope.supportEnabled = supportEnabled;
            $scope.chatEnabled = chatEnabled;
            $scope.showTabs = function() {
                return supportEnabled && chatEnabled;
            };
            $scope.getSupportTabAriaLabel = function() {
                return i18n.format(supportTabAriaLabel, $scope.getSupportUnreadCount());
            };
            $scope.isUsersWaitingIndicatorShowing = function() {
                return (queues.getAllWaitingCount() > 0) && !$scope.isSupport();
            };
            snCustomEvent.observe('chat:open_conversation', function(profile) {
                var cachedPeerConversations = conversations.getCachedPeerConversations(profile.userID || profile.sys_id);
                if (cachedPeerConversations[0]) {
                    activeConversation.tab = 'chat';
                    activeConversation.conversation = cachedPeerConversations[0];
                } else {
                    $rootScope.$broadcast("connect.show_create_conversation_screen", profile);
                }
            });
            $scope.isSupport = function() {
                return activeConversation.isSupport;
            };
            $scope.openChat = openTab('chat');
            $scope.openSupport = openTab('support');

            function openTab(tab) {
                return function() {
                    activeConversation.tab = tab;
                }
            }
            $scope.getChatUnreadCount = getUnreadCount(false);
            $scope.getSupportUnreadCount = getUnreadCount(true);

            function getUnreadCount(isSupport) {
                return function() {
                    var unreadCount = 0;
                    $filter('conversation')(conversations.all, true, isSupport)
                        .forEach(function(conversation) {
                            if (isSupport && conversation.queueEntry && conversation.queueEntry.isTransferringToMe)
                                return;
                            unreadCount += conversation.unreadCount;
                        });
                    return conversationFactory.formatUnreadCount(unreadCount);
                }
            }
            $scope.$watch(function() {
                return $scope.getChatUnreadCount() + $scope.getSupportUnreadCount();
            }, function(unreadCount) {
                CustomEvent.fireTop('connect:message_notification.update', unreadCount);
            });
        }
    };
});;