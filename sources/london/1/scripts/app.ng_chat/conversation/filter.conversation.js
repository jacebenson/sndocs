/*! RESOURCE: /scripts/app.ng_chat/conversation/filter.conversation.js */
angular.module('sn.connect.conversation').filter('conversation', function(
  inSupportClient, supportEnabled, supportAddMembers, closedConversationLimit) {
  'use strict';

  function isConversationDisplayable(conversation, isHelpDesk) {
    if (conversation.type == "interaction") {
      return false;
    }
    if (inSupportClient)
      return conversation.isHelpDesk && conversation.queueEntry.isOpenedByMe;
    if (isHelpDesk !== conversation.isHelpDesk)
      return false;
    if (!isHelpDesk)
      return true;
    return (supportEnabled || supportAddMembers) &&
      !conversation.queueEntry.isOpenedByMe;
  }

  function isOpenSession(conversation, isOpenSession) {
    if (!conversation.isHelpDesk)
      return false;
    return !isOpenSession ===
      (conversation.queueEntry.isClosedByAgent || conversation.queueEntry.isAbandoned);
  }

  function isVisible(conversation, visible) {
    return conversation.visible === visible;
  }

  function filter(input, filter, fn) {
    return angular.isUndefined(filter) ?
      input :
      input.filter(function(conversation) {
        return fn(conversation, filter);
      });
  }
  return function(input, visible, helpDesk, openSession) {
    if (angular.isObject(visible)) {
      var object = visible;
      visible = object.visible;
      helpDesk = object.helpDesk;
      openSession = object.openSession;
    }
    input = filter(input, visible, isVisible);
    input = filter(input, helpDesk, isConversationDisplayable);
    input = filter(input, openSession, isOpenSession);
    input.sort(function(conv1, conv2) {
      return conv2.sortIndex - conv1.sortIndex;
    });
    if (angular.isDefined(openSession) && !openSession && closedConversationLimit)
      input = input.slice(0, closedConversationLimit);
    return input;
  }
});;