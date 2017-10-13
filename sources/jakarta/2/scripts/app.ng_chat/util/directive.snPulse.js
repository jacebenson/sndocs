/*! RESOURCE: /scripts/app.ng_chat/util/directive.snPulse.js */
angular.module('sn.connect.util').directive('snPulse', function($timeout) {
  "use strict";
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var timeouts = scope.pulseTimeouts ? angular.fromJson(attrs.pulseTimeouts) : [10000, 10000, 10000, 10000];
      var classes = ['pulse-off', 'pulse-positive', 'pulse-warning', 'pulse-danger'];
      var index = 0;
      var timeout;
      var enabled = true;
      scope.$watch(function() {
        return attrs.pulseEnabled;
      }, function() {
        enabled = attrs.pulseEnabled === 'true';
        if (!enabled) {
          $timeout.cancel(timeout);
          element.removeClass(classes.join(' '));
        }
      });
      scope.$watch(function() {
        return attrs.pulseTimestamp;
      }, function() {
        index = 0;
        $timeout.cancel(timeout);
        if (attrs.pulseTimestamp && enabled) {
          var start = parseInt(attrs.pulseTimestamp, 10);
          var now = Date.now();
          var diff = now - start;
          var elapsedTime = 0;
          for (var i = 0; i < timeouts.length; i++) {
            if (diff >= elapsedTime) {
              index = i;
              elapsedTime += timeouts[i];
            }
          }
          updateClass();
        }
      });

      function updateClass() {
        element.removeClass(classes.join(' '));
        if (index > 0) {
          element.addClass(classes[index]);
        }
        if (index < timeouts.length - 1) {
          timeout = $timeout(updateClass, timeouts[index + 1]);
          index++;
        }
      }
    }
  };
});;