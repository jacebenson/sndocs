/*! RESOURCE: /scripts/sn/common/datetime/directive.snDayAgo.js */
angular.module('sn.common.datetime').directive("snDayAgo", function(timeAgoSettings, $rootScope, timeAgo, timeAgoTimer, DATE_GRANULARITY) {
  "use strict";
  return {
    restrict: "E",
    template: '<time>{{dayAgo}}</time>',
    scope: {
      date: "="
    },
    link: function(scope) {
      timeAgoSettings.ready.then(function() {
        setDayAgo();
      });

      function setDayAgo() {
        scope.dayAgo = dayAgoConverter(scope.date, "noFuture");
      }

      function dayAgoConverter(input, option) {
        if (!input) return;
        var allowFuture = !((option === 'noFuture') || (option === 'no_future'));
        var date = timeAgo.parse(input);
        if (Object.prototype.toString.call(date) !== "[object Date]")
          return input;
        else if (isNaN(date.getTime()))
          return input;
        var diff = timeAgoTimer(DATE_GRANULARITY.DATE) - date;
        return timeAgo.allowFuture(allowFuture).toWords(diff, DATE_GRANULARITY.DATE);
      }
    }
  }
});;