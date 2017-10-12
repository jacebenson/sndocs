/*! RESOURCE: /scripts/sn/common/controls/directive.snRecordPicker.js */
angular.module('sn.common.controls').directive('snRecordPicker', function($timeout, $http, urlTools, filterExpressionParser, $sanitize, i18n) {
      "use strict";
      var cache = {};

      function cleanLabel(val) {
        if (typeof val == "object")
          return "";
        return typeof val == "string" ? val.trim() : val;
      }
      return {
        restrict: 'E',
        replace: true,
        scope: {
          field: '=',
          table: '=',
          defaultQuery: '=?',
          searchFields: '=?',
          valueField: '=?',
          displayField: '=?',
          displayFields: '=?',
          pageSize: '=?',
          onChange: '&',
          snDisabled: '=',
          multiple: '=?',
          options: '=?',
          placeholder: '@'
        },
        template: '<input type="text" ng-disabled="snDisabled" style="min-width: 150px;" name="{{field.name}}" ng-model="field.value" />',
        controller: function($scope) {
          if (!angular.isNumber($scope.pageSize))
            $scope.pageSize = 20;
          if (!angular.isDefined($scope.valueField))
            $scope.valueField = 'sys_id';
          this.filterResults = function(data, page) {
            return {
              results: data.data.result,
              more: (page * $scope.pageSize < parseInt(data.headers('x-total-count'), 10))
            };
          };
        },
        link: function(scope, element, attrs, ctrl) {
            var isExecuting = false;
            var select2Helpers = {
                formatSelection: function(item) {
                  return $sanitize(getDisplayValue(item));
                },
                formatResult: function(item) {
                  var displayFields = getdisplayFields(item);
                  if (displayFields.length == 1)
                    return $sanitize(cleanLabel(displayFields[0]));
                  if (displayFields.length > 1) {
                    var markup = $sanitize(displayFields[0]);
                    var width = 100 / (displayFields.length - 1);
                    markup += "<div>";
                    for (var i = 1; i < displayFields.length; i++)
                      markup += "<div style='width: " + width + "%;' class='select2-additional-display-field'>" + $sanitize(cleanLabel(displayFields[i])) + "</div>";
                    markup += "</div>";
                    return markup;
                  }
                  return "";
                },
                search: function(queryParams) {
                  var url = '/api/now/table/' + scope.table + '?' + urlTools.encodeURIParameters(queryParams.data);
                  if (scope.options && scope.options.cache && cache[url])
                    return queryParams.success(cache[url]);
                  return $http.get(url).then(function(response) {
                    if (scope.options && scope.options.cache) {
                      cache[url] = response;
                    }
                    return queryParams.success(response)
                  });
                },
                initSelection: function(elem, callback) {
                    if (scope.field.displayValue) {
                      if (scope.multiple) {
                        var items = [],
                          sel;
                        var values = scope.field.value.split(',');
                        var displayValues = scope.field.displayValue.split(',');
                        for (var i = 0; i < values.length; i++) {
                          sel = {};
                          sel[scope.valueField] = values[i];
                          sel[scope.displayField] = displayValues[i];
                          items.push(sel);
                        }
                        callback(items);
                      } else {
                        var sel = {};
                        sel[scope.valueField] = scope.fi