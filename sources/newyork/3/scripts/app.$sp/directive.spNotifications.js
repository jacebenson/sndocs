/*! RESOURCE: /scripts/app.$sp/directive.spNotifications.js */
angular.module('sn.$sp').directive('spNotifications', function($timeout, spAriaUtil, spAriaFocusManager, i18n) {
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
class="alert" ng-class="{\'alert-danger\' : m.type == \'error\', \'alert-warning\' : m.type == \'warning\', \'alert-success\' : m.type != \'warning\' && m.type != \'error\'}">\
<span ng-if="m.type == \'error\' " class="fa fa-exclamation-triangle m-r-xs" aria-label="{{c.errorMsg}}"></span>\
<span ng-bind-html="::m.message"></span>\
<button ng-if="::$first" class="btn btn-link fa fa-close dismiss-notifications" ng-click="::c.dismissNotificationsButton()" aria-label="Close Notification"></button>\
</div>\
</div>',
    controllerAs: 'c',
    controller: function($scope, $element) {
      var c = this;
      c.errorMsg = i18n.getMessage("Error") + '. ';
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
        if (spAriaUtil.isAccessibilityEnabled())
          spAriaFocusManager.focusOnPageTitle();
      };
      c.dismissNotifications = function() {
        c.notifications.length = 0;
      };
      c.getMilliSeconds = function() {
        var msgTimeout = (typeof g_notif_timeout !== "undefined") ? g_notif_timeout : 5;
        var seconds = (areTrivial(c.notifications)) ? 3 : msgTimeout;
        return seconds * 1000;
      };

      function areTrivial(input) {
        return input.length >= 1 && input.every(function(item) {
          return item && item.type === 'trivial';
        })
      }

      function autoDismiss() {
        if (timer)
          $timeout.cancel(timer);
        var milliSeconds = c.getMilliSeconds();
        if (milliSeconds > 0)
          return $timeout(c.dismissNotifications, milliSeconds);
      }
      c.cancelAutoDismiss = function() {
        if (areTrivial(c.notifications))
          return;
        $timeout.cancel(timer);
      };
      $scope.$on("$$uiNotification.dismiss", c.dismissNotifications);
    },
    link: function(scope, element, attrs, ctrl) {
      scope.focusOnNotification = function() {
        $timeout(function() {
          $('#uiNotificationContainer > .alert').attr('tabIndex', '-1').focus();
        });
      };
    }
  }
});;