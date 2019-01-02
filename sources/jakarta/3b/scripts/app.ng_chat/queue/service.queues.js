/*! RESOURCE: /scripts/app.ng_chat/queue/service.queues.js */
angular.module('sn.connect.queue').service('queues', function(
  $q, amb, snHttp, queueFactory, profiles, supportAddMembers, supportEnabled, inSupportClient, isLoggedIn, alertOnQueueEnter, audioNotifier) {
  'use strict';
  var AMB_CHANNEL = '/connect/support/queue/';
  var REST_API_PATH = isLoggedIn ? "/api/now/connect/support/queues" : "/api/now/connect/support/anonymous/queues";
  var queues = {};
  var agentsQueues = {};

  function refresh() {
    return snHttp.get(REST_API_PATH).then(function(response) {
      angular.forEach(queues, function(queue) {
        if (queue.ambChannel)
          queue.ambChannel.unsubscribe();
      });
      queues = {};
      if (response.data)
        addRawQueues(response.data.result);
      return queues;
    });
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
    var queue = queueFactory.fromObject(rawQueueData);
    if (!queues[queue.id] && !inSupportClient) {
      queue.ambChannel = amb.getChannel(AMB_CHANNEL + queue.id).subscribe(function(response) {
        return requestHttpQueue(response.data.sys_id);
      });
      amb.connect();
    }
    if (queue.isAgentsQueue) {
      if (alertOnQueueEnter && agentsQueues[queue.id] && rawQueueData.waiting_count > agentsQueues[queue.id].waitingCount) {
        audioNotifier.notify({
          timestamp: Date.now()
        });
      }
      agentsQueues[queue.id] = queue;
    }
    return queues[queue.id] = queue;
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