/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snFloatingConversationContainer.js */
angular.module('sn.connect.conversation').directive('snFloatingConversationContainer', function(
    getTemplateUrl, $rootScope, documentLinkMatcher, conversations, activeConversation) {
    "use strict";
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl('snFloatingConversationContainer.xml'),
        scope: {},
        link: function(scope) {
            var mainFrame = angular.element("#gsft_main");
            if (mainFrame.length > 0) {
                scope.$watch(function() {
                    return mainFrame[0].contentDocument.location.href;
                }, checkForRecord);
                mainFrame.on("load", function() {
                    scope.$digest();
                });
                mainFrame.on("click", function() {
                    scope.$apply(function() {
                        checkForRecord(mainFrame[0].contentDocument.location.href)
                    })
                })
            }
            CustomEvent.observe("connect:open_group", function(data) {
                conversations.followDocumentConversation(data).then(function(conversation) {
                    activeConversation.conversation = conversation;
                })
            });
            CustomEvent.observe("connect:follow_document", conversations.followDocumentConversation);
            CustomEvent.observe("connect:unfollow_document", conversations.unfollowDocumentConversation);

            function checkForRecord(newValue) {
                if (!documentLinkMatcher.isLink(newValue))
                    return;
                $rootScope.$broadcast("connect.spotlight", documentLinkMatcher.getRecordData(newValue));
            }
        },
        controller: function($scope, $element, $filter, $timeout, $window, snRecordPresence, conversationPersister, isRTL) {
            angular.element('document').append($element);
            var FRAME_SPACING = 350;
            var FRAME_COMPRESSED = 60;
            var FRAME_SEPARATOR = 10;
            var ASIDE_WIDTH = 285;
            $scope.activeConversation = activeConversation;
            conversations.refreshAll().then(function() {
                activeConversation.conversation = getFirstFocusConversation();
            });
            $scope.filterConversations = function() {
                return $filter('frameSet')(conversations.all);
            };
            var isAsideOpen = false;
            CustomEvent.observe("connect:conversation_list:state", function(state) {
                isAsideOpen = state === "open";
                resize();
            });
            angular.element($window).bind('resize', resize);
            var conversationDisplayCount = calculateConversationDisplayCount();
            var resizeTimeout;

            function resize() {
                if (resizeTimeout)
                    $timeout.cancel(resizeTimeout);
                resizeTimeout = $timeout(function() {
                    conversationDisplayCount = calculateConversationDisplayCount();
                }, 100);
            }

            function calculateConversationDisplayCount() {
                var frameWidth = $window.innerWidth;
                if (isAsideOpen)
                    frameWidth -= ASIDE_WIDTH;
                var allWidth = $scope.filterConversations().length * FRAME_SPACING;
                frameWidth -= (allWidth > frameWidth) ? FRAME_COMPRESSED : FRAME_SEPARATOR;
                return Math.max(Math.floor(frameWidth / FRAME_SPACING), 1);
            }
            $scope.getConversationDisplayCount = function() {
                return conversationDisplayCount - (activeConversation.pendingConversation ? 1 : 0);
            };
            $scope.getCompressPosition = function() {
                return $scope.getContainerPosition(conversationDisplayCount);
            };
            $scope.getContainerPosition = function(index) {
                return index * FRAME_SPACING + FRAME_SEPARATOR;
            };
            $scope.newConversation = function() {
                return conversations.newConversation;
            };
            $scope.$watch(function() {
                return activeConversation.sysID;
            }, function(sysID) {
                if (!sysID) {
                    activeConversation.conversation = getFirstFocusConversation();
                    sysID = activeConversation.sysID;
                }
                if (sysID)
                    snRecordPresence.initPresence("live_group_profile", sysID);
            });

            function getFirstFocusConversation() {
                if (activeConversation.pendingConversation)
                    return activeConversation.pendingConversation;
                var first = undefined;
                $scope.filterConversations()
                    .some(function(conversation, index) {
                        if (!conversation.isFrameStateOpen)
                            return false;
                        if (index > conversationDisplayCount)
                            return false;
                        first = conversation;
                        return true;
                    });
                return first;
            }
            $scope.$on("connect.show_create_conversation_screen", function(evt, preloadedMember) {
                if (activeConversation.pendingConversation)
                    return;
                activeConversation.pendingConversation = conversations.newConversation.$reset();
                if (preloadedMember)
                    $timeout(function() {
                        $rootScope.$broadcast("connect.member_profile.direct_message", preloadedMember);
                        $timeout(function() {
                            $rootScope.$broadcast("connect.member_profile.direct_message", preloadedMember)
                        }, 0, false);
                    });
            });
            $scope.$on("connect.new_conversation.cancelled", function() {
                activeConversation.pendingConversation = undefined;
                if (activeConversation.isEmpty)
                    activeConversation.conversation = getFirstFocusConversation();
            });
            $scope.$on("connect.new_conversation.complete", function(event, conversation) {
                activeConversation.pendingConversation = undefined;
                moveToTop(conversation);
            });
            $scope.$on("connect.open.floating", function(event, conversation) {
                moveToTop(conversation);
            });

            function moveToTop(conversation) {
                if (conversation.isPending)
                    return;
                if (!conversation)
                    return;
                conversation.openFrameState();
                var conversationList = $scope.filterConversations();
                var position = conversations.find(conversation, conversationList).index;
                if (position < 1) {
                    activeConversation.conversation = conversation;
                    $scope.$broadcast('connect.auto_scroll.jump_to_bottom');
                    return;
                }
                conversationList.splice(position, 1);
                conversationList.unshift(conversation);
                conversationPersister.changeFrameOrder(conversationList.map(function(conversation, index) {
                    conversation.frameOrder = index;
                    return conversation.sysID;
                }));
                activeConversation.conversation = conversation;
                $scope.$broadcast('connect.auto_scroll.jump_to_bottom');
            }
            if (angular.element(document.body).data().layout) {
                var $connectFloating = $element.find('.sn-connect-floating');
                var positionProperty = isRTL ? 'left' : 'right';
                $connectFloating.css(positionProperty, "5px");
                $scope.$on("pane.collapsed", function(evt, position, collapsed) {
                    $connectFloating.css(positionProperty, collapsed ? "5px" : "290px");
                });
            }
        }
    }
});;