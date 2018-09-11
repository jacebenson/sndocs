/*! RESOURCE: /scripts/app.ng_chat/util/directive.snPod.js */
angular.module('sn.connect.util').directive('snPod', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snPod.xml"),
    replace: true,
    scope: {
      user: '=',
      label: '=label',
      showLabel: '=showLabel',
      removeTitle: '@removeTitle',
      removeClick: '&removeClick'
    },
    controller: function($scope) {
      $scope.onRemove = function($event) {
        if ($scope.removeClick) {
          $event.stopPropagation();
          $scope.removeClick({
            $event: $event
          });
        }
      };
    }
  };
});;