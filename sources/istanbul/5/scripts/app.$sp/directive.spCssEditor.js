/*! RESOURCE: /scripts/app.$sp/directive.spCssEditor.js */
angular.module('sn.$sp').directive('spCssEditor', function() {
  return {
    template: '<textarea ng-model="v" name="{{::field.name}}" style="width: 100%; min-height: 2em;" rows="1" wrap="soft" data-length="{{::dataLength}}" data-charlimit="false">' +
      '</textarea>',
    restrict: 'E',
    replace: true,
    require: '^ngModel',
    scope: {
      field: '=',
      dataLength: '@',
      snDisabled: '=?',
      snChange: '&',
      snBlur: '&'
    },
    link: function(scope, element, attrs, ctrl) {
      element[0].value = scope.field.value;
      element[0].id = scope.field.name + "_css_editor";
      var cmi = CodeMirror.fromTextArea(element[0], {
        mode: "text/x-less",
        lineWrapping: false,
        readOnly: scope.snDisabled === true,
        viewportMargin: Infinity,
        lineNumbers: true,
        tabSize: 2,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
      });
      var extraKeys = {
        "Ctrl-M": function(cm) {
          cm.setOption("fullScreen", !cm.getOption("fullScreen"));
        },
        "Esc": function(cm) {
          if (cm.getOption("fullScreen"))
            cm.setOption("fullScreen", false);
        }
      }
      cmi.addKeyMap(extraKeys);
      cmi.on('change', function(cm) {
        if ("stagedValue" in scope.field) {
          scope.field.stagedValue = cm.getValue();
          ctrl.$setViewValue(scope.field.stagedValue);
        } else {
          scope.field.value = cm.getValue();
          ctrl.$setViewValue(scope.field.value);
        }
        if (angular.isDefined(scope.snChange))
          scope.snChange();
      });
      cmi.on('blur', function() {
        if (angular.isDefined(scope.snBlur))
          scope.snBlur();
      });
      ctrl.$viewChangeListeners.push(function() {
        scope.$eval(attrs.ngChange);
      });
      scope.$watch(function() {
        return scope.field.value;
      }, function(newValue, oldValue) {
        if (newValue != oldValue && !cmi.hasFocus())
          cmi.getDoc().setValue(scope.field.value);
      });
      scope.$watch('snDisabled', function(newValue) {
        if (angular.isDefined(newValue)) {
          cmi.setOption('readOnly', newValue);
        }
      });
    }
  }
});