/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationList.js */
angular.module('sn.connect.conversation').directive('snConversationList', function(getTemplateUrl, i18n) {
    'use strict';
    var unreadMessage = 'Unread Messages';
    i18n.getMessages([unreadMessage], function(i18nNames) {
        unreadMessage = i18nNames[unreadMessage];
    });
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl('snConversationList.xml'),
        scope: {
            headerText: '@',
            isHelpDesk: '=?',
            filter: '&?',
            isHeaderVisible: '&?'
        },
        controller: function($scope, $rootScope, conversations, activeConversation, inSupportClient) {
            $scope.isHelpDesk = $scope.isHelpDesk || false;
            $scope.conversations = [];
            if (angular.isUndefined($scope.isHeaderVisible)) {
                $scope.isHeaderVisible = function() {
                    return function() {
                        return $scope.conversations.length > 0;
                    };
                }
            } else {
                var value = $scope.isHeaderVisible();
                if (!angular.isFunction(value)) {
                    $scope.isHeaderVisible = function() {
                        return function() {
                            return value;
                        };
                    }
                }
            }
            $scope.$watchCollection(function() {
                if ($scope.filter)
                    return $scope.filter()(conversations.all);
                return conversations.all;
            }, function(conversations) {
                $scope.conversations = conversations || [];
            });
            $scope.isActive = function(conversation) {
                return activeConversation.isActive(conversation);
            };
            $scope.selectConversation = function(event, conversation) {
                if (event && event.keyCode === 9)
                    return;
                $rootScope.$broadcast('connect.open.floating', conversation);
                $rootScope.$broadcast("connect.new_conversation.cancelled");
                activeConversation.conversation = conversation;
            };
            $scope.getAriaText = function(conversation) {
                var text = inSupportClient ?
                    conversation.description :
                    conversation.name;
                text += conversation.unreadCount ?
                    ' ' + conversation.formattedUnreadCount + ' ' + unreadMessage :
                    '';
                return text;
            }
            $scope.conversationDelta = function(conversation) {
                return conversation.sysID + conversation.avatar + conversation.name;
            }
        }
    };
});;