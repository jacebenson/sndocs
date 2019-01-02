/*! RESOURCE: /scripts/app.ng_chat/message/service.messages.js */
angular.module('sn.connect.message').value('CONNECT_CONTEXT', Date.now() + "" + Math.random() * Math.pow(10, 19));
angular.module('sn.connect.message').service("messageService", function(
  $q, $rootScope, snHttp, amb, userID, liveProfileID, messageFactory, unreadCountService, messageBatcherService,
  uploadAttachmentService, CONNECT_CONTEXT, snNotification, $timeout, isLoggedIn) {
  "use strict";
  var CONVERSATIONS_URL = isLoggedIn ? "/api/now/connect/conversations/" : "/api/now/connect/support/anonymous/conversations/";
  var context = CONNECT_CONTEXT;
  var allHistoryLoaded = {};
  var watches = [];
  amb.getChannel("/connect/message/" + userID).subscribe(function(response) {
    addRawMessage(response.data);
  });
  amb.connect();

  function retrieveMessages(conversation, time) {
    if (!conversation)
      return $q.when([]);
    if (!conversation.sysID)
      return $q.when([]);
    if (conversation.isPending)
      return $q.when([]);
    if (time && allHistoryLoaded[conversation.sysID])
      return $q.when([]);
    var conversationID = conversation.sysID;
    var url = CONVERSATIONS_URL + conversationID + "/messages";
    if (time)
      url += "?before=" + time;
    return snHttp.get(url).then(function(response) {
      var processedMessages = [];
      angular.forEach(response.data.result, function(messageData) {
        processedMessages.push(messageFactory.fromObject(messageData));
      });
      if (time && processedMessages.length === 0)
        allHistoryLoaded[conversationID] = true;
      conversation.restricted = conversation.restricted || false;
      var added = messageBatcherService.addMessages(processedMessages).added;
      $rootScope.$broadcast('sn.TimeAgo.tick');
      return added;
    }, function(response) {
      if (response.status === 403)
        conversation.restricted = true;
      return $q.reject(response)
    });
  }

  function addRawMessage(messageData) {
    var message = messageFactory.fromObject(messageData);
    var isOldMessage = unreadCountService.getLastTimestamp(message.conversationID) > message.timestamp;
    $rootScope.$apply(function() {
      messageBatcherService.addMessages(message);
      $timeout(function() {
        $rootScope.$broadcast('sn.TimeAgo.tick');
      }, 0, false);
    });
    if (isOldMessage)
      return message;
    if (message.profileID === liveProfileID)
      return message;
    angular.forEach(watches, function(watch) {
      watch(message);
    });
    return message;
  }

  function send(message) {
    messageBatcherService.addMessages(message);
    unreadCountService.reset(message.conversationID, true);
    return snHttp.post(CONVERSATIONS_URL + message.conversationID + "/messages", {
      group: message.conversationID,
      message: message.text,
      reflected_field: message.reflectedField || "comments",
      attachments: message.attachmentSysIDs,
      context: context
    }).then(function(response) {
      var newMessage = messageFactory.fromObject(response.data.result);
      $rootScope.$evalAsync(function() {
        messageBatcherService.removeMessages(message);
        messageBatcherService.addMessages(newMessage);
        unreadCountService.reset(message.conversationID);
      });
      return newMessage;
    }, function(response) {
      if (response.status === 403)
        snNotification.show("error", response.data.result);
      return $q.reject(response)
    });
  }

  function uploadAttachments(conversation, fileList) {
    if (fileList.length === 0)
      return $q.when({});
    var files = [];
    for (var i = 0; i < fileList.length; ++i)
      files.push(fileList[i]);
    var message = messageFactory.newPendingAttachmentMessage(conversation, files);
    messageBatcherService.addMessages(message);
    unreadCountService.reset(message.conversationID, true);
    return uploadAttachmentService.attachFiles(conversation, files, {
      error: function(file) {
        $rootScope.$broadcast("connect.conversation.attachment_errors", {
          conversation: conversation,
          errors: [file.name + ": " + file.error]
        });
      }
    }).then(function(files) {
      var array = files.filter(function(file) {
        return !file.error;
      });
      if (array.length === 0) {
        messageBatcherService.removeMessages(message);
        return;
      }
      message.attachmentSysIDs = array.map(function(file) {
        return file.sysID;
      });
      var text = "";
      array.forEach(function(file) {
        text += "File: " + file.name + "\n";
      });
      message.text = text.trim();
      return message;
    });
  }
  return {
    retrieveMessages: retrieveMessages,
    uploadAttachments: uploadAttachments,
    send: send,
    watch: function(callback) {
      watches.push(callback)
    }
  };
});;