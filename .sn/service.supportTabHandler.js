/*! RESOURCE: /scripts/app.ng_chat/resource/service.supportTabHandler.js */
angular.module('sn.connect.resource').service('supportTabHandler', function() {
    'use strict';
    var tabs = {};
    var watches = {};
    var globalWatches = [];

    function addTab(channelID, tab) {
        if (!channelID || !tab)
            return false;
        tabs[channelID] = tabs[channelID] || [];
        if (ngObjectIndexOf(tabs[channelID], tab) !== -1)
            return tab;
        tabs[channelID].push(tab);
        callWatches(channelID, tab);
        return tab;
    }

    function removeTab(channelID, tab) {
        if (!channelID || !tab || !tabs[channelID])
            return false;
        var loc = ngObjectIndexOf(tabs[channelID], tab);
        if (loc !== -1) {
            var removedTab = tabs[channelID].splice(loc, 1)[0];
            callWatches(channelID, removedTab);
            return removedTab;
        }
        return false;
    }

    function removeChannel(channelID) {
        if (!channelID || !tabs[channelID])
            return false;
        tabs[channelID] = [];
        callWatches(channelID, []);
        return true;
    }

    function getTabs(channelID, sort) {
        if (!tabs[channelID])
            return [];
        return sort ? tabs[channelID].sort(function(a, b) {
            return a.$order - b.$order;
        }) : tabs[channelID];
    }

    function ngObjectIndexOf(arr, obj) {
        for (var i = 0, len = arr.length; i < len; i++)
            if (angular.equals(arr[i], obj))
                return i;
        return -1;
    }

    function watch(func, channelID) {
        if (channelID) {
            watches[channelID] = watches[channelID] || [];
            watches[channelID].push(func)
        } else {
            globalWatches.push(func);
        }
        return func;
    }

    function unwatch(func, channelID) {
        var i, len;
        if (channelID && watches[channelID]) {
            for (i = 0, len = watches[channelID].length; i < len; i++) {
                var watchLoc = watches[channelID].indexOf(func);
                if (watchLoc !== -1)
                    watches[channelID].splice(watchLoc, 1);
            }
        } else {
            for (i = 0, len = globalWatches.length; i < len; i++) {
                var globalWatchLoc = globalWatches.indexOf(func);
                if (globalWatchLoc !== -1)
                    globalWatches.splice(globalWatchLoc, 1);
            }
        }
    }

    function callWatches(channelID, response) {
        var i, len;
        if (channelID && watches[channelID] && watches[channelID].length) {
            for (i = 0, len = watches[channelID].length; i < len; i++)
                watches[channelID][i](response);
        }
        for (i = 0, len = globalWatches.length; i < len; i++)
            globalWatches[i](response);
    }
    return {
        add: addTab,
        remove: removeTab,
        get: getTabs,
        removeChannel: removeChannel,
        watch: watch,
        unwatch: unwatch
    };
});;