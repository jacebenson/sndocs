/*! RESOURCE: /scripts/app.$sp/directive.spDurationElement.js */
angular.module('sn.$sp').directive('spDurationElement', function() {
  "use strict";
  if (typeof moment.tz !== "undefined")
    moment.tz.setDefault(g_tz);

  function getVisibleUnits(attributes) {
    var maxUnit = "days";
    var o = {
      days: ["days", "hours", "minutes", "seconds"],
      hours: ["hours", "minutes", "seconds"],
      minutes: ["minutes", "seconds"],
      seconds: ["seconds"]
    };
    if (attributes && attributes.max_unit && attributes.max_unit in o)
      maxUnit = attributes.max_unit;
    return o[maxUnit];
  }

  function parseDurationToParts(value) {
    var MS_IN_DAY = 86400000;
    var parts = value.split(" ");
    if (parts.length == 2) {
      var times = parts[1].split(":");
      for (var i = 0; i < times.length; i++)
        parts[1 + i] = times[i];
      var dateParts = parts[0].split("-");
      if (dateParts.length == 3)
        parts[0] = parseInt(Date.parse(dateParts[1] +
          '/' + dateParts[2] + '/' +
          dateParts[0] + ' 00:00:00 UTC')) /
        MS_IN_DAY;
    }
    return parts;
  }
  return {
    restrict: 'E',
    replace: true,
    require: 'ngModel',
    templateUrl: 'sp_element_duration.xml',
    link: function(scope, element, attrs, ngModelCtrl) {
      var theDawnOfTime;
      scope.field = scope.$eval(attrs.field);
      scope.visibleUnits = getVisibleUnits(scope.field.attributes);
      ngModelCtrl.$formatters.push(function() {
        if (!ngModelCtrl.$modelValue)
          return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
          };
        var duration = parseDurationToParts(ngModelCtrl.$modelValue);
        var d = duration[0];
        var h = duration[1];
        var m = duration[2];
        var s = duration[3];
        scope.field.value = d + " " + h + ":" + m + ":" + s;
        if (scope.visibleUnits[0] == "hours") {
          h = h + (d * 24);
          d = 0;
        } else if (scope.visibleUnits[0] == "minutes") {
          m = m + (h * 60) + (d * 1440);
          d = h = 0;
        } else if (scope.visibleUnits[0] == "seconds") {
          s = s + (m * 60) + (h * 3600) + (d * 86400);
          d = h = m = 0;
        }
        return {
          days: d,
          hours: h,
          minutes: m,
          seconds: s
        };
      });
      ngModelCtrl.$render = function() {
        scope.parts = ngModelCtrl.$viewValue;
      };
      ngModelCtrl.$parsers.push(function(model) {
        theDawnOfTime = moment("1970-01-01 00:00:00");
        var modelValue = moment.duration(model);
        var newValue = theDawnOfTime.add(modelValue).format("YYYY-MM-DD HH:mm:ss");
        return newValue;
      });
      scope.updateDuration = function() {
        ngModelCtrl.$setViewValue(angular.copy(scope.parts));
      };
      scope.showLabel = function(unit) {
        if (unit == "days" || unit == "hours")
          return true;
        if (scope.visibleUnits[0] == "minutes")
          return unit == "minutes";
        return scope.visibleUnits[0] == "seconds";
      };
    }
  };
});;