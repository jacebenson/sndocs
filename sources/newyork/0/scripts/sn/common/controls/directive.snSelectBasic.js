/*! RESOURCE: /scripts/sn/common/controls/directive.snSelectBasic.js */
angular.module('sn.common.controls').directive('snSelectBasic', function($timeout, i18n) {
  return {
    restrict: 'C',
    priority: 1,
    require: '?ngModel',
    scope: {
      'snAllowClear': '@',
      'snSelectWidth': '@',
      'snChoices': '=?'
    },
    link: function(scope, element, attrs, ngModel) {
      if (angular.isFunction(element.select2)) {
        var config = {
          allowClear: scope.selectAllowClear,
          width: scope.selectWidth
        };
        i18n.getMessage('Searching...', function(searchingMsg) {
          config.formatSearching = function() {
            return searchingMsg;
          };
        });
        i18n.getMessage('No matches found', function(msg) {
          config.formatNoMatches = function() {
            return msg;
          };
        });
        i18n.getMessage('Loading more results...', function(msg) {
          config.formatLoadMore = function() {
            return msg;
          };
        });
        element.css("opacity", 0);
        scope.selectWidth = scope.snSelectWidth || '100%';
        scope.selectAllowClear = scope.snAllowClear === "true";
        $timeout(function() {
          element.css("opacity", 1);
          element.select2(config);
          if (ngModel === null)
            return;
          ngModel.$render = function() {
            element.select2('val', ngModel.$viewValue);
            element.val(ngModel.$viewValue);
          };
        });
        element.on('change', function() {
          scope.$evalAsync(setModelValue);
        });
        scope.$watch('snChoices', function(newValue, oldValue) {
          if (angular.isDefined(newValue) && newValue != oldValue) {
            $timeout(function() {
              setModelValue();
            });
          }
        }, true);

        function setModelValue() {
          if (ngModel === null)
            return;
          ngModel.$setViewValue(element.val());
        }
      }
    }
  };
});;