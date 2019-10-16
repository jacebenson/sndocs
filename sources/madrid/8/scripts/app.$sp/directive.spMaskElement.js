/*! RESOURCE: /scripts/app.$sp/directive.spMaskElement.js */
angular.module('sn.$sp').directive('spMaskElement', function(i18n) {
      "use strict";
      return {
        restrict: 'E',
        scope: {
          field: '=',
          onChange: '&snChange',
          onBlur: '&snBlur',
          disabled: '=snDisabled',
          placeholder: '=',
          getGlideForm: '&glideForm'
        },
        templateUrl: 'sp_element_mask.xml',
        controller: function($scope) {
            var c = this;
            var VALUE_MASK = '**********';
            $scope.inputType = 'password';
            $scope.toggleShowHide = i18n.getMessage('u_show');
            if (!$scope.field.catalog_view_masked && $scope.field.stagedValue != '') {
              $scope.field.stagedValue = VALUE_MASK;
            }
            $scope.modelValueChange = function() {
                $scope.field._setFromModel = true;
                $scope.getGlideForm().setValue($scope.field.name, $scope.field.stagedValue);
              },
              c.validate = function() {
                if ($sc