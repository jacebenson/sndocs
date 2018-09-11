/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snSupportConversationItem.js */
angular.module('sn.connect.conversation').directive('snSupportConversationItem', function(getTemplateUrl, inSupportClient) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl(inSupportClient ? 'snConversationItem-SupportClient.xml' : 'snSupportConversationItem.xml'),
    replace: true,
    require: 'snConversationItem',
    scope: {
      conversation: '='
    },
    controller: function($scope, $rootScope, activeConversation, queueEntries,
      queueEntryNotifier, supportEnabled, inFrameSet, snConversationItemDirective) {
      var parent = snConversationItemDirective[0].controller.apply(this, arguments);
      $scope.supportEnabled = supportEnabled || false;
      for (var i = 0; i < $scope.conversation.members.length; i++)
        if ($scope.conversation.members[i].document === $scope.conversation.queueEntry.openedBy)
          $scope.openedBy = $scope.conversation.members[i];
      $scope.acceptTransfer = function($event) {
        $event.stopPropagation();
        $scope.conversation.queueEntry.clearTransferState();
        queueEntries.accept($scope.conversation.sysID);
        activeConversation.conversation = $scope.conversation;
      };
      $scope.rejectTransfer = function($event) {
        $event.stopPropagation();
        $scope.conversation.queueEntry.clearTransferState();
        queueEntries.reject($scope.conversation.sysID);
        if ($scope.conversation.queueEntry.transferShouldClose)
          parent.closeConversation();
      };
      $scope.cancelTransfer = function($event) {
        $event.stopPropagation();
        $scope.conversation.queueEntry.clearTransferState();
        queueEntries.cancel($scope.conversation.sysID);
      };
      $scope.isTransferPending = function() {
        return !!$scope.conversation.isHelpDesk && $scope.conversation.queueEntry.isTransferPending;
      };
      $scope.isSendingTransfer = function() {
        return $scope.isTransferPending() && $scope.conversation.queueEntry.isTransferringFromMe;
      };
      $scope.isReceivingTransfer = function() {
        return $scope.isTransferPending() && $scope.conversation.queueEntry.isTransferringToMe;
      };
      $rootScope.$on("connect.queueEntry.updated", queueEntryUpdated);
      queueEntryUpdated(undefined, $scope.conversation.queueEntry);

      function queueEntryUpdated(event, queueEntry, old) {
        if (queueEntry.conversationID !== $scope.conversation.sysID)
          return;
        if (!queueEntry)
          return;
        var initial = angular.isUndefined(old);
        if (!queueEntry.isTransferStateChanged && !initial)
          return;
        if ((inFrameSet || activeConversation.isEmpty) &&
          queueEntry.isTransferringToMe && queueEntry.isTransferPending)
          activeConversation.conversation = $scope.conversation;
        var isTransferNegative = queueEntry.isTransferCancelled || queueEntry.isTransferRejected;
        if (queueEntry.isTransferringToMe &&
          queueEntry.transferShouldClose &&
          isTransferNegative)
          parent.closeConversation();
        queueEntryNotifier.notify($scope.conversation);
      }
    }
  };
});;