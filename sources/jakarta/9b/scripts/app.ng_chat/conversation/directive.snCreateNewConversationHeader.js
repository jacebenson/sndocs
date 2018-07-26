/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snCreateNewConversationHeader.js */
angular.module('sn.connect.conversation').directive('snCreateNewConversationHeader', function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snCreateNewConversationHeader.xml'),
    replace: true,
    link: function(scope, elem) {
      var input;
      scope.focusOnInput = function() {
        if (!input)
          input = elem.find("input");
        input.focus();
      };
      scope.scrollRecipientListToBottom = function() {
        $timeout(function() {
          var recipientListElem = document.getElementById("create-conversation-recipient-list");
          recipientListElem.scrollTop = recipientListElem.scrollHeight;
        }, 0, false);
      };
      var unWatch = scope.$on("live.search.control.ready", function(evt, control) {
        if (control)
          input = control;
        $timeout(scope.focusOnInput, 0, false);
        unWatch();
      });
    },
    controller: function($scope, $rootScope, activeConversation, conversations, snCustomEvent) {
      snCustomEvent.observe('connect:member_profile.direct_message', function(suggestion) {
        $scope.selectedMember(null, suggestion);
        if (suggestion)
          $scope.$broadcast("connect.message.focus", $scope.newConversation);
      });
      $rootScope.$on("connect.member_profile.direct_message", function(evt, suggestion) {
        $scope.selectedMember(null, suggestion);
        if (suggestion)
          $scope.$broadcast("connect.message.focus", $scope.newConversation);
      });

      function updatePendingConversation() {
        var conversation = conversations.newConversation;
        var pendingRecipients = conversation.pendingRecipients;
        if (pendingRecipients.length === 1) {
          var userSysID = pendingRecipients[0].sysID;
          var cachedPeerConversation = conversations.getCachedPeerConversations(userSysID)[0];
          if (cachedPeerConversation) {
            conversation = angular.copy(cachedPeerConversation);
            conversation.isPending = true;
          }
        }
        activeConversation.pendingConversation = conversation;
      }
      $scope.pendingRecipients = function() {
        return conversations.newConversation.pendingRecipients;
      };
      $scope.isAddUserShowing = function() {
        return !conversations.newConversation.firstMessage;
      };
      $scope.ignoreList = function() {
        return conversations.newConversation.pendingRecipients.map(function(recipient) {
          return recipient.sysID;
        }).join(',');
      };
      $scope.selectedMember = function(id, suggestion) {
        var sys_id = suggestion.sys_id || suggestion.userID || suggestion.jid.split(".")[1];
        var recipient = {
          name: suggestion.name,
          jid: suggestion.jid || (suggestion.table + "." + sys_id),
          sysID: sys_id
        };
        var alreadyAdded = conversations.newConversation.pendingRecipients
          .some(function(obj) {
            return angular.equals(obj, recipient);
          });
        if (!alreadyAdded) {
          conversations.newConversation.pendingRecipients.push(recipient);
          updatePendingConversation();
        }
        $scope.scrollRecipientListToBottom();
      };
      $scope.removeRecipient = function(event, index) {
        if (event && event.keyCode === 9)
          return;
        conversations.newConversation.pendingRecipients.splice(index, 1);
        updatePendingConversation();
        $scope.focusOnInput();
      };
      $scope.$on("connect.search_control_key", function(evt, key) {
        $scope.$evalAsync(function() {
          if (key === "backspace") {
            conversations.newConversation.pendingRecipients.pop();
            updatePendingConversation();
          } else if (key === "enter")
            $rootScope.$broadcast("connect.message.focus", activeConversation.pendingConversation);
          else if (key === "escape")
            $scope.$emit("connect.new_conversation.cancelled");
        });
      });
      $scope.$on("connect.message_control_key", function(evt, key) {
        if (key === "escape")
          $scope.$emit("connect.new_conversation.cancelled");
      });
    }
  };
});;