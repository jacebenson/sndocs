/*! RESOURCE: /scripts/app.ng_chat/util/directive.snInfiniteScroll.js */
angular.module("sn.connect.util").directive('snInfiniteScroll', function($q, $interval, $window, $timeout, infiniteScrollFactory) {
  var SCROLL_THROTTLE_MS = 50;
  var LOOK_AHEAD = 0.15;
  var snInfiniteScrollService;

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
      scrollConfig: '='
    },
    bindToController: true,
    controllerAs: '$ctrl',
    link: function(scope, element) {
      var el = element[0];
      var scrollHandler = function() {
        snInfiniteScrollService.onScroll(el.scrollTop, el.scrollHeight, el.clientHeight);
      };
      el.onscroll = scrollHandler;
      angular.element($window).on('resize', scrollHandler);
    },
    controller: function() {
      this.scrollConfig = this.scrollConfig || {};
      this.scrollConfig.lookAhead = LOOK_AHEAD;
      this.scrollConfig.throttleFunc = throttle;
      this.scrollConfig.scrollThrottleInMs = SCROLL_THROTTLE_MS;
      snInfiniteScrollService = infiniteScrollFactory.get(this.scrollConfig);
    }
  };
});;