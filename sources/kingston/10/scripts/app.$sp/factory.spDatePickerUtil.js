/*! RESOURCE: /scripts/app.$sp/factory.spDatePickerUtil.js */
angular.module('sn.$sp').factory('spDatePickerUtil', function(spAriaUtil) {
    var service = {
      isValidDate: isValidDate,
      validate: validate
    };

    function isValidDate(value, format) {
      if (value === '')
        return true;
      return moment(value, format).isValid();
    }

    function validate(dp, format, formattedDate, cb) {
      if (formattedDate == null || formattedDate == '') {
        dp.data('DateTimePicker').setValue(new Date());
        return '';
      }
      if (service.isValidDate(formattedDate, format)) {
        formattedDate = moment(formattedDate, format).format(format);
        dp.data('DateTimePicker').setDate(moment(formattedDate, format));
        cb()
      } else if (service.isValidDate(formattedDate, moment.ISO_8601)) {
        var date = moment.utc(formattedDate).clone().local();
        dp.data('DateTimePicker').setDate(date);
        formattedDate = date.format(format);
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