/*! RESOURCE: /scripts/sn/common/util/service.dateUtils.js */
angular.module('sn.common.util').factory('dateUtils', function() {
      var dateUtils = {
          SYS_DATE_FORMAT: "yyyy-MM-dd",
          SYS_TIME_FORMAT: "HH:mm:ss",
          SYS_DATE_TIME_FORMAT: "yyyy-MM-dd HH:mm:ss",
          MONTH_NAMES: new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'),
          DAY_NAMES: new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
          LZ: function(x) {
            return (x < 0 || x > 9 ? "" : "0") + x
          },
          isDate: function(val, format) {
            var date = this.getDateFromFormat(val, format);
            if (date == 0) {
              return false;
            }
            return true;
          },
          compareDates: function(date1, dateformat1, date2, dateformat2) {
            var d1 = this.getDateFromFormat(date1, dateformat1);
            var d2 = this.getDateFromFormat(date2, dateformat2);
            if (d1 == 0 || d2 == 0) {
              return -1;
            } else if (d1 > d2) {
              return 1;
            }
            return 0;
          },
          formatDateServer: function(date, format) {
              var ga = new GlideAjax("DateTimeUtils");
              ga.addParam("sysparm_name", "formatCalendarDate");
              var browserOffset = dat