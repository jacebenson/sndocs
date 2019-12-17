/*! RESOURCE: /scripts/sn/common/presence/factory.snRecordPresence.js */
angular.module("sn.common.presence").factory('snRecordPresence', function($rootScope, $location, amb, $timeout, $window, PRESENCE_DISABLED, snTabActivity) {
      "use strict";
      var statChannel;
      var interval = ($window.NOW.record_presence_interval || 20) * 1000;
      var sessions = {};
      var primary = false;
      var currentJournalFieldName = "";
      var prevJournalFieldName = "";
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
      }

      function onPresenceEvent(sessionsToSend) {
        $rootScope.$emit("sn.sessions", sessionsToSend);
        $rootScope.$emit("sp.sessions", sessionsToSend);
      }

      function termPresence() {
        if (!statChannel)
          return;
        statChannel.unsubscribe();
        statChannel = table = sys_id = null;
      }

      function setStatus(status) {
        if (status == $rootScope.status && prevJournalFieldName === currentJournalFieldName)
          return;
        prevJournalFieldName = currentJournalFieldName;
        $rootScope.status = status;
        if (Object.keys(sessions).length == 0)
          return;
        if (getStatusPrecedence(status) > 1)
          return;
        publish($rootScope.status);
      }

      function publish(status) {
        if (!statChannel)
          return;
        if (amb.getState() !== "opened")
          return;
        statChannel.publish({
          presences: [{
            status: status,
            session_id: NOW.session_id,
            user_name: NOW.user_name,
            user_id: NOW.user_id,
            user_display_name: NOW.user_display_name,
            user_initials: NOW.user_initials,
            user_avatar: NOW.user_avatar,
            ua: navigator.userAgent,
            table: table,
            sys_id: sys_id,
            field_type: currentJournalFieldName,
            time: new Date().toString().substring(0, 24)
          }]
        });
      }

      function onStatus(message) {
        message.data.presences.forEach(function(d) {
          if (!d.session_id || d.session_id == NOW.session_id)
            return;
          var s = sessions[d.session_id];
          if (s)
            angular.extend(s, d);
          else
            s = sessions[d.session_id] = d;
          s.lastUpdated = new Date();
          if (s.status == 'exited')
            delete sessions[d.session_id];
        });
        broadcastSessions();
      }

      function broadcastSessions() {
        var sessionsToSend = getUniqueSessions();
        $rootScope.$emit("sn.sessions", sessionsToSend);
        $rootScope.$emit("sp.sessions", sessionsToSend);
        if (primary)
          $timeout(function() {
            CustomEvent.fire('sn.sessions', sessionsToSend);
          })
      }

      function getUniqueSessions() {
        var uniqueSessionsByUser = {};
        var sessionKe