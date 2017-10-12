/*! RESOURCE: /scripts/sn/common/presence/factory.snRecordPresence.js */
angular.module("sn.common.presence").factory('snRecordPresence', function($rootScope, $location, amb, $timeout, $window, PRESENCE_DISABLED, snTabActivity) {
      "use strict";
      var statChannel;
      var interval = ($window.NOW.record_presence_interval || 20) * 1000;
      var sessions = {};
      var primary = false;
      var table;
      var sys_id;

      function initPresence(t, id) {
        if (PRESENCE_DISABLED)
          return;
        if (!t || !id)
          return;
        if (t == table && id == sys_id)
          return;
        initRootScopes();
        if (!primary)
          return;
        termPresence();
        table = t;
        sys_id = id;
        var recordPresence = "/sn/rp/" + table + "/" + sys_id;
        $rootScope.me = NOW.session_id;
        statChannel = amb.getChannel(recordPresence);
        statChannel.subscribe(onStatus);
        amb.connected.then(function() {
          setStatus("entered");
          $rootScope.status = "viewing";
        });
        return statChannel;
      }

      function initRootScopes() {
        if ($window.NOW.record_presence_scopes) {
          var ps = $window.NOW.record_presence_scopes;
          if (ps.indexOf($rootScope) == -1) {
            ps.push($rootScope);
            CustomEvent.observe('sn.sessions', onPresenceEvent);
          }
        } else {
          $window.NOW.record_presence_scopes = [$rootScope];
          primary = true;
        }