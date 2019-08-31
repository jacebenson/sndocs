/*! RESOURCE: /scripts/app.$sp/factory.spDatePickerUtil.js */
angular.module('sn.$sp').factory('spDatePickerUtil', function(spAriaUtil, $window) {
    var service = {
      isValidDate: isValidDate,
      validate: validate
    };
    var enableDateTranslation = $window.NOW.sp.enableDateTranslation;

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
          formattedDate = formattedDate = moment(formattedDate, format).locale("en").format(format);
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
    if (typeof moment !== "undefined" && typeof moment.tz !== "undefined")
      moment.tz.setDefault(g_tz);
  });;