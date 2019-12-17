/*! RESOURCE: /scripts/app.ng_chat/util/directive.snChatPaneScroll.js */
angular.module("sn.connect.util").directive('snChatPaneScroll', function($timeout, $window, $q) {
  "use strict";

  function throttle(func, wait) {
    var initialCall = true,
      deferred = $q.defer(),
      timerId;
    if (typeof func != 'function') {
      return;
    }

    function throttled() {
      if (timerId) {
        return;
      }
      if (initialCall) {
        initialCall = false;
        deferred.resolve(func());
        return deferred.promise;
      }
      timerId = $timeout(function() {
        timerId = undefined;
        deferred.resolve(func());
      }, wait, false);
      return deferred.promise;
    }
    return throttled;
  }
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var SCROLL_THROTTLE_MS = 500;
      var TRIGGER_HEIGHT = 5;
      var resizeTrigger = false;
      var el = element[0];
      var prevScrollPos = el.scrollTop;
      var lastScrollHeight = el.scrollHeight;
      var scrollHandler = throttle(function() {
        if (resizeTrigger) {
          resizeTrigger = false;
          return;
        }
        var scrollPos = el.scrollTop;
        var scrollHeight = el.scrollHeight;
        if (scrollPos + el.offsetHeight + TRIGGER_HEIGHT >= scrollHeight) {
          scope.$apply(attrs.snChatPaneScroll);
        }
        lastScrollHeight = scrollHeight;
      }, SCROLL_THROTTLE_MS);
      el.scrollTop = el.scrollHeight;
      $timeout(function() {
        el.scrollTop = el.scrollHeight;
        prevScrollPos = el.scrollTop;
      }, 0, false);
      angular.element(el).on('scroll', scrollHandler);
      scope.$on("$destroy", function() {
        angular.element(el).off('scroll', scrollHandler);
      });
    }
  }
});;