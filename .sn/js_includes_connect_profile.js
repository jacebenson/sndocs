/*! RESOURCE: /scripts/app.ng_chat/profile/js_includes_connect_profile.js */
/*! RESOURCE: /scripts/app.ng_chat/profile/_module.js */
angular.module("sn.connect.profile", []);;
/*! RESOURCE: /scripts/app.ng_chat/profile/service.profiles.js */
angular.module('sn.connect.profile').service('profiles', function(snHttp, $q, i18n, snCustomEvent, snNotification, isLoggedIn) {
    "use strict";
    var errorText = "User profile was not found";
    i18n.getMessages([errorText], function(array) {
        errorText = array[errorText];
    });
    var PROFILES_URL = isLoggedIn ? '/api/now/live/profiles/' : '/api/now/connect/support/anonymous/live/profiles/';
    var activeRequests = {};
    var profiles = {};

    function fromObject(config) {
        if (!config)
            return;
        if (!profiles[config.sys_id]) {
            config.name = config.name || '';
            config.sysID = config.sys_id;
            config.avatar = config.avatar || '';
            config.userID = config.document;
            profiles[config.sys_id] = config;
        }
        profiles[config.sys_id].supportConversationCount = config.supportConversationCount;
        return profiles[config.sys_id];
    }

    function getAsync(id) {
        if (!id)
            return $q.when(null);
        if (angular.isObject(id))
            id = id.sysID || id.userID;
        if (profiles[id])
            return $q.when(profiles[id]);
        var url = PROFILES_URL + id;
        if (!activeRequests[url]) {
            activeRequests[url] = snHttp.get(url).then(function(response) {
                delete activeRequests[url];
                return fromObject(response.data.result);
            });
        }
        return activeRequests[url];
    }

    function openConversation(profileID) {
        getAsync(profileID).then(function(profile) {
            snCustomEvent.fireTop('chat:open_conversation', profile);
        }, function(response) {
            if (response.status === 404)
                snNotification.show("error", errorText);
        });
    }
    return {
        fromObject: fromObject,
        get: function(id) {
            if (!profiles[id])
                this.getAsync(id);
            return profiles[id];
        },
        getAsync: getAsync,
        addMembers: function(members) {
            angular.forEach(members, fromObject);
        },
        openConversation: openConversation
    };
});;;