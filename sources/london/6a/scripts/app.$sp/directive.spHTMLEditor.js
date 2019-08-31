/*! RESOURCE: /scripts/app.$sp/directive.spHTMLEditor.js */
angular.module('sn.$sp').directive('spHtmlEditor', function($timeout) {
  return {
    template: '<textarea class="CodeMirror" name="{{::field.name}}" ng-model="v" style="width: 100%;" data-length="{{ ::dataLength }}" data-charlimit="false"></textarea>',
    restrict: 'E',
    require: '^ngModel',
    replace: true,
    scope: {
      field: '=',
      dataLength: '@',
      rows: '@',
      snDisabled: '=?',
      snChange: '&',
      snBlur: '&',
      getGlideForm: '&glideForm'
    },
    link: function(scope, element, attrs, ctrl) {
      $timeout(function() {
        var g_form;
        var field = scope.field;
        if (typeof attrs.glideForm != "undefined") {
          g_form = scope.getGlideForm();
        }
        element[0].value = field.value;
        element[0].id = "sp_formfield_" + field.name;
        var cmi = CodeMirror.fromTextArea(element[0], {
          mode: "htmlmixed",
          lineWrapping: false,
          readOnly: scope.snDisabled === true,
          viewportMargin: Infinity,
          lineNumbers: true,
          autoCloseTags: true,
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
        ctrl.$viewChangeListeners.push(function() {
          scope.$eval(attrs.ngChange);
        });
        cmi.on('change', function(cm) {
          if (typeof field.stagedValue != "undefined") {
            field.stagedValue = cm.getValue();
            ctrl.$setViewValue(field.stagedValue);
          } else {
            field.value = cm.getValue();
            ctrl.$setViewValue(field.value);
          }
          if (angular.isDefined(scope.snChange))
            scope.snChange();
        });
        cmi.on('blur', function() {
          if (angular.isDefined(scope.snBlur))
            scope.snBlur();
        });
        if (g_form) {
          g_form.$private.events.on('propertyChange', function(type, fieldName, propertyName) {
            if (fieldName != field.name)
              return;
            if (propertyName == "readonly") {
              var isReadOnly = g_form.isReadOnly(fieldName);
              cmi.setOption('readOnly', isReadOnly);
              var cmEl = cmi.getWrapperElement();
              jQuery(cmEl).css("background-color", isReadOnly ? "#eee" : "");
            }
            g_form.$private.events.on('change', function(fieldName, oldValue, newValue) {
              if (fieldName != field.name)
                return;
              if (newValue != oldValue && !cmi.hasFocus())
                cmi.getDoc().setValue(newValue);
            });
          });
        } else {
          scope.$watch(function() {
            return field.value;
          }, function(newValue, oldValue) {
            if (newValue != oldValue && !cmi.hasFocus())
              cmi.getDoc().setValue(field.value);
          });
          scope.$watch('snDisabled', function(newValue) {
            if (angular.isDefined(newValue)) {
              cmi.setOption('readOnly', newValue);
            }
          });
        }
      });
    }
  }
});