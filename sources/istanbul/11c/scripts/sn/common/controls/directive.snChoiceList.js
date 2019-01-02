/*! RESOURCE: /scripts/sn/common/controls/directive.snChoiceList.js */
angular.module('sn.common.controls').directive('snChoiceList', function($timeout) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      snModel: "=",
      snTextField: "@",
      snValueField: "@",
      snOptions: "=?",
      snItems: "=?",
      snOnChange: "&",
      snDisabled: "=",
      snDialogName: "=",
    },
    template: '<select ng-disabled="snDisabled" ng-model="model" ng-options="item[snValueField] as item[snTextField] for item in snItems"><option value="" ng-show="snOptions.placeholder">{{snOptions.placeholder}}</option></select>',
    link: function(scope, element, attrs) {
      if (scope.snDialogName)
        scope.$on("dialog." + scope.snDialogName + ".close", function() {
          $timeout(function() {
            $(element).select2("destroy");
          })
        });
      $(element).css("opacity", 0);
      var config = {
        width: "100%"
      };
      if (scope.snOptions) {
        if (scope.snOptions.placeholder) {
          config.placeholderOption = "first";
        }
        if (scope.snOptions.hideSearch && scope.snOptions.hideSearch === true) {
          config.minimumResultsForSearch = -1;
        }
      }

      function init() {
        scope.model = scope.snModel;
        render();
      }

      function render() {
        if (!attrs) {
          $timeout(function() {
            render();
          });
          return;
        }
        $timeout(function() {
          $(element).css("opacity", 1);
          $(element).select2("destroy");
          $(element).select2(config);
        });
      }
      init();
      scope.$watch("snItems", function(newValue, oldValue) {
        if (newValue !== oldValue) {
          init();
        }
      }, true);
      scope.$watch("snModel", function(newValue) {
        if (newValue !== undefined && newValue !== scope.model) {
          init();
        }
      });
      scope.$watch("model", function(newValue, oldValue) {
        if (newValue !== oldValue) {
          scope.snModel = newValue;
          if (scope.snOnChange)
            scope.snOnChange({
              selectedValue: newValue
            });
        }
      });
    },
    controller: function($scope) {}
  }
});;