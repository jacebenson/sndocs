/*! RESOURCE: /scripts/app.ng_chat/util/service.snTypingTracker.js */
angular.module('sn.connect.util').service("snTypingTracker", function($rootScope, $timeout) {
    "use strict";
    var typingTimeout;
    var newKeystroke = false;

    function notifyTyping() {
        newKeystroke = true;
        if (!typingTimeout) {
            $rootScope.$broadcast("record.typing", {
                status: "typing"
            });
            waitForTypingToStop();
        }
    }

    function cancelTypingTimer() {
        $rootScope.$broadcast("record.typing", {
            status: "viewing"
        });
        newKeystroke = false;
        if (!typingTimeout)
            return;
        $timeout.cancel(typingTimeout);
        typingTimeout = void(0);
    }

    function waitForTypingToStop() {
        newKeystroke = false;
        typingTimeout = $timeout(function() {
            if (newKeystroke) {
                waitForTypingToStop()
            } else {
                cancelTypingTimer();
            }
        }, 3000)
    }
    return {
        typing: notifyTyping,
        cancelTyping: cancelTypingTimer
    }
});