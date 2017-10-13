/*! RESOURCE: /scripts/app.ng_chat/util/service.snConversationAsideHistory.js */
angular.module("sn.connect.util").service("snConversationAsideHistory", function() {
  "use strict";
  var conversationAsides = {};

  function getHistory(conversation) {
    if (conversationAsides.hasOwnProperty(conversation))
      return conversationAsides[conversation];
    return false;
  }

  function saveAsideHistory(conversation, view) {
    conversationAsides[conversation] = view;
  }

  function clearAsideHistory(conversation) {
    delete conversationAsides[conversation];
  }
  return {
    getHistory: getHistory,
    saveHistory: saveAsideHistory,
    clearHistory: clearAsideHistory
  }
});;