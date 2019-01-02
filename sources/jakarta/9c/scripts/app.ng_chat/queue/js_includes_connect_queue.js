/*! RESOURCE: /scripts/app.ng_chat/queue/js_includes_connect_queue.js */
/*! RESOURCE: /scripts/app.ng_chat/queue/_module.js */
angular.module("sn.connect.queue", ["sn.connect.profile", "sn.connect.conversation"]);;
/*! RESOURCE: /scripts/app.ng_chat/queue/directive.snQueueList.js */
angular.module('sn.connect.queue').directive('snQueueList', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snQueueList.xml'),
    replace: true,
    scope: {},
    controller: function($scope, $filter, queues, conversations, supportConversationLimit) {
      $scope.agents = queues.agents;
      $scope.hasQueues = queues.hasQueues;
      $scope.isLimitReached = function() {
        if (supportConversationLimit === -1)
          return false;
        var supportConversations = $filter('conversation')(conversations.all, true, true)
          .filter(function(conversation) {
            var queueEntry = conversation.queueEntry;
            return queueEntry.isAssignedToMe && !queueEntry.isPermanentlyClosed;
          });
        return supportConversationLimit <= supportConversations.length;
      };
      $scope.$on('dialog.queue-error.show', function(evt, data) {
        $scope.queueErrorData = data;
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/directive.snQueueItem.js */
angular.module('sn.connect.queue').directive('snQueueItem', function(getTemplateUrl, $timeout, i18n) {
  'use strict';
  var acceptButtonLabel = "Accept Ticket From {0}";
  i18n.getMessages([acceptButtonLabel], function(translations) {
    acceptButtonLabel = translations[acceptButtonLabel];
  });
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snQueueItem.xml'),
    replace: true,
    scope: {
      queue: '=',
      canAnswer: '='
    },
    link: function(scope, element) {
      var flashCoolDown = 1000;
      var onCoolDown = false;
      var queueItem = element.find('.queue-item');
      scope.flashQueue = function() {
        if (onCoolDown)
          return;
        onCoolDown = true;
        queueItem.addClass("highlight-flash");
        $timeout(function() {
          queueItem.removeClass("highlight-flash");
        }, 250);
        $timeout(function() {
          onCoolDown = false;
        }, flashCoolDown);
      }
    },
    controller: function($scope, $rootScope, queueEntries, queueNotifier, conversations, activeConversation) {
      $scope.isEmpty = function() {
        return $scope.queue.waitingCount == 0;
      };
      $scope.getAcceptAriaLabel = function() {
        return i18n.format(acceptButtonLabel, $scope.queue.name);
      };
      $scope.answer = function() {
        if ($scope.isEmpty())
          return;
        if (!$scope.canAnswer)
          return;
        queueEntries.requestNext($scope.queue.id).then(function(queueEntry) {
          conversations.get(queueEntry.conversationID).then(function(conversation) {
            activeConversation.conversation = conversation;
          });
        }, function(response) {
          if (response.status !== 404 || !response.data || !response.data.result || !response.data.result.error)
            return;
          $rootScope.$broadcast('dialog.queue-error.show', {
            queue: $scope.queue,
            message: response.data.result.error
          });
        })
      };
      $scope.$watch('queue.waitingCount', function() {
        $scope.flashQueue();
        queueNotifier.notify($scope.queue);
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/directive.snNonAgentClose.js */
angular.module('sn.connect.queue').directive('snNonAgentClose', function(
  getTemplateUrl, conversations, activeConversation) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snNonAgentClose.xml'),
    scope: {},
    controller: function($scope) {
      $scope.$on('connect.non_agent_conversation.close_prompt', function(event, conversation) {
        $scope.conversation = conversation;
        $scope.$broadcast('dialog.queue-non-agent-modal.show');
      });
      $scope.close = function() {
        conversations.closeSupport($scope.conversation.sysID, true);
        activeConversation.clear($scope.conversation);
      };
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/directive.snQueueEntryClose.js */
angular.module('sn.connect.queue').directive('snQueueEntryClose', function(
  getTemplateUrl, conversations, activeConversation) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snQueueEntryClose.xml'),
    scope: {},
    controller: function($scope) {
      var hideConversation = true;
      $scope.$on('connect.support_conversation.close_prompt', function(event, conversation, shouldHide) {
        $scope.conversation = conversation;
        hideConversation = shouldHide;
        $scope.$broadcast('dialog.queue-entry-close-modal.show');
      });
      $scope.close = function() {
        conversations.closeSupport($scope.conversation.sysID, hideConversation);
        if (hideConversation)
          activeConversation.clear($scope.conversation);
      };
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/directive.snQueueEntryTransfer.js */
angular.module('sn.connect.queue').directive('snQueueEntryTransfer', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snQueueEntryTransfer.xml'),
    scope: {},
    controller: function($scope, queues, queueEntries, userID, supportConversationLimit) {
      $scope.queues = [];

      function reset() {
        $scope.queue = {};
        $scope.agents = [];
      }
      $scope.$on('connect.support.conversation.transfer', function(event, conversation) {
        reset();
        $scope.conversation = conversation;
        $scope.queues.length = 0;
        queueEntries.requestByConversation(conversation.sysID).then(function(queueEntry) {
          queues.getQueue(queueEntry.queueID).then(function(queue) {
            $scope.queue = queue;
          });
          queues.getAgents(queueEntry.queueID).then(function(agents) {
            $scope.agents = agents.filter(function(agent) {
              return (agent.userID !== queueEntry.openedBy) &&
                (agent.userID !== userID);
            }).sort(function(a, b) {
              return a.name.localeCompare(b.name);
            });
          });
          queues.refresh().then(function() {
            angular.forEach(queues.all, function(value, key) {
              if (key !== queueEntry.queueID)
                $scope.queues.push(value)
            });
          });
          $scope.$broadcast('dialog.transfer-modal.show');
        });
      });
      $scope.close = reset;
      $scope.startsWith = function(actual, expected) {
        return actual.toLowerCase().indexOf(expected.toLowerCase()) > -1;
      };
      $scope.canTransferToAgent = function(agent) {
        if (supportConversationLimit === -1)
          return true;
        if (!agent.supportConversationCount)
          return true;
        return agent.supportConversationCount < supportConversationLimit;
      };
      $scope.transferToAgent = function(agent) {
        queueEntries.transfer($scope.conversation.sysID, agent.userID);
        $scope.$broadcast('dialog.transfer-modal.close');
        reset();
      };
      $scope.transferToQueue = function(queue) {
        $scope.transferQueue = queue;
        $scope.$broadcast('dialog.transfer-modal.close');
        reset();
        $scope.$broadcast('dialog.queue-transfer-confirm.show');
      };
      $scope.transferQueueOk = function() {
        queueEntries.escalate($scope.conversation, $scope.transferQueue.id);
      };
      $scope.cancelTransfer = function() {
        queueEntries.cancel($scope.conversation.sysID);
      };
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/directive.snQueueEntryTransferAccepted.js */
angular.module('sn.connect.queue').directive('snQueueEntryTransferAccepted', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snQueueEntryTransferAccepted.xml'),
    scope: {},
    controller: function($scope, $rootScope, $timeout, $filter, activeConversation, conversations, queueEntries,
      profiles) {
      var transferOrder = [];
      $scope.$watchCollection(function() {
        return $filter('transferAccepted')(conversations.all).map(function(conversation) {
          return conversation.sysID;
        });
      }, function(newCollection) {
        transferOrder = newCollection.sort(function(sysID1, sysID2) {
          return sortIndex(sysID1) - sortIndex(sysID2);
        });
        if (transferOrder.length > 0)
          show();
        else
          hide();
      });

      function sortIndex(sysID) {
        var index = transferOrder.indexOf(sysID);
        return (index < 0) ? 1000 : index;
      }
      $scope.leave = closeModal(true);
      $scope.stay = closeModal(false);

      function closeModal(removeConversation) {
        return function() {
          var conversation = conversations.indexed[currentSysID];
          queueEntries.complete(currentSysID);
          conversation.queueEntry.clearTransferState();
          if (removeConversation) {
            conversations.closeSupport(conversation.sysID, true);
            activeConversation.clear(conversation);
          }
          hide();
        }
      }
      var currentSysID;

      function show() {
        var sysID = transferOrder[0];
        if (currentSysID === sysID)
          return;
        currentSysID = sysID;
        var conversation = conversations.indexed[currentSysID];
        var queueEntry = conversation.queueEntry;
        delete $scope.profileForSession;
        delete $scope.transferToProfile;
        profiles.getAsync('sys_user.' + queueEntry.openedBy).then(function(profile) {
          $scope.profileForSession = profile;
          profiles.getAsync('sys_user.' + queueEntry.transferTo).then(function(profile) {
            $scope.transferToProfile = profile;
            $scope.$broadcast('dialog.transfer-accepted-modal.show');
            activeConversation.conversation = conversation;
          });
        });
      }

      function hide() {
        $scope.$broadcast('dialog.transfer-accepted-modal.close');
        if (currentSysID === transferOrder[0])
          transferOrder.shift();
        currentSysID = undefined;
        if (transferOrder.length === 0)
          return;
        $timeout(function() {
          show();
        }, 400);
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/factory.queue.js */
angular.module('sn.connect.queue').factory('queueFactory', function() {
  'use strict';
  return {
    fromObject: function(data) {
      return {
        get id() {
          return data.sys_id;
        },
        get name() {
          return data.name;
        },
        get question() {
          return data.question;
        },
        get waitTime() {
          return data.average_wait_time.replace(/ Minute(s?)/g, "m").replace(/ Hour(s?)/g, "h").replace(/ Second(s?)/g, "s");
        },
        get waitTimeLong() {
          return data.average_wait_time;
        },
        get waitingCount() {
          return data.waiting_count;
        },
        get available() {
          return angular.isUndefined(data.not_available);
        },
        get unavailableMessage() {
          return data.not_available;
        },
        get escalateTo() {
          return data.escalate_to;
        },
        get isAgentsQueue() {
          return data.is_agent_for;
        }
      };
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/factory.queueEntry.js */
angular.module('sn.connect.queue').factory('queueEntryFactory', function(profiles, userID, queues) {
  'use strict';
  var WAITING = 1;
  var WORK_IN_PROGRESS = 2;
  var CLOSED_COMPLETE = 3;
  var CLOSED_ESCALATED = 4;
  var CLOSED_BY_CLIENT = 7;
  var CLOSED_ABANDONED = 8;
  var TRANSFER_PENDING = 'pending';
  var TRANSFER_CANCELLED = 'cancelled';
  var TRANSFER_ACCEPTED = 'accepted';
  var TRANSFER_REJECTED = 'rejected';
  return {
    fromObject: function(data) {
      return {
        equals: function(rawQueueEntry) {
          return angular.equals(data, rawQueueEntry);
        },
        get averageWaitTime() {
          return data.average_wait_time;
        },
        get sysID() {
          return data.sys_id;
        },
        get queueID() {
          return data.queue;
        },
        get queue() {
          return queues.all[data.queue];
        },
        get conversationID() {
          return data.group;
        },
        get assignedTo() {
          return data.assigned_to;
        },
        get isAssignedToMe() {
          return this.assignedTo === userID;
        },
        get number() {
          return data.number;
        },
        get position() {
          return data.position;
        },
        get profile() {
          return profiles.get(data.sys_id);
        },
        get shortDescription() {
          return data.short_description;
        },
        get state() {
          return data.state;
        },
        set state(value) {
          data.state = value;
        },
        get waitTime() {
          return data.wait_time;
        },
        get workStart() {
          return data.work_start;
        },
        get workEnd() {
          return data.work_end;
        },
        get isTransferStateChanged() {
          return data.transfer_change;
        },
        clearTransferState: function() {
          data.transfer_state = undefined;
        },
        get hasTransfer() {
          return !!data.transfer_state;
        },
        get isTransferPending() {
          return data.transfer_state === TRANSFER_PENDING;
        },
        get isTransferCancelled() {
          return data.transfer_state === TRANSFER_CANCELLED;
        },
        get isTransferAccepted() {
          return data.transfer_state === TRANSFER_ACCEPTED;
        },
        get isTransferRejected() {
          return data.transfer_state === TRANSFER_REJECTED;
        },
        get openedBy() {
          return data.opened_by;
        },
        get isOpenedByMe() {
          return this.openedBy === userID;
        },
        get transferTo() {
          return data.transfer_to;
        },
        get isTransferringToMe() {
          return this.transferTo === userID;
        },
        get isTransferringFromMe() {
          return data.transfer_from === userID;
        },
        get transferShouldClose() {
          if (this.isAssignedToMe)
            return false;
          return data.transfer_should_close;
        },
        get transferUpdatedOn() {
          return new Date(data.transfer_updated_on);
        },
        get updatedOn() {
          return new Date(data.sys_updated_on);
        },
        get isActive() {
          return this.isWaiting || this.isAccepted || (!this.isOpenedByMe && this.isClosedByClient);
        },
        get isPermanentlyClosed() {
          return this.isClosedByAgent || this.isEscalated;
        },
        get isWaiting() {
          return this.state === WAITING;
        },
        get isAccepted() {
          return this.state === WORK_IN_PROGRESS;
        },
        get isEscalated() {
          return this.state === CLOSED_ESCALATED;
        },
        get isAbandoned() {
          return this.state === CLOSED_ABANDONED;
        },
        get isClosedByAgent() {
          return this.state === CLOSED_COMPLETE;
        },
        get isClosedByClient() {
          return this.state === CLOSED_BY_CLIENT;
        },
        escalate: function() {
          this.state = CLOSED_ESCALATED;
        }
      };
    }
  };
});;
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
/*! RESOURCE: /scripts/app.ng_chat/queue/service.queueNotifier.js */
angular.module('sn.connect.queue').service('queueNotifier', function($window, snNotifier, i18n, userPreferences, queues) {
  'use strict';
  var LOCAL_STORAGE_KEY = 'sn.connect.queueNotifier.lastUpdatedOn';
  var queueWaitingCountUpdated;
  i18n.getMessages([
    'A new customer has joined your support queue'
  ], function(results) {
    queueWaitingCountUpdated = results['A new customer has joined your support queue'];
  });
  var lastWaitingCounts = {};
  angular.forEach(queues.all, function(queue) {
    updateWaitingCounts(queue);
  });
  angular.element($window).on('storage', function(e) {
    if (e.originalEvent.key !== LOCAL_STORAGE_KEY)
      return;
    var lastWaitingCountsJson = $window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (lastWaitingCountsJson) {
      lastWaitingCounts = angular.fromJson(lastWaitingCountsJson);
    }
  });

  function updateWaitingCounts(queue) {
    lastWaitingCounts[queue.id] = queue.waitingCount;
    $window.localStorage.setItem(LOCAL_STORAGE_KEY, angular.toJson(lastWaitingCounts));
  }
  return {
    notify: function(queue) {
      userPreferences.getPreference('connect.notifications.desktop').then(function(value) {
        if (value === 'false')
          return;
        if (queue.waitingCount <= lastWaitingCounts[queue.id]) {
          updateWaitingCounts(queue);
          return;
        }
        updateWaitingCounts(queue);
        snNotifier().notify(queueWaitingCountUpdated);
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/service.queueEntries.js */
angular.module('sn.connect.queue').service('queueEntries', function(
  $q, $rootScope, snHttp, amb, queueEntryFactory, queues, inSupportClient, isLoggedIn, snNotification) {
  'use strict';
  var QUEUE_AMB = '/connect/support/queue/';
  var GROUP_AMB = '/connect/support/group/';
  var queueEntries = {};
  var ambWatchers = {};

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
    if (!ambWatchers[queueEntry.queueID]) {
      ambWatchers[queueEntry.queueID] = amb.getChannel(QUEUE_AMB + queueEntry.queueID)
        .subscribe(function(response) {
          requestFiltered({
            'closed': !inSupportClient,
            'queue_id': response.data.sys_id
          });
        });
    }
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
  amb.connect();
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
        if (response.status === 403)
          snNotification.show("error", response.data.result);
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
/*! RESOURCE: /scripts/app.ng_chat/queue/service.queueEntryNotifier.js */
angular.module('sn.connect.queue').service('queueEntryNotifier', function(
  $window, snNotifier, i18n, profiles, userPreferences, activeConversation, snNotification, inFrameSet) {
  'use strict';
  var A_TAG = '<a href="/$c.do#/support" target="_self">{0}</a>';
  var LOCAL_STORAGE_KEY = 'sn.connect.queueEntryNotifier.lastUpdatedOn';
  var NOTIFICATION_TEMPLATE = ['You have an incoming case transfer from {0}.',
    'To view the conversation, accept or decline the request,'
  ].join(' ');
  var transferPendingText,
    transferAcceptedText,
    transferRejectedText,
    transferCancelledText,
    transferPendingNotificationText;
  i18n.getMessages([
    'Incoming chat transfer',
    'Accepted {0}',
    'Rejected {0}',
    'Cancelled transfer {0}',
    'click here',
    NOTIFICATION_TEMPLATE
  ], function(results) {
    transferPendingText = results['Incoming chat transfer'];
    transferAcceptedText = results['Accepted {0}'];
    transferRejectedText = results['Rejected {0}'];
    transferCancelledText = results['Cancelled transfer {0}'];
    transferPendingNotificationText = results[NOTIFICATION_TEMPLATE] + " " + A_TAG.replace(/(\{0})/g, results['click here']);
  });
  var lastUpdatedOn;
  angular.element($window).on('storage', function(e) {
    if (e.originalEvent.key !== LOCAL_STORAGE_KEY)
      return;
    lastUpdatedOn = $window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (lastUpdatedOn) {
      lastUpdatedOn = new Date(lastUpdatedOn)
    }
  });
  return {
    notify: function(conversation) {
      var queueEntry = conversation.queueEntry;
      if (!inFrameSet && !activeConversation.isSupport && queueEntry.isTransferringToMe) {
        profiles.getAsync('sys_user.' + queueEntry.assignedTo).then(function(profile) {
          snNotification.show('info', i18n.format(transferPendingNotificationText, profile.name))
            .then(function(element) {
              element.on('click', function() {
                snNotification.hide(element);
                activeConversation.conversation = conversation;
              });
            });
        });
      }
      userPreferences.getPreference('connect.notifications.desktop').then(function(value) {
        if (value === 'false')
          return;
        if (!queueEntry.isTransferStateChanged)
          return;
        if (queueEntry.transferUpdatedOn <= lastUpdatedOn)
          return;
        var body, userID;
        if (queueEntry.isTransferringToMe) {
          if (queueEntry.isTransferPending) {
            userID = queueEntry.assignedTo;
            body = transferPendingText + "\n" + queueEntry.number + " - " + queueEntry.shortDescription;
          }
          if (queueEntry.isTransferCancelled) {
            userID = queueEntry.assignedTo;
            body = transferCancelledText.replace(/\{0\}/, queueEntry.number);
          }
        } else if (queueEntry.isTransferringFromMe) {
          if (queueEntry.isTransferAccepted) {
            userID = queueEntry.assignedTo;
            body = transferAcceptedText.replace(/\{0\}/, queueEntry.number);
          }
          if (queueEntry.isTransferRejected) {
            userID = queueEntry.transferTo;
            body = transferRejectedText.replace(/\{0\}/, queueEntry.number);
          }
        }
        if (!body)
          return;
        $window.localStorage.setItem(LOCAL_STORAGE_KEY, queueEntry.transferUpdatedOn);
        profiles.getAsync('sys_user.' + userID).then(function(profile) {
          snNotifier().notify(profile.name, {
            body: body,
            onClick: function() {
              activeConversation.conversation = conversation;
            }
          });
        });
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/filter.transferAccepted.js */
angular.module('sn.connect.queue').filter('transferAccepted', function() {
  'use strict';
  return function(input) {
    return input.filter(function(conversation) {
      var queueEntry = conversation.queueEntry;
      return queueEntry && queueEntry.isTransferringFromMe && queueEntry.isTransferAccepted;
    });
  }
});;;