/*! RESOURCE: /scripts/classes/GlideTimeElement.js */
var GlideTimeElement = Class.create({
  initialize: function(name, initialValue) {
    this.name = name;
    if (initialValue)
      this.setValue(initialValue)
  },
  setValue: function(value, displayValue) {
    var hours = 0;
    var mins = 0;
    var secs = 0;
    var ampm = "";
    var dateFormat = gel(this.name + '_format').value;
    if (value == "00:00:00") {
      if (dateFormat.indexOf("hh") > -1) {
        hours = 12;
        ampm = "AM";
      }
    } else {
      var timeObject = this._getTimeFromFormat(value, dateFormat);
      if (!timeObject) {
        this.log("setValue aborted; unable to interpret time '" + value + "' for format '" + dateFormat + "'");
        return;
      }
      hours = timeObject.hh;
      mins = timeObject.mm;
      secs = timeObject.ss;
      ampm = timeObject.ampm;
    }
    hours = this._LZ(hours, (dateFormat.toLowerCase().indexOf("hh") > -1));
    mins = this._LZ(mins, (dateFormat.toLowerCase().indexOf("mm") > -1));
    secs = this._LZ(secs, (dateFormat.toLowerCase().indexOf("ss") > -1));
    gel(this.name + 'dur_hour').value = hours;
    gel(this.name + 'dur_min').value = mins;
    var secondsInput = gel(this.name + 'dur_sec');
    if (secondsInput)
      secondsInput.value = secs;
    var ampmw = gel(this.name + 'dur_ampm');
    if (ampmw)
      if (ampm)
        ampmw.value = ampm;
    if ("undefined" === typeof g_form)
      GlideTimeElement.updateRealTime(this.name);
    else {
      g_form._internalChange = true;
      GlideTimeElement.updateRealTime(this.name);
      g_form._internalChange = false;
    }
  },
  _LZ: function(val, padded) {
    if (!padded) {
      if (val.length > 1)
        if (val.charAt(0) == '0')
          val = val.substring(1);
      return val;
    }
    val += "";
    if (val.length < 2)
      val = "0" + val;
    return val;
  },
  _getTimeFromFormat: function(val, format) {
    val = trim(val);
    var i_val = 0;
    var i_format = 0;
    var c = "";
    var token = "";
    var hh = "",
      mm = "",
      ss = "",
      ampm = "";
    while (i_format < format.length) {
      c = format.charAt(i_format);
      token = "";
      while ((format.charAt(i_format) == c) && (i_format < format.length)) {
        token += format.charAt(i_format++);
      }
      if (token == "hh" || token == "h") {
        hh = this._getInt(val, i_val, token.length, 2);
        if (hh == null || (hh < 1) || (hh > 12)) {
          this.log("bad hours: " + hh);
          return;
        }
        i_val += hh.length;
      } else if (token == "HH" || token == "H") {
        hh = this._getInt(val, i_val, token.length, 2);
        if (hh == null || (hh < 0) || (hh > 23)) {
          this.log("bad hours: " + hh);
          return;
        }
        i_val += hh.length;
      } else if (token == "mm" || token == "m") {
        mm = this._getInt(val, i_val, token.length, 2);
        if (mm == null || (mm < 0) || (mm > 59)) {
          this.log("bad minutes: " + mm);
          return;
        }
        i_val += mm.length;
      } else if (token == "ss" || token == "s") {
        ss = this._getInt(val, i_val, token.length, 2);
        if (ss == null || (ss < 0) || (ss > 59)) {
          this.log("bad seconds: " + ss);
          return;
        }
        i_val += ss.length;
      } else if (token == "a") {
        if (val.substring(i_val, i_val + 2).toLowerCase() == "am")
          ampm = "AM";
        else if (val.substring(i_val, i_val + 2).toLowerCase() == "pm")
          ampm = "PM";
        else {
          this.log("bad AM/PM: " + val.substring(i_val, i_val + 2));
          return;
        }
        i_val += 2;
      } else {
        if (val.substring(i_val, i_val + token.length) != token) {
          this.log("time did not match format at character " + i_val);
          return;
        } else
          i_val += token.length;
      }
    }
    if (i_val != val.length) {
      this.log("time includes trailing characters");
      return;
    }
    return {
      hh: hh,
      mm: mm,
      ss: ss,
      ampm: ampm
    };
  },
  _getInt: function(str, i, minlength, maxlength) {
    for (var x = maxlength; x >= minlength; x--) {
      var token = str.substring(i, i + x);
      var intPart = this._getInteger(token);
      if (intPart != "")
        return intPart;
    }
    return null;
  },
  _getInteger: function(val) {
    var digits = "1234567890";
    for (var i = 0; i < val.length; i++) {
      if (digits.indexOf(val.charAt(i)) == -1)
        return val.substring(0, i);
    }
    return val;
  },
  log: function(msg) {
    jslog("GetTimeElement - " + msg);
  },
  type: function() {
    return "GlideTimeElement";
  }
});
GlideTimeElement.updateRealTime = function(ref) {
  var sdata = gel(ref);
  var hour = gel(ref + 'dur_hour');
  var min = gel(ref + 'dur_min');
  var sec = "";
  var ampm = "";
  var dateFormat = gel(ref + '_format').value;
  if (dateFormat.indexOf("a") > -1) {
    var ampmw = gel(ref + 'dur_ampm');
    if (ampmw)
      ampm = ampmw.value;
  }
  if (dateFormat.indexOf("s") > -1) {
    var secondsInput = gel(ref + 'dur_sec');
    if (secondsInput)
      sec = secondsInput.value;
  }
  sdata.value = GlideTimeElement.formatTime(parseInt(hour.value || 0, 10),
    parseInt(min.value || 0, 10),
    parseInt(sec || 0, 10),
    ampm,
    dateFormat);
  onChange(ref);
}
GlideTimeElement.formatTime = function(hour, minute, second, ampm, format) {
  var value = new Object();
  if (ampm == "PM")
    hour += 12;
  value["H"] = hour;
  value["HH"] = LZ(hour);
  if (hour == 0)
    value["h"] = 12;
  else if (hour > 12)
    value["h"] = hour - 12;
  else
    value["h"] = hour;
  value["hh"] = LZ(value["h"]);
  value["a"] = ampm;
  value["m"] = minute;
  value["mm"] = LZ(minute);
  value["s"] = second;
  value["ss"] = LZ(second);
  var i_format = 0;
  var c = "";
  var result = "";
  while (i_format < format.length) {
    c = format.charAt(i_format);
    token = "";
    while ((format.charAt(i_format) == c) && (i_format < format.length)) {
      token += format.charAt(i_format++);
    }
    if (value[token] != null)
      result = result + value[token];
    else
      result = result + token;
  }
  return result;
};