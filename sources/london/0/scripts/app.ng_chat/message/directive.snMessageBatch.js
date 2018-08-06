/*! RESOURCE: /scripts/app.ng_chat/message/directive.snMessageBatch.js */
angular.module('sn.connect.message').directive('snMessageBatch', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snMessageBatch.xml'),
    scope: {
      batch: '=',
      isGroupConversation: '=',
      disableAvatarPopovers: '=?'
    },
    controller: function($scope, showAgentAvatar, inSupportClient) {
      $scope.isSystemMessage = function() {
        return $scope.batch.isSystemMessage;
      };
      $scope.inSupportClient = inSupportClient;
      $scope.isQueueAvatarShowing = function() {
        return (inSupportClient && !showAgentAvatar && $scope.batch.isFromPeer) || $scope.isFromQueue();
      };
      $scope.isFromQueue = function() {
        return $scope.batch.profileData && $scope.batch.profileData.table === 'chat_queue_entry';
      };
      $scope.isTextShowing = function(message) {
        return message.isMessageShowing && !message.uploadingFiles;
      };
      if (!$scope.batch.profileData) {
        var unwatch = $scope.$watch('batch.profileData', function(newVal) {
          if (newVal) {
            $scope.profileData = newVal;
            unwatch();
          }
        })
      } else {
        $scope.profileData = $scope.batch.profileData;
      }
    }
  }
});;