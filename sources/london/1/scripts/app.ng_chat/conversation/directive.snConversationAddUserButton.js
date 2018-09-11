/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationAddUserButton.js */
angular.module('sn.connect.conversation').directive('snConversationAddUserButton', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    scope: {
      conversation: "="
    },
    templateUrl: getTemplateUrl("snConversationAddUserButton.xml"),
    controller: function($scope, $rootScope, conversations, activeConversation) {
      $scope.userSelected = function(user) {
        conversations.addUser($scope.conversation.sysID, user)
          .then(function(conversation) {
            activeConversation.conversation = conversation;
          })
      };
    }
  }
});;