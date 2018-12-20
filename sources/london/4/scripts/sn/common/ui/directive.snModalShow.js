/*! RESOURCE: /scripts/sn/common/ui/directive.snModalShow.js */
angular.module('sn.common.ui').directive('snModalShow', function() {
  "use strict";
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.click(function() {
        showDialog();
      });

      function showDialog() {
        scope.$broadcast('dialog.' + attrs.snModalShow + '.show');
      }
      if (window.SingletonKeyboardRegistry) {
        var keyboardRegistry = SingletonKeyboardRegistry.getInstance();
        var isEventValid = function() {
          return true
        };
        if (window.MagellanNavigatorKeyboardUtils) {
          isEventValid = MagellanNavigatorKeyboardUtils.isEventValidFactory();
          CustomEvent.observe('application_navigator_keyboard_shortcuts_updated', function(keyboard_shortcuts_enabled) {
            isEventValid = MagellanNavigatorKeyboardUtils.isEventValidFactory(keyboard_shortcuts_enabled);
          });
        }
        keyboardRegistry.bind('ctrl + alt + i', function(evt) {
          if (!isEventValid(evt)) return;
          scope.$broadcast('dialog.impersonate.show');
        }).selector(null, true);
      }
    }
  }
});;