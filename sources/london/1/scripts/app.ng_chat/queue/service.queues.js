/*! RESOURCE: /scripts/app.ng_chat/queue/service.queues.js */
angular.module('sn.connect.queue').service('queues', function(
  $q, amb, snHttp, queueFactory, profiles, supportAddMembers, supportEnabled, inSupportClient, isLoggedIn, alertOnQueueEnter, audioNotifier) {
  'use strict';
  var AMB_CHANNEL = '/connect/support/queues';
  var REST_API_PATH = isLoggedIn ? "/api/now/connect/support/queues" : "/api/now/connect/support/anonymous/queues";
  var queues = {};
  var agentsQueues = {};
  var ambChannel;

  function refresh() {
    return snHttp.get(REST_API_PATH).then(function(response) {
      queues = {};
      ambUnsubscribe();
      if (response.data) {
        addRawQueues(response.data.result);
        ambSubscribe();
      }
      return queues;
    });
  }

  function ambSubscribe() {
    if (!ambChannel) {
      ambChannel = amb.getChannel(AMB_CHANNEL).subscribe(function(response) {
        var queue = addRawQueue(response.data);
        addEscalationQueue(queue);
        return queue;
      });
      amb.connect();
    }
    return ambChannel;
  }

  function ambUnsubscribe() {
    if (ambChannel) {
      ambChannel.unsubscribe();
      ambChannel = void(0);
    }
  }

  function addRawQueues(rawQueuesData) {
    angular.forEach(rawQueuesData, function(queueData) {
      addRawQueue(queueData);
    });
    angular.forEach(queues, function(queue) {
      addEscalationQueue(queue);
    });
    return queues;
  }

  function addRawQueue(rawQueueData) {
    if (!rawQueueData)
      return;
    if (queues[rawQueueData.sys_id]) {
      var existingItem = queues[rawQueueData.sys_id];
      rawQueueData = angular.extend({}, existingItem.__rawData, rawQueueData);
    }
    var queue = queueFactory.fromObject(rawQueueData);
    if (queue.isAgentsQueue) {
      if (shouldAlertOnQueueEnter(queue)) {
        audioNotifier.notify({
          timestamp: Date.now()
        });
      }
      agentsQueues[queue.id] = queue;
    }
    return queues[queue.id] = queue;
  }

  function shouldAlertOnQueueEnter(queue) {
    var staleQueue = agentsQueues[queue.id];
    if (!staleQueue) {
      return false;
    }
    return alertOnQueueEnter && queue.waitingCount > staleQueue.waitingCount;
  }

  function addEscalationQueue(queue) {
    if (!queue.escalateTo)
      return;
    requestQueue(queue.escalateTo).then(function(escalationQueue) {
      queue.escalationQueue = escalationQueue;
    });
  }

  function requestHttpQueue(queueID) {
    return snHttp.get(REST_API_PATH + '/' + queueID).then(function(response) {
      var queue = addRawQueue(response.data.result);
      addEscalationQueue(queue);
      return queue;
    });
  }

  function requestQueue(queueID) {
    if (!queueID)
      return $q.when();
    if (queues[queueID])
      return $q.when(queues[queueID]);
    return requestHttpQueue(queueID);
  }
  if ((supportAddMembers || supportEnabled) && !inSupportClient)
    refresh();
  return {
    get all() {
      return queues;
    },
    get agents() {
      return agentsQueues;
    },
    hasQueues: function() {
      return Object.keys(agentsQueues).length > 0;
    },
    refresh: refresh,
    getAgents: function(queueID) {
      return snHttp.get(REST_API_PATH + '/' + queueID + '/agents').then(function(response) {
        return response.data.result.map(profiles.fromObject);
      });
    },
    getQueue: requestQueue,
    getAllWaitingCount: function() {
      var waitingCount = 0;
      angular.forEach(agentsQueues, function(queue) {
        waitingCount = waitingCount + queue.waitingCount;
      });
      return waitingCount;
    }
  };
});;