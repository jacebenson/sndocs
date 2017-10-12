/*! RESOURCE: /scripts/sn/common/presence/factory.snPresence.js */
angular.module("sn.common.presence").factory('snPresence', function($rootScope, $window, $log, amb, $timeout, $http, snRecordPresence, snTabActivity, urlTools, PRESENCE_DISABLED) {
      "use strict";
      var REST = {
        PRESENCE: "/api/now/ui/presence"
      };
      var databaseInterval = ($window.NOW.presence_interval || 15) * 1000;
      var initialized = false;
      var primary = false;
      var presenceArray = [];
      var serverTimeMillis;
      var skew = 0;
      var st = 0;

      function init() {
        var location = urlTools.parseQueryString(window.location.search);
        var table = location['table'] || location['sysparm_table'];
        var sys_id = location['sys_id'] || location['sysparm_sys_id'];
        var query = location['sysparm_query'];
        initPresence(table, sys_id, query);
      }

      function initPresence(t, id) {
        if (PRESENCE_DISABLED)
          return;
        if (!initialized) {
          initialized = true;
          initRootScopes();
          if (!primary) {
            CustomEvent.observe('sn.presence', onPresenceEvent);
            CustomEvent.fireTop('sn.presence.ping');
          } else {
            presenceArray = getLocalPresence();
            if (presenceArray)
              $timeout(schedulePresence, 100);
            else
              updateDatabase();
          }
        }
        snRecordPresence.initPresence(t, id);
      }
      fu