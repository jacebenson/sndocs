/*! RESOURCE: /scripts/app.$sp/directive.spDatePicker.js */
angular.module('sn.$sp').directive('spDatePicker', function(spConf, $rootScope, $document, $window, spAriaUtil, i18n, spDatePickerUtil, select2EventBroker, spUtil) {
  var dateFormat = g_user_date_format || spConf.SYS_DATE_FORMAT;
  var dateTimeFormat = g_user_date_time_format || spConf.SYS_TIME_FORMAT;
  var keyMap = {
    ArrowLeft: {
      date: 'decrementDays',
      time: null
    },
    Left: {
      date: 'decrementDays',
      time: null
    },
    ArrowRight: {
      date: 'incrementDays',
      time: null
    },
    Right: {
      date: 'incrementDays',
      time: null
    },
    ArrowUp: {
      date: 'decrementWeeks',
      time: 'incrementMinutes'
    },
    Up: {
      date: 'decrementWeeks',
      time: 'incrementMinutes'
    },
    ArrowDown: {
      date: 'incrementWeeks',
      time: 'decrementMinutes'
    },
    Down: {
      date: 'incrementWeeks',
      time: 'decrementMinutes'
    },
    AltUp: 'toggleDateTimePicker',
    AltArrowUp: 'toggleDateTimePicker',
    AltDown: 'toggleDateTimePicker',
    AltArrowDown: 'toggleDateTimePicker',
    PageUp: {
      date: 'decrementMonths',
      time: 'incrementHours'
    },
    PageDown: {
      date: 'incrementMonths',
      time: 'decrementHours'
    },
    AltPageUp: {
      date: 'decrementYears',
      time: null
    },
    AltPageDown: {
      date: 'incrementYears',
      time: null
    },
    Home: {
      date: 'startOfCurrentMonth',
      time: null
    },
    End: {
      date: 'endOfCurrentMonth',
      time: null
    }
  };
  var TOGGLE_DATETIME_PICKER = "toggleDateTimePicker";
  var DECREMENT_MINUTES = "decrementMinutes";
  var isChrome = $window.navigator.userAgent.indexOf("Chrome") > -1;
  var isSafari = !isChrome && $window.navigator.userAgent.indexOf("Safari") > -1;
  var enableDateTranslation = $window.NOW.sp.enableDateTranslation;

  function onShowDatePicker(picker) {
    setArialabels(picker);
    setShowDatePickerFocus(picker, picker.date, "open");
  }

  function attachKeyboardEvent(picker) {
    picker.widget.on('keydown', $.proxy(onKeydownEvt, this, picker));
    picker.widget.on('keyup', $.proxy(onKeyupEvt, this, picker));
    picker.widget.on('click', '.datepicker .day div, .datepicker .day', $.proxy(onClickEvt, this, picker));
  }

  function detachKeyboardEvent(picker) {
    picker.widget.off('keydown');
    picker.widget.off('keyup');
    picker.widget.off('click', '.datepicker .day div, .datepicker .day');
  }

  function onKeyupEvt(picker, e) {
    e.stopPropagation();
    e.preventDefault();
  }

  function onDpToggle(picker, e, openMessage) {
    var toggleElement = setToggleElementArialabel(picker);
    if (openMessage) {
      setArialabel(toggleElement, openMessage + " " + toggleElement.getAttribute('aria-label'));
    }
    toggleElement.blur();
    setTimeout(function() {
      toggleElement.focus();
    }, 150);
  }

  function onClickEvt(picker, e) {
    if (picker.options.pickTime) {
      setTimeout(function() {
        setShowDatePickerFocus(picker, picker.date, "click");
      }, 200);
    } else
      hidePicker(picker);
  }

  function setArialabels(picker) {
    setMonthDayYearArialabel(picker);
    if (picker.options.pickTime) {
      setToggleElementArialabel(picker);
      setTimeArrowElementsArialabel(picker);
    }
  }

  function setMonthDayYearArialabel(picker) {
    if (isSafari) return;
    var dates = picker.widget.find('.datepicker .day'),
      currentDate = moment(picker.date);
    $(dates).each(function(index, date) {
      var clone = currentDate.clone(),
        div = $(date).find('div')[0];
      if ($(date).hasClass("old")) {
        clone.subtract("1", "month");
      } else if ($(date).hasClass("new")) {
        clone.add("1", "month");
      }
      clone.date(div.innerHTML);
      var dateText = spDatePickerUtil.formattedDate(picker, clone);
      div.setAttribute('aria-label', dateText);
    });
  }

  function setTimeArrowElementsArialabel(picker) {
    setTimeArrowElementArialabel(picker, 'incrementMinutes');
    setTimeArrowElementArialabel(picker, 'decrementMinutes');
    setTimeArrowElementArialabel(picker, 'incrementHours');
    setTimeArrowElementArialabel(picker, 'decrementHours');
  }

  function setTimeArrowElementArialabel(picker, action) {
    var arrowElement = picker.widget.find('.timepicker [data-action=' + action + ']');
    if (arrowElement.length > 0) {
      setArialabel(arrowElement[0], action)
    }
  }

  function setHideDatePickerFocus(picker) {
    var calendarButtonElement = picker.element.find('button');
    var closeMessage = (picker.options.pickTime ? i18n.getMessage('date time') : i18n.getMessage('date')) + " " + i18n.getMessage('picker is closed');
    if (calendarButtonElement.length > 0) {
      setArialabel(calendarButtonElement[0], closeMessage + ". " + i18n.getMessage('Show calendar'));
      calendarButtonElement[0].focus();
      setTimeout(function() {
        setArialabel(calendarButtonElement[0], i18n.getMessage('Show calendar'));
      }, 3000);
    }
  }

  function setHideDatePickerFocusPrev(picker) {
    var previousElement = picker.element.prev();
    if (previousElement.length > 0) {
      previousElement[0].focus();
    }
  }

  function setToggleElementArialabel(picker) {
    var showType = spDatePickerUtil.datePickerShowType(picker),
      toggleElement = picker.widget.find('.accordion-toggle a');
    setArialabel(toggleElement[0], showTypeMessage(picker) + i18n.getMessage("Toggle date time picker"));
    return toggleElement[0];
  }

  function showTypeMessage(picker) {
    var showType = spDatePickerUtil.datePickerShowType(picker);
    return i18n.getMessage('showing') + " " + i18n.getMessage(showType) + " " + i18n.getMessage('picker') + ". ";
  }

  function setShowDatePickerFocus(picker, date, action) {
    var showType = spDatePickerUtil.datePickerShowType(picker),
      formattedDate = spDatePickerUtil.formattedDate(picker, date),
      openMessage = getOpenMessage(picker);
    if (!action || action.indexOf("toggleDateTimePicker") !== -1) {
      return;
    }
    if (showType === "date") {
      var dayElement = picker.widget.find('.datepicker-days td.active div');
      if (dayElement.length > 0) {
        var label = formattedDate;
        if (action === "open") {
          label = openMessage + (picker.options.pickTime ? showTypeMessage(picker) : "") + label;
          setArialabel(dayElement[0], label);
        } else {
          if (!isSafari) {
            setArialabel(dayElement[0], label);
          }
        }
        dayElement[0].blur();
        setTimeout(function() {
          dayElement[0].focus();
        }, 50);
      }
    }
    if (showType === "time") {
      if (action === "open") {
        onDpToggle(picker, null, openMessage);
      } else if (action === "togglePeriod") {
        var togglePeriodElement = picker.widget.find('.timepicker [data-action=' + action + ']');
        setArialabel(togglePeriodElement[0], action + " " + togglePeriodElement[0].innerText);
        togglePeriodElement[0].blur();
        setTimeout(function() {
          togglePeriodElement[0].focus();
        }, 100);
      } else {
        var arrowElement = picker.widget.find('.timepicker [data-action=' + action + ']');
        setArialabel(arrowElement[0], action + " " + (isSafari ? "" : formattedDate));
        arrowElement[0].blur();
        setTimeout(function() {
          arrowElement[0].focus();
        }, 100);
      }
    }
  }

  function getOpenMessage(picker) {
    return (picker.options.pickTime ? i18n.getMessage('date time') : i18n.getMessage('date')) + " " + i18n.getMessage('picker is opened') + ". ";
  }

  function setArialabel(element, label) {
    if (element) {
      element.setAttribute('aria-label', label);
    }
  }

  function onDpAction(e) {
    setShowDatePickerFocus(e.picker, e.date, e.action)
  }

  function onDpChangeAria(e, picker, element) {
    if (isSafari) {
      var el = element.find('.form-control');
      el[0].setAttribute('aria-label', spDatePickerUtil.formattedDayTime(picker, e.date));
    }
    if (e.date.month() !== e.oldDate.month() || e.date.year() !== e.oldDate.year()) {
      setMonthDayYearArialabel(picker);
    }
  }

  function hidePicker(picker) {
    var input = spDatePickerUtil.getSPDateickerInput(picker);
    if (input && input.val() === '') {
      picker.setDate(enableDateTranslation ? moment().format(picker.format) : moment().locale("en").format(picker.format));
    }
    picker.hide();
    setHideDatePickerFocus(picker);
  }

  function setTimeArrowElementFocus(picker, action) {
    var arrowElement = picker.widget.find('.timepicker [data-action=' + action + ']');
    if (arrowElement[0])
      arrowElement[0].focus();
  }

  function onKeydownEvt(picker, e) {
    var showType = spDatePickerUtil.datePickerShowType(picker);
    if (e.keyCode === 9) {
      if (picker.options.pickTime) {
        if (showType === "date") {
          if (e.shiftKey) {
            e.stopPropagation();
            e.preventDefault();
            if ($(e.target).parent().hasClass('accordion-toggle')) {
              setShowDatePickerFocus(picker, picker.date, "tab");
            } else if ($(e.target).parent().hasClass('day')) {
              picker.widget.find('[data-action=' + TOGGLE_DATETIME_PICKER + ']').focus();
            }
          } else if ($(e.target).attr("data-action") === TOGGLE_DATETIME_PICKER) {
            e.stopPropagation();
            e.preventDefault();
            picker.widget.find('.datepicker-days td.active div').focus();
          } else if ($(e.target).parent().hasClass('accordion-toggle')) {
            hidePicker(picker);
          }
        }
        if (showType === "time") {
          if (e.shiftKey) {
            e.stopPropagation();
            e.preventDefault();
            if ($(e.target).parent().hasClass('accordion-toggle')) {
              setTimeArrowElementFocus(picker, DECREMENT_MINUTES);
            } else if ($(e.target).attr("data-action") === "incrementHours") {
              var toggleElement = picker.widget.find('.accordion-toggle a');
              toggleElement[0].focus();
            } else if ($(e.target).attr("data-action") === "incrementMinutes") {
              setTimeArrowElementFocus(picker, 'incrementHours');
            } else if ($(e.target).attr("data-action") === "decrementHours") {
              setTimeArrowElementFocus(picker, 'incrementMinutes');
            } else if ($(e.target).attr("data-action") === "decrementMinutes") {
              setTimeArrowElementFocus(picker, 'decrementHours');
            }
          } else {
            if ($(e.target).attr("data-action") === DECREMENT_MINUTES) {
              e.stopPropagation();
              e.preventDefault();
              picker.widget.find("[data-action=" + TOGGLE_DATETIME_PICKER + "]").focus();
            } else {
              e.stopPropagation();
              e.preventDefault();
              if ($(e.target).parent().hasClass('accordion-toggle')) {
                setTimeArrowElementFocus(picker, 'incrementHours');
              } else if ($(e.target).attr("data-action") === "incrementHours") {
                setTimeArrowElementFocus(picker, 'incrementMinutes');
              } else if ($(e.target).attr("data-action") === "togglePeriod") {
                setTimeArrowElementFocus(picker, 'decrementHours');
              } else if ($(e.target).attr("data-action") === "decrementHours") {
                setTimeArrowElementFocus(picker, 'decrementMinutes');
              } else if ($(e.target).attr("data-action") === "incrementMinutes") {
                setTimeArrowElementFocus(picker, 'decrementHours');
              }
            }
          }
        }
      } else {
        hidePicker(picker);
      }
      return;
    }
    if (e.keyCode === 13 && $(e.target).attr("data-action")) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    if (e.keyCode === 32) {
      setTimeout(function() {
        hidePicker(picker);
      }, 200);
    } else if (e.keyCode === 27 || e.keyCode === 13) {
      hidePicker(picker);
    } else {
      var maybeAltHandler = e.altKey && keyMap["Alt" + e.key],
        action = maybeAltHandler || keyMap[e.key];
      if (action && action instanceof Object) {
        action = action[showType];
      }
      if (action) {
        if (showType === "time" && action.indexOf("toggle") === -1) {
          var arrowElement = picker.widget.find('.timepicker [data-action=' + action + ']');
          $(arrowElement[0]).trigger('click');
        } else {
          var actionEvent = jQuery.Event("doAction", {
            action: action
          });
          picker.widget.trigger(actionEvent);
        }
      }
    }
    if (maybeAltHandler && (e.keyCode === 38 || e.keyCode === 40)) {
      spAriaUtil.sendLiveMessage(i18n.getMessage('Switching to') + " " + spDatePickerUtil.datePickerShowType(picker) + " " + i18n.getMessage('picker'));
    }
  }
  if ($rootScope.user && $rootScope.user.date_format)
    dateFormat = $rootScope.user.date_format;
  if ($rootScope.user && $rootScope.user.date_time_format)
    dateTimeFormat = $rootScope.user.date_time_format;
  return {
    template: '<div ng-class="{\'input-group\': !snDisabled, \'has-error\': field.isInvalidDateFormat || field.isInvalid}" style="width: 100%;">' +
      '<input id="sp_formfield_{{::field.name}}" aria-live="{{::live}}" aria-label="{{::field.label}} {{formattedDateAria}}" type="text" name="{{field.name}}" class="form-control" placeholder="{{field.placeholder}}" title="{{g_accessibility ? translations[\'Date in format\'] + \' \': \'\'}}{{g_accessibility ? format : \'\'}}" tooltip-top="true" tooltip-enable="{{g_accessibility}}" ng-model="formattedDate" ng-model-options="{updateOn: \'blur\', getterSetter: true}" ng-readonly="snDisabled" />' +
      '<span class="input-group-btn" ng-hide="snDisabled">' +
      '<input type="hidden" class="datepickerinput" ng-model="formattedDate" ng-readonly="true" />' +
      '<button class="btn btn-default" type="button" role="button" aria-label="{{translations[\'Show calendar\']}}">' +
      '<glyph sn-char="calendar" />' +
      '</button>' +
      '</span>' +
      '<span ng-if="field.isInvalidDateFormat" class="sp-date-format-info" style="display:table-row;" aria-hidden="true">{{translations[\'Date in format\']}} {{format}}</span>' +
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
    controller: function($scope) {
      $scope.live = isSafari ? "polite" : "off";
    },
    link: function(scope, element, attrs, ngModel) {
      scope.g_accessibility = spAriaUtil.isAccessibilityEnabled();
      var includeTime = scope.snIncludeTime;
      var format, isUserEnteredValue = false,
        initDateTimePicker = true;
      var dpValueTouched;
      format = includeTime ? dateTimeFormat.trim() : dateFormat.trim();
      format = format.replace(/y/g, 'Y').replace(/d/g, 'D').replace(/a/g, 'A');
      scope.format = format;
      var config = {
        keepInvalid: true,
        pickTime: scope.snIncludeTime === true,
        format: scope.format,
        locale: spUtil.localeMap[g_lang],
        language: spUtil.localeMap[g_lang]
      };
      var dp = element.find('.input-group-btn').datetimepicker(config).on('dp.change', onDpChange);
      if (scope.snIncludeTime === true)
        $(element.find('.input-group-btn')).data("DateTimePicker").initial_value = scope.field.value;
      element.find('.form-control').on('blur', function(e) {
        var value = e.target.value;
        setFieldValue('newValue', '');
        setFieldValue('newValue', value);
      }).on('keyup', function(e) {
        if (e.keyCode === 13) {
          var value = e.target.value;
          setFieldValue('newValue', '');
          setFieldValue('newValue', value);
        } else {
          isUserEnteredValue = true;
        }
      });

      function validate(formattedDate) {
        scope.field.isInvalidDateFormat = false;
        scope.field.isInvalid = false;
        return spDatePickerUtil.validate(dp, format, formattedDate, isUserEnteredValue, function(error) {
          if (error) {
            spAriaUtil.sendLiveMessage(scope.translations["Entered date not valid. Enter date in format"] + " " + format);
            scope.field.isInvalidDateFormat = true;
            if (g_datepicker_validation_enable)
              scope.field.isInvalid = true;
          }
        });
      }

      function closeOnTouch(evt) {
        if (!jQuery.contains(dp.data('DateTimePicker').widget[0], evt.target)) {
          dp.data('DateTimePicker').hide();
        }
      }

      function bindTouchClose() {
        if (initDateTimePicker) {
          initDateTimePicker = false;
          attachKeyboardEvent(dp.data('DateTimePicker'));
        }
        $document.on('touchstart', closeOnTouch);
        attachOnscrollEvent();
        onShowDatePicker(dp.data('DateTimePicker'));
      }

      function unBindTouchClose() {
        $document.off('touchstart', closeOnTouch);
        detachOnscrollEvent();
      }

      function detachOnscrollEvent() {
        var scrollContainer = $('.sp-scroll');
        if (scrollContainer) {
          $(scrollContainer[0]).off("scroll")
        }
        var containers = $('.sp-row-content > div .panel .panel-body');
        if (containers) {
          for (var i = 0; i < containers.length; i++) {
            $(containers[i]).off("scroll")
          }
        }
      }

      function attachOnscrollEvent() {
        var lazyPlace = _.debounce(onscrollEvt, 100);
        var scrollContainer = $('.sp-scroll');
        if (scrollContainer) {
          $(scrollContainer[0]).scroll(lazyPlace.bind(null, scrollContainer[0]));
        }
        var containers = $('.sp-row-content > div .panel .panel-body');
        if (containers) {
          for (var i = 0; i < containers.length; i++) {
            $(containers[i]).scroll(lazyPlace.bind(null, containers[i]));
          }
        }
      }

      function onscrollEvt(container) {
        var picker = dp.data('DateTimePicker');
        if (isElementInViewport(picker.element, container)) {
          picker.place(container);
        } else {
          picker.hide();
        }
      }

      function isElementInViewport(el, scrollContainer) {
        if (typeof jQuery === "function" && el instanceof jQuery) {
          el = el[0];
        }
        var rect = el.getBoundingClientRect(),
          scrollContainerRect = scrollContainer.getBoundingClientRect();
        return (
          rect.top >= scrollContainerRect.top &&
          rect.left >= scrollContainerRect.left &&
          rect.bottom <= scrollContainerRect.bottom &&
          rect.right <= scrollContainerRect.right
        );
      }
      dp.on('dp.show', bindTouchClose).on('dp.hide', unBindTouchClose);
      dp.on('dp.action', function(e) {
        onDpAction(e);
      });
      dp.on('dp.toggle', function(e) {
        onDpToggle(dp.data('DateTimePicker'), e);
      });
      dp.on('dp.hide', function(e) {
        if (ngModel) {
          setFieldValue('newValue', scope.field.stagedValue);
        }
      })
      scope.$on('sp.spFormField.unFocus', function() {
        validate(scope.field.value);
      });

      function onDpChange(e) {
        isUserEnteredValue = false;
        var elem = $(e.target);
        if (elem.data("DateTimePicker").initial_value === "" && !dpValueTouched)
          reInitializeTime(e, elem);
        var translatedDate = enableDateTranslation ? e.date.format(format) : e.date.locale("en").format(format);
        scope.formattedDate(translatedDate);
        scope.formattedDateAria = spDatePickerUtil.formattedDate(dp.data('DateTimePicker'), e.date);
        if (!scope.$root.$$phase)
          scope.$apply();
        onDpChangeAria(e, dp.data('DateTimePicker'), element);
      }

      function reInitializeTime(e, elem) {
        var currDate = new Date();
        e.date.set({
          hour: currDate.getHours(),
          minute: currDate.getMinutes(),
          second: currDate.getSeconds()
        });
        elem.data("DateTimePicker").initial_value = null;
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
          var formattedDate = ngModel.$viewValue;
          if (formattedDate && formattedDate !== null && formattedDate !== '') {
            dpValueTouched = true;
            if (!spDatePickerUtil.isValidDate(formattedDate, format)) {
              var validFormattedDate = null;
              if (enableDateTranslation) {
                validFormattedDate = moment(formattedDate).format(format)
              } else {
                validFormattedDate = moment(formattedDate).locale("en").format(format);
              }
              if (validFormattedDate !== "Invalid date") {
                formattedDate = validFormattedDate;
              }
            }
          }
          validate(formattedDate);
        };
        scope.formattedDate = function(formattedValue) {
          if (angular.isDefined(formattedValue)) {
            dpValueTouched = true;
            ngModel.$setViewValue(formattedValue);
            setFieldValue('stagedValue', formattedValue);
          }
          var formattedDate = ngModel.$viewValue;
          if (formattedDate && formattedDate !== null && formattedDate !== '') {
            if (!spDatePickerUtil.isValidDate(formattedDate, format)) {
              var validFormattedDate = null;
              if (enableDateTranslation) {
                validFormattedDate = moment(formattedDate).format(format)
              } else {
                validFormattedDate = moment(formattedDate).locale("en").format(format);
              }
              if (validFormattedDate !== "Invalid date") {
                formattedDate = validFormattedDate;
              }
            }
          }
          return formattedDate;
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
        if ($(dp.data('DateTimePicker').widget[0]).is(":visible"))
          dp.data('DateTimePicker').hide();
      })
      scope.$on('$destroy', function() {
        dp.off('dp.change', onDpChange);
        unBindTouchClose();
        select2Unsubscribe();
        detachKeyboardEvent(dp.data('DateTimePicker'));
      });
      scope.translations = [];
      i18n.getMessages(["Date in format", "Use format", "Entered date not valid. Enter date in format", "Show calendar"], function(msgs) {
        scope.translations = msgs;
      });
    }
  }
});;