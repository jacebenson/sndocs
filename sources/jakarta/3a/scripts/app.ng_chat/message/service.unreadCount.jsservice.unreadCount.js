/*! RESOURCE: /scripts/app.ng_chat/message/service.unreadCount.js */
angular.module('sn.connect.message').service('unreadCountService', function(conversationPersister, messageBatcherService) {
  'use strict';
  var unreadCountObjects = {};

  function setCount(conversationID, lastViewed, count) {
    if (!conversationID)
      return;
    if (angular.isUndefined(lastViewed))
      return;
    unreadCountObjects[conversationID] = {
      timestamp: lastViewed,
      count: count
    }
  }

  function resetCount(conversationID, doNotPersist) {
    var batches = messageBatcherService.getBatcher(conversationID).batches;
    var lastMessageTime = (batches.length > 0) ?
      batches[batches.length - 1].lastMessage.timestamp :
      new Date().getTime();
    var old = unreadCountObjects[conversationID];
    unreadCountObjects[conversationID] = {
      timestamp: lastMessageTime
    };
    if (doNotPersist)
      return;
    if (old && (old.timestamp === lastMessageTime))
      return;
    conversationPersister.lastViewed(conversationID, lastMessageTime);
  }

  function getCount(conversationID) {
    var unreadCountObject = unreadCountObjects[conversationID];
    if (!unreadCountObject)
      return 0;
    var batches = messageBatcherService.getBatcher(conversationID).batches;
    var count = 0;
    batches.forEach(function(batch) {
      if (count > 0) {
        count += batch.messages.length;
        return;
      }
      if (unreadCountObject.timestamp < batch.lastMessage.timestamp) {
        var messages = batch.messages;
        for (var i = 0; i < messages.length; ++i) {
          if (unreadCountObject.timestamp < messages[i].timestamp) {
            count = messages.length - i;
            break;
          }
        }
      }
    });
    return unreadCountObject.count ?
      Math.max(count, unreadCountObject.count) :
      count;
  }

  function getTimestamp(conversationID) {
    var unreadCounts = unreadCountObjects[conversationID];
    return unreadCounts ?
      unreadCounts.timestamp :
      0;
  }
  return {
    set: setCount,
    get: getCount,
    reset: resetCount,
    getLastTimestamp: getTimestamp
  };
});;