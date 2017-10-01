/*! RESOURCE: /scripts/sn/common/session_notification/js_includes_session_notification.js */
/*! RESOURCE: /scripts/sn/common/session_notification/_module.js */
angular.module('sn.common.session_notification', ['sn.common.notification', 'sn.common.i18n']);;
/*! RESOURCE: /scripts/sn/common/session_notification/service.sessionNotificationInterceptor.js */
angular.module('sn.common.session_notification').config(function($httpProvider) {
    var HEADER_KEY = "X-WantSessionNotificationMessages";

    function handleSessionNotificationResponse(response, snCustomEvent) {
        if (!response.data.result || !response.data.session || !response.data.session.notifications)
            return response;
        var deDupedNotifications = _deDupedNotifications(response.data.session.notifications);
        angular.forEach(deDupedNotifications, function(item) {
            var method = 'fire';
            if (item.type == 'ui_notification')
                method = 'fireTop';
            snCustomEvent[method]("session_notification", item);
        });
        return response;
    }

    function handleSessionNotificationRequest(config) {
        if (config.url.indexOf('xmlhttp.do') === 0 ||
            config.url.indexOf('/api/now/ui/presence') === 0 ||
            typeof g_form != "undefined")
            return config;
        if (HEADER_KEY in config.headers)
            return config;
        config.headers[HEADER_KEY] = 'true';
        return config;
    }
    $httpProvider.interceptors.push(function(snCustomEvent) {
        return {
            'request': function(config) {
                return handleSessionNotificationRequest(config);
            },
            'response': function(response) {
                return handleSessionNotificationResponse(response, snCustomEvent);
            }
        };
    });

    function _deDupedNotifications(notifications) {
        var _deDupedMessages = notifications.map(function(item) {
            return item.text
        });
        return notifications.filter(function(notification, index) {
            return _deDupedMessages.indexOf(notification.text) == index;
        });
    }
});
angular.module('sn.common.session_notification').run(function(snCustomEvent, snNotification) {
    snCustomEvent.observe('session_notification', function(item) {
        var duration = 0;
        var ephemeralAlertTypes = ['system'];
        var notUsTypes = ['system_event', 'service', 'action', 'processed'];
        if (!item.text || notUsTypes.indexOf(item.notification_type) > -1)
            return;
        if (item.duration)
            duration = parseInt(item.duration, 10);
        else if (ephemeralAlertTypes.indexOf(item.notification_type) > -1) {
            duration = 5000;
        }
        type = 'info';
        if (item.type)
            type = item.type;
        if (type != 'info' && type != 'error' && type != 'success' && type != 'warning' && type != 'danger')
            type = 'info';
        snNotification.show(type, item.text, duration);
        item.notification_type = 'processed';
        return false;
    });
});;
/*! RESOURCE: /scripts/sn/common/session_notification/service.uiNotificationHandler.js */
angular.module('sn.common.session_notification').run(function(snCustomEvent, snNotification, i18n) {
    snNotification.setOptions({
        duration: 0
    });
    snCustomEvent.observe('session_notification', function(item) {
        if (!snCustomEvent.isTopWindow())
            return;
        if (item.notification_type == 'system') {
            outputMessage(item.text, parseInt(item.duration, 10));
        }
        if (item.notification_type == 'update_set_change') {
            var string = 'Your current update set has been changed to {0}';
            if (item.notification_attributes && item.notification_attributes.msg) {
                string += "<br/>" + item.notification_attributes.msg;
                item.type = 'warning';
            }
            i18n.getMessage(string, function(msg) {
                var formattedMsg = i18n.format(msg, item.notification_attributes.name);
                handleMessage(item, formattedMsg, 10000);
            });
        }
        if (item.notification_type == 'system_event' && item.notification_attributes && item.notification_attributes.event == 'refresh_nav') {
            snCustomEvent.fireTop('navigator.refresh');
        }
        return;
    });

    function handleMessage(item, message, duration) {
        var dur = duration || false;
        triggerPickerRefresh();
        if (item.notification_attributes.update_only == 'true')
            return;
        outputMessage(message, dur);
    }

    function triggerPickerRefresh() {
        snCustomEvent.fireAll('sn:refresh_update_set');
    }

    function outputMessage(msg, duration) {
        snNotification.show('info', msg, duration);
    }
});;
/*! RESOURCE: /scripts/sn/common/session_notification/service.legacySessionNotificationHandler.js */
angular.module('sn.common.session_notification').run(function(snCustomEvent) {
    window.NOW.ngLegacySessionNotificationSupport = true;
    snCustomEvent.observe('legacy_session_notification', function(span) {
        var notification = {
            notification_attributes: {}
        };
        if (span && span.attributes.length > 0) {
            for (var i = 0; i < span.attributes.length; i++) {
                var attr = span.attributes[i];
                var name = attr.name;
                if (name.indexOf('data-') != -1)
                    name = name.substring('data-'.length);
                if (name.startsWith('attr-')) {
                    name = name.substring('attr-'.length)
                    notification.notification_attributes[name] = attr.value;
                    continue;
                }
                notification[name] = attr.value;
            }
        }
        if (notification['class'] == 'ui_notification') {
            notification.notification_type = notification.type || 'ui_notification';
            notification.type = notification.type || 'ui_notification';
            snCustomEvent.fireTop('session_notification', notification);
            return;
        }
        snCustomEvent.fire('session_notification', notification);
        return false;
    });
    snCustomEvent.observe('glide:ui_notification.update_set_change', function(notification) {
        snCustomEvent.fire('legacy_session_notification', notification.xml);
    });
    snCustomEvent.observe('glide:ui_notification.system', function(notification) {
        if (typeof notification != 'undefined' && typeof notification.xml != 'undefined') {
            snCustomEvent.fire('legacy_session_notification', notification.xml);
        }
    });
    snCustomEvent.observe('glide:ui_notification.system_event', function(notification) {
        if (typeof notification != 'undefined' && typeof notification.xml != 'undefined') {
            var type = notification.xml.getAttribute('data-attr-event');
            if (typeof type != 'undefined' && type === 'refresh_nav') {
                snCustomEvent.fireTop('navigator.refresh');
            }
        }
    });
    snCustomEvent.observe('glide:ui_notification.error', function(notificaiton) {
        snCustomEvent.fire('legacy_session_notification', notificaiton.xml);
        return false;
    });
    snCustomEvent.observe('glide:ui_notification.info', function(notificaiton) {
        snCustomEvent.fire('legacy_session_notification', notificaiton.xml);
        return false;
    });
});;;