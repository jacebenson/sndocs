/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationHeader.js */
angular.module('sn.connect').directive('snConversationHeader', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snConversationHeader.xml'),
    replace: true,
    scope: {
      conversation: '='
    },
    controller: function($scope, $element, $timeout, conversations, snAttachmentHandler, userID) {
      $scope.conversationTemp = {};
      $scope.middleAlignName = false;
      $scope.userID = userID;
      $scope.canEdit = function() {
        return $scope.conversation && $scope.conversation.isGroup;
      };
      $scope.getPrimaryUser = function() {
        return $scope.conversation.isGroup ?
          $scope.conversation.lastMessage.profileData :
          $scope.conversation.peer;
      };
      $scope.onlyShowName = function() {
        if ($scope.conversation.isHelpDesk)
          return false;
        if ($scope.conversation.isGroup)
          return !$scope.showDescription();
        if (!$scope.conversation.peer)
          return true;
        var detail = $scope.conversation.peer.detail;
        return !detail || !(detail.department || detail.city);
      };
      $scope.showDescription = function() {
        return $scope.conversation.isGroup && !(!$scope.conversation.description || $scope.conversation.description === "") &&
          !($scope.conversation.isHelpDesk && $scope.conversation.queueEntry.isTransferPending);
      };
      $scope.isEditable = function() {
        return $scope.conversation.isGroup && !$scope.conversation.isHelpDesk && $scope.conversation.amMember;
      };
      $scope.saveGroupEdit = function() {
        conversations.update($scope.conversation.sysID, $scope.conversationTemp);
      };
      $scope.openModal = function(evt) {
        if (evt.keyCode === 9 || !$scope.isEditable())
          return;
        $scope.conversationTemp = {
          name: $scope.conversation.name,
          description: $scope.conversation.description,
          access: $scope.conversation.access
        };
        angular.element("#chatGroupPopupModal").modal('show').find("#groupName").focus();
      };
      $scope.stopProp = function(event) {
        event.stopPropagation();
      };
      $scope.uploadNewGroupImage = function() {
        if ($scope.conversation.amMember)
          $timeout(function() {
            $element.find(".message-attach-file").click();
          }, 0, false);
      };
      $scope.getImageBackground = function() {
        return {
          'background-image': "url('" + $scope.conversation.avatar + "')"
        }
      };
      $scope.attachFiles = function(files) {
        $scope.uploading = true;
        snAttachmentHandler.create("live_group_profile", $scope.conversation.sysID).uploadAttachment(files.files[0], {
          sysparm_fieldname: "photo"
        }).then(function(response) {
          conversations.refreshConversation($scope.conversation.sysID);
          $scope.conversation.avatar = response.sys_id + ".iix";
          $scope.uploading = false;
        });
      }
    }
  };
});;