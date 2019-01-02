/*! RESOURCE: /scripts/app.ng_chat/util/directive.snConnectDuration.js */
angular.module('sn.connect.util').directive('snConnectDuration', function($interval, $sanitize, durationFormatter) {
  'use strict';
  var listenerCount = 0;
  var listeners = {};
  $interval(tick, 1000, 0, false);

  function tick() {
    angular.forEach(listeners, function(listenerFn) {
      if (typeof listenerFn !== "function")
        return;
      listenerFn();
    })
  }

  function onTick(fn) {
    listenerCount++;
    listeners[listenerCount] = fn;
    return listenerCount;
  }

  function remove(listenerCount) {
    delete listeners[listenerCount];
  }
  return {
    template: '<span></span>',
    restrict: 'E',
    replace: true,
    scope: {
      startTimestamp: '=?',
      endTimestamp: '=?',
      placeholder: '@'
    },
    link: function(scope, element, attrs) {
      var listenerIndex;

      function calculate() {
        var duration = attrs.placeholder || '';
        if (scope.startTimestamp && scope.endTimestamp) {
          duration = durationFormatter.formatWithRange(scope.startTimestamp, scope.endTimestamp);
        } else if (scope.startTimestamp) {
          duration = durationFormatter.format(scope.startTimestamp);
        } else if (scope.endTimestamp) {
          duration = durationFormatter.format(scope.endTimestamp);
        }
        element.html($sanitize(duration));
      }
      listenerIndex = onTick(calculate);
      scope.$on('$destroy', function() {
        remove(listenerIndex);
      });
      calculate();
    }
  };
});;