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