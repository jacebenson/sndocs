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
        angular.element($window).off(getActiveEvents());
        angular.element($window).one(getActiveEvents(), setActive);
        if (index >= numCallbacks)
            return;
        if (idleTimeout)
            $timeout.cancel(idleTimeout);
        idleTimeout = $timeout(function() {
            idleTime = callback.delay;
            callback.cb();
            $timeout.cancel(idleTimeout);
            idleTimeout = void(0);
            angular.element($window).off(getActiveEvents());
            angular.element($window).one(getActiveEvents(), setActive);
            for (var i = index + 1; i < numCallbacks; i++) {
                var nextDelay = callbacks['activity.idle'][i].delay;
                if (nextDelay <= callback.delay)
                    callbacks['activity.idle'][i].cb();
                else {
                    waitForIdle(i, nextDelay - callback.delay);
                    break;
                }
            }
        }, delayOffset, false);
    }

    function setActive() {
        angular.element($window).off(getActiveEvents());
        if (idleTimeout) {
            $timeout.cancel(idleTimeout);
            idleTimeout = void(0);
        }
        var activeCallbacks = callbacks['activity.active'];
        activeCallbacks.some(function(callback) {
            if (callback.delay <= idleTime)
                callback.cb();
            else
                return true;
        });
        idleTime = 0;
        makePrimary();
        if (pageIdleTimeout) {
            $timeout.cancel(pageIdleTimeout);
            pageIdleTimeout = void(0);
        }
        var minDelay = callbacks['activity.idle'][0].delay;
        hasActed = false;
        if (!pageIdleTimeout)
            pageIdleTimeout = $timeout(pageIdleHandler, minDelay, false);
        listenForActivity();
    }

    function pageIdleHandler() {
        if (idleTimeout)
            return;
        var minDelay = callbacks['activity.idle'][0].delay;
        if (hasActed) {
            hasActed = false;
            if (pageIdleTimeout)
                $timeout.cancel(pageIdleTimeout);
            pageIdleTimeout = $timeout(pageIdleHandler, minDelay, false);
            listenForActivity();
            return;
        }
        var delayOffset = minDelay;
        if (callbacks['activity.idle'].length > 1)
            delayOffset = callbacks['activity.idle'][1].delay - minDelay;
        idleTime = minDelay;
        callbacks['activity.idle'][0].cb();
        waitForIdle(1, delayOffset);
        pageIdleTimeout = void(0);
    }

    function listenForActivity() {
        angular.element($window).off(getActiveEvents());
        angular.element($window).one(getActiveEvents(), onActivity);
        angular.element("#gsft_main").on("load.snTabActivity", function() {
            var src = angular.element(this).attr('src');
            if (src.indexOf("/") == 0 || src.indexOf($window.location.origin) == 0 || src.indexOf('http') == -1) {
                var iframeWindow = this.contentWindow ? this.contentWindow : this.contentDocument.defaultView;
                angular.element(iframeWindow).off(getActiveEvents());
                angular.element(iframeWindow).one(getActiveEvents(), onActivity);
            }
        });
        angular.element('iframe').each(function(idx, iframe) {
            var src = angular.element(iframe).attr('src');
            if (!src)
                return;
            if (src.indexOf("/") == 0 || src.indexOf($window.location.origin) == 0 || src.indexOf('http') == -1) {
                var iframeWindow = iframe.contentWindow ? iframe.contentWindow : iframe.contentDocument.defaultView;
                angular.element(iframeWindow).off(getActiveEvents());
                angular.element(iframeWindow).one(getActiveEvents(), onActivity);
            }
        });
    }

    function onActivity() {
        hasActed = true;
        makePrimary();
    }

    function makePrimary(initial) {
        var oldGuid = $window.localStorage.getItem(storageKey);
        isPrimary = true;
        isVisible = true;
        $timeout.cancel(idleTimeout);
        idleTimeout = void(0);
        if (canUseStorage() && oldGuid !== $window.tabGUID && !initial)
            for (var i = 0, len = callbacks["tab.primary"].length; i < len; i++)
                callbacks["tab.primary"][i].cb();
        try {
            $window.localStorage.setItem(storageKey, $window.tabGUID);
        } catch (ignored) {}
        if (idleTime && $document[0].hasFocus())
            setActive();
    }

    function makeSecondary() {
        isPrimary = false;
        isVisible = false;
        for (var i = 0, len = callbacks["tab.secondary"].length; i < len; i++)
            callbacks["tab.secondary"][i].cb();
    }

    function registerCallback(event, callback, scope) {
        var cbObject = angular.isObject(callback) ? callback : {
            delay: defaultIdle,
            cb: callback
        };
        if (callbacks[event]) {
            callbacks[event].push(cbObject);
            callbacks[event].sort(function(a, b) {
                return a.delay - b.delay;
            })
        }

        function destroyCallback() {
            if (callbacks[event]) {
                var pos = ngObjectIndexOf(callbacks[event], cbObject);
                if (pos !== -1)
                    callbacks[event].splice(pos, 1);
            }
        }
        if (scope)
            scope.$on("$destroy", function() {
                destroyCallback();
            });
        return destroyCallback;
    }

    function registerIdleCallback(options, onIdle, onReturn, scope) {
        var delay = options,
            onIdleDestroy,
            onReturnDestroy;
        if (angular.isObject(options)) {
            delay = options.delay;
            onIdle = options.onIdle || onIdle;
            onReturn = options.onReturn || onReturn;
            scope = options.scope || scope;
        }
        if (angular.isFunction(onIdle))
            onIdleDestroy = registerCallback("activity.idle", {
                delay: delay,
                cb: onIdle
            });
        else if (angular.isFunction(onReturn)) {
            onIdleDestroy = registerCallback("activity.idle", {
                delay: delay,
                cb: function() {}
            });
        }
        if (angular.isFunction(onReturn))
            onReturnDestroy = registerCallback("activity.active", {
                delay: delay,
                cb: onReturn
            });

        function destroyAll() {
            if (angular.isFunction(onIdleDestroy))
                onIdleDestroy();
            if (angular.isFunction(onReturnDestroy))
                onReturnDestroy();
        }
        if (scope)
            scope.$on("$destroy", function() {
                destroyAll();
            });
        return destroyAll;
    }

    function canUseStorage() {
        var canWe = false;
        try {
            $window.localStorage.setItem(storageKey, $window.tabGUID);
            canWe = true;
        } catch (ignored) {}
        return canWe;
    }
    makePrimary(true);
    listenForActivity();
    pageIdleTimeout = $timeout(pageIdleHandler, defaultIdle, false);
    return {
        on: registerCallback,
        onIdle: registerIdleCallback,
        setAppName: setAppName,
        get isPrimary() {
            return isPrimary;
        },
        get isIdle() {
            return idleTime > 0;
        },
        get idleTime() {
            return idleTime;
        },
        get isVisible() {
            return isVisible;
        },
        get appName() {
            return appName;
        },
        get defaultIdleTime() {
            return defaultIdle
        },
        isActive: function() {
            return this.idleTime < this.defaultIdleTime && this.isVisible;
        }
    }
});;
/*! RESOURCE: /scripts/sn/common/util/factory.ArraySynchronizer.js */
angular.module("sn.common.util").factory("ArraySynchronizer", function() {
    'use strict';

    function ArraySynchronizer() {}

    function index(key, arr) {
        var result = {};
        var keys = [];
        result.orderedKeys = keys;
        angular.forEach(arr, function(item) {
            var keyValue = item[key];
            result[keyValue] = item;
            keys.push(keyValue);
        });
        return result;
    }

    function sortByKeyAndModel(arr, key, model) {
        arr.sort(function(a, b) {
            var aIndex = model.indexOf(a[key]);
            var bIndex = model.indexOf(b[key]);
            if (aIndex > bIndex)
                return 1;
            else if (aIndex < bIndex)
                return -1;
            return 0;
        });
    }
    ArraySynchronizer.prototype = {
        add: function(syncField, dest, source, end) {
            end = end || "bottom";
            var destIndex = index(syncField, dest);
            var sourceIndex = index(syncField, source);
            angular.forEach(sourceIndex.orderedKeys, function(key) {
                if (destIndex.orderedKeys.indexOf(key) === -1) {
                    if (end === "bottom") {
                        dest.push(sourceIndex[key]);
                    } else {
                        dest.unshift(sourceIndex[key]);
                    }
                }
            });
        },
        synchronize: function(syncField, dest, source, deepKeySyncArray) {
            var destIndex = index(syncField, dest);
            var sourceIndex = index(syncField, source);
            deepKeySyncArray = (typeof deepKeySyncArray === "undefined") ? [] : deepKeySyncArray;
            for (var i = destIndex.orderedKeys.length - 1; i >= 0; i--) {
                var key = destIndex.orderedKeys[i];
                if (sourceIndex.orderedKeys.indexOf(key) === -1) {
                    destIndex.orderedKeys.splice(i, 1);
                    dest.splice(i, 1);
                }
                if (deepKeySyncArray.length > 0) {
                    angular.forEach(deepKeySyncArray, function(deepKey) {
                        if (sourceIndex[key] && destIndex[key][deepKey] !== sourceIndex[key][deepKey]) {
                            destIndex[key][deepKey] = sourceIndex[key][deepKey];
                        }
                    });
                }
            }
            angular.forEach(sourceIndex.orderedKeys, function(key) {
                if (destIndex.orderedKeys.indexOf(key) === -1)
                    dest.push(sourceIndex[key]);
            });
            sortByKeyAndModel(dest, syncField, sourceIndex.orderedKeys);
        }
    };
    return ArraySynchronizer;
});;
/*! RESOURCE: /scripts/sn/common/util/directive.snBindOnce.js */
angular.module("sn.common.util").directive("snBindOnce", function($sanitize) {
    "use strict";
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            var value = scope.$eval(attrs.snBindOnce);
            var sanitizedValue = $sanitize(value);
            element.append(sanitizedValue);
        }
    }
});
/*! RESOURCE: /scripts/sn/common/util/directive.snCloak.js */
angular.module("sn.common.util").directive("snCloak", function() {
    "use strict";
    return {
        restrict: "A",
        compile: function(element, attr) {
            return function() {
                attr.$set('snCloak', undefined);
                element.removeClass('sn-cloak');
            }
        }
    };
});
/*! RESOURCE: /scripts/sn/common/util/service.md5.js */
angular.module('sn.common.util').factory('md5', function() {
    'use strict';
    var md5cycle = function(x, k) {
        var a = x[0],
            b = x[1],
            c = x[2],
            d = x[3];
        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);
        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);
        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);
        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);
        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
    };
    var cmn = function(q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    };
    var ff = function(a, b, c, d, x, s, t) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    };
    var gg = function(a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    };
    var hh = function(a, b, c, d, x, s, t) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    };
    var ii = function(a, b, c, d, x, s, t) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    };
    var md51 = function(s) {
        var txt = '';
        var n = s.length,
            state = [1732584193, -271733879, -1732584194, 271733878],
            i;
        for (i = 64; i <= s.length; i += 64) {
            md5cycle(state, md5blk(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < s.length; i++)
            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i++) tail[i] = 0;
        }
        tail[14] = n * 8;
        md5cycle(state, tail);
        return state;
    };
    var md5blk = function(s) {
        var md5blks = [],
            i;
        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i) +
                (s.charCodeAt(i + 1) << 8) +
                (s.charCodeAt(i + 2) << 16) +
                (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    };
    var hex_chr = '0123456789abcdef'.split('');
    var rhex = function(n) {
        var s = '',
            j = 0;
        for (; j < 4; j++)
            s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] +
            hex_chr[(n >> (j * 8)) & 0x0F];
        return s;
    };
    var hex = function(x) {
        for (var i = 0; i < x.length; i++)
            x[i] = rhex(x[i]);
        return x.join('');
    };
    var add32 = function(a, b) {
        return (a + b) & 0xFFFFFFFF;
    };
    return function(s) {
        return hex(md51(s));
    };
});;
/*! RESOURCE: /scripts/sn/common/util/service.priorityQueue.js */
angular.module('sn.common.util').factory('priorityQueue', function() {
    'use strict';
    return function(comparator) {
        var items = [];
        var compare = comparator || function(a, b) {
            return a - b;
        };
        var swap = function(a, b) {
            var temp = items[a];
            items[a] = items[b];
            items[b] = temp;
        };
        var bubbleUp = function(pos) {
            var parent;
            while (pos > 0) {
                parent = (pos - 1) >> 1;
                if (compare(items[pos], items[parent]) >= 0)
                    break;
                swap(parent, pos);
                pos = parent;
            }
        };
        var bubbleDown = function(pos) {
            var left, right, min, last = items.length - 1;
            while (true) {
                left = (pos << 1) + 1;
                right = left + 1;
                min = pos;
                if (left <= last && compare(items[left], items[min]) < 0)
                    min = left;
                if (right <= last && compare(items[right], items[min]) < 0)
                    min = right;
                if (min === pos)
                    break;
                swap(min, pos);
                pos = min;
            }
        };
        return {
            add: function(item) {
                items.push(item);
                bubbleUp(items.length - 1);
            },
            poll: function() {
                var first = items[0],
                    last = items.pop();
                if (items.length > 0) {
                    items[0] = last;
                    bubbleDown(0);
                }
                return first;
            },
            peek: function() {
                return items[0];
            },
            clear: function() {
                items = [];
            },
            inspect: function() {
                return angular.toJson(items, true);
            },
            get size() {
                return items.length;
            },
            get all() {
                return items;
            },
            set comparator(fn) {
                compare = fn;
            }
        };
    };
});;
/*! RESOURCE: /scripts/sn/common/util/service.snResource.js */
angular.module('sn.common.util').factory('snResource', function($http, $q, priorityQueue, md5) {
    'use strict';
    var methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'jsonp', 'trace'],
        queue = priorityQueue(function(a, b) {
            return a.timestamp - b.timestamp;
        }),
        resource = {},
        pendingRequests = [],
        inFlightRequests = [];
    return function() {
        var requestInterceptors = $http.defaults.transformRequest,
            responseInterceptors = $http.defaults.transformResponse;
        var next = function() {
            var request = queue.peek();
            pendingRequests.shift();
            inFlightRequests.push(request.hash);
            $http(request.config).then(function(response) {
                request.deferred.resolve(response);
            }, function(reason) {
                request.deferred.reject(reason);
            }).finally(function() {
                queue.poll();
                inFlightRequests.shift();
                if (queue.size > 0)
                    next();
            });
        };
        angular.forEach(methods, function(method) {
            resource[method] = function(url, data) {
                var deferredRequest = $q.defer(),
                    promise = deferredRequest.promise,
                    deferredAbort = $q.defer(),
                    config = {
                        method: method,
                        url: url,
                        data: data,
                        transformRequest: requestInterceptors,
                        transformResponse: responseInterceptors,
                        timeout: deferredAbort.promise
                    },
                    hash = md5(JSON.stringify(config));
                pendingRequests.push(hash);
                queue.add({
                    config: config,
                    deferred: deferredRequest,
                    timestamp: Date.now(),
                    hash: hash
                });
                if (queue.size === 1)
                    next();
                promise.abort = function() {
                    deferredAbort.resolve('Request cancelled');
                };
                return promise;
            };
        });
        resource.addRequestInterceptor = function(fn) {
            requestInterceptors = requestInterceptors.concat([fn]);
        };
        resource.addResponseInterceptor = function(fn) {
            responseInterceptors = responseInterceptors.concat([fn]);
        };
        resource.queueSize = function() {
            return queue.size;
        };
        resource.queuedRequests = function() {
            return queue.all;
        };
        return resource;
    };
});;
/*! RESOURCE: /scripts/sn/common/util/service.snConnect.js */
angular.module("sn.common.util").service("snConnectService", function($http, snCustomEvent) {
    "use strict";
    var connectPaths = ["/$c.do", "/$chat.do"];

    function canOpenInFrameset() {
        return window.top.NOW.collaborationFrameset;
    }

    function isInConnect() {
        var parentPath = getParentPath();
        return connectPaths.some(function(path) {
            return parentPath == path;
        });
    }

    function getParentPath() {
        try {
            return window.top.location.pathname;
        } catch (IGNORED) {
            return "";
        }
    }

    function openWithProfile(profile) {
        if (isInConnect() || canOpenInFrameset())
            snCustomEvent.fireTop('chat:open_conversation', profile);
        else
            window.open("$c.do#/with/" + profile.sys_id, "_blank");
    }
    return {
        openWithProfile: openWithProfile
    }
});;
/*! RESOURCE: /scripts/sn/common/util/snPolyfill.js */
(function() {
    "use strict";
    polyfill(String.prototype, 'startsWith', function(prefix) {
        return this.indexOf(prefix) === 0;
    });
    polyfill(String.prototype, 'endsWith', function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    });
    polyfill(Number, 'isNaN', function(value) {
        return value !== value;
    });
    polyfill(window, 'btoa', function(input) {
        var str = String(input);
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        for (
            var block, charCode, idx = 0, map = chars, output = ''; str.charAt(idx | 0) || (map = '=', idx % 1); output += map.charAt(63 & block >> 8 - idx % 1 * 8)
        ) {
            charCode = str.charCodeAt(idx += 3 / 4);
            if (charCode > 0xFF) {
                throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
            }
            block = block << 8 | charCode;
        }
        return output;
    });

    function polyfill(obj, slot, fn) {
        if (obj[slot] === void(0)) {
            obj[slot] = fn;
        }
    }
    window.console = window.console || {
        log: function() {}
    };
})();;
/*! RESOURCE: /scripts/sn/common/util/directive.snFocus.js */
angular.module('sn.common.util').directive('snFocus', function($timeout) {
    'use strict';
    return function(scope, element, attrs) {
        scope.$watch(attrs.snFocus, function(value) {
            if (value !== true)
                return;
            $timeout(function() {
                element[0].focus();
            });
        });
    };
});;
/*! RESOURCE: /scripts/sn/common/util/directive.snResizeHeight.js */
angular.module('sn.common.util').directive('snResizeHeight', function($window) {
    'use strict';
    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
            if (typeof $window.autosize === 'undefined') {
                return;
            }
            $window.autosize(elem);

            function _update() {
                $window.autosize.update(elem);
            }

            function _destroy() {
                $window.autosize.destroy(elem);
            }
            if (typeof attrs.disableValueWatcher === "undefined") {
                scope.$watch(function() {
                    return elem.val();
                }, function valueWatcher(newValue, oldValue) {
                    if (newValue === oldValue) {
                        return;
                    }
                    _update();
                });
            }
            elem.on('input.resize', _update());
            scope.$on('$destroy', function() {
                _destroy();
            });
            if (attrs.snTextareaAutosizer === 'trim') {
                elem.on('blur', function() {
                    elem.val(elem.val().trim());
                    _update();
                })
            }
        }
    }
});;
/*! RESOURCE: /scripts/sn/common/util/directive.snBlurOnEnter.js */
angular.module('sn.common.util').directive('snBlurOnEnter', function() {
    'use strict';
    return function(scope, element) {
        element.bind("keydown keypress", function(event) {
            if (event.which !== 13)
                return;
            element.blur();
            event.preventDefault();
        });
    };
});;
/*! RESOURCE: /scripts/sn/common/util/directive.snStickyHeaders.js */
angular.module('sn.common.util').directive('snStickyHeaders', function() {
    "use strict";
    return {
        restrict: 'A',
        transclude: false,
        replace: false,
        link: function(scope, element, attrs) {
            element.addClass('sticky-headers');
            var containers;
            var scrollContainer = element.find('[sn-sticky-scroll-container]');
            scrollContainer.addClass('sticky-scroll-container');

            function refreshHeaders() {
                if (attrs.snStickyHeaders !== 'false') {
                    angular.forEach(containers, function(container) {
                        var stickyContainer = angular.element(container);
                        var stickyHeader = stickyContainer.find('[sn-sticky-header]');
                        var stickyOffset = stickyContainer.position().top + stickyContainer.outerHeight();
                        stickyContainer.addClass('sticky-container');
                        if (stickyOffset < stickyContainer.outerHeight() && stickyOffset > -stickyHeader.outerHeight()) {
                            stickyContainer.css('padding-top', stickyHeader.outerHeight());
                            stickyHeader.css('width', stickyHeader.outerWidth());
                            stickyHeader.removeClass('sticky-header-disabled').addClass('sticky-header-enabled');
                        } else {
                            stickyContainer.css('padding-top', '');
                            stickyHeader.css('width', '');
                            stickyHeader.removeClass('sticky-header-enabled').addClass('sticky-header-disabled');
                        }
                    });
                } else {
                    element.find('[sn-sticky-container]').removeClass('sticky-container');
                    element.find('[sn-sticky-container]').css('padding-top', '');
                    element.find('[sn-sticky-header]').css('width', '');
                    element.find('[sn-sticky-header]').removeClass('sticky-header-enabled').addClass('sticky-header-disabled');
                }
            }
            scope.$watch(function() {
                scrollContainer.find('[sn-sticky-header]').addClass('sticky-header');
                containers = element.find('[sn-sticky-container]');
                return attrs.snStickyHeaders;
            }, refreshHeaders);
            scope.$watch(function() {
                return scrollContainer[0].scrollHeight;
            }, refreshHeaders);
            scrollContainer.on('scroll', refreshHeaders);
        }
    };
});;;