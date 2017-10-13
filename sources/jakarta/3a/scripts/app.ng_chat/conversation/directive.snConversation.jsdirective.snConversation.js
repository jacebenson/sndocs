/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversation.js */
angular.module('sn.connect.conversation').directive('snConversation', function(
  getTemplateUrl, $rootScope, $timeout, messageService, activeConversation, profiles) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snConversation.xml"),
    replace: true,
    scope: {
      conversation: "=",
      shouldAnnounce: "=readmessages",
      showSenderPresence: "@"
    },
    link: function(scope, element) {
      scope.loading = false;
      scope.$watch("messagesLoadedOnce", function() {
        var isConversationActive = !activeConversation.pendingConversation;
        if (isConversationActive)
          $timeout(function() {
            var el = element.find('.new-message');
            el.focus()
          }, 0, false);
        $timeout(function() {
          scope.loading = !scope.messagesLoadedOnce && isConversationActive;
        }, 0, true);
      });
      scope.checkForUnloadedMessages = function() {
        $timeout(function() {
          var scrollHeight = element.find(".sn-feed-messages")[0].scrollHeight;
          var containerHeight = element.find(".sn-feed-messages").height();
          if (scrollHeight < containerHeight) {
            scope.retrieveMessageHistory().then(function(retrievedMessages) {
              if (retrievedMessages.length === 30)
                scope.checkForUnloadedMessages();
              else
                $timeout(function() {
                  scope.$broadcast('connect.auto_scroll.jump_to_bottom');
                }, 0, false);
            });
          }
        });
      };

      function onClick(evt) {
        $timeout(function() {
          var profileID = angular.element(evt.target).attr('class').substring("at-mention at-mention-user-".length);
          profiles.getAsync(profileID).then(function(profile) {
            scope.showPopover = true;
            scope.mentionPopoverProfile = profile;
            scope.clickEvent = evt;
          });
        }, 0, false);
      }
      element.on("click", ".at-mention", function(evt) {
        if (scope.showPopover) {
          var off = scope.$on("snMentionPopover.showPopoverIsFalse", function() {
            onClick(evt);
            off();
          });
        } else {
          onClick(evt);
        }
      });
      element.on("click", function(evt) {
        scope.focusOnConversation();
      });
    },
    controller: function($scope, $element, $q, snRecordPresence, queueEntries, hotKeyHandler, snHotKey,
      snComposingPresence, userID, inFrameSet) {
      $scope.messagesLoadedOnce = false;
      $scope.showLoading = true;
      $scope.rawMessages = [];
      $scope.asideOpen = false;
      $scope.$on("sn.aside.open", function() {
        $scope.asideOpen = true;
      });
      $scope.$on("sn.aside.close", function() {
        $scope.asideOpen = false;
      });
      $scope.isComposingHidden = function() {
        return $scope.conversation.isHelpDesk && !$scope.conversation.queueEntry.isActive;
      };
      var closeHotKey = new snHotKey({
        key: "ESC",
        callback: function() {
          $scope.$broadcast("snippets.hide", $scope.conversation);
          hotKeyHandler.remove(closeHotKey);
        }
      });
      $scope.escalateOk = function() {
        queueEntries.escalate($scope.conversation);
      };
      $rootScope.$on('http-error.hide', function() {
        messageService.retrieveMessages($scope.conversation);
      });
      $scope.isNoRecipientsMessageShowing = function() {
        return hasNoMessage() && $scope.conversation.pendingRecipients.length === 0;
      };
      $scope.isOneRecipientsMessageShowing = function() {
        return hasNoMessage() && $scope.conversation.pendingRecipients.length === 1;
      };
      $scope.isGroupMessageShowing = function() {
        return hasNoMessage() && $scope.conversation.pendingRecipients.length > 1;
      };

      function hasNoMessage() {
        return !$scope.conversation.firstMessage;
      }

      function isVisible() {
        return ($element[0].offsetWidth !== 0) && ($element[0].offsetHeight !== 0);
      }
      $scope.$watch(isVisible, function(visible) {
        if (!visible || $scope.conversation.isPending)
          return;
        if (inFrameSet && $scope.conversation.isFrameStateMinimize)
          return;
        $scope.conversation.resetUnreadCount();
      });
      $scope.$watch("conversation.sysID", function(newSysID) {
        if (!newSysID)
          return;
        if ($scope.conversation.isPending)
          return;
        $scope.messagesLoadedOnce = false;
        $scope.conversationAlreadyViewed = $scope.conversation.unreadCount > 0;
        $scope.rawMessages = [];
        $scope.previousProfileID = void(0);
        if (!$scope.conversation)
          return;
        if ($scope.conversation.sysID) {
          snComposingPresence.set($scope.conversation.sysID, {
            viewing: [],
            typing: []
          });
          snRecordPresence.initPresence("live_group_profile", $scope.conversation.sysID);
        }
        refreshMessages().then(function(loadedMessages) {
          if (loadedMessages.length === 30)
            $scope.checkForUnloadedMessages();
        });
      });
      $scope.$root.$on("sn.sessions", function(name, data) {
        if (!$scope.conversation || !$scope.conversation.members)
          return;
        var viewing = {};
        var typing = {};
        angular.forEach(data, function(value) {
          if (value.user_id === userID)
            return;
          var conversationID = $scope.conversation.sysID;
          if (value.sys_id === conversationID) {
            if (value.status === "typing") {
              typing[value.user_id] = true;
              delete viewing[value.user_id];
            } else if ((value.status === "viewing" || value.status === "entered") && !typing[value.user_id]) {
              viewing[value.user_id] = true;
            }
          }
        });
        var conversationViewing = [];
        var conversationTyping = [];
        if ($scope.conversation.amMember) {
          angular.forEach($scope.conversation.members, function(member) {
            if (viewing[member.document])
              conversationViewing.push(member);
            if (typing[member.document])
              conversationTyping.push(member);
          });
          snComposingPresence.set($scope.conversation.sysID, {
            viewing: conversationViewing,
            typing: conversationTyping
          });
        }
      });
      $scope.$on("conversation.refresh_messages", function(e, data) {
        if ($scope.conversation.sysID !== data.sysID)
          return;
        refreshMessages();
      });
      $scope.$on("amb.connection.recovered", refreshMessages);

      function refreshMessages() {
        return messageService.retrieveMessages($scope.conversation)
          .then(function(loadedMessages) {
            $timeout(function() {
              $scope.$broadcast('connect.auto_scroll.jump_to_bottom');
            }, 500);
            $scope.messagesLoadedOnce = true;
            return loadedMessages;
          })
          .catch(function() {
            $scope.messagesLoadedOnce = true;
            return [];
          });
      }
      $scope.focusOnConversation = function() {
        if (activeConversation.pendingConversation)
          $rootScope.$broadcast("connect.message.focus", this.conversation);
        else
          activeConversation.conversation = $scope.conversation;
      };
      $scope.retrieveMessageHistory = function() {
        if ($scope.conversation.isPending ||
          $scope.conversation.restricted ||
          !$scope.conversation.messageBatcher.batches.length)
          return $q.when([]);
        var earliestReceivedTime = $scope.conversation.firstMessage.timestamp;
        var promise = messageService.retrieveMessages($scope.conversation, earliestReceivedTime);
        if (!promise)
          return $q.when([]);
        var deferred = $q.defer();
        promise.then(function(retrievedMessages) {
          $scope.messagesLoadedOnce = false;
          $scope.rawMessages = [];
          $scope.messagesLoadedOnce = true;
          deferred.resolve(retrievedMessages);
        });
        return deferred.promise;
      };
      $scope.$on("ngRepeat.complete", function(e) {
        if (angular.equals(e.targetScope, $scope))
          return;
        $scope.$broadcast("ngRepeat.complete");
      });
    }
  }
});;