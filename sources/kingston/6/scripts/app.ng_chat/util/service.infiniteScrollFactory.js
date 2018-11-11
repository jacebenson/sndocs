/*! RESOURCE: /scripts/app.ng_chat/util/service.infiniteScrollFactory.js */
"use strict";
var _createClass = function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
var InfiniteScrollService = function() {
  function InfiniteScrollService(_ref) {
    var onScrollUp = _ref.onScrollUp,
      onScrollDown = _ref.onScrollDown,
      onScrollMissing = _ref.onScrollMissing,
      throttleFunc = _ref.throttleFunc,
      scrollThrottleInMs = _ref.scrollThrottleInMs,
      lookAhead = _ref.lookAhead;
    _classCallCheck(this, InfiniteScrollService);
    this.onScrollUp = onScrollUp;
    this.onScrollDown = onScrollDown;
    this.onScrollMissing = onScrollMissing;
    this.lookAhead = lookAhead;
    this.throttleFunc = throttleFunc;
    this.scrollThrottleInMs = scrollThrottleInMs;
    this.prevScrollPos = 0;
  }
  _createClass(InfiniteScrollService, [{
    key: "onScroll",
    value: function onScroll(scrollPos, scrollHeight, clientHeight) {
      var _this = this;
      this.throttleFunc(function() {
        if (_this.isScrollBarMissing(scrollHeight, clientHeight)) {
          _this.onScrollMissing();
          return;
        }
        var scrollUp = _this.prevScrollPos > scrollPos;
        var scrollDown = _this.prevScrollPos < scrollPos;
        _this.prevScrollPos = scrollPos;
        var upperBoundary = Math.ceil(scrollHeight * _this.lookAhead);
        var lowerBoundary = Math.ceil(scrollHeight * (1 - _this.lookAhead));
        if (scrollPos + clientHeight >= lowerBoundary && scrollDown) {
          _this.onScrollDown();
        } else if (scrollPos <= upperBoundary && scrollUp) {
          _this.onScrollUp();
        }
      }, this.scrollThrottleInMs)();
    }
  }, {
    key: "isScrollBarMissing",
    value: function isScrollBarMissing(scrollHeight, clientHeight) {
      if (scrollHeight > clientHeight) {
        return false;
      } else {
        return true;
      }
    }
  }]);
  return InfiniteScrollService;
}();
angular.module('sn.connect.util').factory('infiniteScrollFactory', function() {
  return {
    get: function(options) {
      return new InfiniteScrollService(options);
    }
  }
});;