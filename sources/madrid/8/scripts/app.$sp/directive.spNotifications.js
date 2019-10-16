/*! RESOURCE: /scripts/app.$sp/directive.spNotifications.js */
angular.module('sn.$sp').directive('spNotifications', function($timeout, spAriaUtil, spAriaFocusManager) {
      var str = 'CONSOLE:';

      function isConsoleMsg(msg) {
        if (!msg)
          return false;
        return msg.startsWith(str);
      }

      function outputToConsole(msg) {
        var output = msg.substring(str.length);
        var reg = new RegExp("^\\{|^\\[");
        if (reg.test(output)) {
          try {
            output = jQuery.parseJSON(output);
          } catch (err) {}
        }
        console.warn(output);
      }
      return {
        restrict: 'E',
        replace: true,
        template: '<div id="uiNotificationContainer" role="alert">\
<div ng-repeat="m in c.notifications track by $index"\
class="alert" ng-class="m.type == \'error\' ? \'alert-danger\' : \'alert-success\'">\
<span ng-if="m.type == \'error\' " class="fa fa-exclamation-triangle m-r-xs"></span>\
<span ng-bind-html="::m.message"></span>\
<button ng-if="::$first" class="btn btn-link fa fa-close dismiss-notifications" ng-click="::c.dismissNotificationsButton()" aria-label="Close Notification"></button>\
</div>\
</div>',
        controllerAs: 'c',
        controller: function($scope, $element) {
            var c = this;
            c.notifications = [];
            var timer;

            function addNotification(notification) {
              if (!notification)
                return;
              if (isConsoleMsg(notification.message)) {
                outputToConsole(notification.message);
                return;
              }
              if (typeof notification.message === "undefined") {
                console.warn("Invalid message \"" + notification + "\" passed to spNotifications directive, expected an Object {type:[type], message:[message]}");
                return;
              }
              $element.on('mouseover', function() {
                $element.off();
                c.cancelAutoDismiss();
              });
              c.notifications.push(notification);
              if (spAriaUtil.g_accessibility === "true")
                $scope.focusOnNotification();
              else
                timer = autoDismiss();
            }

            function addNotifications(e, notifications) {
              if (!notifications) {
                console.warn("$$uiNotification event fired with invalid or missing notifications parameter");
                return;
              }
              if (Array.isArray(notifications)) {
                for (var x in notifications)
                  addNotification(notifications[x]);
              } else {
                addNotification(notifications);
              }
            }
            $scope.$on("$$uiNotification", addNotifications);
            c.dismissNotificationsButton = function() {
              c.dismissNotifications();
              if (spAriaUtil.g_accessibility) {
                spAriaFocusManager.focusOnPageTitle();
              }
            };
            c.dismissNotifications = function() {
              c.notifications.length = 0;
            };
            c.getMilliSeconds = function() {
                var msgTimeout = (typeof g_notif_timeout !== "undefined") ? g_noti