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