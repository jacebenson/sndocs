/*! RESOURCE: /scripts/sn/common/util/js_includes_util.js */
/*! RESOURCE: /scripts/thirdparty/autosizer/autosizer.min.js */
/*!
 Autosize 4.0.0
 license: MIT
 http://www.jacklmoore.com/autosize
 */
! function(e, t) {
  if ("function" == typeof define && define.amd) define(["exports", "module"], t);
  else if ("undefined" != typeof exports && "undefined" != typeof module) t(exports, module);
  else {
    var n = {
      exports: {}
    };
    t(n.exports, n), e.autosize = n.exports
  }
}(this, function(e, t) {
  "use strict";

  function n(e) {
    function t() {
      var t = window.getComputedStyle(e, null);
      "vertical" === t.resize ? e.style.resize = "none" : "both" === t.resize && (e.style.resize = "horizontal"), s = "content-box" === t.boxSizing ? -(parseFloat(t.paddingTop) + parseFloat(t.paddingBottom)) : parseFloat(t.borderTopWidth) + parseFloat(t.borderBottomWidth), isNaN(s) && (s = 0), l()
    }

    function n(t) {
      var n = e.style.width;
      e.style.width = "0px", e.offsetWidth, e.style.width = n, e.style.overflowY = t
    }

    function o(e) {
      for (var t = []; e && e.parentNode && e.parentNode instanceof Element;) e.parentNode.scrollTop && t.push({
        node: e.parentNode,
        scrollTop: e.parentNode.scrollTop
      }), e = e.parentNode;
      return t
    }

    function r() {
      var t = e.style.height,
        n = o(e),
        r = document.documentElement && document.documentElement.scrollTop;
      e.style.height = "";
      var i = e.scrollHeight + s;
      return 0 === e.scrollHeight ? void(e.style.height = t) : (e.style.height = i + "px", u = e.clientWidth, n.forEach(function(e) {
        e.node.scrollTop = e.scrollTop
      }), void(r && (document.documentElement.scrollTop = r)))
    }

    function l() {
      r();
      var t = Math.round(parseFloat(e.style.height)),
        o = window.getComputedStyle(e, null),
        i = "content-box" === o.boxSizing ? Math.round(parseFloat(o.height)) : e.offsetHeight;
      if (i !== t ? "hidden" === o.overflowY && (n("scroll"), r(), i = "content-box" === o.boxSizing ? Math.round(parseFloat(window.getComputedStyle(e, null).height)) : e.offsetHeight) : "hidden" !== o.overflowY && (n("hidden"), r(), i = "content-box" === o.boxSizing ? Math.round(parseFloat(window.getComputedStyle(e, null).height)) : e.offsetHeight), a !== i) {
        a = i;
        var l = d("autosize:resized");
        try {
          e.dispatchEvent(l)
        } catch (e) {}
      }
    }
    if (e && e.nodeName && "TEXTAREA" === e.nodeName && !i.has(e)) {
      var s = null,
        u = e.clientWidth,
        a = null,
        c = function() {
          e.clientWidth !== u && l()
        },
        p = function(t) {
          window.removeEventListener("resize", c, !1), e.removeEventListener("input", l, !1), e.removeEventListener("keyup", l, !1), e.removeEventListener("autosize:destroy", p, !1), e.removeEventListener("autosize:update", l, !1), Object.keys(t).forEach(function(n) {
            e.style[n] = t[n]
          }), i.delete(e)
        }.bind(e, {
          height: e.style.height,
          resize: e.style.resize,
          overflowY: e.style.overflowY,
          overflowX: e.style.overflowX,
          wordWrap: e.style.wordWrap
        });
      e.addEventListener("autosize:destroy", p, !1), "onpropertychange" in e && "oninput" in e && e.addEventListener("keyup", l, !1), window.addEventListener("resize", c, !1), e.addEventListener("input", l, !1), e.addEventListener("autosize:update", l, !1), e.style.overflowX = "hidden", e.style.wordWrap = "break-word", i.set(e, {
        destroy: p,
        update: l
      }), t()
    }
  }

  function o(e) {
    var t = i.get(e);
    t && t.destroy()
  }

  function r(e) {
    var t = i.get(e);
    t && t.update()
  }
  var i = "function" == typeof Map ? new Map : function() {
      var e = [],
        t = [];
      return {
        has: function(t) {
          return e.indexOf(t) > -1
        },
        get: function(n) {
          return t[e.indexOf(n)]
        },
        set: function(n, o) {
          e.indexOf(n) === -1 && (e.push(n), t.push(o))
        },
        delete: function(n) {
          var o = e.indexOf(n);
          o > -1 && (e.splice(o, 1), t.splice(o, 1))
        }
      }
    }(),
    d = function(e) {
      return new Event(e, {
        bubbles: !0
      })
    };
  try {
    new Event("test")
  } catch (e) {
    d = function(e) {
      var t = document.createEvent("Event");
      return t.initEvent(e, !0, !1), t
    }
  }
  var l = null;
  "undefined" == typeof window || "function" != typeof window.getComputedStyle ? (l = function(e) {
    return e
  }, l.destroy = function(e) {
    return e
  }, l.update = function(e) {
    return e
  }) : (l = function(e, t) {
    return e && Array.prototype.forEach.call(e.length ? e : [e], function(e) {
      return n(e, t)
    }), e
  }, l.destroy = function(e) {
    return e && Array.prototype.forEach.call(e.length ? e : [e], o), e
  }, l.update = function(e) {
    return e && Array.prototype.forEach.call(e.length ? e : [e], r), e
  }), t.exports = l
});
/*! RESOURCE: /scripts/sn/common/util/_module.js */
angular.module('sn.common.util', ['sn.common.auth']);
angular.module('sn.util', ['sn.common.util']);;
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
            return 0;
          }
          i_val += mm.length;
        } else if (token == "ss" || token == "s") {
          ss = this._getInt(val, i_val, token.length, 2);
          if (ss == null || (ss < 0) || (ss > 59)) {
            return 0;
          }
          i_val += ss.length;
        } else if (token == "a") {
          if (val.substring(i_val, i_val + 2).toLowerCase() == "am") {
            ampm = "AM";
          } else if (val.substring(i_val, i_val + 2).toLowerCase() == "pm") {
            ampm = "PM";
          } else {
            return 0;
          }
          i_val += 2;
        } else if (token == "w" || token == "ww") {
          var weekNum = this._getInt(val, i_val, token.length, 2);
          week = true;
          if (weekNum != null) {
            var temp = new Date(year, 0, 1, 0, 0, 0);
            temp.setWeek(parseInt(weekNum, 10));
            year = temp.getFullYear();
            month = temp.getMonth() + 1;
            date = temp.getDate();
          }
          weekNum += "";
          i_val += weekNum.length;
        } else if (token == "D") {
          if (week) {
            var day = this._getInt(val, i_val, token.length, 1);
            if ((day == null) || (day <= 0) || (day > 7))
              return 0;
            var temp = new Date(year, month - 1, date, hh, mm, ss);
            var dayOfWeek = temp.getDay();
            day = parseInt(day, 10);
            day = (day + g_first_day_of_week - 1) % 7;
            if (day == 0)
              day = 7;
            day--;
            if (day < dayOfWeek)
              day = 7 - (dayOfWeek - day);
            else
              day -= dayOfWeek;
            if (day > 0) {
              temp.setDate(temp.getDate() + day);
              year = temp.getFullYear();
              month = temp.getMonth() + 1;
              date = temp.getDate();
            }
            i_val++;
          }
        } else if (token == "z")
          i_val += 3;
        else {
          if (val.substring(i_val, i_val + token.length) != token) {
            return 0;
          } else {
            i_val += token.length;
          }
        }
      }
      if (i_val != val.length) {
        return 0;
      }
      if (month == 2) {
        if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) {
          if (date > 29) {
            return 0;
          }
        } else {
          if (date > 28) {
            return 0;
          }
        }
      }
      if ((month == 4) || (month == 6) || (month == 9) || (month == 11)) {
        if (date > 30) {
          return 0;
        }
      }
      if (hh < 12 && ampm == "PM") {
        hh = hh - 0 + 12;
      } else if (hh > 11 && ampm == "AM") {
        hh -= 12;
      }
      var newdate = new Date(year, month - 1, date, hh, mm, ss);
      return newdate.getTime();
    },
    parseDate: function(val) {
      var preferEuro = (arguments.length == 2) ? arguments[1] : false;
      generalFormats = new Array('y-M-d', 'MMM d, y', 'MMM d,y', 'y-MMM-d', 'd-MMM-y', 'MMM d');
      monthFirst = new Array('M/d/y', 'M-d-y', 'M.d.y', 'MMM-d', 'M/d', 'M-d');
      dateFirst = new Array('d/M/y', 'd-M-y', 'd.M.y', 'd-MMM', 'd/M', 'd-M');
      yearFirst = new Array('yyyyw.F', 'yyw.F');
      var checkList = new Array('generalFormats', preferEuro ? 'dateFirst' : 'monthFirst', preferEuro ? 'monthFirst' : 'dateFirst', 'yearFirst');
      var d = null;
      for (var i = 0; i < checkList.length; i++) {
        var l = window[checkList[i]];
        for (var j = 0; j < l.length; j++) {
          d = this.getDateFromFormat(val, l[j]);
          if (d != 0) {
            return new Date(d);
          }
        }
      }
      return null;
    }
  };
  Date.prototype.getWeek = function() {
    var newYear = new Date(this.getFullYear(), 0, 1);
    var day = newYear.getDay() - (g_first_day_of_week - 1);
    day = (day >= 0 ? day : day + 7);
    var dayNum = Math.floor((this.getTime() - newYear.getTime() - (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
    var weekNum;
    if (day < 4) {
      weekNum = Math.floor((dayNum + day - 1) / 7) + 1;
      if (weekNum > 52)
        weekNum = this._checkNextYear(weekNum);
      return weekNum;
    }
    weekNum = Math.floor((dayNum + day - 1) / 7);
    if (weekNum < 1)
      weekNum = this._lastWeekOfYear();
    else if (weekNum > 52)
      weekNum = this._checkNextYear(weekNum);
    return weekNum;
  };
  Date.prototype._lastWeekOfYear = function() {
    var newYear = new Date(this.getFullYear() - 1, 0, 1);
    var endOfYear = new Date(this.getFullYear() - 1, 11, 31);
    var day = newYear.getDay() - (g_first_day_of_week - 1);
    var dayNum = Math.floor((endOfYear.getTime() - newYear.getTime() - (endOfYear.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
    return day < 4 ? Math.floor((dayNum + day - 1) / 7) + 1 : Math.floor((dayNum + day - 1) / 7);
  };
  Date.prototype._checkNextYear = function() {
    var nYear = new Date(this.getFullYear() + 1, 0, 1);
    var nDay = nYear.getDay() - (g_first_day_of_week - 1);
    nDay = nDay >= 0 ? nDay : nDay + 7;
    return nDay < 4 ? 1 : 53;
  };
  Date.prototype.setWeek = function(weekNum) {
    weekNum--;
    var startOfYear = new Date(this.getFullYear(), 0, 1);
    var day = startOfYear.getDay() - (g_first_day_of_week - 1);
    if (day > 0 && day < 4) {
      this.setFullYear(startOfYear.getFullYear() - 1);
      this.setDate(31 - day + 1);
      this.setMonth(11);
    } else if (day > 3)
      this.setDate(startOfYear.getDate() + (7 - day));
    this.setDate(this.getDate() + (7 * weekNum));
  };
  return dateUtils;
});
/*! RESOURCE: /scripts/sn/common/util/service.debounceFn.js */
angular.module("sn.common.util").service("debounceFn", function() {
  "use strict";

  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this,
        args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
  return {
    debounce: debounce
  }
});;
/*! RESOURCE: /scripts/sn/common/util/factory.unwrappedHTTPPromise.js */
angular.module('sn.common.util').factory("unwrappedHTTPPromise", function($q) {
  "use strict";

  function isGenericPromise(promise) {
    return (typeof promise.then === "function" &&
      promise.success === undefined &&
      promise.error === undefined);
  }
  return function(httpPromise) {
    if (isGenericPromise(httpPromise))
      return httpPromise;
    var deferred = $q.defer();
    httpPromise.success(function(data) {
      deferred.resolve(data);
    }).error(function(data, status) {
      deferred.reject({
        data: data,
        status: status
      })
    });
    return deferred.promise;
  };
});;
/*! RESOURCE: /scripts/sn/common/util/service.urlTools.js */
angular.module('sn.common.util').constant('angularProcessorUrl', 'angular.do?sysparm_type=');
angular.module('sn.common.util').factory("urlTools", function(getTemplateUrl, angularProcessorUrl) {
  "use strict";

  function getPartialURL(name, parameters) {
    var url = getTemplateUrl(name);
    if (parameters) {
      if (typeof parameters !== 'string') {
        parameters = encodeURIParameters(parameters);
      }
      if (parameters.length) {
        url += "&" + parameters;
      }
    }
    if (window.NOW && window.NOW.ng_cache_defeat)
      url += "&t=" + new Date().getTime();
    return url;
  }

  function getURL(name, parameters) {
    if (parameters && typeof parameters === 'object')
      return urlFor(name, parameters);
    var url = angularProcessorUrl;
    url += name;
    if (parameters)
      url += "&" + parameters;
    return url;
  }

  function urlFor(route, parameters) {
    var p = encodeURIParameters(parameters);
    return angularProcessorUrl + route + (p.length ? '&' + p : '');
  }

  function getPropertyURL(name) {
    var url = angularProcessorUrl + "get_property&name=" + name;
    url += "&t=" + new Date().getTime();
    return url;
  }

  function encodeURIParameters(parameters) {
    var s = [];
    for (var parameter in parameters) {
      if (parameters.hasOwnProperty(parameter)) {
        var key = encodeURIComponent(parameter);
        var value = parameters[parameter] ? encodeURIComponent(parameters[parameter]) : '';
        s.push(key + "=" + value);
      }
    }
    return s.join('&');
  }

  function parseQueryString(qs) {
    qs = qs || '';
    if (qs.charAt(0) === '?') {
      qs = qs.substr(1);
    }
    var a = qs.split('&');
    if (a === "") {
      return {};
    }
    if (a && a[0].indexOf('http') != -1)
      a[0] = a[0].split("?")[1];
    var b = {};
    for (var i = 0; i < a.length; i++) {
      var p = a[i].split('=', 2);
      if (p.length == 1) {
        b[p[0]] = "";
      } else {
        b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
      }
    }
    return b;
  }
  return {
    getPartialURL: getPartialURL,
    getURL: getURL,
    urlFor: urlFor,
    getPropertyURL: getPropertyURL,
    encodeURIParameters: encodeURIParameters,
    parseQueryString: parseQueryString
  };
});;
/*! RESOURCE: /scripts/sn/common/util/service.getTemplateUrl.js */
angular.module('sn.common.util').provider('getTemplateUrl', function(angularProcessorUrl) {
  'use strict';
  var _handlerId = 0;
  var _handlers = {};
  this.registerHandler = function(handler) {
    var registeredId = _handlerId;
    _handlers[_handlerId] = handler;
    _handlerId++;
    return function() {
      delete _handlers[registeredId];
    };
  };
  this.$get = function() {
    return getTemplateUrl;
  };

  function getTemplateUrl(templatePath) {
    if (_handlerId > 0) {
      var path;
      var handled = false;
      angular.forEach(_handlers, function(handler) {
        if (!handled) {
          var handlerPath = handler(templatePath);
          if (typeof handlerPath !== 'undefined') {
            path = handlerPath;
            handled = true;
          }
        }
      });
      if (handled) {
        return path;
      }
    }
    return angularProcessorUrl + 'get_partial&name=' + templatePath;
  }
});;
/*! RESOURCE: /scripts/sn/common/util/service.snTabActivity.js */
angular.module("sn.common.util").service("snTabActivity", function($window, $timeout, $rootElement, $document) {
      "use strict";
      var activeEvents = ["keydown", "DOMMouseScroll", "mousewheel", "mousedown", "touchstart", "mousemove", "mouseenter", "input", "focus", "scroll"],
        defaultIdle = 75000,
        isPrimary = true,
        idleTime = 0,
        isVisible = true,
        idleTimeout = void(0),
        pageIdleTimeout = void(0),
        hasActed = false,
        appName = $rootElement.attr('ng-app') || "",
        storageKey = "sn.tabs." + appName + ".activeTab";
      var callbacks = {
        "tab.primary": [],
        "tab.secondary": [],
        "activity.active": [],
        "activity.idle": [{
          delay: defaultIdle,
          cb: function() {}
        }]
      };
      $window.tabGUID = $window.tabGUID || createGUID();

      function getActiveEvents() {
        return activeEvents.join(".snTabActivity ") + ".snTabActivity";
      }

      function setAppName(an) {
        appName = an;
        storageKey = "sn.tabs." + appName + ".activeTab";
        makePrimary(true);
      }

      function createGUID(l) {
        l = l || 32;
        var strResult = '';
        while (strResult.length < l)
          strResult += (((1 + Math.random() + new Date().getTime()) * 0x10000) | 0).toString(16).substring(1);
        return strResult.substr(0, l);
      }

      function ngObjectIndexOf(arr, obj) {
        for (var i = 0, len = arr.length; i < len; i++)
          if (angular.equals(arr[i], obj))
            return i;
        return -1;
      }
      var detectedApi,
        apis = [{
          eventName: 'visibilitychange',
          propertyName: 'hidden'
        }, {
          eventName: 'mozvisibilitychange',
          propertyName: 'mozHidden'
        }, {
          eventName: 'msvisibilitychange',
          propertyName: 'msHidden'
        }, {
          eventName: 'webkitvisibilitychange',
          propertyName: 'webkitHidden'
        }];
      apis.some(function(api) {
        if (angular.isDefined($document[0][api.propertyName])) {
          detectedApi = api;
          return true;
        }
      });
      if (detectedApi)
        $document.on(detectedApi.eventName, function() {
          if (!$document[0][detectedApi.propertyName]) {
            makePrimary();
            isVisible = true;
          } else {
            if (!idleTimeout && !idleTime)
              waitForIdle(0);
            isVisible = false;
          }
        });
      angular.element($window).on({
        "mouseleave": function(e) {
          var destination = angular.isUndefined(e.toElement) ? e.relatedTarget : e.toElement;
          if (destination === null && $document[0].hasFocus()) {
            waitForIdle(0);
          }
        },
        "storage": function(e) {
          if (e.originalEvent.key !== storageKey)
            return;
          if ($window.localStorage.getItem(storageKey) !== $window.tabGUID)
            makeSecondary();
        }
      });

      function waitForIdle(index, delayOffset) {
        var callback = callbacks['activity.idle'][index];
        var numCallbacks = callbacks['activity.idle'].length;
        delayOffset = delayOffset || callback.delay;
        angular.e