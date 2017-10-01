/*! RESOURCE: /scripts/classes/nowapi/ui/Notification.js */
(function(exports, angular) {
    "use strict";
    angular.injector(['ng', 'sn.common.notification']).invoke(function(snNotification) {
        exports.g_notification = snNotification;
    });
})(window.nowapi, angular);;