/*! RESOURCE: /scripts/app.ng_chat/conversation/service.conversationPersister.js */
angular.module('sn.connect.conversation').service('conversationPersister', function(
  snHttp, CONNECT_CONTEXT, isLoggedIn) {
  "use strict";
  var REST_API_PATH = isLoggedIn ? '/api/now/connect/conversations' : '/api/now/connect/support/anonymous/conversations';

  function createGroup(optionalParams) {
    optionalParams = optionalParams || {};
    return snHttp.post(REST_API_PATH, optionalParams).then(extractResult);
  }

  function addUser(conversationID, profileID) {
    return snHttp.post(REST_API_PATH + '/' + conversationID + '/members', {
      "member_id": profileID
    }).then(extractResult);
  }

  function removeUser(conversationID, profileID) {
    return snHttp.delete(REST_API_PATH + '/' + conversationID + '/members/' + profileID).then(extractResult);
  }

  function update(conversationID, data) {
    return snHttp.put(REST_API_PATH + '/' + conversationID, data).then(extractResult);
  }

  function extractResult(response) {
    return response.data.result;
  }
  var conversationURL = REST_API_PATH;
  return {
    createGroup: createGroup,
    addUser: addUser,
    removeUser: removeUser,
    update: update,
    getConversations: function(queueID) {
      if (queueID) {
        conversationURL = isLoggedIn ? '/api/now/connect/support/queues/' + queueID + '/sessions' :
          '/api/now/connect/support/anonymous/queues/' + queueID + '/sessions';
      }
      return snHttp.get(conversationURL).then(extractResult);
    },
    getConversation: function(conversationID) {
      return snHttp.get(REST_API_PATH + '/' + conversationID)
        .then(extractResult)
    },
    lastViewed: function(conversationID, timestamp) {
      return update(conversationID, {
        last_viewed: timestamp
      })
    },
    visible: function(conversationID, visible) {
      return update(conversationID, {
        visible: visible
      });
    },
    frameState: function(conversationID, state) {
      var data = {
        frame_state: state
      };
      if (state === 'closed')
        data.frame_order = -1;
      return update(conversationID, data);
    },
    changeFrameOrder: function(conversations) {
      var data = {
        frame_order: conversations.join(',')
      };
      return snHttp.post(REST_API_PATH + '/order', data).then(extractResult);
    },
    createConversation: function(groupName, recipients, message) {
      var recipientJIDs = recipients.map(function(recipient) {
        return recipient.jid;
      });
      var data = {
        group_name: groupName,
        recipients: recipientJIDs,
        message: message.text,
        reflected_field: message.reflectedField || "comments",
        attachments: message.attachmentSysIDs,
        context: CONNECT_CONTEXT
      };
      return snHttp.post(REST_API_PATH, data).then(extractResult);
    },
    createDocumentConversation: function(table, sysID) {
      var data = {
        table: table,
        sys_id: sysID
      };
      return snHttp.post(REST_API_PATH + '/records', data).then(extractResult);
    },
    setDocument: function(profileID, table, document) {
      var data = {
        table: table,
        document: document
      };
      return snHttp.put(REST_API_PATH + '/' + profileID + '/records', data);
    }
  };
});;