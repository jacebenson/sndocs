/*! RESOURCE: /scripts/app.$sp/directive.spDatePicker.js */
angular.module('sn.$sp').directive('spDatePicker', function(dateUtils, $rootScope) {
  var dateFormat = g_user_date_format || dateUtils.SYS_DATE_FORMAT;
  if ($rootScope.user && $rootScope.user.date_format)
    dateFormat = $rootScope.user.date_format;

  function isValidDate(value, format) {
    if (value === '')
      return true;
    return dateUtils.getDateFromFormat(value, format) != 0;
  }
  return {
    template: '<div ng-class="{\'input-group\': !snDisabled, \'has-error\': isInvalid}" style="width: 100%;">' +
      '<input type="text" name="{{field.name}}" class="form-control" placeholder="{{field.placeholder}}" ng-model="formattedDate" ng-model-options="{updateOn: \'blur\', getterSetter: true}" ng-disabled="snDisabled" />' +
      '<span class="input-group-btn" ng-hide="snDisabled">' +
      '<input type="hidden" class="datepickerinput" ng-model="formattedDate" ng-readonly="true" />' +
      '<button class="btn btn-default" type="button">' +
      '<glyph sn-char="calendar" />' +
      '</button>' +
      '</span>' +
      '</div>',
    restrict: 'E',
    replace: true,
    require: '?ngModel',
    scope: {
      field: '=',
      snDisabled: '=',
      snIncludeTime: '=',
      snChange: '&'
    },
    link: function(scope, element, attrs, ngModel) {
      var includeTime = scope.snIncludeTime;
      var format = includeTime ? dateFormat.trim() + ' ' + dateUtils.SYS_TIME_FORMAT : dateFormat;
      var dp = element.find('.input-group-btn').datetimepicker({
        keepInvalid: true,
        pickTime: scope.snIncludeTime === true,
        format: "X"
      }).on('dp.change', onDpChange);

      function onDpChange(e) {
        var value = new Date(e.date._d);
        scope.formattedDate(dateUtils.formatDate(value, format));
        if (!scope.$root.$$phase)
          scope.$apply();
      }

      function validate(formattedDate) {
        scope.isInvalid = false;
        if (formattedDate == null || formattedDate == '') {
          dp.data('DateTimePicker').setValue(new Date());
          return '';
        }
        if (isValidDate(formattedDate, format)) {
          var d = dateUtils.getDateFromFormat(formattedDate, format);
          dp.data('DateTimePicker').setValue(new Date(d));
        } else {
          scope.isInvalid = true;
        }
        return formattedDate;
      }
      if (ngModel) {
        ngModel.$parsers.push(validate);
        ngModel.$render = function() {
          validate(ngModel.$viewValue);
        };
        scope.formattedDate = function(formattedValue) {
          if (angular.isDefined(formattedValue)) {
            ngModel.$setViewValue(formattedValue);
            if (scope.snChange) scope.snChange({
              newValue: formattedValue
            });
          }
          return ngModel.$viewValue;
        };
      } else {
        scope.formattedDate = function(formattedValue) {
          if (angular.isDefined(formattedValue)) {
            scope.field.value = validate(formattedValue);
            if (scope.snChange) scope.snChange({
              newValue: formattedValue
            });
          }
          return scope.field.value;
        };
        scope.$watch('field.value', function(newValue, oldValue) {
          if (newValue != oldValue)
            validate(newValue);
        });
      }
      scope.$on('$destroy', function() {
        dp.off('dp.change', onDpChange);
      });
    }
  }
});;