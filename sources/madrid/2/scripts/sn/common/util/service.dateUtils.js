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
            var browserOffset = date.getTimezoneOffset() * 60000;
            var utcTime = date.getTime() - browserOffset;
            var userDateTime = utcTime - g_tz_offset;
            ga.addParam("sysparm_value", userDateTime);
            ga.getXMLWait();
            return ga.getAnswer();
          },
          formatDate: function(date, format) {
            if (format.indexOf("z") > 0)
              return this.formatDateServer(date, format);
            format = format + "";
            var result = "";
            var i_format = 0;
            var c = "";
            var token = "";
            var y = date.getYear() + "";
            var M = date.getMonth() + 1;
            var d = date.getDate();
            var E = date.getDay();
            var H = date.getHours();
            var m = date.getMinutes();
            var s = date.getSeconds();
            var yyyy, yy, MMM, MM, dd, hh, h, mm, ss, ampm, HH, H, KK, K, kk, k;
            var value = new Object();
            value["M"] = M;
            value["MM"] = this.LZ(M);
            value["MMM"] = this.MONTH_NAMES[M + 11];
            value["NNN"] = this.MONTH_NAMES[M + 11];
            value["MMMM"] = this.MONTH_NAMES[M - 1];
            value["d"] = d;
            value["dd"] = this.LZ(d);
            value["E"] = this.DAY_NAMES[E + 7];
            value["EE"] = this.DAY_NAMES[E];
            value["H"] = H;
            value["HH"] = this.LZ(H);
            if (format.indexOf('w') != -1) {
              var wk = date.getWeek();
              if (wk >= 52 && M == 1) {
                y = date.getYear();
                y--;
                y = y + "";
              }
              if (wk == 1 && M == 12) {
                y = date.getYear();
                y++;
                y = y + "";
              }
              value["w"] = wk;
              value["ww"] = this.LZ(wk);
            }
            var dayOfWeek = (7 + (E + 1) - (g_first_day_of_week - 1)) % 7;
            if (dayOfWeek == 0)
              dayOfWeek = 7;
            value["D"] = dayOfWeek;
            if (y.length < 4) {
              y = "" + (y - 0 + 1900);
            }
            value["y"] = "" + y;
            value["yyyy"] = y;
            value["yy"] = y.substring(2, 4);
            if (H == 0) {
              value["h"] = 12;
            } else if (H > 12) {
              value["h"] = H - 12;
            } else {
              value["h"] = H;
            }
            value["hh"] = this.LZ(value["h"]);
            if (H > 11) {
              value["K"] = H - 12;
            } else {
              value["K"] = H;
            }
            value["k"] = H + 1;
            value["KK"] = this.LZ(value["K"]);
            value["kk"] = this.LZ(value["k"]);
            if (H > 11) {
              value["a"] = "PM";
            } else {
              value["a"] = "AM";
            }
            value["m"] = m;
            value["mm"] = this.LZ(m);
            value["s"] = s;
            value["ss"] = this.LZ(s);
            while (i_format < format.length) {
              c = format.charAt(i_format);
              token = "";
              while ((format.charAt(i_format) == c) && (i_format < format.length)) {
                token += format.charAt(i_format++);
              }
              if (value[token] != null) {
                result = result + value[token];
              } else {
                result = result + token;
              }
            }
            return result;
          },
          _isInteger: function(val) {
            var digits = "1234567890";
            for (var i = 0; i < val.length; i++) {
              if (digits.indexOf(val.charAt(i)) == -1) {
                return false;
              }
            }
            return true;
          },
          _getInt: function(str, i, minlength, maxlength) {
            for (var x = maxlength; x >= minlength; x--) {
              var token = str.substring(i, i + x);
              if (token.length < minlength) {
                return null;
              }
              if (this._isInteger(token)) {
                return token;
              }
            }
            return null;
          },
          getDateFromFormat: function(val, format) {
              val = val + "";
              format = format + "";
              var i_val = 0;
              var i_format = 0;
              var c = "";
              var token = "";
              var token2 = "";
              var x, y;
              var now = new Date();
              var year = now.getYear();
              var month = now.getMonth() + 1;
              var date = 0;
              var hh = now.getHours();
              var mm = now.getMinutes();
              var ss = now.getSeconds();
              var ampm = "";
              var week = false;
              while (i_format < format.length) {
                c = format.charAt(i_format);
                token = "";
                while ((format.charAt(i_format) == c) && (i_format < format.length)) {
                  token += format.charAt(i_format++);
                }
                if (token == "yyyy" || token == "yy" || token == "y") {
                  if (token == "yyyy") {
                    x = 4;
                    y = 4;
                  }
                  if (token == "yy") {
                    x = 2;
                    y = 2;
                  }
                  if (token == "y") {
                    x = 2;
                    y = 4;
                  }
                  year = this._getInt(val, i_val, x, y);
                  if (year == null) {
                    return 0;
                  }
                  i_val += year.length;
                  if (year.length == 2) {
                    if (year > 70) {
                      year = 1900 + (year - 0);
                    } else {
                      year = 2000 + (year - 0);
                    }
                  }
                } else if (token == "MMM" || token == "NNN") {
                  month = 0;
                  for (var i = 0; i < this.MONTH_NAMES.length; i++) {
                    var month_name = this.MONTH_NAMES[i];
                    if (val.substring(i_val, i_val + month_name.length).toLowerCase() == month_name.toLowerCase()) {
                      if (token == "MMM" || (token == "NNN" && i > 11)) {
                        month = i + 1;
                        if (month > 12) {
                          month -= 12;
                        }
                        i_val += month_name.length;
                        break;
                      }
                    }
                  }
                  if ((month < 1) || (month > 12)) {
                    return 0;
                  }
                } else if (token == "EE" || token == "E") {
                  for (var i = 0; i < this.DAY_NAMES.length; i++) {
                    var day_name = this.DAY_NAMES[i];
                    if (val.substring(i_val, i_val + day_name.length).toLowerCase() == day_name.toLowerCase()) {
                      if (week) {
                        if (i == 0 || i == 7)
                          date += 6;
                        else if (i == 2 || i == 9)
                          date += 1;
                        else if (i == 3 || i == 10)
                          date += 2;
                        else if (i == 4 || i == 11)
                          date += 3;
                        else if (i == 5 || i == 12)
                          date += 4;
                        else if (i == 6 || i == 13)
                          date += 5;
                      }
                      i_val += day_name.length;
                      break;
                    }
                  }
                } else if (token == "MM" || token == "M") {
                  month = this._getInt(val, i_val, token.length, 2);
                  if (month == null || (month < 1) || (month > 12)) {
                    return 0;
                  }
                  i_val += month.length;
                } else if (token == "dd" || token == "d") {
                  date = this._getInt(val, i_val, token.length, 2);
                  if (date == null || (date < 1) || (date > 31)) {
                    return 0;
                  }
                  i_val += date.length;
                } else if (token == "hh" || token == "h") {
                  hh = this._getInt(val, i_val, token.length, 2);
                  if (hh == null || (hh < 1) || (hh > 12)) {
                    return 0;
                  }
                  i_val += hh.length;
                } else if (token == "HH" || token == "H") {
                  hh = this._getInt(val, i_val, token.length, 2);
                  if (hh == null || (hh < 0) || (hh > 23)) {
                    return 0;
                  }
                  i_val += hh.length;
                } else if (token == "KK" || token == "K") {
                  hh = this._getInt(val, i_val, token.length, 2);
                  if (hh == null || (hh < 0) || (hh > 11)) {
                    return 0;
                  }
                  i_val += hh.length;
                } else if (token == "kk" || token == "k") {
                  hh = this._getInt(val, i_val, token.length, 2);
                  if (hh == null || (hh < 1) || (hh > 24)) {
                    return 0;
                  }
                  i_val += hh.length;
                  hh--;
                } else if (token == "mm" || token == "m") {
                  mm = this._getInt(val, i_val, token.length, 2);
                  if (mm == null || (mm < 0) || (mm > 59)) {
                    return