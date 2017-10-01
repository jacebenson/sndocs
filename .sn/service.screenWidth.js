/*! RESOURCE: /scripts/app.ng_chat/util/service.screenWidth.js */
angular.module("sn.connect.util").service("screenWidth", function($window, $timeout) {
    "use strict";
    var window = angular.element($window);
    var thresholdTimeout;
    return {
        get width() {
            return window.width();
        },
        onResize: function(fn) {
            var self = this;
            window.on('resize', function() {
                fn(self.width);
            });
        },
        isAbove: function(width) {
            return this.width > width;
        },
        threshold: function(threshold, fn, debounce) {
            var lastState;
            this.onResize(function(curr) {
                $timeout.cancel(thresholdTimeout);
                thresholdTimeout = $timeout(function() {
                    var state = curr >= threshold;
                    if (state === lastState)
                        return;
                    fn(state, curr);
                    lastState = state;
                }, debounce);
            });
        }
    }
});;