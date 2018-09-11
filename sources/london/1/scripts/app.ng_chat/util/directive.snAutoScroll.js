/*! RESOURCE: /scripts/app.ng_chat/util/directive.snAutoScroll.js */
angular.module("sn.connect.util").directive('snAutoScroll', function($timeout, $window, $q, inFrameSet, activeConversation) {
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
    scope: {
      onScrollToTop: "&"
    },
    link: function(scope, element) {
      var HISTORY_THROTTLE_MS = 100;
      var SCROLL_THROTTLE_MS = 500;
      var RESIZE_THROTTLE_MS = 500;
      var STICKY_ZONE_HEIGHT = 32;
      var shouldStick = true;
      var activeTopRequest = false;
      var resizeTrigger = false;
      var el = element[0];
      var prevScrollPos = el.scrollTop;
      var lastScrollHeight = el.scrollHeight;
      var onScrollTop, heightAdjustUnwatch;

      function enforceSticky() {
        if (shouldStick) {
          el.scrollTop = el.scrollHeight;
        }
      }

      function forceScroll() {
        shouldStick = true;
        enforceSticky();
      }
      var scrollHandler = throttle(function() {
        if (resizeTrigger) {
          resizeTrigger = false;
          return;
        }
        var scrollPos = el.scrollTop;
        var scrollHeight = el.scrollHeight;
        var scrollUp = prevScrollPos > scrollPos;
        prevScrollPos = scrollPos;
        if (scrollUp) {
          shouldStick = false;
          if (angular.isFunction(scope.onScrollToTop) && !onScrollTop) {
            onScrollTop = throttle(scope.onScrollToTop, HISTORY_THROTTLE_MS);
          }
          if (scrollPos === 0) {
            var oldScrollHeight = scrollHeight;
            if (!activeTopRequest) {
              activeTopRequest = true;
              var topBatch = element.find(".sn-feed-message-holder:first-child");
              var topBatchLastMessage = topBatch.scope().batch.lastMessage;
              onScrollTop().finally(function(result) {
                activeTopRequest = false;
                if (!heightAdjustUnwatch) {
                  heightAdjustUnwatch = scope.$on("ngRepeat.complete", function() {
                    var heightAdjust = 0;
                    var potentialConflict = topBatch.prev();
                    var newTopBatch = element.find(".sn-feed-message-holder:first-child");
                    if (potentialConflict.length && potentialConflict.scope().batch.lastMessage.sysID === topBatchLastMessage.sysID) {
                      heightAdjust = topBatch[0].clientHeight;
                    } else if (topBatch[0] !== newTopBatch[0]) {
                      heightAdjust = topBatch.find('.sn-feed-message_date').outerHeight(true);
                    }
                    el.scrollTop = el.scrollHeight - oldScrollHeight - heightAdjust;
                    heightAdjustUnwatch();
                    heightAdjustUnwatch = void(0);
                  });
                }
                return result;
              });
            }
          }
          return;
        }
        if (scrollPos + el.clientHeight + STICKY_ZONE_HEIGHT >= scrollHeight) {
          shouldStick = true;
          enforceSticky();
        }
        lastScrollHeight = scrollHeight;
      }, SCROLL_THROTTLE_MS);
      var resizeHandler = throttle(function() {
        resizeTrigger = true;
        if (el.scrollTop <= STICKY_ZONE_HEIGHT) {
          shouldStick = true;
        }
        enforceSticky();
      }, RESIZE_THROTTLE_MS);
      el.scrollTop = el.scrollHeight;
      $timeout(function() {
        el.scrollTop = el.scrollHeight;
        prevScrollPos = el.scrollTop;
      }, 0, false);
      angular.element(el).on('scroll', scrollHandler);
      angular.element($window).on('resize', resizeHandler);
      scope.$on('connect.auto_scroll.scroll_to_bottom', forceScroll);
      scope.$on('connect.auto_scroll.jump_to_bottom', forceScroll);
      scope.$watch(enforceSticky);
      if (!inFrameSet)
        scope.$watch(function() {
          return activeConversation.sysID;
        }, function(newVal, oldVal) {
          if (newVal === oldVal)
            return;
          forceScroll();
        });
      scope.$on("$destroy", function() {
        angular.element(el).off('scroll', scrollHandler);
        angular.element($window).off('resize', resizeHandler);
      });
    }
  }
});;