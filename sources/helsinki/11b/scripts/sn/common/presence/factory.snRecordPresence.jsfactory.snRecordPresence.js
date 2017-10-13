/*! RESOURCE: /scripts/sn/common/presence/factory.snRecordPresence.js */
angular.module("sn.common.presence").factory('snRecordPresence', function($rootScope, $location, amb, $timeout, $window, PRESENCE_DISABLED, snTabActivity) {
  "use strict";
  var statChannel;
  var interval = 20 * 1000;
  var sessions = {};
  var timer;
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
    timer = $timeout(managePresence, interval);
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
    $rootScope.$broadcast("sn.sessions", sessionsToSend);
    $rootScope.$broadcast("sp.sessions", sessionsToSend);
  }

  function termPresence() {
    if (timer)
      $timeout.cancel(timer);
    if (!statChannel)
      return;
    publish("exited");
    statChannel.unsubscribe();
    statChannel = table = sys_id = null;
  }

  function setStatus(status) {
    if (status == $rootScope.status)
      return;
    $rootScope.status = status;
    publish($rootScope.status);
  }

  function publish(status) {
    if (!statChannel)
      return;
    if (amb.getState() !== "opened")
      return;
    statChannel.publish({
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
      time: new Date().toString().substring(0, 24)
    });
  }

  function onStatus(message) {
    var d = message.data;
    if (d.session_id == NOW.session_id)
      return;
    var s = sessions[d.session_id];
    if (s)
      angular.extend(s, d);
    else
      s = sessions[d.session_id] = d;
    s.lastUpdated = new Date();
    broadcastSessions();
    if (s.status == 'entered')
      publish($rootScope.status);
  }

  function managePresence() {
    var now = new Date().getTime();
    var deleted = false;
    Object.keys(sessions).forEach(function(id) {
      var s = sessions[id];
      if (!s.lastUpdated)
        return;
      var last = s.lastUpdated.getTime();
      var t = now - last;
      s.lastSeen = t / 1000;
      if (s.status === 'exited') {
        deleted = true;
        delete sessions[id];
      }
      if (t > interval * 2)
        s.status = 'probably left';
      if (t > interval * 4) {
        deleted = true;
        delete sessions[id];
      }
    });
    if (Object.keys(sessions).length !== 0)
      publish($rootScope.status);
    timer = $timeout(managePresence, interval);
    if (deleted)
      broadcastSessions();
  }

  function broadcastSessions() {
    var sessionsToSend = getUniqueSessions();
    $rootScope.$broadcast("sn.sessions", sessionsToSend);
    $rootScope.$broadcast("sp.sessions", sessionsToSend);
    if (primary)
      $timeout(function() {
        CustomEvent.fire('sn.sessions', sessionsToSend);
      })
  }

  function getUniqueSessions() {
    var uniqueSessionsByUser = {};
    var sessionKeys = Object.keys(sessions);
    sessionKeys.forEach(function(key) {
      var session = sessions[key];
      if (session.user_id == NOW.user_id)
        return;
      if (session.user_id in uniqueSessionsByUser) {
        var otherSession = uniqueSessionsByUser[session.user_id];
        var thisPrecedence = getStatusPrecedence(session.status);
        var otherPrecedence = getStatusPrecedence(otherSession.status);
        uniqueSessionsByUser[session.user_id] = thisPrecedence < otherPrecedence ? session : otherSession;
        return
      }
      uniqueSessionsByUser[session.user_id] = session;
    });
    var uniqueSessions = {};
    angular.forEach(uniqueSessionsByUser, function(item) {
      uniqueSessions[item.session_id] = item;
    });
    return uniqueSessions;
  }

  function getStatusPrecedence(status) {
    switch (status) {
      case 'typing':
        return 0;
      case 'viewing':
        return 1;
      case 'entered':
        return 2;
      case 'exited':
      case 'probably left':
        return 4;
      case 'offline':
        return 5;
      default:
        return 3;
    }
  }
  $rootScope.$on("record.typing", function(evt, data) {
    setStatus(data.status);
  });
  var idleTable, idleSysID;
  snTabActivity.onIdle({
    onIdle: function RecordPresenceTabIdle() {
      idleTable = table;
      idleSysID = sys_id;
      sessions = {};
      termPresence();
      broadcastSessions();
    },
    onReturn: function RecordPresenceTabActive() {
      initPresence(idleTable, idleSysID, true);
      idleTable = idleSysID = void(0);
    },
    delay: interval * 4
  });
  return {
    initPresence: initPresence,
    termPresence: termPresence
  }
});;