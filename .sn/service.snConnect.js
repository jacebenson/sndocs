/*! RESOURCE: /scripts/sn/common/util/service.snConnect.js */
angular.module("sn.common.util").service("snConnectService", function($http, snCustomEvent) {
    "use strict";
    var connectPaths = ["/$c.do", "/$chat.do"];

    function canOpenInFrameset() {
        return window.top.NOW.collaborationFrameset;
    }

    function isInConnect() {
        var parentPath = getParentPath();
        return connectPaths.some(function(path) {
            return parentPath == path;
        });
    }

    function getParentPath() {
        try {
            return window.top.location.pathname;
        } catch (IGNORED) {
            return "";
        }
    }

    function openWithProfile(profile) {
        if (isInConnect() || canOpenInFrameset())
            snCustomEvent.fireTop('chat:open_conversation', profile);
        else
            window.open("$c.do#/with/" + profile.sys_id, "_blank");
    }
    return {
        openWithProfile: openWithProfile
    }
});;