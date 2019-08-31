/*! RESOURCE: /scripts/app.ng_chat/queue/service.queueEntries.js */
angular.module('sn.connect.queue').service('queueEntries', function(
  $q, $rootScope, snHttp, amb, queueEntryFactory, queues, inSupportClient, isLoggedIn, snNotification, i18n, supportEnabled) {
  'use strict';
  var QUEUE_AMB = '/connect/support/queues';
  var GROUP_AMB = '/connect/support/group/';
  var queueEntries = {};
  var ambWatchers = {};
  amb.connect();
  if (inSupportClient || supportEnabled) {
    amb.getChannel(QUEUE_AMB).subscribe(function(response) {
      var queueID = response.data.sys_id;
      if (queues.agents[queueID]) {
        requestFiltered({
          'closed': !inSupportClient,
          'queue_id': queueID
        });
      }
    });
  }
  var messageUnknownError = "Unable to complete your request: An unknown error occurred";
  i18n.getMessages([messageUnknownError],
    function(results) {
      messageUnknownError = results[messageUnknownError];
    });

  function requestFiltered(filter) {
    var url = '/api/now/connect/support/sessions';
    if (filter) {
      url += '?';
      for (var item in filter)
        if (filter.hasOwnProperty(item))
          url += item + "=" + encodeURIComponent(filter[item]) + "&";
      url = url.slice(0, -1);
    }
    return snHttp.get(url).then(function(response) {
      if (!response.data.result)
        return;
      angular.forEach(response.data.result, function(rawQueueEntry) {
        addRawQueueEntry(rawQueueEntry);
      });
    });
  }

  function addRawQueueEntry(rawQueueEntry) {
    var oldQueueEntry = queueEntries[rawQueueEntry.sys_id];
    if (oldQueueEntry && oldQueueEntry.equals(rawQueueEntry))
      return oldQueueEntry;
    var queueEntry = queueEntryFactory.fromObject(rawQueueEntry);
    queueEntries[queueEntry.conversationID] = queueEntries[queueEntry.sysID] = queueEntry;
    if (ambWatchers[queueEntry.conversationID]) {
      if (queueEntry.isPermanentlyClosed)
        removeAMBWatch(queueEntry.conversationID);
    } else if (!queueEntry.isPermanentlyClosed && (queueEntry.isOpenedByMe === inSupportClient)) {
      ambWatchers[queueEntry.conversationID] = amb.getChannel(GROUP_AMB + queueEntry.conversationID)
        .subscribe(function(response) {
          addRawQueueEntry(response.data);
        });
    }
    $rootScope.$broadcast("connect.queueEntry.updated", queueEntry, oldQueueEntry);
    return queueEntry;
  }

  function removeAMBWatch(conversationID) {
    if (ambWatchers[conversationID]) {
      ambWatchers[conversationID].unsubscribe();
      delete ambWatchers[conversationID];
    }
  }

  function remove(id) {
    var queueEntry = queueEntries[id];
    if (!queueEntry)
      return;
    delete queueEntries[queueEntry.conversationID];
    delete queueEntries[queueEntry.sysID];
    removeAMBWatch(queueEntry.conversationID);
  }

  function postAction(conversationID, action, data) {
    data = data || {};
    if (!conversationID)
      throw 'conversationID cannot be undefined';
    var sessionsApiUri = isLoggedIn ? '/api/now/connect/support/sessions/' : '/api/now/connect/support/anonymous/sessions/';
    return snHttp.post(sessionsApiUri + conversationID + action, data).then(function(response) {
      return addRawQueueEntry(response.data.result);
    });
  }

  function requestByConversation(conversationID) {
    if (!conversationID)
      throw 'conversationID cannot be undefined';
    var queueEntry = queueEntries[conversationID];
    if (queueEntry)
      return $q.when(queueEntry);
    return requestFiltered({
      'group_id': conversationID
    }).then(function() {
      return queueEntries[conversationID];
    });
  }

  function requestNext(queueID) {
    return snHttp.post('/api/now/connect/support/queues/' + queueID + '/accept', {}).then(function(response) {
      return addRawQueueEntry(response.data.result);
    });
  }
  return {
    addRaw: addRawQueueEntry,
    get: function(id) {
      return queueEntries[id];
    },
    requestByConversation: requestByConversation,
    create: function(queueID, message, fromRecord) {
      if (!queueID)
        throw 'queue ID cannot be undefined';
      if (!message)
        throw 'message cannot be undefined';
      var url = isLoggedIn ? '/api/now/connect/support/queues/' + queueID + '/sessions' :
        '/api/now/connect/support/anonymous/queues/' + queueID + '/sessions';
      var data = {
        message: message
      };
      if (fromRecord && fromRecord.table && fromRecord.sysId) {
        data.from_table = fromRecord.table;
        data.from_sysid = fromRecord.sysId;
      }
      return snHttp.post(url, data).then(function(response) {
        return addRawQueueEntry(response.data.result);
      }, function(response) {
        if (response.status === 403 || response.status === 503) {
          snNotification.show("error", response.data.result);
        } else {
          snNotification.show("error", messageUnknownError);
        }
        return $q.reject(response)
      });
    },
    remove: remove,
    close: function(conversationID, agentLeave) {
      return postAction(conversationID, '/close', {
        agent_leave: !!agentLeave
      });
    },
    leave: function(conversationID) {
      return postAction(conversationID, '/leave');
    },
    rejoin: function(conversationID) {
      return postAction(conversationID, '/rejoin');
    },
    escalate: function(conversation, queueID) {
      queueID = queueID || conversation.queueEntry.queue.escalateTo;
      if (!queueID)
        throw "queueID must be set";
      conversation.queueEntry.escalate();
      return postAction(conversation.sysID, '/escalate/' + queueID);
    },
    transfer: function(conversationID, agentID) {
      if (!agentID)
        throw 'agentID cannot be undefined';
      return postAction(conversationID, '/transfer/' + agentID);
    },
    accept: function(conversationID) {
      return postAction(conversationID, '/transfer/accept');
    },
    reject: function(conversationID) {
      var complete = this.complete;
      return postAction(conversationID, '/transfer/reject').then(function() {
        return complete(conversationID);
      });
    },
    cancel: function(conversationID) {
      var complete = this.complete;
      return postAction(conversationID, '/transfer/cancel').then(function() {
        return complete(conversationID);
      });
    },
    complete: function(conversationID) {
      return postAction(conversationID, '/transfer/complete');
    },
    requestNext: requestNext
  };
});;