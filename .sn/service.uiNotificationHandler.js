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