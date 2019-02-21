/*! RESOURCE: /scripts/app.$sp/factory.spDatePickerUtil.js */
angular.module('sn.$sp').factory('spDatePickerUtil', function(spAriaUtil, $window) {
    var enableDateTranslation = $window.NOW.sp.enableDateTranslation;
    var service = {
      isValidDate: isValidDate,
      validate: validate,
      getSPDateickerInput: getSPDateickerInput,
      formattedDate: formattedDate,
      formattedDayTime: formattedDayTime,
      datePickerActionType: datePickerActionType,
      datePickerShowType: datePickerShowType
    };

    function getSPDateickerInput(picker) {
      var input;
      if (picker.isInput) {
        return picker.element;
      }
      input = picker.element.find('.datepickerinput');
      if (input.size() === 0) {
        input = picker.element.find('input');
      } else if (!input.is('input')) {
        throw new Error('CSS class "datepickerinput" cannot be applied to non input element');
      }
      return input.parent().prev();
    }

    function formattedDate(picker, date) {
      var format = "DD MMMM YYYY",
        formattedDate = null,
        a = "",
        s = "";
      if (picker.options.pickTime) {
        if (picker.options.format.indexOf("h") !== -1) {
          a = " A";
        }
        if (picker.options.format.indexOf("s") !== -1) {
          s = ":ss";
        }
        format += (a ? " hh" : " HH") + ":mm" + s + a;
      }
      format += " dddd";
      if (enableDateTranslation) {
        formattedDate = moment(date).format(format);
      } else {
        formattedDate = moment(date).locale("en").format(format);
      }
      return formattedDate;
    }

    function formattedDayTime(picker, date) {
      var format = "",
        formattedDate = null,
        a = "";
      if (picker.options.pickTime) {
        if (picker.options.format.indexOf("h") !== -1) {
          a = "A";
        }
        format += a;
      }
      format += " dddd";
      if (enableDateTranslation) {
        formattedDate = moment(date).format(format);
      } else {
        formattedDate = moment(date).locale("en").format(format);
      }
      return formattedDate;
    }

    function datePickerActionType(action) {
      if (action.indexOf("Hours") !== -1) {
        return "hour";
      }
      return "minute";
    }

    function datePickerShowType(picker) {
      if (!picker.options.pickTime) {
        return "date";
      }
      if (!picker.options.pickDate) {
        return "time";
      }
      var $this = $(picker.widget.find('.accordion-toggle')[0]);
      return $this.find('.glyphicon-calendar').length !== 0 ? "time" : "date";
    }

    function isValidDate(value, format) {
      if (value === '')
        return true;
      if (!enableDateTranslation) {
        moment.locale("en");
      }
      return moment(value, format, true).isValid();
    }

    function validate(dp, format, formattedDate, cb) {
      if (formattedDate == null || formattedDate == '') {
        dp.data('DateTimePicker').setValue(new Date());
        return '';
      }
      if (service.isValidDate(formattedDate, format)) {
        if (enableDateTranslation) {
          formattedDate = moment(formattedDate, format).format(format);
        } else {
          formattedDate = moment(formattedDate, format).locale("en").format(format);
        }
        dp.data('DateTimePicker').setDate(moment(formattedDate, format));
        cb()
      } else if (service.isValidDate(formattedDate, moment.ISO_8601)) {
        var date = moment.utc(formattedDate).clone().local();
        dp.data('DateTimePicker').setDate(date);
        if (enableDateTranslation) {
          formattedDate = date.format(format);
        } else {
          formattedDate = date.locale("en").format(format);
        }
        cb()
      } else {
        cb(true);
      }
      return formattedDate;
    }
    return service;
  })
  .run(function() {
    if (typeof moment !== "undefined" && typeof moment.tz !== "undefined") {
      var startOfWeek = parseInt(g_date_picker_first_day_of_week);
      if (isNaN(startOfWeek) || startOfWeek < 1) {
        startOfWeek = 0;
      } else if (startOfWeek > 7) {
        startOfWeek = 6;
      } else {
        startOfWeek = startOfWeek - 1;
      }
      moment.tz.setDefault(g_tz);
      moment.locale(g_lang, {
        week: {
          dow: startOfWeek
        }
      });
    }
  });;