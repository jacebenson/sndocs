/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationFooter.js */
angular.module('sn.connect.conversation').directive('snConversationFooter', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snConversationFooter.xml"),
    replace: true,
    scope: {
      conversation: "="
    },
    controller: function($scope, $rootScope, amb, uploadAttachmentService, queueEntries, inSupportClient, showActionsForClosedCases) {
      $scope.amb = amb;
      var snHttpError = false;
      $scope.$on('http-error.show', function() {
        snHttpError = true;
      });
      $scope.$on('http-error.hide', function() {
        snHttpError = false;
      });

      function getNoticeType() {
        if (isQueueEntry("isClosedByAgent") || isQueueEntry("isClosedByClient"))
          return "closed session";
        if ($scope.conversation.restricted)
          return "restricted";
        if (amb.interrupted || snHttpError)
          return "connection error";
        if (inSupportClient && isQueueEntry("isReOpenable"))
          return "rejoin";
        if (!inSupportClient && isQueueEntry("isWaiting"))
          return "agent waiting";
        if ($scope.conversation.isPendingNoRecipients)
          return "no recipients";
        if (uploadAttachmentService.filesInProgress.length > 0)
          return "upload in progress";
      }
      $scope.isNoticeShowing = function() {
        return !!getNoticeType();
      };
      $scope.isClosedSessionShowing = function() {
        return getNoticeType() === "closed session";
      };
      $scope.isConnectionErrorShowing = function() {
        return getNoticeType() === "connection error";
      };
      $scope.isRestrictedShowing = function() {
        return getNoticeType() === "restricted";
      };
      $scope.isRejoinShowing = function() {
        return getNoticeType() === "rejoin";
      };
      $scope.isAgentWaitingShowing = function() {
        return getNoticeType() === "agent waiting";
      };
      $scope.isNewConversationNoRecipientsShowing = function() {
        return getNoticeType() === "no recipients";
      };
      $scope.isUploadInProgressShowing = function() {
        return getNoticeType() === "upload in progress";
      };
      $scope.isError = function() {
        return $scope.isRestrictedShowing() || $scope.isConnectionErrorShowing();
      };
      $scope.isQueueNameShowing = function() {
        return isQueueEntry("queue");
      };
      $scope.isQueueNumberShowing = function() {
        return $scope.conversation.table == 'chat_queue_entry';
      };
      $scope.isDocumentNumberShowing = function() {
        return $scope.conversation.hasRecord;
      };

      function isQueueEntry(field) {
        return $scope.conversation.isHelpDesk && $scope.conversation.queueEntry[field];
      }
      $scope.selectSnippet = function(snippet) {
        $scope.$broadcast("connect.conversation.insert_snippet", snippet);
      };
      $scope.rejoin = function() {
        queueEntries.rejoin($scope.conversation.sysID);
      };
      $scope.isMenuVisible = function() {
        return !inSupportClient &&
          !$scope.conversation.isEmpty &&
          $scope.conversation.chatActions &&
          $scope.conversation.chatActions.getMenuActions().length > 0 &&
          (!isQueueEntry("isClosedByAgent") || showActionsForClosedCases);
      };
    }
  }
});;