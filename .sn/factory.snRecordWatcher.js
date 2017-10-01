/*! RESOURCE: /scripts/app.ng.amb/factory.snRecordWatcher.js */
angular.module("ng.amb").factory('snRecordWatcher', function($rootScope, amb, $timeout, snPresence, $log, urlTools) {
    "use strict";
    var watcherChannel;
    var connected = false;
    var diagnosticLog = true;

    function initWatcher(table, sys_id, query) {
        if (!table)
            return;
        if (sys_id)
            var filter = "sys_id=" + sys_id;
        else
            filter = query;
        if (!filter)
            return;
        return initChannel(table, filter);
    }

    function initList(table, query) {
        if (!table)
            return;
        query = query || "sys_idISNOTEMPTY";
        return initChannel(table, query);
    }

    function initTaskList(list, prevChannel) {
        if (prevChannel)
            prevChannel.unsubscribe();
        var sys_ids = list.toString();
        var filter = "sys_idIN" + sys_ids;
        return initChannel("task", filter);
    }

    function initChannel(table, filter) {
        if (isBlockedTable(table)) {
            $log.log("Blocked from watching", table);
            return null;
        }
        if (diagnosticLog)
            log(">>> init " + table + "?" + filter);
        watcherChannel = amb.getChannelRW(table, filter);
        watcherChannel.subscribe(onMessage);
        amb.connect();
        return watcherChannel;
    }

    function onMessage(message) {
        var r = message.data;
        var c = message.channel;
        if (diagnosticLog)
            log(">>> record " + r.operation + ": " + r.table_name + "." + r.sys_id + " " + r.display_value);
        $rootScope.$broadcast('record.updated', r);
        $rootScope.$broadcast("sn.stream.tap");
        $rootScope.$broadcast('list.updated', r, c);
    }

    function log(message) {
        $log.log(message);
    }

    function isBlockedTable(table) {
        return table == 'sys_amb_message' || table.startsWith('sys_rw');
    }
    return {
        initTaskList: initTaskList,
        initChannel: initChannel,
        init: function() {
            var location = urlTools.parseQueryString(window.location.search);
            var table = location['table'] || location['sysparm_table'];
            var sys_id = location['sys_id'] || location['sysparm_sys_id'];
            var query = location['sysparm_query'];
            initWatcher(table, sys_id, query);
            snPresence.init(table, sys_id, query);
        },
        initList: initList,
        initRecord: function(table, sysId) {
            initWatcher(table, sysId, null);
            snPresence.initPresence(table, sysId);
        },
        _initWatcher: initWatcher
    }
});;