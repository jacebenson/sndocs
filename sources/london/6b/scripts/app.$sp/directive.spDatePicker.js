/*! RESOURCE: /scripts/app.$sp/directive.spDatePicker.js */
angular.module('sn.$sp').directive('spDatePicker', function(spConf, $rootScope, $document, spAriaUtil, i18n, spDatePickerUtil, select2EventBroker, $window) {
  var dateFormat = g_user_date_format || spConf.SYS_DATE_FORMAT;
  var dateTimeFormat = g_user_date_time_format || spConf.SYS_TIME_FORMAT;
  var enableDateTranslation = $window.NOW.sp.enableDateTranslation;
  if ($rootScope.user && $rootScope.user.date_format)
    dateFormat = $rootScope.user.date_format;
  if ($rootScope.user && $rootScope.user.date_time_format)
    dateTimeFormat = $rootScope.user.date_time_format;
  return {
    template: '<div ng-class="{\'input-group\': !snDisabled, \'has-error\': field.isInvalid || field.isInvalidDateFormat}" style="width: 100%;">' +
      '<input id="sp_formfield_{{::field.name}}" type="text" name="{{field.name}}" class="form-control" placeholder="{{field.placeholder}}" title="{{g_accessibility ? translations[\'Enter date in format\']: \'\'}} {{g_accessibility ? format : \'\'}}" tooltip-top="true" tooltip-enable="{{g_accessibility}}" ng-model="formattedDate" ng-model-options="{updateOn: \'blur\', getterSetter: true}" ng-readonly="snDisabled" />' +
      '<span class="input-group-btn" ng-hide="snDisabled">' +
      '<input type="hidden" class="datepickerinput" ng-model="formattedDate" ng-readonly="true" />' +
      '<button class="btn btn-default" type="button" tabindex="-1" aria-hidden="true">' +
      '<glyph sn-char="calendar" />' +
      '</button>' +
      '</span>' +
      '<span ng-if="field.isInvalidDateFormat && !field.isInvalid" class="sp-date-format-info" style="display:table-row;" aria-hidden="true">{{translations[\'Enter date in format\']}} {{format}}</span>' +
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
      scope.g_accessibility = spAriaUtil.isAccessibilityEnabled();
      var includeTime = scope.snIncludeTime;
      var format;
      format = includeTime ? dateTimeFormat.trim() : dateFormat.trim();
      format = format.replace(/y/g, 'Y').replace(/d/g, 'D').replace(/a/g, 'A');
      scope.format = format;
      var dp = element.find('.input-group-btn').datetimepicker({
        keepInvalid: true,
        pickTime: scope.snIncludeTime === true,
        format: scope.format,
        locale: g_lang,
        language: g_lang
      }).on('dp.change', onDpChange);
      element.find('.form-control').on('blur', function() {
        scope.field.value = '';
      }).on('keyup', function(e) {
        if (e.keyCode === 13) {
          var value = e.target.value;
          setFieldValue('newValue', '');
          setFieldValue('newValue', value);
        }
      });

      function validate(formattedDate) {
        scope.field.isInvalidDateFormat = false;
        return spDatePickerUtil.validate(dp, format, formattedDate, function(error) {
          if (error) {
            spAriaUtil.sendLiveMessage(scope.translations["Entered date not valid. Enter date in format"] + " " + format);
            scope.field.isInvalidDateFormat = true;
          }
        });
      }

      function closeOnTouch(evt) {
        if (!jQuery.contains(dp.data('DateTimePicker').widget[0], evt.target)) {
          dp.data('DateTimePicker').hide();
        }
      }

      function bindTouchClose() {
        $document.on('touchstart', closeOnTouch);
      }

      function unBindTouchClose() {
        $document.off('touchstart', closeOnTouch);
      }
      dp.on('dp.show', bindTouchClose).on('dp.hide', unBindTouchClose);
      dp.on('dp.hide', function(e) {
        if (ngModel) {
          setFieldValue('newValue', scope.field.stagedValue);
        }
      })

      function onDpChange(e) {
        var translatedDate = enableDateTranslation ? e.date.format(format) : e.date.locale("en").format(format);
        scope.formattedDate(translatedDate);
        if (!scope.$root.$$phase)
          scope.$apply();
      }

      function setFieldValue(key, value) {
        if (scope.snChange) {
          var change = {};
          change[key] = value;
          scope.snChange(change);
        }
      }
      if (ngModel) {
        ngModel.$parsers.push(validate);
        ngModel.$render = function() {
          validate(ngModel.$viewValue);
        };
        scope.formattedDate = function(formattedValue) {
          if (angular.isDefined(formattedValue)) {
            ngModel.$setViewValue(formattedValue);
            setFieldValue('stagedValue', formattedValue);
          }
          return ngModel.$viewValue;
        };
      } else {
        scope.formattedDate = function(formattedValue) {
          if (angular.isDefined(formattedValue)) {
            scope.field.value = validate(formattedValue);
            setFieldValue('newValue', formattedValue);
          }
          return scope.field.value;
        };
        scope.$watch('field.value', function(newValue, oldValue) {
          if (newValue != oldValue)
            validate(newValue);
        });
      }
      var select2Unsubscribe = select2EventBroker.subscribeSelect2Opening(function() {
        dp.data('DateTimePicker').hide();
      })
      scope.$on('$destroy', function() {
        dp.off('dp.change', onDpChange);
        unBindTouchClose();
        select2Unsubscribe();
      });
      scope.translations = [];
      i18n.getMessages(["Enter date in format", "Use format", "Entered date not valid. Enter date in format"], function(msgs) {
        scope.translations = msgs;
      });
    }
  }
});;