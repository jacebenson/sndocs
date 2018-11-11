/*! RESOURCE: /scripts/app.ng_chat/message/service.messageBatcher.js */
angular.module('sn.connect.message').service("messageBatcherService", function(i18n, $filter, liveProfileID) {
  "use strict";
  var yesterday = "Yesterday";
  var today = "Today";
  i18n.getMessages([yesterday, today], function(results) {
    yesterday = results[yesterday];
    today = results[today];
  });
  var MINIMUM_TIME = 20 * 60 * 1000;

  function getMonthCount(date) {
    return (date.getFullYear() * 12 + date.getMonth());
  }

  function getDayCount(date) {
    return (date.getFullYear() * 365 + date.getMonth() * 30 + date.getDate());
  }

  function MessageBatch(messages, isLastBatchFn) {
    return {
      messages: messages,
      get firstMessage() {
        return this.messages[0];
      },
      get lastMessage() {
        return this.messages[this.messages.length - 1]
      },
      get batchID() {
        return this.firstMessage.sysID + "" + this.lastMessage.sysID;
      },
      get isFromPeer() {
        return !!this.firstMessage.isFromPeer;
      },
      get isSystemMessage() {
        return !!this.firstMessage.isSystemMessage;
      },
      get profileData() {
        return this.firstMessage.profileData;
      },
      get createdOn() {
        return this.lastMessage.createdOn;
      },
      get timestamp() {
        return this.lastMessage.timestamp;
      },
      get isLastBatch() {
        return isLastBatchFn(this);
      },
      get systemMessageLink() {
        if (this.lastMessage.hasSystemLink)
          return this.lastMessage.links[0];
      },
      getSeparator: function() {
        var timestamp = new Date(this.lastMessage.timestamp);
        var now = new Date();
        var hasYear = now.getFullYear() - timestamp.getFullYear() > 0;
        if (hasYear && getMonthCount(now) - getMonthCount(timestamp) > 12)
          return $filter('date')(timestamp, 'yyyy');
        var hasMonth = now.getMonth() - timestamp.getMonth() > 0;
        if ((hasMonth || hasYear) && getDayCount(now) - getDayCount(timestamp) > 30)
          return $filter('date')(timestamp, 'MMMM yyyy');
        var hasDay = now.getDate() - timestamp.getDate() > 0;
        if (hasMonth || hasYear || hasDay) {
          if (now.getDate() - timestamp.getDate() === 1)
            return yesterday;
          return $filter('date')(timestamp, 'longDate');
        }
        return today;
      }
    }
  }
  var messageBatchers = {};
  var ariaMessages = {};

  function compare(message1, message2) {
    if (message1.id && message2.id)
      return message1.id < message2.id ? -1 : 1;
    return message1.timestamp - message2.timestamp;
  }

  function MessageBatcher() {
    var messageBatchMap = {};
    var batches = [];

    function isLastBatchFn(batch) {
      return lastBatch() === batch;
    }

    function lastBatch() {
      return batches[batches.length - 1];
    }

    function add(message) {
      if (batches.length == 0) {
        insertNewBatch(0, [message]);
        return true;
      }
      var batch = messageBatchMap[message.sysID];
      if (batch) {
        update(batch, message);
        return false;
      }
      for (var i = 0; i < batches.length; ++i) {
        batch = batches[i];
        var insert = insertAt(batch, message);
        if (insert === "after")
          continue;
        if (insert === "before") {
          insertNewBatch(i, [message]);
          return true;
        }
        var isLast = (insert === batch.messages.length);
        if (isBatchable(batch, message)) {
          if (isLast) {
            var next = batches[i + 1];
            if (next && compare(message, next.firstMessage) > 0)
              continue;
          }
          batch.messages.splice(insert, 0, message);
          messageBatchMap[message.sysID] = batch;
          coalesce(i);
          return true;
        }
        if (insert === 0) {
          insertNewBatch(i, [message]);
          return true;
        }
        if (!isLast) {
          split(i, insert);
          insertNewBatch(i + 1, [message]);
          return true;
        }
      }
      insertNewBatch(batches.length, [message]);
      return true;
    }

    function update(batch, message) {
      if (message.isPlaceholder)
        return;
      for (var i = 0; i < batch.messages.length; ++i) {
        if (batch.messages[i].sysID === message.sysID) {
          batch.messages[i] = message;
          break;
        }
      }
    }

    function insertAt(batch, message) {
      if (!isInRange(message, batch.firstMessage))
        return "before";
      if (!isInRange(batch.lastMessage, message))
        return "after";
      var messages = batch.messages;
      for (var i = 0; i < messages.length; ++i) {
        if (compare(message, messages[i]) < 0)
          return i;
      }
      return messages.length;
    }

    function isBatchable(batch, message) {
      if (message.isSystemMessage)
        return false;
      var first = batch.firstMessage;
      return !first.isSystemMessage &&
        (message.profile === first.profile);
    }

    function mapMessageToBatch(batch, messages) {
      messages.forEach(function(message) {
        messageBatchMap[message.sysID] = batch;
      });
    }

    function coalesce(batchIndex) {
      var curr = batches[batchIndex];
      var remove = batchIndex + 1;
      var next = batches[remove];
      if (!next)
        return;
      if (!isBatchable(curr, next.firstMessage))
        return;
      if (!isInRange(curr.lastMessage, next.firstMessage))
        return;
      batches.splice(remove, 1);
      curr.messages = curr.messages.concat(next.messages);
      mapMessageToBatch(curr, next.messages);
    }

    function split(batchIndex, messageIndex) {
      var batch = batches[batchIndex];
      insertNewBatch(batchIndex + 1, batch.messages.slice(messageIndex));
      batch.messages = batch.messages.slice(0, messageIndex);
    }

    function insertNewBatch(batchIndex, messages) {
      var batch = new MessageBatch(messages, isLastBatchFn);
      batches.splice(batchIndex, 0, batch);
      mapMessageToBatch(batch, messages);
    }

    function isInRange(message1, message2) {
      return message1.timestamp + MINIMUM_TIME >= message2.timestamp;
    }

    function removeFromBatch(batch, messageIndex) {
      var messages = batch.messages;
      messages.splice(messageIndex, 1);
      var batchIndex = batches.indexOf(batch);
      var length = messages.length;
      if (length === 0) {
        batches.splice(batchIndex, 1);
        return;
      }
      if (messageIndex === length)
        return;
      var prev = messages[messageIndex - 1];
      if (!prev)
        return;
      var curr = messages[messageIndex];
      if (isInRange(prev, curr))
        return;
      split(batchIndex, messageIndex);
    }

    function remove(message) {
      var batch = messageBatchMap[message.sysID];
      if (!batch)
        return false;
      for (var i = 0; i < batch.messages.length; ++i) {
        if (batch.messages[i].sysID === message.sysID) {
          removeFromBatch(batch, i);
          break;
        }
      }
      delete messageBatchMap[message.sysID];
      return true;
    }

    function isSeparator(index) {
      var currTimestamp = new Date(batches[index].timestamp);
      if (index === 0) {
        var now = new Date();
        return getDayCount(now) - getDayCount(currTimestamp) > 0;
      }
      var prevTimestamp = new Date(batches[index - 1].timestamp);
      var hasYear = currTimestamp.getFullYear() - prevTimestamp.getFullYear() > 0;
      var hasMonth = currTimestamp.getMonth() - prevTimestamp.getMonth() > 0;
      var hasDay = currTimestamp.getDate() - prevTimestamp.getDate() > 0;
      return hasYear || hasMonth || hasDay;
    }
    return {
      get batches() {
        return batches;
      },
      get lastBatch() {
        return lastBatch();
      },
      isSeparator: isSeparator,
      addMessage: add,
      removeMessage: remove
    }
  }

  function add(message, results) {
    if (!message.conversationID)
      return results;
    var batcher = messageBatchers[message.conversationID];
    if (!batcher)
      batcher = messageBatchers[message.conversationID] = new MessageBatcher();
    var added = batcher.addMessage(message);
    if (added) {
      results.added.push(message);
      if (message.profile !== liveProfileID || message.isSystemMessage) {
        ariaMessages[message.conversationID] = ariaMessages[message.conversationID] || [];
        ariaMessages[message.conversationID].push(message);
        ariaMessages[message.conversationID].sort(compare);
      }
    } else {
      results.existing.push(message);
    }
    return results;
  }

  function remove(message, results) {
    var batcher = messageBatchers[message.conversationID];
    if (!batcher)
      return results;
    var removed = batcher.removeMessage(message);
    if (removed)
      results.push(message);
    return results;
  }

  function callActionFn(messages, isPlaceholder, results, fn) {
    if (angular.isArray(messages)) {
      messages
        .sort(compare)
        .forEach(function(message) {
          message.isPlaceholder = isPlaceholder;
          fn(message, results);
        });
      return results;
    }
    messages.isPlaceholder = isPlaceholder;
    return fn(messages, results);
  }
  return {
    addMessages: function(messages, doNotUpdate) {
      return callActionFn(messages, doNotUpdate, {
        added: [],
        existing: []
      }, add);
    },
    removeMessages: function(messages) {
      return callActionFn(messages, undefined, [], remove);
    },
    getBatcher: function(conversationID) {
      var batcher = messageBatchers[conversationID];
      if (!batcher)
        batcher = messageBatchers[conversationID] = new MessageBatcher();
      return batcher;
    },
    removeMessageBatcher: function(conversationID) {
      delete messageBatchers[conversationID];
      delete ariaMessages[conversationID];
    },
    clearAriaMessages: function(conversationID) {
      ariaMessages[conversationID] = [];
    },
    getAriaMessages: function(conversationID, count) {
      if (angular.isUndefined(count))
        count = 1;
      count = -Math.abs(count);
      ariaMessages[conversationID] = ariaMessages[conversationID] || [];
      return ariaMessages[conversationID].slice(count);
    },
    getLastMessage: function(conversationID) {
      var batcher = this.getBatcher(conversationID);
      var lastBatch = batcher.lastBatch;
      return lastBatch && lastBatch.lastMessage;
    },
    getFirstMessage: function(conversationID) {
      var batcher = this.getBatcher(conversationID);
      var firstBatch = batcher.batches[0];
      return firstBatch && firstBatch.firstMessage;
    },
    _wipeOut_: function() {
      messageBatchers = {};
    }
  }
});;