/*! RESOURCE: /scripts/sn/common/notification/service.snNotifier.js */
angular.module("sn.common.notification").factory("snNotifier", function($window, snNotificationWrapper) {
    "use strict";
    return function(settings) {
        function requestNotificationPermission() {
            if ($window.Notification && $window.Notification.permission === "default")
                $window.Notification.requestPermission();
        }

        function canUseNativeNotifications() {
            return ($window.Notification && $window.Notification.permission === "granted");
        }
        var currentNotifications = [];
        settings = angular.extend({
            notifyMethods: ["native", "glide"]
        }, settings);
        var methods = {
            'native': nativeNotify,
            'glide': glideNotify
        };

        function nativeNotify(title, options) {
            if (canUseNativeNotifications()) {
                var newNotification = snNotificationWrapper(title, options);
                newNotification.onclose = function() {
                    stopTrackingNotification(newNotification)
                };
                currentNotifications.push(newNotification);
                return true;
            }
            return false;
        }

        function glideNotify(title, options) {
            return false;
        }

        function stopTrackingNotification(newNotification) {
            var index = currentNotifications.indexOf(newNotification);
            if (index > -1)
                currentNotifications.splice(index, 1);
        }

        function notify(title, options) {
            if (typeof options === "string")
                options = {
                    body: options
                };
            options = options || {};
            for (var i = 0, len = settings.notifyMethods.length; i < len; i++)
                if (typeof settings.notifyMethods[i] == "string") {
                    if (methods[settings.notifyMethods[i]](title, options))
                        break;
                } else {
                    if (settings.notifyMethods[i](title, options))
                        break;
                }
        }

        function clearAllNotifications() {
            while (currentNotifications.length > 0)
                currentNotifications.pop().close();
        }
        return {
            notify: notify,
            canUseNativeNotifications: canUseNativeNotifications,
            clearAllNotifications: clearAllNotifications,
            requestNotificationPermission: requestNotificationPermission
        }
    }
});;