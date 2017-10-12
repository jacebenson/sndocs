/*! RESOURCE: /scripts/sn/common/ui/directive.snTextExpander.js */
angular.module('sn.common.ui').directive('snTextExpander', function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('sn_text_expander.xml'),
    scope: {
      maxHeight: '&',
      value: '='
    },
    link: function compile(scope, element, attrs) {
      var container = angular.element(element).find('.textblock-content-container');
      var content = angular.element(element).find('.textblock-content');
      if (scope.maxHeight() === undefined) {
        scope.maxHeight = function() {
          return 100;
        }
      }
      container.css('overflow-y', 'hidden');
      container.css('max-height', scope.maxHeight() + 'px');
    },
    controller: function($scope, $element) {
      var container = $element.find('.textblock-content-container');
      var content = $element.find('.textblock-content');
      $scope.value = $scope.value || '';
      $scope.toggleExpand = function() {
        $scope.showMore = !$scope.showMore;
        if ($scope.showMore) {
          container.css('max-height', content.height());
        } else {
          container.css('max-height', $scope.maxHeight());
        }
      };
      $timeout(function() {
        if (content.height() > $scope.maxHeight()) {
          $scope.showToggle = true;
          $scope.showMore = false;
        }
      });
    }
  };
});;