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
          if ($scope.field.stagedValue !== $scope.field.confirmPassword && $scope.field.useConfirmation == true)
            $scope.field.isInvalid = true;
          else
            $scope.field.isInvalid = false;
          $scope.onChange();
        },
        c.cleanData = function() {
          if ($scope.field.stagedValue === VALUE_MASK) {
            $scope.field.stagedValue = '';
            $scope.field.confirmPassword = '';
          }
        },
        c.togglePassword = function() {
          if ($scope.inputType == 'password') {
            $scope.toggleShowHide = i18n.getMessage('u_hide');
            $scope.inputType = 'text';
          } else {
            $scope.toggleShowHide = i18n.getMessage('u_show');
            $scope.inputType = 'password';
          }
        }
    },
    controllerAs: 'c',
    link: function(scope, elem, attrs) {
      scope.field.isInvalid = false;
      scope.field.confirmPassword = scope.field.stagedValue;
      scope.reEnter = i18n.getMessage('Re-enter');
      scope.misMatch = i18n.getMessage('Confirmation must match');
    }
  };
});;