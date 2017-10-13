/*! RESOURCE: /scripts/app.$sp/directive.spFormField.js */
angular.module('sn.$sp').directive('spFormField', function($location, glideFormFieldFactory, $timeout) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: 'sp_form_field.xml',
    replace: true,
    scope: {
      field: '=',
      formModel: '=',
      getGlideForm: '&glideForm'
    },
    controller: function($element, $scope) {
      var field = $scope.field;
      if (!field)
        throw "spFormField used without providing a field.";
      extendField($scope.field);

      function extendField(field) {
        var glideField = glideFormFieldFactory.create(field);
        field.isReadonly = glideField.isReadonly;
        field.isMandatory = function() {
          return !glideField.isReadonly() && glideField.isMandatory();
        };
        field.mandatory_filled = hasValue;
        field.stagedValue = field.value;
        $scope.getGlideForm().$private.events.on("change", function(fieldName, oldValue, newValue) {
          if (fieldName == field.name)
            field.stagedValue = newValue;
        });
      }

      function hasValue() {
        if (field.type === "boolean")
          return true;
        if (field.stagedValue == null || typeof field.stagedValue === 'undefined')
          return false;
        var trimmed = String(field.stagedValue).trim();
        return trimmed.length > 0;
      }
      $scope.stagedValueChange = function() {
        $scope.$emit('sp.spFormField.stagedValueChange', null);
      }
      $scope.fieldValue = function(newValue, displayValue) {
        if (angular.isDefined(newValue)) {
          $scope.getGlideForm().setValue(field.name, newValue, displayValue);
        }
        return field.value;
      };
      $scope.getEncodedRecordValues = function() {
        var result = {};
        angular.forEach($scope.formModel._fields, function(f) {
          if (f.type != 'user_image')
            result[f.name] = f.value;
          else if (f.value)
            result[f.name] = 'data:image/jpeg;base64,A==';
        });
        return result;
      };
      $scope.onImageUpload = function(thumbnail) {
        $scope.getGlideForm().setValue(field.name, thumbnail, thumbnail);
      };
      $scope.onImageDelete = function() {
        $scope.getGlideForm().setValue(field.name, '');
      };
      $scope.hasValueOrFocus = function() {
        var val = $scope.hasFocus || glideFormFieldFactory.hasValue(field);
        if (field.type == "user_image")
          val = true;
        return val;
      };
    },
    link: function(scope, element, attr) {
      $timeout(function() {
        var inputField;
        switch (scope.field.type) {
          case "masked":
          case "email":
          case "password":
            inputField = element.find("input[name='" + scope.field.name + "']");
            break;
          case "field_list":
          case "glide_list":
          case "reference":
          case "field_name":
          case "table_name":
            return;
            break;
          default:
            inputField = element.find("[name='" + scope.field.name + "']");
            break;
        }
        var focusHandler = function() {
          scope.hasFocus = true;
          scope.$emit("sp.spFormField.focus", element, inputField);
          if (!scope.$root.$$phase)
            scope.$apply();
        };
        var blurHandler = function() {
          scope.fieldValue(scope.field.stagedValue);
          scope.hasFocus = false;
          scope.$emit("sp.spFormField.blur", element, inputField);
          if (!scope.$root.$$phase)
            scope.$apply();
        };
        inputField.on('focus', focusHandler).on('blur', blurHandler);
        scope.$on('$destroy', function() {
          inputField.off('focus', focusHandler).off('blur', blurHandler);
        });
        scope.$emit("sp.spFormField.rendered", element, inputField);
      });
      scope.$on('select2.ready', function(e, $el) {
        e.stopPropagation();
        var focusHandler = function(e) {
          $el.select2('open');
        };
        $el.on('focus', focusHandler);
        scope.$on('$destroy', function() {
          $el.off('focus', focusHandler);
        });
        scope.$emit("sp.spFormField.rendered", element, $el);
      });
    }
  }
});;