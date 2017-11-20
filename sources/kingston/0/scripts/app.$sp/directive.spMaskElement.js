/*! RESOURCE: /scripts/app.$sp/directive.spMaskElement.js */
angular.module('sn.$sp').directive('spMaskElement', function(i18n) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: 'sp_element_mask.xml',
    link: function(scope, elem, attrs) {
      scope.field.isInvalid = false;
      scope.field.confirmPassword = scope.field.stagedValue;
      scope.reEnter = i18n.getMessage('Re-enter');
      scope.misMatch = i18n.getMessage('Confirmation must match');
      scope.isConfirmed = function() {
        if (scope.field.stagedValue !== scope.field.confirmPassword && scope.field.useConfirmation == true)
          scope.field.isInvalid = true;
        else
          scope.field.isInvalid = false;
      }
    },
  };
});;