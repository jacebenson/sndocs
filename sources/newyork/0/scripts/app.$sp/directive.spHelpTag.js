/*! RESOURCE: /scripts/app.$sp/directive.spHelpTag.js */
angular.module('sn.$sp').directive('spHelpTag', function($sce) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: 'sp_help_tag.xml',
    scope: {
      field: '='
    },
    controller: function($scope) {
      $scope.trustedHTML = function(html) {
        return $sce.trustAsHtml(html);
      }
    }
  }
});;