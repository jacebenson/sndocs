/*! RESOURCE: /scripts/app.$sp/directive.spCheckboxGroup.js */
angular.module('sn.$sp').directive('spCheckboxGroup', function($sce) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: 'sp_checkbox_group.xml',
    scope: {
      getGlideForm: '&glideForm',
      containers: "=containers",
      formModel: "=formModel",
      name: "="
    },
    controllerAs: "c",
    controller: function($scope) {
      var c = this;
      var field;
      $scope.field = $scope.formModel._fields[$scope.name];
      field = $scope.field;
      $scope.getVarID = function(v) {
        if (typeof v.name != "undefined" && hasVariablePrefix(v.name))
          return v.name.substring(3);
        return v.name;
      };
      $scope.trustedHTML = function(html) {
        return $sce.trustAsHtml(html);
      };

      function hasVariablePrefix(v) {
        return v.indexOf("IO:") == 0;
      }
    }
  };
});;