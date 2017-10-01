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
});;