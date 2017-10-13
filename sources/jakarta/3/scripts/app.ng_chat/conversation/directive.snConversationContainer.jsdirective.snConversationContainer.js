/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationContainer.js */
angular.module('sn.connect.conversation').directive('snConversationContainer', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snConversationContainer.xml'),
    replace: true,
    scope: {},
    controller: function($scope, $timeout, conversations, activeConversation, screenWidth) {
      $scope.activeConversation = activeConversation;
      var loading = true;
      conversations.loaded.then(function() {
        loading = false;
      });
      $scope.$on("connect.new_conversation.cancelled", function() {
        activeConversation.pendingConversation = undefined;
      });
      $scope.$on("connect.new_conversation.complete", function() {
        activeConversation.pendingConversation = undefined;
      });
      $scope.$on("connect.show_create_conversation_screen", function(unused, preloadedMember) {
        activeConversation.pendingConversation = conversations.newConversation.$reset();
        activeConversation.tab = 'chat';
        if (preloadedMember)
          $timeout(function() {
            $scope.$emit("connect.member_profile.direct_message", preloadedMember);
          });
      });
      $scope.showLoading = function() {
        return loading;
      };
      $scope.showIntroduction = function() {
        return !loading && activeConversation.isEmpty;
      };
      $scope.showConversation = function() {
        return !loading && !activeConversation.isEmpty;
      };
      $scope.showSidePanel = function() {
        return $scope.showConversation() && screenWidth.isAbove(800);
      };
      $scope.isCloseNewConversationShowing = function() {
        return !conversations.newConversation.firstMessage;
      };
      $scope.closeNewConversation = function() {
        $scope.$emit("connect.new_conversation.cancelled");
      };
    }
  }
});;