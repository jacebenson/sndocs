/*! RESOURCE: /scripts/app.ng_chat/util/service.connectDropTarget.js */
angular.module('sn.connect.util').service('connectDropTargetService', function($rootScope, activeConversation) {
  'use strict';

  function isIgnoreDrop(conversation) {
    if (!conversation.amMember)
      return false;
    if (conversation.isPending && !conversation.isPendingNoRecipients)
      return false;
    return (conversation.isHelpDesk && conversation.queueEntry.isPermanentlyClosed)
  }
  return {
    activateDropTarget: function(conversation) {
      conversation = conversation || activeConversation.conversation;
      if (isIgnoreDrop(conversation))
        return;
      $rootScope.$broadcast("connect.drop_target_popup.show", conversation.sysID);
    },
    deactivateDropTarget: function(conversation) {
      conversation = conversation || activeConversation.conversation;
      if (isIgnoreDrop(conversation))
        return;
      $rootScope.$broadcast("connect.drop_target_popup.hide", conversation.sysID);
    },
    onFileDrop: function(files, conversation) {
      conversation = conversation || activeConversation.conversation;
      if (isIgnoreDrop(conversation))
        return;
      this.deactivateDropTarget(conversation);
      $rootScope.$broadcast("connect.drop.files", files, conversation.sysID);
    },
    handleDropEvent: function(data, conversation) {
      conversation = conversation || activeConversation.conversation;
      if (isIgnoreDrop(conversation))
        return;
      this.deactivateDropTarget(conversation);
      $rootScope.$broadcast("connect.drop", data, conversation.sysID);
    }
  };
});;