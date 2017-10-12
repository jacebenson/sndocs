/*! RESOURCE: /scripts/glide-highcharts-v5.js */
if (window.Highcharts) {
  window.oldHighcharts = window.Highcharts;
  delete window.Highcharts;
}
/*! RESOURCE: /scripts/highcharts/highstock.src.js */
'use strict';
(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = root.document ?
      factory(root) :
      factory;
  } else {
    root.Highcharts = factory(root);
  }
}(typeof window !== 'undefined' ? window : this, function(win) {
  var Highcharts = (function() {
    'use strict';
    var win = window,
      doc = win.document;
    var SVG_NS = 'http://www.w3.org/2000/svg',
      userAgent = (win.navigator && win.navigator.userAgent) || '',
      svg = doc && doc.createElementNS && !!doc.createElementNS(SVG_NS, 'svg').createSVGRect,
      isMS = /(edge|msie|trident)/i.test(userAgent) && !window.opera,
      vml = !svg,
      isFirefox = /Firefox/.test(userAgent),
      hasBidiBug = isFirefox && parseInt(userAgent.split('Firefox/')[1], 10) < 4;
    var Highcharts = win.Highcharts ? win.Highcharts.error(16, true) : {
      product: 'Highstock',
      version: '5.0.7',
      deg2rad: Math.PI * 2 / 360,
      doc: doc,
      hasBidiBug: hasBidiBug,
      hasTouch: doc && doc.documentElement.ontouchstart !== undefined,
      isMS: isMS,
      isWebKit: /AppleWebKit/.test(userAgent),
      isFirefox: isFirefox,
      isTouchDevice: /(Mobile|Android|Windows Phone)/.test(userAgent),
      SVG_NS: SVG_NS,
      chartCount: 0,
      seriesTypes: {},
      symbolSizes: {},
      svg: svg,
      vml: vml,
      win: win,
      charts: [],
      marginNames: ['plotTop', 'marginRight', 'marginBottom', 'plotLeft'],
      noop: function() {
        return undefined;
      }
    };
    return Highcharts;
  }());
  (function(H) {
    'use strict';
    var timers = [];
    var charts = H.charts,
      doc = H.doc,
      win = H.win;
    H.error = function(code, stop) {
      var msg = H.isNumber(code) ?
        'Highcharts error #' + code + ': www.highcharts.com/errors/' + code :
        code;
      if (stop) {
        throw new Error(msg);
      }
      if (win.console) {
        console.log(msg);
      }
    };
    H.Fx = function(elem, options, prop) {
      this.options = options;
      this.elem = elem;
      this.prop = prop;
    };
    H.Fx.prototype = {
      dSetter: function() {
        var start = this.paths[0],
          end = this.paths[1],
          ret = [],
          now = this.now,
          i = start.length,
          startVal;
        if (now === 1) {
          ret = this.toD;
        } else if (i === end.length && now < 1) {
          while (i--) {
            startVal = parseFloat(start[i]);
            ret[i] =
              isNaN(startVal) ?
              start[i] :
              now * (parseFloat(end[i] - startVal)) + startVal;
          }
        } else {
          ret = end;
        }
        this.elem.attr('d', ret, null, true);
      },
      update: function() {
        var elem = this.elem,
          prop = this.prop,
          now = this.now,
          step = this.options.step;
        if (this[prop + 'Setter']) {
          this[prop + 'Setter']();
        } else if (elem.attr) {
          if (elem.element) {
            elem.attr(prop, now, null, true);
          }
        } else {
          elem.style[prop] = now + this.unit;
        }
        if (step) {
          step.call(elem, now, this);
        }
      },
      run: function(from, to, unit) {
        var self = this,
          timer = function(gotoEnd) {
            return timer.stopped ? false : self.step(gotoEnd);
          },
          i;
        this.startTime = +new Date();
        this.start = from;
        this.end = to;
        this.unit = unit;
        this.now = this.start;
        this.pos = 0;
        timer.elem = this.elem;
        timer.prop = this.prop;
        if (timer() && timers.push(timer) === 1) {
          timer.timerId = setInterval(function() {
            for (i = 0; i < timers.length; i++) {
              if (!timers[i]()) {
                timers.splice(i--, 1);
              }
            }
            if (!timers.length) {
              clearInterval(timer.timerId);
            }
          }, 13);
        }
      },
      step: function(gotoEnd) {
        var t = +new Date(),
          ret,
          done,
          options = this.options,
          elem = this.elem,
          complete = options.complete,
          duration = options.duration,
          curAnim = options.curAnim,
          i;
        if (elem.attr && !elem.element) {
          ret = false;
        } else if (gotoEnd || t >= duration + this.startTime) {
          this.now = this.end;
          this.pos = 1;
          this.update();
          curAnim[this.prop] = true;
          done = true;
          for (i in curAnim) {
            if (curAnim[i] !== true) {
              done = false;
            }
          }
          if (done && complete) {
            complete.call(elem);
          }
          ret = false;
        } else {
          this.pos = options.easing((t - this.startTime) / duration);
          this.now = this.start + ((this.end - this.start) * this.pos);
          this.update();
          ret = true;
        }
        return ret;
      },
      initPath: function(elem, fromD, toD) {
        fromD = fromD || '';
        var shift,
          startX = elem.startX,
          endX = elem.endX,
          bezier = fromD.indexOf('C') > -1,
          numParams = bezier ? 7 : 3,
          fullLength,
          slice,
          i,
          start = fromD.split(' '),
          end = toD.slice(),
          isArea = elem.isArea,
          positionFactor = isArea ? 2 : 1,
          reverse;

        function sixify(arr) {
          var isOperator,
            nextIsOperator;
          i = arr.length;
          while (i--) {
            isOperator = arr[i] === 'M' || arr[i] === 'L';
            nextIsOperator = /[a-zA-Z]/.test(arr[i + 3]);
            if (isOperator && nextIsOperator) {
              arr.splice(
                i + 1, 0,
                arr[i + 1], arr[i + 2],
                arr[i + 1], arr[i + 2]
              );
            }
          }
        }

        function insertSlice(arr, subArr, index) {
          [].splice.apply(
            arr, [index, 0].concat(subArr)
          );
        }

        function prepend(arr, other) {
          while (arr.length < fullLength) {
            arr[0] = other[fullLength - arr.length];
            insertSlice(arr, arr.slice(0, numParams), 0);
            if (isArea) {
              insertSlice(
                arr,
                arr.slice(arr.length - numParams), arr.length
              );
              i--;
            }
          }
          arr[0] = 'M';
        }

        function append(arr, other) {
          var i = (fullLength - arr.length) / numParams;
          while (i > 0 && i--) {
            slice = arr.slice().splice(
              (arr.length / positionFactor) - numParams,
              numParams * positionFactor
            );
            slice[0] = other[fullLength - numParams - (i * numParams)];
            if (bezier) {
              slice[numParams - 6] = slice[numParams - 2];
              slice[numParams - 5] = slice[numParams - 1];
            }
            insertSlice(arr, slice, arr.length / positionFactor);
            if (isArea) {
              i--;
            }
          }
        }
        if (bezier) {
          sixify(start);
          sixify(end);
        }
        if (startX && endX) {
          for (i = 0; i < startX.length; i++) {
            if (startX[i] === endX[0]) {
              shift = i;
              break;
            } else if (startX[0] ===
              endX[endX.length - startX.length + i]) {
              shift = i;
              reverse = true;
              break;
            }
          }
          if (shift === undefined) {
            start = [];
          }
        }
        if (start.length && H.isNumber(shift)) {
          fullLength = end.length + shift * positionFactor * numParams;
          if (!reverse) {
            prepend(end, start);
            append(start, end);
          } else {
            prepend(start, end);
            append(end, start);
          }
        }
        return [start, end];
      }
    };
    H.extend = function(a, b) {
      var n;
      if (!a) {
        a = {};
      }
      for (n in b) {
        a[n] = b[n];
      }
      return a;
    };
    H.merge = function() {
      var i,
        args = arguments,
        len,
        ret = {},
        doCopy = function(copy, original) {
          var value, key;
          if (typeof copy !== 'object') {
            copy = {};
          }
          for (key in original) {
            if (original.hasOwnProperty(key)) {
              value = original[key];
              if (H.isObject(value, true) &&
                key !== 'renderTo' &&
                typeof value.nodeType !== 'number') {
                copy[key] = doCopy(copy[key] || {}, value);
              } else {
                copy[key] = original[key];
              }
            }
          }
          return copy;
        };
      if (args[0] === true) {
        ret = args[1];
        args = Array.prototype.slice.call(args, 2);
      }
      len = args.length;
      for (i = 0; i < len; i++) {
        ret = doCopy(ret, args[i]);
      }
      return ret;
    };
    H.pInt = function(s, mag) {
      return parseInt(s, mag || 10);
    };
    H.isString = function(s) {
      return typeof s === 'string';
    };
    H.isArray = function(obj) {
      var str = Object.prototype.toString.call(obj);
      return str === '[object Array]' || str === '[object Array Iterator]';
    };
    H.isObject = function(obj, strict) {
      return obj && typeof obj === 'object' && (!strict || !H.isArray(obj));
    };
    H.isNumber = function(n) {
      return typeof n === 'number' && !isNaN(n);
    };
    H.erase = function(arr, item) {
      var i = arr.length;
      while (i--) {
        if (arr[i] === item) {
          arr.splice(i, 1);
          break;
        }
      }
    };
    H.defined = function(obj) {
      return obj !== undefined && obj !== null;
    };
    H.attr = function(elem, prop, value) {
      var key,
        ret;
      if (H.isString(prop)) {
        if (H.defined(value)) {
          elem.setAttribute(prop, value);
        } else if (elem && elem.getAttribute) {
          ret = elem.getAttribute(prop);
        }
      } else if (H.defined(prop) && H.isObject(prop)) {
        for (key in prop) {
          elem.setAttribute(key, prop[key]);
        }
      }
      return ret;
    };
    H.splat = function(obj) {
      return H.isArray(obj) ? obj : [obj];
    };
    H.syncTimeout = function(fn, delay, context) {
      if (delay) {
        return setTimeout(fn, delay, context);
      }
      fn.call(0, context);
    };
    H.pick = function() {
      var args = arguments,
        i,
        arg,
        length = args.length;
      for (i = 0; i < length; i++) {
        arg = args[i];
        if (arg !== undefined && arg !== null) {
          return arg;
        }
      }
    };
    H.css = function(el, styles) {
      if (H.isMS && !H.svg) {
        if (styles && styles.opacity !== undefined) {
          styles.filter = 'alpha(opacity=' + (styles.opacity * 100) + ')';
        }
      }
      H.extend(el.style, styles);
    };
    H.createElement = function(tag, attribs, styles, parent, nopad) {
      var el = doc.createElement(tag),
        css = H.css;
      if (attribs) {
        H.extend(el, attribs);
      }
      if (nopad) {
        css(el, {
          padding: 0,
          border: 'none',
          margin: 0
        });
      }
      if (styles) {
        css(el, styles);
      }
      if (parent) {
        parent.appendChild(el);
      }
      return el;
    };
    H.extendClass = function(parent, members) {
      var object = function() {};
      object.prototype = new parent();
      H.extend(object.prototype, members);
      return object;
    };
    H.pad = function(number, length, padder) {
      return new Array((length || 2) + 1 -
        String(number).length).join(padder || 0) + number;
    };
    H.relativeLength = function(value, base) {
      return (/%$/).test(value) ?
        base * parseFloat(value) / 100 :
        parseFloat(value);
    };
    H.wrap = function(obj, method, func) {
      var proceed = obj[method];
      obj[method] = function() {
        var args = Array.prototype.slice.call(arguments),
          outerArgs = arguments,
          ctx = this,
          ret;
        ctx.proceed = function() {
          proceed.apply(ctx, arguments.length ? arguments : outerArgs);
        };
        args.unshift(proceed);
        ret = func.apply(this, args);
        ctx.proceed = null;
        return ret;
      };
    };
    H.getTZOffset = function(timestamp) {
      var d = H.Date;
      return ((d.hcGetTimezoneOffset && d.hcGetTimezoneOffset(timestamp)) ||
        d.hcTimezoneOffset || 0) * 60000;
    };
    H.dateFormat = function(format, timestamp, capitalize) {
      if (!H.defined(timestamp) || isNaN(timestamp)) {
        return H.defaultOptions.lang.invalidDate || '';
      }
      format = H.pick(format, '%Y-%m-%d %H:%M:%S');
      var D = H.Date,
        date = new D(timestamp - H.getTZOffset(timestamp)),
        key,
        hours = date[D.hcGetHours](),
        day = date[D.hcGetDay](),
        dayOfMonth = date[D.hcGetDate](),
        month = date[D.hcGetMonth](),
        fullYear = date[D.hcGetFullYear](),
        lang = H.defaultOptions.lang,
        langWeekdays = lang.weekdays,
        shortWeekdays = lang.shortWeekdays,
        pad = H.pad,
        replacements = H.extend({
          'a': shortWeekdays ?
            shortWeekdays[day] : langWeekdays[day].substr(0, 3),
          'A': langWeekdays[day],
          'd': pad(dayOfMonth),
          'e': pad(dayOfMonth, 2, ' '),
          'w': day,
          'b': lang.shortMonths[month],
          'B': lang.months[month],
          'm': pad(month + 1),
          'y': fullYear.toString().substr(2, 2),
          'Y': fullYear,
          'H': pad(hours),
          'k': hours,
          'I': pad((hours % 12) || 12),
          'l': (hours % 12) || 12,
          'M': pad(date[D.hcGetMinutes]()),
          'p': hours < 12 ? 'AM' : 'PM',
          'P': hours < 12 ? 'am' : 'pm',
          'S': pad(date.getSeconds()),
          'L': pad(Math.round(timestamp % 1000), 3)
        }, H.dateFormats);
      for (key in replacements) {
        while (format.indexOf('%' + key) !== -1) {
          format = format.replace(
            '%' + key,
            typeof replacements[key] === 'function' ?
            replacements[key](timestamp) :
            replacements[key]
          );
        }
      }
      return capitalize ?
        format.substr(0, 1).toUpperCase() + format.substr(1) :
        format;
    };
    H.formatSingle = function(format, val) {
      var floatRegex = /f$/,
        decRegex = /\.([0-9])/,
        lang = H.defaultOptions.lang,
        decimals;
      if (floatRegex.test(format)) {
        decimals = format.match(decRegex);
        decimals = decimals ? decimals[1] : -1;
        if (val !== null) {
          val = H.numberFormat(
            val,
            decimals,
            lang.decimalPoint,
            format.indexOf(',') > -1 ? lang.thousandsSep : ''
          );
        }
      } else {
        val = H.dateFormat(format, val);
      }
      return val;
    };
    H.format = function(str, ctx) {
      var splitter = '{',
        isInside = false,
        segment,
        valueAndFormat,
        path,
        i,
        len,
        ret = [],
        val,
        index;
      while (str) {
        index = str.indexOf(splitter);
        if (index === -1) {
          break;
        }
        segment = str.slice(0, index);
        if (isInside) {
          valueAndFormat = segment.split(':');
          path = valueAndFormat.shift().split('.');
          len = path.length;
          val = ctx;
          for (i = 0; i < len; i++) {
            val = val[path[i]];
          }
          if (valueAndFormat.length) {
            val = H.formatSingle(valueAndFormat.join(':'), val);
          }
          ret.push(val);
        } else {
          ret.push(segment);
        }
        str = str.slice(index + 1);
        isInside = !isInside;
        splitter = isInside ? '}' : '{';
      }
      ret.push(str);
      return ret.join('');
    };
    H.getMagnitude = function(num) {
      return Math.pow(10, Math.floor(Math.log(num) / Math.LN10));
    };
    H.normalizeTickInterval = function(interval, multiples, magnitude,
      allowDecimals, hasTickAmount) {
      var normalized,
        i,
        retInterval = interval;
      magnitude = H.pick(magnitude, 1);
      normalized = interval / magnitude;
      if (!multiples) {
        multiples = hasTickAmount ? [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10] : [1, 2, 2.5, 5, 10];
        if (allowDecimals === false) {
          if (magnitude === 1) {
            multiples = H.grep(multiples, function(num) {
              return num % 1 === 0;
            });
          } else if (magnitude <= 0.1) {
            multiples = [1 / magnitude];
          }
        }
      }
      for (i = 0; i < multiples.length; i++) {
        retInterval = multiples[i];
        if ((hasTickAmount && retInterval * magnitude >= interval) ||
          (!hasTickAmount && (normalized <= (multiples[i] +
            (multiples[i + 1] || multiples[i])) / 2))) {
          break;
        }
      }
      retInterval = H.correctFloat(
        retInterval * magnitude, -Math.round(Math.log(0.001) / Math.LN10)
      );
      return retInterval;
    };
    H.stableSort = function(arr, sortFunction) {
      var length = arr.length,
        sortValue,
        i;
      for (i = 0; i < length; i++) {
        arr[i].safeI = i;
      }
      arr.sort(function(a, b) {
        sortValue = sortFunction(a, b);
        return sortValue === 0 ? a.safeI - b.safeI : sortValue;
      });
      for (i = 0; i < length; i++) {
        delete arr[i].safeI;
      }
    };
    H.arrayMin = function(data) {
      var i = data.length,
        min = data[0];
      while (i--) {
        if (data[i] < min) {
          min = data[i];
        }
      }
      return min;
    };
    H.arrayMax = function(data) {
      var i = data.length,
        max = data[0];
      while (i--) {
        if (data[i] > max) {
          max = data[i];
        }
      }
      return max;
    };
    H.destroyObjectProperties = function(obj, except) {
      var n;
      for (n in obj) {
        if (obj[n] && obj[n] !== except && obj[n].destroy) {
          obj[n].destroy();
        }
        delete obj[n];
      }
    };
    H.discardElement = function(element) {
      var garbageBin = H.garbageBin;
      if (!garbageBin) {
        garbageBin = H.createElement('div');
      }
      if (element) {
        garbageBin.appendChild(element);
      }
      garbageBin.innerHTML = '';
    };
    H.correctFloat = function(num, prec) {
      return parseFloat(
        num.toPrecision(prec || 14)
      );
    };
    H.setAnimation = function(animation, chart) {
      chart.renderer.globalAnimation = H.pick(
        animation,
        chart.options.chart.animation,
        true
      );
    };
    H.animObject = function(animation) {
      return H.isObject(animation) ?
        H.merge(animation) : {
          duration: animation ? 500 : 0
        };
    };
    H.timeUnits = {
      millisecond: 1,
      second: 1000,
      minute: 60000,
      hour: 3600000,
      day: 24 * 3600000,
      week: 7 * 24 * 3600000,
      month: 28 * 24 * 3600000,
      year: 364 * 24 * 3600000
    };
    H.numberFormat = function(number, decimals, decimalPoint, thousandsSep) {
      number = +number || 0;
      decimals = +decimals;
      var lang = H.defaultOptions.lang,
        origDec = (number.toString().split('.')[1] || '').length,
        strinteger,
        thousands,
        ret,
        roundedNumber;
      if (decimals === -1) {
        decimals = Math.min(origDec, 20);
      } else if (!H.isNumber(decimals)) {
        decimals = 2;
      }
      roundedNumber = (
        Math.abs(number) + Math.pow(10, -Math.max(decimals, origDec) - 1)
      ).toFixed(decimals);
      strinteger = String(H.pInt(roundedNumber));
      thousands = strinteger.length > 3 ? strinteger.length % 3 : 0;
      decimalPoint = H.pick(decimalPoint, lang.decimalPoint);
      thousandsSep = H.pick(thousandsSep, lang.thousandsSep);
      ret = number < 0 ? '-' : '';
      ret += thousands ? strinteger.substr(0, thousands) + thousandsSep : '';
      ret += strinteger
        .substr(thousands)
        .replace(/(\d{3})(?=\d)/g, '$1' + thousandsSep);
      if (decimals) {
        ret += decimalPoint + roundedNumber.slice(-decimals);
      }
      return ret;
    };
    Math.easeInOutSine = function(pos) {
      return -0.5 * (Math.cos(Math.PI * pos) - 1);
    };
    H.getStyle = function(el, prop) {
      var style;
      if (prop === 'width') {
        return Math.min(el.offsetWidth, el.scrollWidth) -
          H.getStyle(el, 'padding-left') -
          H.getStyle(el, 'padding-right');
      } else if (prop === 'height') {
        return Math.min(el.offsetHeight, el.scrollHeight) -
          H.getStyle(el, 'padding-top') -
          H.getStyle(el, 'padding-bottom');
      }
      style = win.getComputedStyle(el, undefined);
      return style && H.pInt(style.getPropertyValue(prop));
    };
    H.inArray = function(item, arr) {
      return arr.indexOf ? arr.indexOf(item) : [].indexOf.call(arr, item);
    };
    H.grep = function(arr, callback) {
      return [].filter.call(arr, callback);
    };
    H.find = function(arr, callback) {
      return [].find.call(arr, callback);
    };
    H.map = function(arr, fn) {
      var results = [],
        i = 0,
        len = arr.length;
      for (; i < len; i++) {
        results[i] = fn.call(arr[i], arr[i], i, arr);
      }
      return results;
    };
    H.offset = function(el) {
      var docElem = doc.documentElement,
        box = el.getBoundingClientRect();
      return {
        top: box.top + (win.pageYOffset || docElem.scrollTop) -
          (docElem.clientTop || 0),
        left: box.left + (win.pageXOffset || docElem.scrollLeft) -
          (docElem.clientLeft || 0)
      };
    };
    H.stop = function(el, prop) {
      var i = timers.length;
      while (i--) {
        if (timers[i].elem === el && (!prop || prop === timers[i].prop)) {
          timers[i].stopped = true;
        }
      }
    };
    H.each = function(arr, fn, ctx) {
      return Array.prototype.forEach.call(arr, fn, ctx);
    };
    H.addEvent = function(el, type, fn) {
      var events = el.hcEvents = el.hcEvents || {};

      function wrappedFn(e) {
        e.target = e.srcElement || win;
        fn.call(el, e);
      }
      if (el.addEventListener) {
        el.addEventListener(type, fn, false);
      } else if (el.attachEvent) {
        if (!el.hcEventsIE) {
          el.hcEventsIE = {};
        }
        el.hcEventsIE[fn.toString()] = wrappedFn;
        el.attachEvent('on' + type, wrappedFn);
      }
      if (!events[type]) {
        events[type] = [];
      }
      events[type].push(fn);
      return function() {
        H.removeEvent(el, type, fn);
      };
    };
    H.removeEvent = function(el, type, fn) {
      var events,
        hcEvents = el.hcEvents,
        index;

      function removeOneEvent(type, fn) {
        if (el.removeEventListener) {
          el.removeEventListener(type, fn, false);
        } else if (el.attachEvent) {
          fn = el.hcEventsIE[fn.toString()];
          el.detachEvent('on' + type, fn);
        }
      }

      function removeAllEvents() {
        var types,
          len,
          n;
        if (!el.nodeName) {
          return;
        }
        if (type) {
          types = {};
          types[type] = true;
        } else {
          types = hcEvents;
        }
        for (n in types) {
          if (hcEvents[n]) {
            len = hcEvents[n].length;
            while (len--) {
              removeOneEvent(n, hcEvents[n][len]);
            }
          }
        }
      }
      if (hcEvents) {
        if (type) {
          events = hcEvents[type] || [];
          if (fn) {
            index = H.inArray(fn, events);
            if (index > -1) {
              events.splice(index, 1);
              hcEvents[type] = events;
            }
            removeOneEvent(type, fn);
          } else {
            removeAllEvents();
            hcEvents[type] = [];
          }
        } else {
          removeAllEvents();
          el.hcEvents = {};
        }
      }
    };
    H.fireEvent = function(el, type, eventArguments, defaultFunction) {
      var e,
        hcEvents = el.hcEvents,
        events,
        len,
        i,
        fn;
      eventArguments = eventArguments || {};
      if (doc.createEvent && (el.dispatchEvent || el.fireEvent)) {
        e = doc.createEvent('Events');
        e.initEvent(type, true, true);
        H.extend(e, eventArguments);
        if (el.dispatchEvent) {
          el.dispatchEvent(e);
        } else {
          el.fireEvent(type, e);
        }
      } else if (hcEvents) {
        events = hcEvents[type] || [];
        len = events.length;
        if (!eventArguments.target) {
          H.extend(eventArguments, {
            preventDefault: function() {
              eventArguments.defaultPrevented = true;
            },
            target: el,
            type: type
          });
        }
        for (i = 0; i < len; i++) {
          fn = events[i];
          if (fn && fn.call(el, eventArguments) === false) {
            eventArguments.preventDefault();
          }
        }
      }
      if (defaultFunction && !eventArguments.defaultPrevented) {
        defaultFunction(eventArguments);
      }
    };
    H.animate = function(el, params, opt) {
      var start,
        unit = '',
        end,
        fx,
        args,
        prop;
      if (!H.isObject(opt)) {
        args = arguments;
        opt = {
          duration: args[2],
          easing: args[3],
          complete: args[4]
        };
      }
      if (!H.isNumber(opt.duration)) {
        opt.duration = 400;
      }
      opt.easing = typeof opt.easing === 'function' ?
        opt.easing :
        (Math[opt.easing] || Math.easeInOutSine);
      opt.curAnim = H.merge(params);
      for (prop in params) {
        H.stop(el, prop);
        fx = new H.Fx(el, opt, prop);
        end = null;
        if (prop === 'd') {
          fx.paths = fx.initPath(
            el,
            el.d,
            params.d
          );
          fx.toD = params.d;
          start = 0;
          end = 1;
        } else if (el.attr) {
          start = el.attr(prop);
        } else {
          start = parseFloat(H.getStyle(el, prop)) || 0;
          if (prop !== 'opacity') {
            unit = 'px';
          }
        }
        if (!end) {
          end = params[prop];
        }
        if (end.match && end.match('px')) {
          end = end.replace(/px/g, '');
        }
        fx.run(start, end, unit);
      }
    };
    H.seriesType = function(type, parent, options, props, pointProps) {
      var defaultOptions = H.getOptions(),
        seriesTypes = H.seriesTypes;
      defaultOptions.plotOptions[type] = H.merge(
        defaultOptions.plotOptions[parent],
        options
      );
      seriesTypes[type] = H.extendClass(seriesTypes[parent] ||
        function() {}, props);
      seriesTypes[type].prototype.type = type;
      if (pointProps) {
        seriesTypes[type].prototype.pointClass =
          H.extendClass(H.Point, pointProps);
      }
      return seriesTypes[type];
    };
    H.uniqueKey = (function() {
      var uniqueKeyHash = Math.random().toString(36).substring(2, 9),
        idCounter = 0;
      return function() {
        return 'highcharts-' + uniqueKeyHash + '-' + idCounter++;
      };
    }());
    if (win.jQuery) {
      win.jQuery.fn.highcharts = function() {
        var args = [].slice.call(arguments);
        if (this[0]) {
          if (args[0]) {
            new H[
              H.isString(args[0]) ? args.shift() : 'Chart'
            ](this[0], args[0], args[1]);
            return this;
          }
          return charts[H.attr(this[0], 'data-highcharts-chart')];
        }
      };
    }
    if (doc && !doc.defaultView) {
      H.getStyle = function(el, prop) {
        var val,
          alias = {
            width: 'clientWidth',
            height: 'clientHeight'
          }[prop];
        if (el.style[prop]) {
          return H.pInt(el.style[prop]);
        }
        if (prop === 'opacity') {
          prop = 'filter';
        }
        if (alias) {
          el.style.zoom = 1;
          return Math.max(el[alias] - 2 * H.getStyle(el, 'padding'), 0);
        }
        val = el.currentStyle[prop.replace(/\-(\w)/g, function(a, b) {
          return b.toUpperCase();
        })];
        if (prop === 'filter') {
          val = val.replace(
            /alpha\(opacity=([0-9]+)\)/,
            function(a, b) {
              return b / 100;
            }
          );
        }
        return val === '' ? 1 : H.pInt(val);
      };
    }
    if (!Array.prototype.forEach) {
      H.each = function(arr, fn, ctx) {
        var i = 0,
          len = arr.length;
        for (; i < len; i++) {
          if (fn.call(ctx, arr[i], i, arr) === false) {
            return i;
          }
        }
      };
    }
    if (!Array.prototype.indexOf) {
      H.inArray = function(item, arr) {
        var len,
          i = 0;
        if (arr) {
          len = arr.length;
          for (; i < len; i++) {
            if (arr[i] === item) {
              return i;
            }
          }
        }
        return -1;
      };
    }
    if (!Array.prototype.filter) {
      H.grep = function(elements, fn) {
        var ret = [],
          i = 0,
          length = elements.length;
        for (; i < length; i++) {
          if (fn(elements[i], i)) {
            ret.push(elements[i]);
          }
        }
        return ret;
      };
    }
    if (!Array.prototype.find) {
      H.find = function(arr, fn) {
        var i,
          length = arr.length;
        for (i = 0; i < length; i++) {
          if (fn(arr[i], i)) {
            return arr[i];
          }
        }
      };
    }
  }(Highcharts));
  (function(H) {
    'use strict';
    var each = H.each,
      isNumber = H.isNumber,
      map = H.map,
      merge = H.merge,
      pInt = H.pInt;
    H.Color = function(input) {
      if (!(this instanceof H.Color)) {
        return new H.Color(input);
      }
      this.init(input);
    };
    H.Color.prototype = {
      parsers: [{
        regex: /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]?(?:\.[0-9]+)?)\s*\)/,
        parse: function(result) {
          return [pInt(result[1]), pInt(result[2]), pInt(result[3]), parseFloat(result[4], 10)];
        }
      }, {
        regex: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
        parse: function(result) {
          return [pInt(result[1], 16), pInt(result[2], 16), pInt(result[3], 16), 1];
        }
      }, {
        regex: /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/,
        parse: function(result) {
          return [pInt(result[1]), pInt(result[2]), pInt(result[3]), 1];
        }
      }],
      names: {
        white: '#ffffff',
        black: '#000000'
      },
      init: function(input) {
        var result,
          rgba,
          i,
          parser;
        this.input = input = this.names[input] || input;
        if (input && input.stops) {
          this.stops = map(input.stops, function(stop) {
            return new H.Color(stop[1]);
          });
        } else {
          i = this.parsers.length;
          while (i-- && !rgba) {
            parser = this.parsers[i];
            result = parser.regex.exec(input);
            if (result) {
              rgba = parser.parse(result);
            }
          }
        }
        this.rgba = rgba || [];
      },
      get: function(format) {
        var input = this.input,
          rgba = this.rgba,
          ret;
        if (this.stops) {
          ret = merge(input);
          ret.stops = [].concat(ret.stops);
          each(this.stops, function(stop, i) {
            ret.stops[i] = [ret.stops[i][0], stop.get(format)];
          });
        } else if (rgba && isNumber(rgba[0])) {
          if (format === 'rgb' || (!format && rgba[3] === 1)) {
            ret = 'rgb(' + rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ')';
          } else if (format === 'a') {
            ret = rgba[3];
          } else {
            ret = 'rgba(' + rgba.join(',') + ')';
          }
        } else {
          ret = input;
        }
        return ret;
      },
      brighten: function(alpha) {
        var i,
          rgba = this.rgba;
        if (this.stops) {
          each(this.stops, function(stop) {
            stop.brighten(alpha);
          });
        } else if (isNumber(alpha) && alpha !== 0) {
          for (i = 0; i < 3; i++) {
            rgba[i] += pInt(alpha * 255);
            if (rgba[i] < 0) {
              rgba[i] = 0;
            }
            if (rgba[i] > 255) {
              rgba[i] = 255;
            }
          }
        }
        return this;
      },
      setOpacity: function(alpha) {
        this.rgba[3] = alpha;
        return this;
      }
    };
    H.color = function(input) {
      return new H.Color(input);
    };
  }(Highcharts));
  (function(H) {
    'use strict';
    var SVGElement,
      SVGRenderer,
      addEvent = H.addEvent,
      animate = H.animate,
      attr = H.attr,
      charts = H.charts,
      color = H.color,
      css = H.css,
      createElement = H.createElement,
      defined = H.defined,
      deg2rad = H.deg2rad,
      destroyObjectProperties = H.destroyObjectProperties,
      doc = H.doc,
      each = H.each,
      extend = H.extend,
      erase = H.erase,
      grep = H.grep,
      hasTouch = H.hasTouch,
      inArray = H.inArray,
      isArray = H.isArray,
      isFirefox = H.isFirefox,
      isMS = H.isMS,
      isObject = H.isObject,
      isString = H.isString,
      isWebKit = H.isWebKit,
      merge = H.merge,
      noop = H.noop,
      pick = H.pick,
      pInt = H.pInt,
      removeEvent = H.removeEvent,
      splat = H.splat,
      stop = H.stop,
      svg = H.svg,
      SVG_NS = H.SVG_NS,
      symbolSizes = H.symbolSizes,
      win = H.win;
    SVGElement = H.SVGElement = function() {
      return this;
    };
    SVGElement.prototype = {
      opacity: 1,
      SVG_NS: SVG_NS,
      textProps: ['direction', 'fontSize', 'fontWeight', 'fontFamily',
        'fontStyle', 'color', 'lineHeight', 'width', 'textDecoration',
        'textOverflow', 'textOutline'
      ],
      init: function(renderer, nodeName) {
        this.element = nodeName === 'span' ?
          createElement(nodeName) :
          doc.createElementNS(this.SVG_NS, nodeName);
        this.renderer = renderer;
      },
      animate: function(params, options, complete) {
        var animOptions = H.animObject(
          pick(options, this.renderer.globalAnimation, true)
        );
        if (animOptions.duration !== 0) {
          if (complete) {
            animOptions.complete = complete;
          }
          animate(this, params, animOptions);
        } else {
          this.attr(params, null, complete);
        }
        return this;
      },
      colorGradient: function(color, prop, elem) {
        var renderer = this.renderer,
          colorObject,
          gradName,
          gradAttr,
          radAttr,
          gradients,
          gradientObject,
          stops,
          stopColor,
          stopOpacity,
          radialReference,
          n,
          id,
          key = [],
          value;
        if (color.linearGradient) {
          gradName = 'linearGradient';
        } else if (color.radialGradient) {
          gradName = 'radialGradient';
        }
        if (gradName) {
          gradAttr = color[gradName];
          gradients = renderer.gradients;
          stops = color.stops;
          radialReference = elem.radialReference;
          if (isArray(gradAttr)) {
            color[gradName] = gradAttr = {
              x1: gradAttr[0],
              y1: gradAttr[1],
              x2: gradAttr[2],
              y2: gradAttr[3],
              gradientUnits: 'userSpaceOnUse'
            };
          }
          if (gradName === 'radialGradient' && radialReference && !defined(gradAttr.gradientUnits)) {
            radAttr = gradAttr;
            gradAttr = merge(gradAttr,
              renderer.getRadialAttr(radialReference, radAttr), {
                gradientUnits: 'userSpaceOnUse'
              }
            );
          }
          for (n in gradAttr) {
            if (n !== 'id') {
              key.push(n, gradAttr[n]);
            }
          }
          for (n in stops) {
            key.push(stops[n]);
          }
          key = key.join(',');
          if (gradients[key]) {
            id = gradients[key].attr('id');
          } else {
            gradAttr.id = id = H.uniqueKey();
            gradients[key] = gradientObject = renderer.createElement(gradName)
              .attr(gradAttr)
              .add(renderer.defs);
            gradientObject.radAttr = radAttr;
            gradientObject.stops = [];
            each(stops, function(stop) {
              var stopObject;
              if (stop[1].indexOf('rgba') === 0) {
                colorObject = H.color(stop[1]);
                stopColor = colorObject.get('rgb');
                stopOpacity = colorObject.get('a');
              } else {
                stopColor = stop[1];
                stopOpacity = 1;
              }
              stopObject = renderer.createElement('stop').attr({
                offset: stop[0],
                'stop-color': stopColor,
                'stop-opacity': stopOpacity
              }).add(gradientObject);
              gradientObject.stops.push(stopObject);
            });
          }
          value = 'url(' + renderer.url + '#' + id + ')';
          elem.setAttribute(prop, value);
          elem.gradient = key;
          color.toString = function() {
            return value;
          };
        }
      },
      applyTextOutline: function(textOutline) {
        var elem = this.element,
          tspans,
          hasContrast = textOutline.indexOf('contrast') !== -1,
          styles = {},
          color,
          strokeWidth,
          firstRealChild;
        if (hasContrast) {
          styles.textOutline = textOutline = textOutline.replace(
            /contrast/g,
            this.renderer.getContrast(elem.style.fill)
          );
        }
        this.fakeTS = true;
        this.ySetter = this.xSetter;
        tspans = [].slice.call(elem.getElementsByTagName('tspan'));
        textOutline = textOutline.split(' ');
        color = textOutline[textOutline.length - 1];
        strokeWidth = textOutline[0];
        if (strokeWidth && strokeWidth !== 'none') {
          strokeWidth = strokeWidth.replace(
            /(^[\d\.]+)(.*?)$/g,
            function(match, digit, unit) {
              return (2 * digit) + unit;
            }
          );
          each(tspans, function(tspan) {
            if (tspan.getAttribute('class') === 'highcharts-text-outline') {
              erase(tspans, elem.removeChild(tspan));
            }
          });
          firstRealChild = elem.firstChild;
          each(tspans, function(tspan, y) {
            var clone;
            if (y === 0) {
              tspan.setAttribute('x', elem.getAttribute('x'));
              y = elem.getAttribute('y');
              tspan.setAttribute('y', y || 0);
              if (y === null) {
                elem.setAttribute('y', 0);
              }
            }
            clone = tspan.cloneNode(1);
            attr(clone, {
              'class': 'highcharts-text-outline',
              'fill': color,
              'stroke': color,
              'stroke-width': strokeWidth,
              'stroke-linejoin': 'round'
            });
            elem.insertBefore(clone, firstRealChild);
          });
        }
      },
      attr: function(hash, val, complete, continueAnimation) {
        var key,
          value,
          element = this.element,
          hasSetSymbolSize,
          ret = this,
          skipAttr,
          setter;
        if (typeof hash === 'string' && val !== undefined) {
          key = hash;
          hash = {};
          hash[key] = val;
        }
        if (typeof hash === 'string') {
          ret = (this[hash + 'Getter'] || this._defaultGetter).call(this, hash, element);
        } else {
          for (key in hash) {
            value = hash[key];
            skipAttr = false;
            if (!continueAnimation) {
              stop(this, key);
            }
            if (this.symbolName && /^(x|y|width|height|r|start|end|innerR|anchorX|anchorY)/.test(key)) {
              if (!hasSetSymbolSize) {
                this.symbolAttr(hash);
                hasSetSymbolSize = true;
              }
              skipAttr = true;
            }
            if (this.rotation && (key === 'x' || key === 'y')) {
              this.doTransform = true;
            }
            if (!skipAttr) {
              setter = this[key + 'Setter'] || this._defaultSetter;
              setter.call(this, value, key, element);
              if (this.shadows && /^(width|height|visibility|x|y|d|transform|cx|cy|r)$/.test(key)) {
                this.updateShadows(key, value, setter);
              }
            }
          }
          if (this.doTransform) {
            this.updateTransform();
            this.doTransform = false;
          }
        }
        if (complete) {
          complete();
        }
        return ret;
      },
      updateShadows: function(key, value, setter) {
        var shadows = this.shadows,
          i = shadows.length;
        while (i--) {
          setter.call(
            shadows[i],
            key === 'height' ?
            Math.max(value - (shadows[i].cutHeight || 0), 0) :
            key === 'd' ? this.d : value,
            key,
            shadows[i]
          );
        }
      },
      addClass: function(className, replace) {
        var currentClassName = this.attr('class') || '';
        if (currentClassName.indexOf(className) === -1) {
          if (!replace) {
            className =
              (currentClassName + (currentClassName ? ' ' : '') +
                className).replace('  ', ' ');
          }
          this.attr('class', className);
        }
        return this;
      },
      hasClass: function(className) {
        return attr(this.element, 'class').indexOf(className) !== -1;
      },
      removeClass: function(className) {
        attr(this.element, 'class', (attr(this.element, 'class') || '').replace(className, ''));
        return this;
      },
      symbolAttr: function(hash) {
        var wrapper = this;
        each(['x', 'y', 'r', 'start', 'end', 'width', 'height', 'innerR', 'anchorX', 'anchorY'], function(key) {
          wrapper[key] = pick(hash[key], wrapper[key]);
        });
        wrapper.attr({
          d: wrapper.renderer.symbols[wrapper.symbolName](
            wrapper.x,
            wrapper.y,
            wrapper.width,
            wrapper.height,
            wrapper
          )
        });
      },
      clip: function(clipRect) {
        return this.attr(
          'clip-path',
          clipRect ?
          'url(' + this.renderer.url + '#' + clipRect.id + ')' :
          'none'
        );
      },
      crisp: function(rect, strokeWidth) {
        var wrapper = this,
          key,
          attribs = {},
          normalizer;
        strokeWidth = strokeWidth || rect.strokeWidth || 0;
        normalizer = Math.round(strokeWidth) % 2 / 2;
        rect.x = Math.floor(rect.x || wrapper.x || 0) + normalizer;
        rect.y = Math.floor(rect.y || wrapper.y || 0) + normalizer;
        rect.width = Math.floor((rect.width || wrapper.width || 0) - 2 * normalizer);
        rect.height = Math.floor((rect.height || wrapper.height || 0) - 2 * normalizer);
        if (defined(rect.strokeWidth)) {
          rect.strokeWidth = strokeWidth;
        }
        for (key in rect) {
          if (wrapper[key] !== rect[key]) {
            wrapper[key] = attribs[key] = rect[key];
          }
        }
        return attribs;
      },
      css: function(styles) {
        var elemWrapper = this,
          oldStyles = elemWrapper.styles,
          newStyles = {},
          elem = elemWrapper.element,
          textWidth,
          n,
          serializedCss = '',
          hyphenate,
          hasNew = !oldStyles,
          svgPseudoProps = ['textOverflow', 'width'];
        if (styles && styles.color) {
          styles.fill = styles.color;
        }
        if (oldStyles) {
          for (n in styles) {
            if (styles[n] !== oldStyles[n]) {
              newStyles[n] = styles[n];
              hasNew = true;
            }
          }
        }
        if (hasNew) {
          textWidth = elemWrapper.textWidth =
            (styles && styles.width && elem.nodeName.toLowerCase() === 'text' && pInt(styles.width)) ||
            elemWrapper.textWidth;
          if (oldStyles) {
            styles = extend(
              oldStyles,
              newStyles
            );
          }
          elemWrapper.styles = styles;
          if (textWidth && (!svg && elemWrapper.renderer.forExport)) {
            delete styles.width;
          }
          if (isMS && !svg) {
            css(elemWrapper.element, styles);
          } else {
            hyphenate = function(a, b) {
              return '-' + b.toLowerCase();
            };
            for (n in styles) {
              if (inArray(n, svgPseudoProps) === -1) {
                serializedCss +=
                  n.replace(/([A-Z])/g, hyphenate) + ':' +
                  styles[n] + ';';
              }
            }
            if (serializedCss) {
              attr(elem, 'style', serializedCss);
            }
          }
          if (elemWrapper.added) {
            if (textWidth) {
              elemWrapper.renderer.buildText(elemWrapper);
            }
            if (styles && styles.textOutline) {
              elemWrapper.applyTextOutline(styles.textOutline);
            }
          }
        }
        return elemWrapper;
      },
      strokeWidth: function() {
        return this['stroke-width'] || 0;
      },
      on: function(eventType, handler) {
        var svgElement = this,
          element = svgElement.element;
        if (hasTouch && eventType === 'click') {
          element.ontouchstart = function(e) {
            svgElement.touchEventFired = Date.now();
            e.preventDefault();
            handler.call(element, e);
          };
          element.onclick = function(e) {
            if (win.navigator.userAgent.indexOf('Android') === -1 ||
              Date.now() - (svgElement.touchEventFired || 0) > 1100) {
              handler.call(element, e);
            }
          };
        } else {
          element['on' + eventType] = handler;
        }
        return this;
      },
      setRadialReference: function(coordinates) {
        var existingGradient = this.renderer.gradients[this.element.gradient];
        this.element.radialReference = coordinates;
        if (existingGradient && existingGradient.radAttr) {
          existingGradient.animate(
            this.renderer.getRadialAttr(
              coordinates,
              existingGradient.radAttr
            )
          );
        }
        return this;
      },
      translate: function(x, y) {
        return this.attr({
          translateX: x,
          translateY: y
        });
      },
      invert: function(inverted) {
        var wrapper = this;
        wrapper.inverted = inverted;
        wrapper.updateTransform();
        return wrapper;
      },
      updateTransform: function() {
        var wrapper = this,
          translateX = wrapper.translateX || 0,
          translateY = wrapper.translateY || 0,
          scaleX = wrapper.scaleX,
          scaleY = wrapper.scaleY,
          inverted = wrapper.inverted,
          rotation = wrapper.rotation,
          element = wrapper.element,
          transform;
        if (inverted) {
          translateX += wrapper.width;
          translateY += wrapper.height;
        }
        transform = ['translate(' + translateX + ',' + translateY + ')'];
        if (inverted) {
          transform.push('rotate(90) scale(-1,1)');
        } else if (rotation) {
          transform.push('rotate(' + rotation + ' ' + (element.getAttribute('x') || 0) + ' ' + (element.getAttribute('y') || 0) + ')');
        }
        if (defined(scaleX) || defined(scaleY)) {
          transform.push('scale(' + pick(scaleX, 1) + ' ' + pick(scaleY, 1) + ')');
        }
        if (transform.length) {
          element.setAttribute('transform', transform.join(' '));
        }
      },
      toFront: function() {
        var element = this.element;
        element.parentNode.appendChild(element);
        return this;
      },
      align: function(alignOptions, alignByTranslate, box) {
        var align,
          vAlign,
          x,
          y,
          attribs = {},
          alignTo,
          renderer = this.renderer,
          alignedObjects = renderer.alignedObjects,
          alignFactor,
          vAlignFactor;
        if (alignOptions) {
          this.alignOptions = alignOptions;
          this.alignByTranslate = alignByTranslate;
          if (!box || isString(box)) {
            this.alignTo = alignTo = box || 'renderer';
            erase(alignedObjects, this);
            alignedObjects.push(this);
            box = null;
          }
        } else {
          alignOptions = this.alignOptions;
          alignByTranslate = this.alignByTranslate;
          alignTo = this.alignTo;
        }
        box = pick(box, renderer[alignTo], renderer);
        align = alignOptions.align;
        vAlign = alignOptions.verticalAlign;
        x = (box.x || 0) + (alignOptions.x || 0);
        y = (box.y || 0) + (alignOptions.y || 0);
        if (align === 'right') {
          alignFactor = 1;
        } else if (align === 'center') {
          alignFactor = 2;
        }
        if (alignFactor) {
          x += (box.width - (alignOptions.width || 0)) / alignFactor;
        }
        attribs[alignByTranslate ? 'translateX' : 'x'] = Math.round(x);
        if (vAlign === 'bottom') {
          vAlignFactor = 1;
        } else if (vAlign === 'middle') {
          vAlignFactor = 2;
        }
        if (vAlignFactor) {
          y += (box.height - (alignOptions.height || 0)) / vAlignFactor;
        }
        attribs[alignByTranslate ? 'translateY' : 'y'] = Math.round(y);
        this[this.placed ? 'animate' : 'attr'](attribs);
        this.placed = true;
        this.alignAttr = attribs;
        return this;
      },
      getBBox: function(reload, rot) {
        var wrapper = this,
          bBox,
          renderer = wrapper.renderer,
          width,
          height,
          rotation,
          rad,
          element = wrapper.element,
          styles = wrapper.styles,
          fontSize,
          textStr = wrapper.textStr,
          toggleTextShadowShim,
          cache = renderer.cache,
          cacheKeys = renderer.cacheKeys,
          cacheKey;
        rotation = pick(rot, wrapper.rotation);
        rad = rotation * deg2rad;
        fontSize = styles && styles.fontSize;
        if (textStr !== undefined) {
          cacheKey = textStr.toString();
          if (cacheKey.indexOf('<') === -1) {
            cacheKey = cacheKey.replace(/[0-9]/g, '0');
          }
          cacheKey += [
              '',
              rotation || 0,
              fontSize,
              styles && styles.width,
              styles && styles.textOverflow
            ]
            .join(',');
        }
        if (cacheKey && !reload) {
          bBox = cache[cacheKey];
        }
        if (!bBox) {
          if (element.namespaceURI === wrapper.SVG_NS || renderer.forExport) {
            try {
              toggleTextShadowShim = this.fakeTS && function(display) {
                each(element.querySelectorAll('.highcharts-text-outline'), function(tspan) {
                  tspan.style.display = display;
                });
              };
              if (toggleTextShadowShim) {
                toggleTextShadowShim('none');
              }
              bBox = element.getBBox ?
                extend({}, element.getBBox()) : {
                  width: element.offsetWidth,
                  height: element.offsetHeight
                };
              if (toggleTextShadowShim) {
                toggleTextShadowShim('');
              }
            } catch (e) {}
            if (!bBox || bBox.width < 0) {
              bBox = {
                width: 0,
                height: 0
              };
            }
          } else {
            bBox = wrapper.htmlGetBBox();
          }
          if (renderer.isSVG) {
            width = bBox.width;
            height = bBox.height;
            if (
              styles &&
              styles.fontSize === '11px' &&
              Math.round(height) === 17
            ) {
              bBox.height = height = 14;
            }
            if (rotation) {
              bBox.width = Math.abs(height * Math.sin(rad)) + Math.abs(width * Math.cos(rad));
              bBox.height = Math.abs(height * Math.cos(rad)) + Math.abs(width * Math.sin(rad));
            }
          }
          if (cacheKey && bBox.height > 0) {
            while (cacheKeys.length > 250) {
              delete cache[cacheKeys.shift()];
            }
            if (!cache[cacheKey]) {
              cacheKeys.push(cacheKey);
            }
            cache[cacheKey] = bBox;
          }
        }
        return bBox;
      },
      show: function(inherit) {
        return this.attr({
          visibility: inherit ? 'inherit' : 'visible'
        });
      },
      hide: function() {
        return this.attr({
          visibility: 'hidden'
        });
      },
      fadeOut: function(duration) {
        var elemWrapper = this;
        elemWrapper.animate({
          opacity: 0
        }, {
          duration: duration || 150,
          complete: function() {
            elemWrapper.attr({
              y: -9999
            });
          }
        });
      },
      add: function(parent) {
        var renderer = this.renderer,
          element = this.element,
          inserted;
        if (parent) {
          this.parentGroup = parent;
        }
        this.parentInverted = parent && parent.inverted;
        if (this.textStr !== undefined) {
          renderer.buildText(this);
        }
        this.added = true;
        if (!parent || parent.handleZ || this.zIndex) {
          inserted = this.zIndexSetter();
        }
        if (!inserted) {
          (parent ? parent.element : renderer.box).appendChild(element);
        }
        if (this.onAdd) {
          this.onAdd();
        }
        return this;
      },
      safeRemoveChild: function(element) {
        var parentNode = element.parentNode;
        if (parentNode) {
          parentNode.removeChild(element);
        }
      },
      destroy: function() {
        var wrapper = this,
          element = wrapper.element || {},
          parentToClean = wrapper.renderer.isSVG && element.nodeName === 'SPAN' && wrapper.parentGroup,
          grandParent,
          key,
          i;
        element.onclick = element.onmouseout = element.onmouseover = element.onmousemove = element.point = null;
        stop(wrapper);
        if (wrapper.clipPath) {
          wrapper.clipPath = wrapper.clipPath.destroy();
        }
        if (wrapper.stops) {
          for (i = 0; i < wrapper.stops.length; i++) {
            wrapper.stops[i] = wrapper.stops[i].destroy();
          }
          wrapper.stops = null;
        }
        wrapper.safeRemoveChild(element);
        wrapper.destroyShadows();
        while (parentToClean && parentToClean.div && parentToClean.div.childNodes.length === 0) {
          grandParent = parentToClean.parentGroup;
          wrapper.safeRemoveChild(parentToClean.div);
          delete parentToClean.div;
          parentToClean = grandParent;
        }
        if (wrapper.alignTo) {
          erase(wrapper.renderer.alignedObjects, wrapper);
        }
        for (key in wrapper) {
          delete wrapper[key];
        }
        return null;
      },
      shadow: function(shadowOptions, group, cutOff) {
        var shadows = [],
          i,
          shadow,
          element = this.element,
          strokeWidth,
          shadowWidth,
          shadowElementOpacity,
          transform;
        if (!shadowOptions) {
          this.destroyShadows();
        } else if (!this.shadows) {
          shadowWidth = pick(shadowOptions.width, 3);
          shadowElementOpacity = (shadowOptions.opacity || 0.15) / shadowWidth;
          transform = this.parentInverted ?
            '(-1,-1)' :
            '(' + pick(shadowOptions.offsetX, 1) + ', ' + pick(shadowOptions.offsetY, 1) + ')';
          for (i = 1; i <= shadowWidth; i++) {
            shadow = element.cloneNode(0);
            strokeWidth = (shadowWidth * 2) + 1 - (2 * i);
            attr(shadow, {
              'isShadow': 'true',
              'stroke': shadowOptions.color || '#000000',
              'stroke-opacity': shadowElementOpacity * i,
              'stroke-width': strokeWidth,
              'transform': 'translate' + transform,
              'fill': 'none'
            });
            if (cutOff) {
              attr(shadow, 'height', Math.max(attr(shadow, 'height') - strokeWidth, 0));
              shadow.cutHeight = strokeWidth;
            }
            if (group) {
              group.element.appendChild(shadow);
            } else {
              element.parentNode.insertBefore(shadow, element);
            }
            shadows.push(shadow);
          }
          this.shadows = shadows;
        }
        return this;
      },
      destroyShadows: function() {
        each(this.shadows || [], function(shadow) {
          this.safeRemoveChild(shadow);
        }, this);
        this.shadows = undefined;
      },
      xGetter: function(key) {
        if (this.element.nodeName === 'circle') {
          if (key === 'x') {
            key = 'cx';
          } else if (key === 'y') {
            key = 'cy';
          }
        }
        return this._defaultGetter(key);
      },
      _defaultGetter: function(key) {
        var ret = pick(this[key], this.element ? this.element.getAttribute(key) : null, 0);
        if (/^[\-0-9\.]+$/.test(ret)) {
          ret = parseFloat(ret);
        }
        return ret;
      },
      dSetter: function(value, key, element) {
        if (value && value.join) {
          value = value.join(' ');
        }
        if (/(NaN| {2}|^$)/.test(value)) {
          value = 'M 0 0';
        }
        element.setAttribute(key, value);
        this[key] = value;
      },
      dashstyleSetter: function(value) {
        var i,
          strokeWidth = this['stroke-width'];
        if (strokeWidth === 'inherit') {
          strokeWidth = 1;
        }
        value = value && value.toLowerCase();
        if (value) {
          value = value
            .replace('shortdashdotdot', '3,1,1,1,1,1,')
            .replace('shortdashdot', '3,1,1,1')
            .replace('shortdot', '1,1,')
            .replace('shortdash', '3,1,')
            .replace('longdash', '8,3,')
            .replace(/dot/g, '1,3,')
            .replace('dash', '4,3,')
            .replace(/,$/, '')
            .split(',');
          i = value.length;
          while (i--) {
            value[i] = pInt(value[i]) * strokeWidth;
          }
          value = value.join(',')
            .replace(/NaN/g, 'none');
          this.element.setAttribute('stroke-dasharray', value);
        }
      },
      alignSetter: function(value) {
        var convert = {
          left: 'start',
          center: 'middle',
          right: 'end'
        };
        this.element.setAttribute('text-anchor', convert[value]);
      },
      opacitySetter: function(value, key, element) {
        this[key] = value;
        element.setAttribute(key, value);
      },
      titleSetter: function(value) {
        var titleNode = this.element.getElementsByTagName('title')[0];
        if (!titleNode) {
          titleNode = doc.createElementNS(this.SVG_NS, 'title');
          this.element.appendChild(titleNode);
        }
        if (titleNode.firstChild) {
          titleNode.removeChild(titleNode.firstChild);
        }
        titleNode.appendChild(
          doc.createTextNode(
            (String(pick(value), '')).replace(/<[^>]*>/g, '')
          )
        );
      },
      textSetter: function(value) {
        if (value !== this.textStr) {
          delete this.bBox;
          this.textStr = value;
          if (this.added) {
            this.renderer.buildText(this);
          }
        }
      },
      fillSetter: function(value, key, element) {
        if (typeof value === 'string') {
          element.setAttribute(key, value);
        } else if (value) {
          this.colorGradient(value, key, element);
        }
      },
      visibilitySetter: function(value, key, element) {
        if (value === 'inherit') {
          element.removeAttribute(key);
        } else {
          element.setAttribute(key, value);
        }
      },
      zIndexSetter: function(value, key) {
        var renderer = this.renderer,
          parentGroup = this.parentGroup,
          parentWrapper = parentGroup || renderer,
          parentNode = parentWrapper.element || renderer.box,
          childNodes,
          otherElement,
          otherZIndex,
          element = this.element,
          inserted,
          run = this.added,
          i;
        if (defined(value)) {
          element.zIndex = value;
          value = +value;
          if (this[key] === value) {
            run = false;
          }
          this[key] = value;
        }
        if (run) {
          value = this.zIndex;
          if (value && parentGroup) {
            parentGroup.handleZ = true;
          }
          childNodes = parentNode.childNodes;
          for (i = 0; i < childNodes.length && !inserted; i++) {
            otherElement = childNodes[i];
            otherZIndex = otherElement.zIndex;
            if (otherElement !== element && (
                pInt(otherZIndex) > value ||
                (!defined(value) && defined(otherZIndex)) ||
                (value < 0 && !defined(otherZIndex) && parentNode !== renderer.box)
              )) {
              parentNode.insertBefore(element, otherElement);
              inserted = true;
            }
          }
          if (!inserted) {
            parentNode.appendChild(element);
          }
        }
        return inserted;
      },
      _defaultSetter: function(value, key, element) {
        element.setAttribute(key, value);
      }
    };
    SVGElement.prototype.yGetter = SVGElement.prototype.xGetter;
    SVGElement.prototype.translateXSetter = SVGElement.prototype.translateYSetter =
      SVGElement.prototype.rotationSetter = SVGElement.prototype.verticalAlignSetter =
      SVGElement.prototype.scaleXSetter = SVGElement.prototype.scaleYSetter = function(value, key) {
        this[key] = value;
        this.doTransform = true;
      };
    SVGElement.prototype['stroke-widthSetter'] = SVGElement.prototype.strokeSetter = function(value, key, element) {
      this[key] = value;
      if (this.stroke && this['stroke-width']) {
        SVGElement.prototype.fillSetter.call(this, this.stroke, 'stroke', element);
        element.setAttribute('stroke-width', this['stroke-width']);
        this.hasStroke = true;
      } else if (key === 'stroke-width' && value === 0 && this.hasStroke) {
        element.removeAttribute('stroke');
        this.hasStroke = false;
      }
    };
    SVGRenderer = H.SVGRenderer = function() {
      this.init.apply(this, arguments);
    };
    SVGRenderer.prototype = {
      Element: SVGElement,
      SVG_NS: SVG_NS,
      init: function(container, width, height, style, forExport, allowHTML) {
        var renderer = this,
          boxWrapper,
          element,
          desc;
        boxWrapper = renderer.createElement('svg')
          .attr({
            'version': '1.1',
            'class': 'highcharts-root'
          })
          .css(this.getStyle(style));
        element = boxWrapper.element;
        container.appendChild(element);
        if (container.innerHTML.indexOf('xmlns') === -1) {
          attr(element, 'xmlns', this.SVG_NS);
        }
        renderer.isSVG = true;
        this.box = element;
        this.boxWrapper = boxWrapper;
        renderer.alignedObjects = [];
        this.url = (isFirefox || isWebKit) && doc.getElementsByTagName('base').length ?
          win.location.href
          .replace(/#.*?$/, '')
          .replace(/<[^>]*>/g, '')
          .replace(/([\('\)])/g, '\\$1')
          .replace(/ /g, '%20') :
          '';
        desc = this.createElement('desc').add();
        desc.element.appendChild(doc.createTextNode('Created with Highstock 5.0.7'));
        renderer.defs = this.createElement('defs').add();
        renderer.allowHTML = allowHTML;
        renderer.forExport = forExport;
        renderer.gradients = {};
        renderer.cache = {};
        renderer.cacheKeys = [];
        renderer.imgCount = 0;
        renderer.setSize(width, height, false);
        var subPixelFix, rect;
        if (isFirefox && container.getBoundingClientRect) {
          subPixelFix = function() {
            css(container, {
              left: 0,
              top: 0
            });
            rect = container.getBoundingClientRect();
            css(container, {
              left: (Math.ceil(rect.left) - rect.left) + 'px',
              top: (Math.ceil(rect.top) - rect.top) + 'px'
            });
          };
          subPixelFix();
          renderer.unSubPixelFix = addEvent(win, 'resize', subPixelFix);
        }
      },
      getStyle: function(style) {
        this.style = extend({
          fontFamily: '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
          fontSize: '12px'
        }, style);
        return this.style;
      },
      setStyle: function(style) {
        this.boxWrapper.css(this.getStyle(style));
      },
      isHidden: function() {
        return !this.boxWrapper.getBBox().width;
      },
      destroy: function() {
        var renderer = this,
          rendererDefs = renderer.defs;
        renderer.box = null;
        renderer.boxWrapper = renderer.boxWrapper.destroy();
        destroyObjectProperties(renderer.gradients || {});
        renderer.gradients = null;
        if (rendererDefs) {
          renderer.defs = rendererDefs.destroy();
        }
        if (renderer.unSubPixelFix) {
          renderer.unSubPixelFix();
        }
        renderer.alignedObjects = null;
        return null;
      },
      createElement: function(nodeName) {
        var wrapper = new this.Element();
        wrapper.init(this, nodeName);
        return wrapper;
      },
      draw: noop,
      getRadialAttr: function(radialReference, gradAttr) {
        return {
          cx: (radialReference[0] - radialReference[2] / 2) + gradAttr.cx * radialReference[2],
          cy: (radialReference[1] - radialReference[2] / 2) + gradAttr.cy * radialReference[2],
          r: gradAttr.r * radialReference[2]
        };
      },
      buildText: function(wrapper) {
        var textNode = wrapper.element,
          renderer = this,
          forExport = renderer.forExport,
          textStr = pick(wrapper.textStr, '').toString(),
          hasMarkup = textStr.indexOf('<') !== -1,
          lines,
          childNodes = textNode.childNodes,
          clsRegex,
          styleRegex,
          hrefRegex,
          wasTooLong,
          parentX = attr(textNode, 'x'),
          textStyles = wrapper.styles,
          width = wrapper.textWidth,
          textLineHeight = textStyles && textStyles.lineHeight,
          textOutline = textStyles && textStyles.textOutline,
          ellipsis = textStyles && textStyles.textOverflow === 'ellipsis',
          noWrap = textStyles && textStyles.whiteSpace === 'nowrap',
          fontSize = textStyles && textStyles.fontSize,
          textCache,
          i = childNodes.length,
          tempParent = width && !wrapper.added && this.box,
          getLineHeight = function(tspan) {
            var fontSizeStyle;
            fontSizeStyle = /(px|em)$/.test(tspan && tspan.style.fontSize) ?
              tspan.style.fontSize :
              (fontSize || renderer.style.fontSize || 12);
            return textLineHeight ?
              pInt(textLineHeight) :
              renderer.fontMetrics(
                fontSizeStyle,
                tspan.getAttribute('style') ? tspan : textNode
              ).h;
          },
          unescapeAngleBrackets = function(inputStr) {
            return inputStr.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
          };
        textCache = [
          textStr,
          ellipsis,
          noWrap,
          textLineHeight,
          textOutline,
          fontSize,
          width
        ].join(',');
        if (textCache === wrapper.textCache) {
          return;
        }
        wrapper.textCache = textCache;
        while (i--) {
          textNode.removeChild(childNodes[i]);
        }
        if (!hasMarkup && !textOutline && !ellipsis && !width && textStr.indexOf(' ') === -1) {
          textNode.appendChild(doc.createTextNode(unescapeAngleBrackets(textStr)));
        } else {
          clsRegex = /<.*class="([^"]+)".*>/;
          styleRegex = /<.*style="([^"]+)".*>/;
          hrefRegex = /<.*href="(http[^"]+)".*>/;
          if (tempParent) {
            tempParent.appendChild(textNode);
          }
          if (hasMarkup) {
            lines = textStr
              .replace(/<(b|strong)>/g, '<span style="font-weight:bold">')
              .replace(/<(i|em)>/g, '<span style="font-style:italic">')
              .replace(/<a/g, '<span')
              .replace(/<\/(b|strong|i|em|a)>/g, '</span>')
              .split(/<br.*?>/g);
          } else {
            lines = [textStr];
          }
          lines = grep(lines, function(line) {
            return line !== '';
          });
          each(lines, function buildTextLines(line, lineNo) {
            var spans,
              spanNo = 0;
            line = line
              .replace(/^\s+|\s+$/g, '')
              .replace(/<span/g, '|||<span')
              .replace(/<\/span>/g, '</span>|||');
            spans = line.split('|||');
            each(spans, function buildTextSpans(span) {
              if (span !== '' || spans.length === 1) {
                var attributes = {},
                  tspan = doc.createElementNS(renderer.SVG_NS, 'tspan'),
                  spanCls,
                  spanStyle;
                if (clsRegex.test(span)) {
                  spanCls = span.match(clsRegex)[1];
                  attr(tspan, 'class', spanCls);
                }
                if (styleRegex.test(span)) {
                  spanStyle = span.match(styleRegex)[1].replace(/(;| |^)color([ :])/, '$1fill$2');
                  attr(tspan, 'style', spanStyle);
                }
                if (hrefRegex.test(span) && !forExport) {
                  attr(tspan, 'onclick', 'location.href=\"' + span.match(hrefRegex)[1] + '\"');
                  css(tspan, {
                    cursor: 'pointer'
                  });
                }
                span = unescapeAngleBrackets(span.replace(/<(.|\n)*?>/g, '') || ' ');
                if (span !== ' ') {
                  tspan.appendChild(doc.createTextNode(span));
                  if (!spanNo) {
                    if (lineNo && parentX !== null) {
                      attributes.x = parentX;
                    }
                  } else {
                    attributes.dx = 0;
                  }
                  attr(tspan, attributes);
                  textNode.appendChild(tspan);
                  if (!spanNo && lineNo) {
                    if (!svg && forExport) {
                      css(tspan, {
                        display: 'block'
                      });
                    }
                    attr(
                      tspan,
                      'dy',
                      getLineHeight(tspan)
                    );
                  }
                  if (width) {
                    var words = span.replace(/([^\^])-/g, '$1- ').split(' '),
                      hasWhiteSpace = spans.length > 1 || lineNo || (words.length > 1 && !noWrap),
                      tooLong,
                      actualWidth,
                      rest = [],
                      dy = getLineHeight(tspan),
                      rotation = wrapper.rotation,
                      wordStr = span,
                      cursor = wordStr.length,
                      bBox;
                    while ((hasWhiteSpace || ellipsis) && (words.length || rest.length)) {
                      wrapper.rotation = 0;
                      bBox = wrapper.getBBox(true);
                      actualWidth = bBox.width;
                      if (!svg && renderer.forExport) {
                        actualWidth = renderer.measureSpanWidth(tspan.firstChild.data, wrapper.styles);
                      }
                      tooLong = actualWidth > width;
                      if (wasTooLong === undefined) {
                        wasTooLong = tooLong;
                      }
                      if (ellipsis && wasTooLong) {
                        cursor /= 2;
                        if (wordStr === '' || (!tooLong && cursor < 0.5)) {
                          words = [];
                        } else {
                          wordStr = span.substring(0, wordStr.length + (tooLong ? -1 : 1) * Math.ceil(cursor));
                          words = [wordStr + (width > 3 ? '\u2026' : '')];
                          tspan.removeChild(tspan.firstChild);
                        }
                      } else if (!tooLong || words.length === 1) {
                        words = rest;
                        rest = [];
                        if (words.length && !noWrap) {
                          tspan = doc.createElementNS(SVG_NS, 'tspan');
                          attr(tspan, {
                            dy: dy,
                            x: parentX
                          });
                          if (spanStyle) {
                            attr(tspan, 'style', spanStyle);
                          }
                          textNode.appendChild(tspan);
                        }
                        if (actualWidth > width) {
                          width = actualWidth;
                        }
                      } else {
                        tspan.removeChild(tspan.firstChild);
                        rest.unshift(words.pop());
                      }
                      if (words.length) {
                        tspan.appendChild(doc.createTextNode(words.join(' ').replace(/- /g, '-')));
                      }
                    }
                    wrapper.rotation = rotation;
                  }
                  spanNo++;
                }
              }
            });
          });
          if (wasTooLong) {
            wrapper.attr('title', wrapper.textStr);
          }
          if (tempParent) {
            tempParent.removeChild(textNode);
          }
          if (textOutline && wrapper.applyTextOutline) {
            wrapper.applyTextOutline(textOutline);
          }
        }
      },
      getContrast: function(rgba) {
        rgba = color(rgba).rgba;
        return rgba[0] + rgba[1] + rgba[2] > 2 * 255 ? '#000000' : '#FFFFFF';
      },
      button: function(text, x, y, callback, normalState, hoverState, pressedState, disabledState, shape) {
        var label = this.label(text, x, y, shape, null, null, null, null, 'button'),
          curState = 0;
        label.attr(merge({
          'padding': 8,
          'r': 2
        }, normalState));
        var normalStyle,
          hoverStyle,
          pressedStyle,
          disabledStyle;
        normalState = merge({
          fill: '#f7f7f7',
          stroke: '#cccccc',
          'stroke-width': 1,
          style: {
            color: '#333333',
            cursor: 'pointer',
            fontWeight: 'normal'
          }
        }, normalState);
        normalStyle = normalState.style;
        delete normalState.style;
        hoverState = merge(normalState, {
          fill: '#e6e6e6'
        }, hoverState);
        hoverStyle = hoverState.style;
        delete hoverState.style;
        pressedState = merge(normalState, {
          fill: '#e6ebf5',
          style: {
            color: '#000000',
            fontWeight: 'bold'
          }
        }, pressedState);
        pressedStyle = pressedState.style;
        delete pressedState.style;
        disabledState = merge(normalState, {
          style: {
            color: '#cccccc'
          }
        }, disabledState);
        disabledStyle = disabledState.style;
        delete disabledState.style;
        addEvent(label.element, isMS ? 'mouseover' : 'mouseenter', function() {
          if (curState !== 3) {
            label.setState(1);
          }
        });
        addEvent(label.element, isMS ? 'mouseout' : 'mouseleave', function() {
          if (curState !== 3) {
            label.setState(curState);
          }
        });
        label.setState = function(state) {
          if (state !== 1) {
            label.state = curState = state;
          }
          label.removeClass(/highcharts-button-(normal|hover|pressed|disabled)/)
            .addClass('highcharts-button-' + ['normal', 'hover', 'pressed', 'disabled'][state || 0]);
          label.attr([normalState, hoverState, pressedState, disabledState][state || 0])
            .css([normalStyle, hoverStyle, pressedStyle, disabledStyle][state || 0]);
        };
        label
          .attr(normalState)
          .css(extend({
            cursor: 'default'
          }, normalStyle));
        return label
          .on('click', function(e) {
            if (curState !== 3) {
              callback.call(label, e);
            }
          });
      },
      crispLine: function(points, width) {
        if (points[1] === points[4]) {
          points[1] = points[4] = Math.round(points[1]) - (width % 2 / 2);
        }
        if (points[2] === points[5]) {
          points[2] = points[5] = Math.round(points[2]) + (width % 2 / 2);
        }
        return points;
      },
      path: function(path) {
        var attribs = {
          fill: 'none'
        };
        if (isArray(path)) {
          attribs.d = path;
        } else if (isObject(path)) {
          extend(attribs, path);
        }
        return this.createElement('path').attr(attribs);
      },
      circle: function(x, y, r) {
        var attribs = isObject(x) ? x : {
            x: x,
            y: y,
            r: r
          },
          wrapper = this.createElement('circle');
        wrapper.xSetter = wrapper.ySetter = function(value, key, element) {
          element.setAttribute('c' + key, value);
        };
        return wrapper.attr(attribs);
      },
      arc: function(x, y, r, innerR, start, end) {
        var arc;
        if (isObject(x)) {
          y = x.y;
          r = x.r;
          innerR = x.innerR;
          start = x.start;
          end = x.end;
          x = x.x;
        }
        arc = this.symbol('arc', x || 0, y || 0, r || 0, r || 0, {
          innerR: innerR || 0,
          start: start || 0,
          end: end || 0
        });
        arc.r = r;
        return arc;
      },
      rect: function(x, y, width, height, r, strokeWidth) {
        r = isObject(x) ? x.r : r;
        var wrapper = this.createElement('rect'),
          attribs = isObject(x) ? x : x === undefined ? {} : {
            x: x,
            y: y,
            width: Math.max(width, 0),
            height: Math.max(height, 0)
          };
        if (strokeWidth !== undefined) {
          attribs.strokeWidth = strokeWidth;
          attribs = wrapper.crisp(attribs);
        }
        attribs.fill = 'none';
        if (r) {
          attribs.r = r;
        }
        wrapper.rSetter = function(value, key, element) {
          attr(element, {
            rx: value,
            ry: value
          });
        };
        return wrapper.attr(attribs);
      },
      setSize: function(width, height, animate) {
        var renderer = this,
          alignedObjects = renderer.alignedObjects,
          i = alignedObjects.length;
        renderer.width = width;
        renderer.height = height;
        renderer.boxWrapper.animate({
          width: width,
          height: height
        }, {
          step: function() {
            this.attr({
              viewBox: '0 0 ' + this.attr('width') + ' ' + this.attr('height')
            });
          },
          duration: pick(animate, true) ? undefined : 0
        });
        while (i--) {
          alignedObjects[i].align();
        }
      },
      g: function(name) {
        var elem = this.createElement('g');
        return name ? elem.attr({
          'class': 'highcharts-' + name
        }) : elem;
      },
      image: function(src, x, y, width, height) {
        var attribs = {
            preserveAspectRatio: 'none'
          },
          elemWrapper;
        if (arguments.length > 1) {
          extend(attribs, {
            x: x,
            y: y,
            width: width,
            height: height
          });
        }
        elemWrapper = this.createElement('image').attr(attribs);
        if (elemWrapper.element.setAttributeNS) {
          elemWrapper.element.setAttributeNS('http://www.w3.org/1999/xlink',
            'href', src);
        } else {
          elemWrapper.element.setAttribute('hc-svg-href', src);
        }
        return elemWrapper;
      },
      symbol: function(symbol, x, y, width, height, options) {
        var ren = this,
          obj,
          symbolFn = this.symbols[symbol],
          path = defined(x) && symbolFn && this.symbols[symbol](
            Math.round(x),
            Math.round(y),
            width,
            height,
            options
          ),
          imageRegex = /^url\((.*?)\)$/,
          imageSrc,
          centerImage;
        if (symbolFn) {
          obj = this.path(path);
          obj.attr('fill', 'none');
          extend(obj, {
            symbolName: symbol,
            x: x,
            y: y,
            width: width,
            height: height
          });
          if (options) {
            extend(obj, options);
          }
        } else if (imageRegex.test(symbol)) {
          imageSrc = symbol.match(imageRegex)[1];
          obj = this.image(imageSrc);
          obj.imgwidth = pick(
            symbolSizes[imageSrc] && symbolSizes[imageSrc].width,
            options && options.width
          );
          obj.imgheight = pick(
            symbolSizes[imageSrc] && symbolSizes[imageSrc].height,
            options && options.height
          );
          centerImage = function() {
            obj.attr({
              width: obj.width,
              height: obj.height
            });
          };
          each(['width', 'height'], function(key) {
            obj[key + 'Setter'] = function(value, key) {
              var attribs = {},
                imgSize = this['img' + key],
                trans = key === 'width' ? 'translateX' : 'translateY';
              this[key] = value;
              if (defined(imgSize)) {
                if (this.element) {
                  this.element.setAttribute(key, imgSize);
                }
                if (!this.alignByTranslate) {
                  attribs[trans] = ((this[key] || 0) - imgSize) / 2;
                  this.attr(attribs);
                }
              }
            };
          });
          if (defined(x)) {
            obj.attr({
              x: x,
              y: y
            });
          }
          obj.isImg = true;
          if (defined(obj.imgwidth) && defined(obj.imgheight)) {
            centerImage();
          } else {
            obj.attr({
              width: 0,
              height: 0
            });
            createElement('img', {
              onload: function() {
                var chart = charts[ren.chartIndex];
                if (this.width === 0) {
                  css(this, {
                    position: 'absolute',
                    top: '-999em'
                  });
                  doc.body.appendChild(this);
                }
                symbolSizes[imageSrc] = {
                  width: this.width,
                  height: this.height
                };
                obj.imgwidth = this.width;
                obj.imgheight = this.height;
                if (obj.element) {
                  centerImage();
                }
                if (this.parentNode) {
                  this.parentNode.removeChild(this);
                }
                ren.imgCount--;
                if (!ren.imgCount && chart && chart.onload) {
                  chart.onload();
                }
              },
              src: imageSrc
            });
            this.imgCount++;
          }
        }
        return obj;
      },
      symbols: {
        'circle': function(x, y, w, h) {
          return this.arc(x + w / 2, y + h / 2, w / 2, h / 2, {
            start: 0,
            end: Math.PI * 2,
            open: false
          });
        },
        'square': function(x, y, w, h) {
          return [
            'M', x, y,
            'L', x + w, y,
            x + w, y + h,
            x, y + h,
            'Z'
          ];
        },
        'triangle': function(x, y, w, h) {
          return [
            'M', x + w / 2, y,
            'L', x + w, y + h,
            x, y + h,
            'Z'
          ];
        },
        'triangle-down': function(x, y, w, h) {
          return [
            'M', x, y,
            'L', x + w, y,
            x + w / 2, y + h,
            'Z'
          ];
        },
        'diamond': function(x, y, w, h) {
          return [
            'M', x + w / 2, y,
            'L', x + w, y + h / 2,
            x + w / 2, y + h,
            x, y + h / 2,
            'Z'
          ];
        },
        'arc': function(x, y, w, h, options) {
          var start = options.start,
            rx = options.r || w,
            ry = options.r || h || w,
            end = options.end - 0.001,
            innerRadius = options.innerR,
            open = options.open,
            cosStart = Math.cos(start),
            sinStart = Math.sin(start),
            cosEnd = Math.cos(end),
            sinEnd = Math.sin(end),
            longArc = options.end - start < Math.PI ? 0 : 1,
            arc;
          arc = [
            'M',
            x + rx * cosStart,
            y + ry * sinStart,
            'A',
            rx,
            ry,
            0,
            longArc,
            1,
            x + rx * cosEnd,
            y + ry * sinEnd
          ];
          if (defined(innerRadius)) {
            arc.push(
              open ? 'M' : 'L',
              x + innerRadius * cosEnd,
              y + innerRadius * sinEnd,
              'A',
              innerRadius,
              innerRadius,
              0,
              longArc,
              0,
              x + innerRadius * cosStart,
              y + innerRadius * sinStart
            );
          }
          arc.push(open ? '' : 'Z');
          return arc;
        },
        callout: function(x, y, w, h, options) {
          var arrowLength = 6,
            halfDistance = 6,
            r = Math.min((options && options.r) || 0, w, h),
            safeDistance = r + halfDistance,
            anchorX = options && options.anchorX,
            anchorY = options && options.anchorY,
            path;
          path = [
            'M', x + r, y,
            'L', x + w - r, y,
            'C', x + w, y, x + w, y, x + w, y + r,
            'L', x + w, y + h - r,
            'C', x + w, y + h, x + w, y + h, x + w - r, y + h,
            'L', x + r, y + h,
            'C', x, y + h, x, y + h, x, y + h - r,
            'L', x, y + r,
            'C', x, y, x, y, x + r, y
          ];
          if (anchorX && anchorX > w) {
            if (anchorY > y + safeDistance && anchorY < y + h - safeDistance) {
              path.splice(13, 3,
                'L', x + w, anchorY - halfDistance,
                x + w + arrowLength, anchorY,
                x + w, anchorY + halfDistance,
                x + w, y + h - r
              );
            } else {
              path.splice(13, 3,
                'L', x + w, h / 2,
                anchorX, anchorY,
                x + w, h / 2,
                x + w, y + h - r
              );
            }
          } else if (anchorX && anchorX < 0) {
            if (anchorY > y + safeDistance && anchorY < y + h - safeDistance) {
              path.splice(33, 3,
                'L', x, anchorY + halfDistance,
                x - arrowLength, anchorY,
                x, anchorY - halfDistance,
                x, y + r
              );
            } else {
              path.splice(33, 3,
                'L', x, h / 2,
                anchorX, anchorY,
                x, h / 2,
                x, y + r
              );
            }
          } else if (anchorY && anchorY > h && anchorX > x + safeDistance && anchorX < x + w - safeDistance) {
            path.splice(23, 3,
              'L', anchorX + halfDistance, y + h,
              anchorX, y + h + arrowLength,
              anchorX - halfDistance, y + h,
              x + r, y + h
            );
          } else if (anchorY && anchorY < 0 && anchorX > x + safeDistance && anchorX < x + w - safeDistance) {
            path.splice(3, 3,
              'L', anchorX - halfDistance, y,
              anchorX, y - arrowLength,
              anchorX + halfDistance, y,
              w - r, y
            );
          }
          return path;
        }
      },
      clipRect: function(x, y, width, height) {
        var wrapper,
          id = H.uniqueKey(),
          clipPath = this.createElement('clipPath').attr({
            id: id
          }).add(this.defs);
        wrapper = this.rect(x, y, width, height, 0).add(clipPath);
        wrapper.id = id;
        wrapper.clipPath = clipPath;
        wrapper.count = 0;
        return wrapper;
      },
      text: function(str, x, y, useHTML) {
        var renderer = this,
          fakeSVG = !svg && renderer.forExport,
          wrapper,
          attribs = {};
        if (useHTML && (renderer.allowHTML || !renderer.forExport)) {
          return renderer.html(str, x, y);
        }
        attribs.x = Math.round(x || 0);
        if (y) {
          attribs.y = Math.round(y);
        }
        if (str || str === 0) {
          attribs.text = str;
        }
        wrapper = renderer.createElement('text')
          .attr(attribs);
        if (fakeSVG) {
          wrapper.css({
            position: 'absolute'
          });
        }
        if (!useHTML) {
          wrapper.xSetter = function(value, key, element) {
            var tspans = element.getElementsByTagName('tspan'),
              tspan,
              parentVal = element.getAttribute(key),
              i;
            for (i = 0; i < tspans.length; i++) {
              tspan = tspans[i];
              if (tspan.getAttribute(key) === parentVal) {
                tspan.setAttribute(key, value);
              }
            }
            element.setAttribute(key, value);
          };
        }
        return wrapper;
      },
      fontMetrics: function(fontSize, elem) {
        var lineHeight,
          baseline;
        fontSize = fontSize ||
          (elem && elem.style && elem.style.fontSize) ||
          (this.style && this.style.fontSize);
        if (/px/.test(fontSize)) {
          fontSize = pInt(fontSize);
        } else if (/em/.test(fontSize)) {
          fontSize = parseFloat(fontSize) *
            (elem ? this.fontMetrics(null, elem.parentNode).f : 16);
        } else {
          fontSize = 12;
        }
        lineHeight = fontSize < 24 ? fontSize + 3 : Math.round(fontSize * 1.2);
        baseline = Math.round(lineHeight * 0.8);
        return {
          h: lineHeight,
          b: baseline,
          f: fontSize
        };
      },
      rotCorr: function(baseline, rotation, alterY) {
        var y = baseline;
        if (rotation && alterY) {
          y = Math.max(y * Math.cos(rotation * deg2rad), 4);
        }
        return {
          x: (-baseline / 3) * Math.sin(rotation * deg2rad),
          y: y
        };
      },
      label: function(str, x, y, shape, anchorX, anchorY, useHTML, baseline, className) {
        var renderer = this,
          wrapper = renderer.g(className !== 'button' && 'label'),
          text = wrapper.text = renderer.text('', 0, 0, useHTML)
          .attr({
            zIndex: 1
          }),
          box,
          bBox,
          alignFactor = 0,
          padding = 3,
          paddingLeft = 0,
          width,
          height,
          wrapperX,
          wrapperY,
          textAlign,
          deferredAttr = {},
          strokeWidth,
          baselineOffset,
          hasBGImage = /^url\((.*?)\)$/.test(shape),
          needsBox = hasBGImage,
          getCrispAdjust,
          updateBoxSize,
          updateTextPadding,
          boxAttr;
        if (className) {
          wrapper.addClass('highcharts-' + className);
        }
        needsBox = hasBGImage;
        getCrispAdjust = function() {
          return (strokeWidth || 0) % 2 / 2;
        };
        updateBoxSize = function() {
          var style = text.element.style,
            crispAdjust,
            attribs = {};
          bBox = (width === undefined || height === undefined || textAlign) && defined(text.textStr) &&
            text.getBBox();
          wrapper.width = (width || bBox.width || 0) + 2 * padding + paddingLeft;
          wrapper.height = (height || bBox.height || 0) + 2 * padding;
          baselineOffset = padding + renderer.fontMetrics(style && style.fontSize, text).b;
          if (needsBox) {
            if (!box) {
              wrapper.box = box = renderer.symbols[shape] || hasBGImage ?
                renderer.symbol(shape) :
                renderer.rect();
              box.addClass(
                (className === 'button' ? '' : 'highcharts-label-box') +
                (className ? ' highcharts-' + className + '-box' : '')
              );
              box.add(wrapper);
              crispAdjust = getCrispAdjust();
              attribs.x = crispAdjust;
              attribs.y = (baseline ? -baselineOffset : 0) + crispAdjust;
            }
            attribs.width = Math.round(wrapper.width);
            attribs.height = Math.round(wrapper.height);
            box.attr(extend(attribs, deferredAttr));
            deferredAttr = {};
          }
        };
        updateTextPadding = function() {
          var textX = paddingLeft + padding,
            textY;
          textY = baseline ? 0 : baselineOffset;
          if (defined(width) && bBox && (textAlign === 'center' || textAlign === 'right')) {
            textX += {
              center: 0.5,
              right: 1
            }[textAlign] * (width - bBox.width);
          }
          if (textX !== text.x || textY !== text.y) {
            text.attr('x', textX);
            if (textY !== undefined) {
              text.attr('y', textY);
            }
          }
          text.x = textX;
          text.y = textY;
        };
        boxAttr = function(key, value) {
          if (box) {
            box.attr(key, value);
          } else {
            deferredAttr[key] = value;
          }
        };
        wrapper.onAdd = function() {
          text.add(wrapper);
          wrapper.attr({
            text: (str || str === 0) ? str : '',
            x: x,
            y: y
          });
          if (box && defined(anchorX)) {
            wrapper.attr({
              anchorX: anchorX,
              anchorY: anchorY
            });
          }
        };
        wrapper.widthSetter = function(value) {
          width = value;
        };
        wrapper.heightSetter = function(value) {
          height = value;
        };
        wrapper['text-alignSetter'] = function(value) {
          textAlign = value;
        };
        wrapper.paddingSetter = function(value) {
          if (defined(value) && value !== padding) {
            padding = wrapper.padding = value;
            updateTextPadding();
          }
        };
        wrapper.paddingLeftSetter = function(value) {
          if (defined(value) && value !== paddingLeft) {
            paddingLeft = value;
            updateTextPadding();
          }
        };
        wrapper.alignSetter = function(value) {
          value = {
            left: 0,
            center: 0.5,
            right: 1
          }[value];
          if (value !== alignFactor) {
            alignFactor = value;
            if (bBox) {
              wrapper.attr({
                x: wrapperX
              });
            }
          }
        };
        wrapper.textSetter = function(value) {
          if (value !== undefined) {
            text.textSetter(value);
          }
          updateBoxSize();
          updateTextPadding();
        };
        wrapper['stroke-widthSetter'] = function(value, key) {
          if (value) {
            needsBox = true;
          }
          strokeWidth = this['stroke-width'] = value;
          boxAttr(key, value);
        };
        wrapper.strokeSetter = wrapper.fillSetter = wrapper.rSetter = function(value, key) {
          if (key === 'fill' && value) {
            needsBox = true;
          }
          boxAttr(key, value);
        };
        wrapper.anchorXSetter = function(value, key) {
          anchorX = value;
          boxAttr(key, Math.round(value) - getCrispAdjust() - wrapperX);
        };
        wrapper.anchorYSetter = function(value, key) {
          anchorY = value;
          boxAttr(key, value - wrapperY);
        };
        wrapper.xSetter = function(value) {
          wrapper.x = value;
          if (alignFactor) {
            value -= alignFactor * ((width || bBox.width) + 2 * padding);
          }
          wrapperX = Math.round(value);
          wrapper.attr('translateX', wrapperX);
        };
        wrapper.ySetter = function(value) {
          wrapperY = wrapper.y = Math.round(value);
          wrapper.attr('translateY', wrapperY);
        };
        var baseCss = wrapper.css;
        return extend(wrapper, {
          css: function(styles) {
            if (styles) {
              var textStyles = {};
              styles = merge(styles);
              each(wrapper.textProps, function(prop) {
                if (styles[prop] !== undefined) {
                  textStyles[prop] = styles[prop];
                  delete styles[prop];
                }
              });
              text.css(textStyles);
            }
            return baseCss.call(wrapper, styles);
          },
          getBBox: function() {
            return {
              width: bBox.width + 2 * padding,
              height: bBox.height + 2 * padding,
              x: bBox.x - padding,
              y: bBox.y - padding
            };
          },
          shadow: function(b) {
            if (b) {
              updateBoxSize();
              if (box) {
                box.shadow(b);
              }
            }
            return wrapper;
          },
          destroy: function() {
            removeEvent(wrapper.element, 'mouseenter');
            removeEvent(wrapper.element, 'mouseleave');
            if (text) {
              text = text.destroy();
            }
            if (box) {
              box = box.destroy();
            }
            SVGElement.prototype.destroy.call(wrapper);
            wrapper = renderer = updateBoxSize = updateTextPadding = boxAttr = null;
          }
        });
      }
    };
    H.Renderer = SVGRenderer;
  }(Highcharts));
  (function(H) {
    'use strict';
    var attr = H.attr,
      createElement = H.createElement,
      css = H.css,
      defined = H.defined,
      each = H.each,
      extend = H.extend,
      isFirefox = H.isFirefox,
      isMS = H.isMS,
      isWebKit = H.isWebKit,
      pInt = H.pInt,
      SVGElement = H.SVGElement,
      SVGRenderer = H.SVGRenderer,
      win = H.win,
      wrap = H.wrap;
    extend(SVGElement.prototype, {
      htmlCss: function(styles) {
        var wrapper = this,
          element = wrapper.element,
          textWidth = styles && element.tagName === 'SPAN' && styles.width;
        if (textWidth) {
          delete styles.width;
          wrapper.textWidth = textWidth;
          wrapper.updateTransform();
        }
        if (styles && styles.textOverflow === 'ellipsis') {
          styles.whiteSpace = 'nowrap';
          styles.overflow = 'hidden';
        }
        wrapper.styles = extend(wrapper.styles, styles);
        css(wrapper.element, styles);
        return wrapper;
      },
      htmlGetBBox: function() {
        var wrapper = this,
          element = wrapper.element;
        if (element.nodeName === 'text') {
          element.style.position = 'absolute';
        }
        return {
          x: element.offsetLeft,
          y: element.offsetTop,
          width: element.offsetWidth,
          height: element.offsetHeight
        };
      },
      htmlUpdateTransform: function() {
        if (!this.added) {
          this.alignOnAdd = true;
          return;
        }
        var wrapper = this,
          renderer = wrapper.renderer,
          elem = wrapper.element,
          translateX = wrapper.translateX || 0,
          translateY = wrapper.translateY || 0,
          x = wrapper.x || 0,
          y = wrapper.y || 0,
          align = wrapper.textAlign || 'left',
          alignCorrection = {
            left: 0,
            center: 0.5,
            right: 1
          }[align],
          styles = wrapper.styles;
        css(elem, {
          marginLeft: translateX,
          marginTop: translateY
        });
        if (wrapper.shadows) {
          each(wrapper.shadows, function(shadow) {
            css(shadow, {
              marginLeft: translateX + 1,
              marginTop: translateY + 1
            });
          });
        }
        if (wrapper.inverted) {
          each(elem.childNodes, function(child) {
            renderer.invertChild(child, elem);
          });
        }
        if (elem.tagName === 'SPAN') {
          var rotation = wrapper.rotation,
            baseline,
            textWidth = pInt(wrapper.textWidth),
            whiteSpace = styles && styles.whiteSpace,
            currentTextTransform = [rotation, align, elem.innerHTML, wrapper.textWidth, wrapper.textAlign].join(',');
          if (currentTextTransform !== wrapper.cTT) {
            baseline = renderer.fontMetrics(elem.style.fontSize).b;
            if (defined(rotation)) {
              wrapper.setSpanRotation(rotation, alignCorrection, baseline);
            }
            css(elem, {
              width: '',
              whiteSpace: whiteSpace || 'nowrap'
            });
            if (elem.offsetWidth > textWidth && /[ \-]/.test(elem.textContent || elem.innerText)) {
              css(elem, {
                width: textWidth + 'px',
                display: 'block',
                whiteSpace: whiteSpace || 'normal'
              });
            }
            wrapper.getSpanCorrection(elem.offsetWidth, baseline, alignCorrection, rotation, align);
          }
          css(elem, {
            left: (x + (wrapper.xCorr || 0)) + 'px',
            top: (y + (wrapper.yCorr || 0)) + 'px'
          });
          if (isWebKit) {
            baseline = elem.offsetHeight;
          }
          wrapper.cTT = currentTextTransform;
        }
      },
      setSpanRotation: function(rotation, alignCorrection, baseline) {
        var rotationStyle = {},
          cssTransformKey = isMS ? '-ms-transform' : isWebKit ? '-webkit-transform' : isFirefox ? 'MozTransform' : win.opera ? '-o-transform' : '';
        rotationStyle[cssTransformKey] = rotationStyle.transform = 'rotate(' + rotation + 'deg)';
        rotationStyle[cssTransformKey + (isFirefox ? 'Origin' : '-origin')] = rotationStyle.transformOrigin = (alignCorrection * 100) + '% ' + baseline + 'px';
        css(this.element, rotationStyle);
      },
      getSpanCorrection: function(width, baseline, alignCorrection) {
        this.xCorr = -width * alignCorrection;
        this.yCorr = -baseline;
      }
    });
    extend(SVGRenderer.prototype, {
      html: function(str, x, y) {
        var wrapper = this.createElement('span'),
          element = wrapper.element,
          renderer = wrapper.renderer,
          isSVG = renderer.isSVG,
          addSetters = function(element, style) {
            each(['opacity', 'visibility'], function(prop) {
              wrap(element, prop + 'Setter', function(proceed, value, key, elem) {
                proceed.call(this, value, key, elem);
                style[key] = value;
              });
            });
          };
        wrapper.textSetter = function(value) {
          if (value !== element.innerHTML) {
            delete this.bBox;
          }
          element.innerHTML = this.textStr = value;
          wrapper.htmlUpdateTransform();
        };
        if (isSVG) {
          addSetters(wrapper, wrapper.element.style);
        }
        wrapper.xSetter = wrapper.ySetter = wrapper.alignSetter = wrapper.rotationSetter = function(value, key) {
          if (key === 'align') {
            key = 'textAlign';
          }
          wrapper[key] = value;
          wrapper.htmlUpdateTransform();
        };
        wrapper
          .attr({
            text: str,
            x: Math.round(x),
            y: Math.round(y)
          })
          .css({
            fontFamily: this.style.fontFamily,
            fontSize: this.style.fontSize,
            position: 'absolute'
          });
        element.style.whiteSpace = 'nowrap';
        wrapper.css = wrapper.htmlCss;
        if (isSVG) {
          wrapper.add = function(svgGroupWrapper) {
            var htmlGroup,
              container = renderer.box.parentNode,
              parentGroup,
              parents = [];
            this.parentGroup = svgGroupWrapper;
            if (svgGroupWrapper) {
              htmlGroup = svgGroupWrapper.div;
              if (!htmlGroup) {
                parentGroup = svgGroupWrapper;
                while (parentGroup) {
                  parents.push(parentGroup);
                  parentGroup = parentGroup.parentGroup;
                }
                each(parents.reverse(), function(parentGroup) {
                  var htmlGroupStyle,
                    cls = attr(parentGroup.element, 'class');
                  if (cls) {
                    cls = {
                      className: cls
                    };
                  }
                  htmlGroup = parentGroup.div = parentGroup.div || createElement('div', cls, {
                    position: 'absolute',
                    left: (parentGroup.translateX || 0) + 'px',
                    top: (parentGroup.translateY || 0) + 'px',
                    display: parentGroup.display,
                    opacity: parentGroup.opacity,
                    pointerEvents: parentGroup.styles && parentGroup.styles.pointerEvents
                  }, htmlGroup || container);
                  htmlGroupStyle = htmlGroup.style;
                  extend(parentGroup, {
                    on: function() {
                      wrapper.on.apply({
                        element: parents[0].div
                      }, arguments);
                      return parentGroup;
                    },
                    translateXSetter: function(value, key) {
                      htmlGroupStyle.left = value + 'px';
                      parentGroup[key] = value;
                      parentGroup.doTransform = true;
                    },
                    translateYSetter: function(value, key) {
                      htmlGroupStyle.top = value + 'px';
                      parentGroup[key] = value;
                      parentGroup.doTransform = true;
                    }
                  });
                  addSetters(parentGroup, htmlGroupStyle);
                });
              }
            } else {
              htmlGroup = container;
            }
            htmlGroup.appendChild(element);
            wrapper.added = true;
            if (wrapper.alignOnAdd) {
              wrapper.htmlUpdateTransform();
            }
            return wrapper;
          };
        }
        return wrapper;
      }
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var VMLRenderer,
      VMLRendererExtension,
      VMLElement,
      createElement = H.createElement,
      css = H.css,
      defined = H.defined,
      deg2rad = H.deg2rad,
      discardElement = H.discardElement,
      doc = H.doc,
      each = H.each,
      erase = H.erase,
      extend = H.extend,
      extendClass = H.extendClass,
      isArray = H.isArray,
      isNumber = H.isNumber,
      isObject = H.isObject,
      merge = H.merge,
      noop = H.noop,
      pick = H.pick,
      pInt = H.pInt,
      svg = H.svg,
      SVGElement = H.SVGElement,
      SVGRenderer = H.SVGRenderer,
      win = H.win;
    if (!svg) {
      VMLElement = {
        docMode8: doc && doc.documentMode === 8,
        init: function(renderer, nodeName) {
          var wrapper = this,
            markup = ['<', nodeName, ' filled="f" stroked="f"'],
            style = ['position: ', 'absolute', ';'],
            isDiv = nodeName === 'div';
          if (nodeName === 'shape' || isDiv) {
            style.push('left:0;top:0;width:1px;height:1px;');
          }
          style.push('visibility: ', isDiv ? 'hidden' : 'visible');
          markup.push(' style="', style.join(''), '"/>');
          if (nodeName) {
            markup = isDiv || nodeName === 'span' || nodeName === 'img' ?
              markup.join('') :
              renderer.prepVML(markup);
            wrapper.element = createElement(markup);
          }
          wrapper.renderer = renderer;
        },
        add: function(parent) {
          var wrapper = this,
            renderer = wrapper.renderer,
            element = wrapper.element,
            box = renderer.box,
            inverted = parent && parent.inverted,
            parentNode = parent ?
            parent.element || parent :
            box;
          if (parent) {
            this.parentGroup = parent;
          }
          if (inverted) {
            renderer.invertChild(element, parentNode);
          }
          parentNode.appendChild(element);
          wrapper.added = true;
          if (wrapper.alignOnAdd && !wrapper.deferUpdateTransform) {
            wrapper.updateTransform();
          }
          if (wrapper.onAdd) {
            wrapper.onAdd();
          }
          if (this.className) {
            this.attr('class', this.className);
          }
          return wrapper;
        },
        updateTransform: SVGElement.prototype.htmlUpdateTransform,
        setSpanRotation: function() {
          var rotation = this.rotation,
            costheta = Math.cos(rotation * deg2rad),
            sintheta = Math.sin(rotation * deg2rad);
          css(this.element, {
            filter: rotation ? ['progid:DXImageTransform.Microsoft.Matrix(M11=', costheta,
              ', M12=', -sintheta, ', M21=', sintheta, ', M22=', costheta,
              ', sizingMethod=\'auto expand\')'
            ].join('') : 'none'
          });
        },
        getSpanCorrection: function(width, baseline, alignCorrection, rotation, align) {
          var costheta = rotation ? Math.cos(rotation * deg2rad) : 1,
            sintheta = rotation ? Math.sin(rotation * deg2rad) : 0,
            height = pick(this.elemHeight, this.element.offsetHeight),
            quad,
            nonLeft = align && align !== 'left';
          this.xCorr = costheta < 0 && -width;
          this.yCorr = sintheta < 0 && -height;
          quad = costheta * sintheta < 0;
          this.xCorr += sintheta * baseline * (quad ? 1 - alignCorrection : alignCorrection);
          this.yCorr -= costheta * baseline * (rotation ? (quad ? alignCorrection : 1 - alignCorrection) : 1);
          if (nonLeft) {
            this.xCorr -= width * alignCorrection * (costheta < 0 ? -1 : 1);
            if (rotation) {
              this.yCorr -= height * alignCorrection * (sintheta < 0 ? -1 : 1);
            }
            css(this.element, {
              textAlign: align
            });
          }
        },
        pathToVML: function(value) {
          var i = value.length,
            path = [];
          while (i--) {
            if (isNumber(value[i])) {
              path[i] = Math.round(value[i] * 10) - 5;
            } else if (value[i] === 'Z') {
              path[i] = 'x';
            } else {
              path[i] = value[i];
              if (value.isArc && (value[i] === 'wa' || value[i] === 'at')) {
                if (path[i + 5] === path[i + 7]) {
                  path[i + 7] += value[i + 7] > value[i + 5] ? 1 : -1;
                }
                if (path[i + 6] === path[i + 8]) {
                  path[i + 8] += value[i + 8] > value[i + 6] ? 1 : -1;
                }
              }
            }
          }
          return path.join(' ') || 'x';
        },
        clip: function(clipRect) {
          var wrapper = this,
            clipMembers,
            cssRet;
          if (clipRect) {
            clipMembers = clipRect.members;
            erase(clipMembers, wrapper);
            clipMembers.push(wrapper);
            wrapper.destroyClip = function() {
              erase(clipMembers, wrapper);
            };
            cssRet = clipRect.getCSS(wrapper);
          } else {
            if (wrapper.destroyClip) {
              wrapper.destroyClip();
            }
            cssRet = {
              clip: wrapper.docMode8 ? 'inherit' : 'rect(auto)'
            };
          }
          return wrapper.css(cssRet);
        },
        css: SVGElement.prototype.htmlCss,
        safeRemoveChild: function(element) {
          if (element.parentNode) {
            discardElement(element);
          }
        },
        destroy: function() {
          if (this.destroyClip) {
            this.destroyClip();
          }
          return SVGElement.prototype.destroy.apply(this);
        },
        on: function(eventType, handler) {
          this.element['on' + eventType] = function() {
            var evt = win.event;
            evt.target = evt.srcElement;
            handler(evt);
          };
          return this;
        },
        cutOffPath: function(path, length) {
          var len;
          path = path.split(/[ ,]/);
          len = path.length;
          if (len === 9 || len === 11) {
            path[len - 4] = path[len - 2] = pInt(path[len - 2]) - 10 * length;
          }
          return path.join(' ');
        },
        shadow: function(shadowOptions, group, cutOff) {
          var shadows = [],
            i,
            element = this.element,
            renderer = this.renderer,
            shadow,
            elemStyle = element.style,
            markup,
            path = element.path,
            strokeWidth,
            modifiedPath,
            shadowWidth,
            shadowElementOpacity;
          if (path && typeof path.value !== 'string') {
            path = 'x';
          }
          modifiedPath = path;
          if (shadowOptions) {
            shadowWidth = pick(shadowOptions.width, 3);
            shadowElementOpacity = (shadowOptions.opacity || 0.15) / shadowWidth;
            for (i = 1; i <= 3; i++) {
              strokeWidth = (shadowWidth * 2) + 1 - (2 * i);
              if (cutOff) {
                modifiedPath = this.cutOffPath(path.value, strokeWidth + 0.5);
              }
              markup = ['<shape isShadow="true" strokeweight="', strokeWidth,
                '" filled="false" path="', modifiedPath,
                '" coordsize="10 10" style="', element.style.cssText, '" />'
              ];
              shadow = createElement(renderer.prepVML(markup),
                null, {
                  left: pInt(elemStyle.left) + pick(shadowOptions.offsetX, 1),
                  top: pInt(elemStyle.top) + pick(shadowOptions.offsetY, 1)
                }
              );
              if (cutOff) {
                shadow.cutOff = strokeWidth + 1;
              }
              markup = [
                '<stroke color="',
                shadowOptions.color || '#000000',
                '" opacity="', shadowElementOpacity * i, '"/>'
              ];
              createElement(renderer.prepVML(markup), null, null, shadow);
              if (group) {
                group.element.appendChild(shadow);
              } else {
                element.parentNode.insertBefore(shadow, element);
              }
              shadows.push(shadow);
            }
            this.shadows = shadows;
          }
          return this;
        },
        updateShadows: noop,
        setAttr: function(key, value) {
          if (this.docMode8) {
            this.element[key] = value;
          } else {
            this.element.setAttribute(key, value);
          }
        },
        classSetter: function(value) {
          (this.added ? this.element : this).className = value;
        },
        dashstyleSetter: function(value, key, element) {
          var strokeElem = element.getElementsByTagName('stroke')[0] ||
            createElement(this.renderer.prepVML(['<stroke/>']), null, null, element);
          strokeElem[key] = value || 'solid';
          this[key] = value;
        },
        dSetter: function(value, key, element) {
          var i,
            shadows = this.shadows;
          value = value || [];
          this.d = value.join && value.join(' ');
          element.path = value = this.pathToVML(value);
          if (shadows) {
            i = shadows.length;
            while (i--) {
              shadows[i].path = shadows[i].cutOff ? this.cutOffPath(value, shadows[i].cutOff) : value;
            }
          }
          this.setAttr(key, value);
        },
        fillSetter: function(value, key, element) {
          var nodeName = element.nodeName;
          if (nodeName === 'SPAN') {
            element.style.color = value;
          } else if (nodeName !== 'IMG') {
            element.filled = value !== 'none';
            this.setAttr('fillcolor', this.renderer.color(value, element, key, this));
          }
        },
        'fill-opacitySetter': function(value, key, element) {
          createElement(
            this.renderer.prepVML(['<', key.split('-')[0], ' opacity="', value, '"/>']),
            null,
            null,
            element
          );
        },
        opacitySetter: noop,
        rotationSetter: function(value, key, element) {
          var style = element.style;
          this[key] = style[key] = value;
          style.left = -Math.round(Math.sin(value * deg2rad) + 1) + 'px';
          style.top = Math.round(Math.cos(value * deg2rad)) + 'px';
        },
        strokeSetter: function(value, key, element) {
          this.setAttr('strokecolor', this.renderer.color(value, element, key, this));
        },
        'stroke-widthSetter': function(value, key, element) {
          element.stroked = !!value;
          this[key] = value;
          if (isNumber(value)) {
            value += 'px';
          }
          this.setAttr('strokeweight', value);
        },
        titleSetter: function(value, key) {
          this.setAttr(key, value);
        },
        visibilitySetter: function(value, key, element) {
          if (value === 'inherit') {
            value = 'visible';
          }
          if (this.shadows) {
            each(this.shadows, function(shadow) {
              shadow.style[key] = value;
            });
          }
          if (element.nodeName === 'DIV') {
            value = value === 'hidden' ? '-999em' : 0;
            if (!this.docMode8) {
              element.style[key] = value ? 'visible' : 'hidden';
            }
            key = 'top';
          }
          element.style[key] = value;
        },
        xSetter: function(value, key, element) {
          this[key] = value;
          if (key === 'x') {
            key = 'left';
          } else if (key === 'y') {
            key = 'top';
          }
          if (this.updateClipping) {
            this[key] = value;
            this.updateClipping();
          } else {
            element.style[key] = value;
          }
        },
        zIndexSetter: function(value, key, element) {
          element.style[key] = value;
        }
      };
      VMLElement['stroke-opacitySetter'] = VMLElement['fill-opacitySetter'];
      H.VMLElement = VMLElement = extendClass(SVGElement, VMLElement);
      VMLElement.prototype.ySetter =
        VMLElement.prototype.widthSetter =
        VMLElement.prototype.heightSetter =
        VMLElement.prototype.xSetter;
      VMLRendererExtension = {
        Element: VMLElement,
        isIE8: win.navigator.userAgent.indexOf('MSIE 8.0') > -1,
        init: function(container, width, height) {
          var renderer = this,
            boxWrapper,
            box,
            css;
          renderer.alignedObjects = [];
          boxWrapper = renderer.createElement('div')
            .css({
              position: 'relative'
            });
          box = boxWrapper.element;
          container.appendChild(boxWrapper.element);
          renderer.isVML = true;
          renderer.box = box;
          renderer.boxWrapper = boxWrapper;
          renderer.gradients = {};
          renderer.cache = {};
          renderer.cacheKeys = [];
          renderer.imgCount = 0;
          renderer.setSize(width, height, false);
          if (!doc.namespaces.hcv) {
            doc.namespaces.add('hcv', 'urn:schemas-microsoft-com:vml');
            css = 'hcv\\:fill, hcv\\:path, hcv\\:shape, hcv\\:stroke' +
              '{ behavior:url(#default#VML); display: inline-block; } ';
            try {
              doc.createStyleSheet().cssText = css;
            } catch (e) {
              doc.styleSheets[0].cssText += css;
            }
          }
        },
        isHidden: function() {
          return !this.box.offsetWidth;
        },
        clipRect: function(x, y, width, height) {
          var clipRect = this.createElement(),
            isObj = isObject(x);
          return extend(clipRect, {
            members: [],
            count: 0,
            left: (isObj ? x.x : x) + 1,
            top: (isObj ? x.y : y) + 1,
            width: (isObj ? x.width : width) - 1,
            height: (isObj ? x.height : height) - 1,
            getCSS: function(wrapper) {
              var element = wrapper.element,
                nodeName = element.nodeName,
                isShape = nodeName === 'shape',
                inverted = wrapper.inverted,
                rect = this,
                top = rect.top - (isShape ? element.offsetTop : 0),
                left = rect.left,
                right = left + rect.width,
                bottom = top + rect.height,
                ret = {
                  clip: 'rect(' +
                    Math.round(inverted ? left : top) + 'px,' +
                    Math.round(inverted ? bottom : right) + 'px,' +
                    Math.round(inverted ? right : bottom) + 'px,' +
                    Math.round(inverted ? top : left) + 'px)'
                };
              if (!inverted && wrapper.docMode8 && nodeName === 'DIV') {
                extend(ret, {
                  width: right + 'px',
                  height: bottom + 'px'
                });
              }
              return ret;
            },
            updateClipping: function() {
              each(clipRect.members, function(member) {
                if (member.element) {
                  member.css(clipRect.getCSS(member));
                }
              });
            }
          });
        },
        color: function(color, elem, prop, wrapper) {
          var renderer = this,
            colorObject,
            regexRgba = /^rgba/,
            markup,
            fillType,
            ret = 'none';
          if (color && color.linearGradient) {
            fillType = 'gradient';
          } else if (color && color.radialGradient) {
            fillType = 'pattern';
          }
          if (fillType) {
            var stopColor,
              stopOpacity,
              gradient = color.linearGradient || color.radialGradient,
              x1,
              y1,
              x2,
              y2,
              opacity1,
              opacity2,
              color1,
              color2,
              fillAttr = '',
              stops = color.stops,
              firstStop,
              lastStop,
              colors = [],
              addFillNode = function() {
                markup = ['<fill colors="' + colors.join(',') +
                  '" opacity="', opacity2, '" o:opacity2="',
                  opacity1, '" type="', fillType, '" ', fillAttr,
                  'focus="100%" method="any" />'
                ];
                createElement(renderer.prepVML(markup), null, null, elem);
              };
            firstStop = stops[0];
            lastStop = stops[stops.length - 1];
            if (firstStop[0] > 0) {
              stops.unshift([
                0,
                firstStop[1]
              ]);
            }
            if (lastStop[0] < 1) {
              stops.push([
                1,
                lastStop[1]
              ]);
            }
            each(stops, function(stop, i) {
              if (regexRgba.test(stop[1])) {
                colorObject = H.color(stop[1]);
                stopColor = colorObject.get('rgb');
                stopOpacity = colorObject.get('a');
              } else {
                stopColor = stop[1];
                stopOpacity = 1;
              }
              colors.push((stop[0] * 100) + '% ' + stopColor);
              if (!i) {
                opacity1 = stopOpacity;
                color2 = stopColor;
              } else {
                opacity2 = stopOpacity;
                color1 = stopColor;
              }
            });
            if (prop === 'fill') {
              if (fillType === 'gradient') {
                x1 = gradient.x1 || gradient[0] || 0;
                y1 = gradient.y1 || gradient[1] || 0;
                x2 = gradient.x2 || gradient[2] || 0;
                y2 = gradient.y2 || gradient[3] || 0;
                fillAttr = 'angle="' + (90 - Math.atan(
                  (y2 - y1) /
                  (x2 - x1)
                ) * 180 / Math.PI) + '"';
                addFillNode();
              } else {
                var r = gradient.r,
                  sizex = r * 2,
                  sizey = r * 2,
                  cx = gradient.cx,
                  cy = gradient.cy,
                  radialReference = elem.radialReference,
                  bBox,
                  applyRadialGradient = function() {
                    if (radialReference) {
                      bBox = wrapper.getBBox();
                      cx += (radialReference[0] - bBox.x) / bBox.width - 0.5;
                      cy += (radialReference[1] - bBox.y) / bBox.height - 0.5;
                      sizex *= radialReference[2] / bBox.width;
                      sizey *= radialReference[2] / bBox.height;
                    }
                    fillAttr = 'src="' + H.getOptions().global.VMLRadialGradientURL + '" ' +
                      'size="' + sizex + ',' + sizey + '" ' +
                      'origin="0.5,0.5" ' +
                      'position="' + cx + ',' + cy + '" ' +
                      'color2="' + color2 + '" ';
                    addFillNode();
                  };
                if (wrapper.added) {
                  applyRadialGradient();
                } else {
                  wrapper.onAdd = applyRadialGradient;
                }
                ret = color1;
              }
            } else {
              ret = stopColor;
            }
          } else if (regexRgba.test(color) && elem.tagName !== 'IMG') {
            colorObject = H.color(color);
            wrapper[prop + '-opacitySetter'](colorObject.get('a'), prop, elem);
            ret = colorObject.get('rgb');
          } else {
            var propNodes = elem.getElementsByTagName(prop);
            if (propNodes.length) {
              propNodes[0].opacity = 1;
              propNodes[0].type = 'solid';
            }
            ret = color;
          }
          return ret;
        },
        prepVML: function(markup) {
          var vmlStyle = 'display:inline-block;behavior:url(#default#VML);',
            isIE8 = this.isIE8;
          markup = markup.join('');
          if (isIE8) {
            markup = markup.replace('/>', ' xmlns="urn:schemas-microsoft-com:vml" />');
            if (markup.indexOf('style="') === -1) {
              markup = markup.replace('/>', ' style="' + vmlStyle + '" />');
            } else {
              markup = markup.replace('style="', 'style="' + vmlStyle);
            }
          } else {
            markup = markup.replace('<', '<hcv:');
          }
          return markup;
        },
        text: SVGRenderer.prototype.html,
        path: function(path) {
          var attr = {
            coordsize: '10 10'
          };
          if (isArray(path)) {
            attr.d = path;
          } else if (isObject(path)) {
            extend(attr, path);
          }
          return this.createElement('shape').attr(attr);
        },
        circle: function(x, y, r) {
          var circle = this.symbol('circle');
          if (isObject(x)) {
            r = x.r;
            y = x.y;
            x = x.x;
          }
          circle.isCircle = true;
          circle.r = r;
          return circle.attr({
            x: x,
            y: y
          });
        },
        g: function(name) {
          var wrapper,
            attribs;
          if (name) {
            attribs = {
              'className': 'highcharts-' + name,
              'class': 'highcharts-' + name
            };
          }
          wrapper = this.createElement('div').attr(attribs);
          return wrapper;
        },
        image: function(src, x, y, width, height) {
          var obj = this.createElement('img')
            .attr({
              src: src
            });
          if (arguments.length > 1) {
            obj.attr({
              x: x,
              y: y,
              width: width,
              height: height
            });
          }
          return obj;
        },
        createElement: function(nodeName) {
          return nodeName === 'rect' ?
            this.symbol(nodeName) :
            SVGRenderer.prototype.createElement.call(this, nodeName);
        },
        invertChild: function(element, parentNode) {
          var ren = this,
            parentStyle = parentNode.style,
            imgStyle = element.tagName === 'IMG' && element.style;
          css(element, {
            flip: 'x',
            left: pInt(parentStyle.width) - (imgStyle ? pInt(imgStyle.top) : 1),
            top: pInt(parentStyle.height) - (imgStyle ? pInt(imgStyle.left) : 1),
            rotation: -90
          });
          each(element.childNodes, function(child) {
            ren.invertChild(child, element);
          });
        },
        symbols: {
          arc: function(x, y, w, h, options) {
            var start = options.start,
              end = options.end,
              radius = options.r || w || h,
              innerRadius = options.innerR,
              cosStart = Math.cos(start),
              sinStart = Math.sin(start),
              cosEnd = Math.cos(end),
              sinEnd = Math.sin(end),
              ret;
            if (end - start === 0) {
              return ['x'];
            }
            ret = [
              'wa',
              x - radius,
              y - radius,
              x + radius,
              y + radius,
              x + radius * cosStart,
              y + radius * sinStart,
              x + radius * cosEnd,
              y + radius * sinEnd
            ];
            if (options.open && !innerRadius) {
              ret.push(
                'e',
                'M',
                x,
                y
              );
            }
            ret.push(
              'at',
              x - innerRadius,
              y - innerRadius,
              x + innerRadius,
              y + innerRadius,
              x + innerRadius * cosEnd,
              y + innerRadius * sinEnd,
              x + innerRadius * cosStart,
              y + innerRadius * sinStart,
              'x',
              'e'
            );
            ret.isArc = true;
            return ret;
          },
          circle: function(x, y, w, h, wrapper) {
            if (wrapper && defined(wrapper.r)) {
              w = h = 2 * wrapper.r;
            }
            if (wrapper && wrapper.isCircle) {
              x -= w / 2;
              y -= h / 2;
            }
            return [
              'wa',
              x,
              y,
              x + w,
              y + h,
              x + w,
              y + h / 2,
              x + w,
              y + h / 2,
              'e'
            ];
          },
          rect: function(x, y, w, h, options) {
            return SVGRenderer.prototype.symbols[!defined(options) || !options.r ? 'square' : 'callout'].call(0, x, y, w, h, options);
          }
        }
      };
      H.VMLRenderer = VMLRenderer = function() {
        this.init.apply(this, arguments);
      };
      VMLRenderer.prototype = merge(SVGRenderer.prototype, VMLRendererExtension);
      H.Renderer = VMLRenderer;
    }
    SVGRenderer.prototype.measureSpanWidth = function(text, styles) {
      var measuringSpan = doc.createElement('span'),
        offsetWidth,
        textNode = doc.createTextNode(text);
      measuringSpan.appendChild(textNode);
      css(measuringSpan, styles);
      this.box.appendChild(measuringSpan);
      offsetWidth = measuringSpan.offsetWidth;
      discardElement(measuringSpan);
      return offsetWidth;
    };
  }(Highcharts));
  (function(H) {
    'use strict';
    var color = H.color,
      each = H.each,
      getTZOffset = H.getTZOffset,
      isTouchDevice = H.isTouchDevice,
      merge = H.merge,
      pick = H.pick,
      svg = H.svg,
      win = H.win;
    H.defaultOptions = {
      colors: '#7cb5ec #434348 #90ed7d #f7a35c #8085e9 #f15c80 #e4d354 #2b908f #f45b5b #91e8e1'.split(' '),
      symbols: ['circle', 'diamond', 'square', 'triangle', 'triangle-down'],
      lang: {
        loading: 'Loading...',
        months: [
          'January', 'February', 'March', 'April', 'May', 'June', 'July',
          'August', 'September', 'October', 'November', 'December'
        ],
        shortMonths: [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
          'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ],
        weekdays: [
          'Sunday', 'Monday', 'Tuesday', 'Wednesday',
          'Thursday', 'Friday', 'Saturday'
        ],
        decimalPoint: '.',
        numericSymbols: ['k', 'M', 'G', 'T', 'P', 'E'],
        resetZoom: 'Reset zoom',
        resetZoomTitle: 'Reset zoom level 1:1',
        thousandsSep: ' '
      },
      global: {
        useUTC: true,
        VMLRadialGradientURL: 'http://code.highcharts.com/5.0.7/gfx/vml-radial-gradient.png'
      },
      chart: {
        borderRadius: 0,
        defaultSeriesType: 'line',
        ignoreHiddenSeries: true,
        spacing: [10, 10, 15, 10],
        resetZoomButton: {
          theme: {
            zIndex: 20
          },
          position: {
            align: 'right',
            x: -10,
            y: 10
          }
        },
        width: null,
        height: null,
        borderColor: '#335cad',
        backgroundColor: '#ffffff',
        plotBorderColor: '#cccccc'
      },
      title: {
        text: 'Chart title',
        align: 'center',
        margin: 15,
        widthAdjust: -44
      },
      subtitle: {
        text: '',
        align: 'center',
        widthAdjust: -44
      },
      plotOptions: {},
      labels: {
        style: {
          position: 'absolute',
          color: '#333333'
        }
      },
      legend: {
        enabled: true,
        align: 'center',
        layout: 'horizontal',
        labelFormatter: function() {
          return this.name;
        },
        borderColor: '#999999',
        borderRadius: 0,
        navigation: {
          activeColor: '#003399',
          inactiveColor: '#cccccc'
        },
        itemStyle: {
          color: '#333333',
          fontSize: '12px',
          fontWeight: 'bold'
        },
        itemHoverStyle: {
          color: '#000000'
        },
        itemHiddenStyle: {
          color: '#cccccc'
        },
        shadow: false,
        itemCheckboxStyle: {
          position: 'absolute',
          width: '13px',
          height: '13px'
        },
        squareSymbol: true,
        symbolPadding: 5,
        verticalAlign: 'bottom',
        x: 0,
        y: 0,
        title: {
          style: {
            fontWeight: 'bold'
          }
        }
      },
      loading: {
        labelStyle: {
          fontWeight: 'bold',
          position: 'relative',
          top: '45%'
        },
        style: {
          position: 'absolute',
          backgroundColor: '#ffffff',
          opacity: 0.5,
          textAlign: 'center'
        }
      },
      tooltip: {
        enabled: true,
        animation: svg,
        borderRadius: 3,
        dateTimeLabelFormats: {
          millisecond: '%A, %b %e, %H:%M:%S.%L',
          second: '%A, %b %e, %H:%M:%S',
          minute: '%A, %b %e, %H:%M',
          hour: '%A, %b %e, %H:%M',
          day: '%A, %b %e, %Y',
          week: 'Week from %A, %b %e, %Y',
          month: '%B %Y',
          year: '%Y'
        },
        footerFormat: '',
        padding: 8,
        snap: isTouchDevice ? 25 : 10,
        backgroundColor: color('#f7f7f7').setOpacity(0.85).get(),
        borderWidth: 1,
        headerFormat: '<span style="font-size: 10px">{point.key}</span><br/>',
        pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>',
        shadow: true,
        style: {
          color: '#333333',
          cursor: 'default',
          fontSize: '12px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }
      },
      credits: {
        enabled: true,
        href: 'http://www.highcharts.com',
        position: {
          align: 'right',
          x: -10,
          verticalAlign: 'bottom',
          y: -5
        },
        style: {
          cursor: 'pointer',
          color: '#999999',
          fontSize: '9px'
        },
        text: 'Highcharts.com'
      }
    };

    function getTimezoneOffsetOption() {
      var globalOptions = H.defaultOptions.global,
        moment = win.moment;
      if (globalOptions.timezone) {
        if (!moment) {
          H.error(25);
        } else {
          return function(timestamp) {
            return -moment.tz(
              timestamp,
              globalOptions.timezone
            ).utcOffset();
          };
        }
      }
      return globalOptions.useUTC && globalOptions.getTimezoneOffset;
    }

    function setTimeMethods() {
      var globalOptions = H.defaultOptions.global,
        Date,
        useUTC = globalOptions.useUTC,
        GET = useUTC ? 'getUTC' : 'get',
        SET = useUTC ? 'setUTC' : 'set';
      H.Date = Date = globalOptions.Date || win.Date;
      Date.hcTimezoneOffset = useUTC && globalOptions.timezoneOffset;
      Date.hcGetTimezoneOffset = getTimezoneOffsetOption();
      Date.hcMakeTime = function(year, month, date, hours, minutes, seconds) {
        var d;
        if (useUTC) {
          d = Date.UTC.apply(0, arguments);
          d += getTZOffset(d);
        } else {
          d = new Date(
            year,
            month,
            pick(date, 1),
            pick(hours, 0),
            pick(minutes, 0),
            pick(seconds, 0)
          ).getTime();
        }
        return d;
      };
      each(['Minutes', 'Hours', 'Day', 'Date', 'Month', 'FullYear'], function(s) {
        Date['hcGet' + s] = GET + s;
      });
      each(['Milliseconds', 'Seconds', 'Minutes', 'Hours', 'Date', 'Month', 'FullYear'], function(s) {
        Date['hcSet' + s] = SET + s;
      });
    }
    H.setOptions = function(options) {
      H.defaultOptions = merge(true, H.defaultOptions, options);
      setTimeMethods();
      return H.defaultOptions;
    };
    H.getOptions = function() {
      return H.defaultOptions;
    };
    H.defaultPlotOptions = H.defaultOptions.plotOptions;
    setTimeMethods();
  }(Highcharts));
  (function(H) {
    'use strict';
    var arrayMax = H.arrayMax,
      arrayMin = H.arrayMin,
      defined = H.defined,
      destroyObjectProperties = H.destroyObjectProperties,
      each = H.each,
      erase = H.erase,
      merge = H.merge,
      pick = H.pick;
    H.PlotLineOrBand = function(axis, options) {
      this.axis = axis;
      if (options) {
        this.options = options;
        this.id = options.id;
      }
    };
    H.PlotLineOrBand.prototype = {
      render: function() {
        var plotLine = this,
          axis = plotLine.axis,
          horiz = axis.horiz,
          options = plotLine.options,
          optionsLabel = options.label,
          label = plotLine.label,
          to = options.to,
          from = options.from,
          value = options.value,
          isBand = defined(from) && defined(to),
          isLine = defined(value),
          svgElem = plotLine.svgElem,
          isNew = !svgElem,
          path = [],
          addEvent,
          eventType,
          color = options.color,
          zIndex = pick(options.zIndex, 0),
          events = options.events,
          attribs = {
            'class': 'highcharts-plot-' + (isBand ? 'band ' : 'line ') + (options.className || '')
          },
          groupAttribs = {},
          renderer = axis.chart.renderer,
          groupName = isBand ? 'bands' : 'lines',
          group,
          log2lin = axis.log2lin;
        if (axis.isLog) {
          from = log2lin(from);
          to = log2lin(to);
          value = log2lin(value);
        }
        if (isLine) {
          attribs = {
            stroke: color,
            'stroke-width': options.width
          };
          if (options.dashStyle) {
            attribs.dashstyle = options.dashStyle;
          }
        } else if (isBand) {
          if (color) {
            attribs.fill = color;
          }
          if (options.borderWidth) {
            attribs.stroke = options.borderColor;
            attribs['stroke-width'] = options.borderWidth;
          }
        }
        groupAttribs.zIndex = zIndex;
        groupName += '-' + zIndex;
        group = axis[groupName];
        if (!group) {
          axis[groupName] = group = renderer.g('plot-' + groupName)
            .attr(groupAttribs).add();
        }
        if (isNew) {
          plotLine.svgElem = svgElem =
            renderer
            .path()
            .attr(attribs).add(group);
        }
        if (isLine) {
          path = axis.getPlotLinePath(value, svgElem.strokeWidth());
        } else if (isBand) {
          path = axis.getPlotBandPath(from, to, options);
        } else {
          return;
        }
        if (isNew && path && path.length) {
          svgElem.attr({
            d: path
          });
          if (events) {
            addEvent = function(eventType) {
              svgElem.on(eventType, function(e) {
                events[eventType].apply(plotLine, [e]);
              });
            };
            for (eventType in events) {
              addEvent(eventType);
            }
          }
        } else if (svgElem) {
          if (path) {
            svgElem.show();
            svgElem.animate({
              d: path
            });
          } else {
            svgElem.hide();
            if (label) {
              plotLine.label = label = label.destroy();
            }
          }
        }
        if (optionsLabel && defined(optionsLabel.text) && path && path.length &&
          axis.width > 0 && axis.height > 0 && !path.flat) {
          optionsLabel = merge({
            align: horiz && isBand && 'center',
            x: horiz ? !isBand && 4 : 10,
            verticalAlign: !horiz && isBand && 'middle',
            y: horiz ? isBand ? 16 : 10 : isBand ? 6 : -4,
            rotation: horiz && !isBand && 90
          }, optionsLabel);
          this.renderLabel(optionsLabel, path, isBand, zIndex);
        } else if (label) {
          label.hide();
        }
        return plotLine;
      },
      renderLabel: function(optionsLabel, path, isBand, zIndex) {
        var plotLine = this,
          label = plotLine.label,
          renderer = plotLine.axis.chart.renderer,
          attribs,
          xs,
          ys,
          x,
          y;
        if (!label) {
          attribs = {
            align: optionsLabel.textAlign || optionsLabel.align,
            rotation: optionsLabel.rotation,
            'class': 'highcharts-plot-' + (isBand ? 'band' : 'line') + '-label ' + (optionsLabel.className || '')
          };
          attribs.zIndex = zIndex;
          plotLine.label = label = renderer.text(
              optionsLabel.text,
              0,
              0,
              optionsLabel.useHTML
            )
            .attr(attribs)
            .add();
          label.css(optionsLabel.style);
        }
        xs = [path[1], path[4], (isBand ? path[6] : path[1])];
        ys = [path[2], path[5], (isBand ? path[7] : path[2])];
        x = arrayMin(xs);
        y = arrayMin(ys);
        label.align(optionsLabel, false, {
          x: x,
          y: y,
          width: arrayMax(xs) - x,
          height: arrayMax(ys) - y
        });
        label.show();
      },
      destroy: function() {
        erase(this.axis.plotLinesAndBands, this);
        delete this.axis;
        destroyObjectProperties(this);
      }
    };
    H.AxisPlotLineOrBandExtension = {
      getPlotBandPath: function(from, to) {
        var toPath = this.getPlotLinePath(to, null, null, true),
          path = this.getPlotLinePath(from, null, null, true);
        if (path && toPath) {
          path.flat = path.toString() === toPath.toString();
          path.push(
            toPath[4],
            toPath[5],
            toPath[1],
            toPath[2],
            'z'
          );
        } else {
          path = null;
        }
        return path;
      },
      addPlotBand: function(options) {
        return this.addPlotBandOrLine(options, 'plotBands');
      },
      addPlotLine: function(options) {
        return this.addPlotBandOrLine(options, 'plotLines');
      },
      addPlotBandOrLine: function(options, coll) {
        var obj = new H.PlotLineOrBand(this, options).render(),
          userOptions = this.userOptions;
        if (obj) {
          if (coll) {
            userOptions[coll] = userOptions[coll] || [];
            userOptions[coll].push(options);
          }
          this.plotLinesAndBands.push(obj);
        }
        return obj;
      },
      removePlotBandOrLine: function(id) {
        var plotLinesAndBands = this.plotLinesAndBands,
          options = this.options,
          userOptions = this.userOptions,
          i = plotLinesAndBands.length;
        while (i--) {
          if (plotLinesAndBands[i].id === id) {
            plotLinesAndBands[i].destroy();
          }
        }
        each([options.plotLines || [], userOptions.plotLines || [], options.plotBands || [], userOptions.plotBands || []], function(arr) {
          i = arr.length;
          while (i--) {
            if (arr[i].id === id) {
              erase(arr, arr[i]);
            }
          }
        });
      }
    };
  }(Highcharts));
  (function(H) {
    'use strict';
    var correctFloat = H.correctFloat,
      defined = H.defined,
      destroyObjectProperties = H.destroyObjectProperties,
      isNumber = H.isNumber,
      merge = H.merge,
      pick = H.pick,
      deg2rad = H.deg2rad;
    H.Tick = function(axis, pos, type, noLabel) {
      this.axis = axis;
      this.pos = pos;
      this.type = type || '';
      this.isNew = true;
      if (!type && !noLabel) {
        this.addLabel();
      }
    };
    H.Tick.prototype = {
      addLabel: function() {
        var tick = this,
          axis = tick.axis,
          options = axis.options,
          chart = axis.chart,
          categories = axis.categories,
          names = axis.names,
          pos = tick.pos,
          labelOptions = options.labels,
          str,
          tickPositions = axis.tickPositions,
          isFirst = pos === tickPositions[0],
          isLast = pos === tickPositions[tickPositions.length - 1],
          value = categories ?
          pick(categories[pos], names[pos], pos) :
          pos,
          label = tick.label,
          tickPositionInfo = tickPositions.info,
          dateTimeLabelFormat;
        if (axis.isDatetimeAxis && tickPositionInfo) {
          dateTimeLabelFormat =
            options.dateTimeLabelFormats[
              tickPositionInfo.higherRanks[pos] || tickPositionInfo.unitName
            ];
        }
        tick.isFirst = isFirst;
        tick.isLast = isLast;
        str = axis.labelFormatter.call({
          axis: axis,
          chart: chart,
          isFirst: isFirst,
          isLast: isLast,
          dateTimeLabelFormat: dateTimeLabelFormat,
          value: axis.isLog ? correctFloat(axis.lin2log(value)) : value
        });
        if (!defined(label)) {
          tick.label = label =
            defined(str) && labelOptions.enabled ?
            chart.renderer.text(
              str,
              0,
              0,
              labelOptions.useHTML
            )
            .css(merge(labelOptions.style))
            .add(axis.labelGroup) :
            null;
          tick.labelLength = label && label.getBBox().width;
          tick.rotation = 0;
        } else if (label) {
          label.attr({
            text: str
          });
        }
      },
      getLabelSize: function() {
        return this.label ?
          this.label.getBBox()[this.axis.horiz ? 'height' : 'width'] :
          0;
      },
      handleOverflow: function(xy) {
        var axis = this.axis,
          pxPos = xy.x,
          chartWidth = axis.chart.chartWidth,
          spacing = axis.chart.spacing,
          leftBound = pick(axis.labelLeft, Math.min(axis.pos, spacing[3])),
          rightBound = pick(axis.labelRight, Math.max(axis.pos + axis.len, chartWidth - spacing[1])),
          label = this.label,
          rotation = this.rotation,
          factor = {
            left: 0,
            center: 0.5,
            right: 1
          }[axis.labelAlign],
          labelWidth = label.getBBox().width,
          slotWidth = axis.getSlotWidth(),
          modifiedSlotWidth = slotWidth,
          xCorrection = factor,
          goRight = 1,
          leftPos,
          rightPos,
          textWidth,
          css = {};
        if (!rotation) {
          leftPos = pxPos - factor * labelWidth;
          rightPos = pxPos + (1 - factor) * labelWidth;
          if (leftPos < leftBound) {
            modifiedSlotWidth = xy.x + modifiedSlotWidth * (1 - factor) - leftBound;
          } else if (rightPos > rightBound) {
            modifiedSlotWidth = rightBound - xy.x + modifiedSlotWidth * factor;
            goRight = -1;
          }
          modifiedSlotWidth = Math.min(slotWidth, modifiedSlotWidth);
          if (modifiedSlotWidth < slotWidth && axis.labelAlign === 'center') {
            xy.x += goRight * (slotWidth - modifiedSlotWidth - xCorrection *
              (slotWidth - Math.min(labelWidth, modifiedSlotWidth)));
          }
          if (labelWidth > modifiedSlotWidth || (axis.autoRotation && (label.styles || {}).width)) {
            textWidth = modifiedSlotWidth;
          }
        } else if (rotation < 0 && pxPos - factor * labelWidth < leftBound) {
          textWidth = Math.round(pxPos / Math.cos(rotation * deg2rad) - leftBound);
        } else if (rotation > 0 && pxPos + factor * labelWidth > rightBound) {
          textWidth = Math.round((chartWidth - pxPos) / Math.cos(rotation * deg2rad));
        }
        if (textWidth) {
          css.width = textWidth;
          if (!(axis.options.labels.style || {}).textOverflow) {
            css.textOverflow = 'ellipsis';
          }
          label.css(css);
        }
      },
      getPosition: function(horiz, pos, tickmarkOffset, old) {
        var axis = this.axis,
          chart = axis.chart,
          cHeight = (old && chart.oldChartHeight) || chart.chartHeight;
        return {
          x: horiz ?
            axis.translate(pos + tickmarkOffset, null, null, old) + axis.transB : axis.left + axis.offset +
            (axis.opposite ?
              ((old && chart.oldChartWidth) || chart.chartWidth) - axis.right - axis.left :
              0
            ),
          y: horiz ?
            cHeight - axis.bottom + axis.offset - (axis.opposite ? axis.height : 0) : cHeight - axis.translate(pos + tickmarkOffset, null, null, old) - axis.transB
        };
      },
      getLabelPosition: function(x, y, label, horiz, labelOptions, tickmarkOffset, index, step) {
        var axis = this.axis,
          transA = axis.transA,
          reversed = axis.reversed,
          staggerLines = axis.staggerLines,
          rotCorr = axis.tickRotCorr || {
            x: 0,
            y: 0
          },
          yOffset = labelOptions.y,
          line;
        if (!defined(yOffset)) {
          if (axis.side === 0) {
            yOffset = label.rotation ? -8 : -label.getBBox().height;
          } else if (axis.side === 2) {
            yOffset = rotCorr.y + 8;
          } else {
            yOffset = Math.cos(label.rotation * deg2rad) * (rotCorr.y - label.getBBox(false, 0).height / 2);
          }
        }
        x = x + labelOptions.x + rotCorr.x - (tickmarkOffset && horiz ?
          tickmarkOffset * transA * (reversed ? -1 : 1) : 0);
        y = y + yOffset - (tickmarkOffset && !horiz ?
          tickmarkOffset * transA * (reversed ? 1 : -1) : 0);
        if (staggerLines) {
          line = (index / (step || 1) % staggerLines);
          if (axis.opposite) {
            line = staggerLines - line - 1;
          }
          y += line * (axis.labelOffset / staggerLines);
        }
        return {
          x: x,
          y: Math.round(y)
        };
      },
      getMarkPath: function(x, y, tickLength, tickWidth, horiz, renderer) {
        return renderer.crispLine([
          'M',
          x,
          y,
          'L',
          x + (horiz ? 0 : -tickLength),
          y + (horiz ? tickLength : 0)
        ], tickWidth);
      },
      render: function(index, old, opacity) {
        var tick = this,
          axis = tick.axis,
          options = axis.options,
          chart = axis.chart,
          renderer = chart.renderer,
          horiz = axis.horiz,
          type = tick.type,
          label = tick.label,
          pos = tick.pos,
          labelOptions = options.labels,
          gridLine = tick.gridLine,
          tickPrefix = type ? type + 'Tick' : 'tick',
          tickSize = axis.tickSize(tickPrefix),
          gridLinePath,
          mark = tick.mark,
          isNewMark = !mark,
          step = labelOptions.step,
          attribs = {},
          show = true,
          tickmarkOffset = axis.tickmarkOffset,
          xy = tick.getPosition(horiz, pos, tickmarkOffset, old),
          x = xy.x,
          y = xy.y,
          reverseCrisp = ((horiz && x === axis.pos + axis.len) ||
            (!horiz && y === axis.pos)) ? -1 : 1;
        var gridPrefix = type ? type + 'Grid' : 'grid',
          gridLineWidth = options[gridPrefix + 'LineWidth'],
          gridLineColor = options[gridPrefix + 'LineColor'],
          dashStyle = options[gridPrefix + 'LineDashStyle'],
          tickWidth = pick(options[tickPrefix + 'Width'], !type && axis.isXAxis ? 1 : 0),
          tickColor = options[tickPrefix + 'Color'];
        opacity = pick(opacity, 1);
        this.isActive = true;
        if (!gridLine) {
          attribs.stroke = gridLineColor;
          attribs['stroke-width'] = gridLineWidth;
          if (dashStyle) {
            attribs.dashstyle = dashStyle;
          }
          if (!type) {
            attribs.zIndex = 1;
          }
          if (old) {
            attribs.opacity = 0;
          }
          tick.gridLine = gridLine = renderer.path()
            .attr(attribs)
            .addClass('highcharts-' + (type ? type + '-' : '') + 'grid-line')
            .add(axis.gridGroup);
        }
        if (!old && gridLine) {
          gridLinePath = axis.getPlotLinePath(pos + tickmarkOffset, gridLine.strokeWidth() * reverseCrisp, old, true);
          if (gridLinePath) {
            gridLine[tick.isNew ? 'attr' : 'animate']({
              d: gridLinePath,
              opacity: opacity
            });
          }
        }
        if (tickSize) {
          if (axis.opposite) {
            tickSize[0] = -tickSize[0];
          }
          if (isNewMark) {
            tick.mark = mark = renderer.path()
              .addClass('highcharts-' + (type ? type + '-' : '') + 'tick')
              .add(axis.axisGroup);
            mark.attr({
              stroke: tickColor,
              'stroke-width': tickWidth
            });
          }
          mark[isNewMark ? 'attr' : 'animate']({
            d: tick.getMarkPath(x, y, tickSize[0], mark.strokeWidth() * reverseCrisp, horiz, renderer),
            opacity: opacity
          });
        }
        if (label && isNumber(x)) {
          label.xy = xy = tick.getLabelPosition(x, y, label, horiz, labelOptions, tickmarkOffset, index, step);
          if ((tick.isFirst && !tick.isLast && !pick(options.showFirstLabel, 1)) ||
            (tick.isLast && !tick.isFirst && !pick(options.showLastLabel, 1))) {
            show = false;
          } else if (horiz && !axis.isRadial && !labelOptions.step &&
            !labelOptions.rotation && !old && opacity !== 0) {
            tick.handleOverflow(xy);
          }
          if (step && index % step) {
            show = false;
          }
          if (show && isNumber(xy.y)) {
            xy.opacity = opacity;
            label[tick.isNew ? 'attr' : 'animate'](xy);
          } else {
            label.attr('y', -9999);
          }
          tick.isNew = false;
        }
      },
      destroy: function() {
        destroyObjectProperties(this, this.axis);
      }
    };
  }(Highcharts));
  (function(H) {
    'use strict';
    var addEvent = H.addEvent,
      animObject = H.animObject,
      arrayMax = H.arrayMax,
      arrayMin = H.arrayMin,
      AxisPlotLineOrBandExtension = H.AxisPlotLineOrBandExtension,
      color = H.color,
      correctFloat = H.correctFloat,
      defaultOptions = H.defaultOptions,
      defined = H.defined,
      deg2rad = H.deg2rad,
      destroyObjectProperties = H.destroyObjectProperties,
      each = H.each,
      extend = H.extend,
      fireEvent = H.fireEvent,
      format = H.format,
      getMagnitude = H.getMagnitude,
      grep = H.grep,
      inArray = H.inArray,
      isArray = H.isArray,
      isNumber = H.isNumber,
      isString = H.isString,
      merge = H.merge,
      normalizeTickInterval = H.normalizeTickInterval,
      pick = H.pick,
      PlotLineOrBand = H.PlotLineOrBand,
      removeEvent = H.removeEvent,
      splat = H.splat,
      syncTimeout = H.syncTimeout,
      Tick = H.Tick;
    H.Axis = function() {
      this.init.apply(this, arguments);
    };
    H.Axis.prototype = {
      defaultOptions: {
        dateTimeLabelFormats: {
          millisecond: '%H:%M:%S.%L',
          second: '%H:%M:%S',
          minute: '%H:%M',
          hour: '%H:%M',
          day: '%e. %b',
          week: '%e. %b',
          month: '%b \'%y',
          year: '%Y'
        },
        endOnTick: false,
        labels: {
          enabled: true,
          style: {
            color: '#666666',
            cursor: 'default',
            fontSize: '11px'
          },
          x: 0
        },
        minPadding: 0.01,
        maxPadding: 0.01,
        minorTickLength: 2,
        minorTickPosition: 'outside',
        startOfWeek: 1,
        startOnTick: false,
        tickLength: 10,
        tickmarkPlacement: 'between',
        tickPixelInterval: 100,
        tickPosition: 'outside',
        title: {
          align: 'middle',
          style: {
            color: '#666666'
          }
        },
        type: 'linear',
        minorGridLineColor: '#f2f2f2',
        minorGridLineWidth: 1,
        minorTickColor: '#999999',
        lineColor: '#ccd6eb',
        lineWidth: 1,
        gridLineColor: '#e6e6e6',
        tickColor: '#ccd6eb'
      },
      defaultYAxisOptions: {
        endOnTick: true,
        tickPixelInterval: 72,
        showLastLabel: true,
        labels: {
          x: -8
        },
        maxPadding: 0.05,
        minPadding: 0.05,
        startOnTick: true,
        title: {
          rotation: 270,
          text: 'Values'
        },
        stackLabels: {
          enabled: false,
          formatter: function() {
            return H.numberFormat(this.total, -1);
          },
          style: {
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#000000',
            textOutline: '1px contrast'
          }
        },
        gridLineWidth: 1,
        lineWidth: 0
      },
      defaultLeftAxisOptions: {
        labels: {
          x: -15
        },
        title: {
          rotation: 270
        }
      },
      defaultRightAxisOptions: {
        labels: {
          x: 15
        },
        title: {
          rotation: 90
        }
      },
      defaultBottomAxisOptions: {
        labels: {
          autoRotation: [-45],
          x: 0
        },
        title: {
          rotation: 0
        }
      },
      defaultTopAxisOptions: {
        labels: {
          autoRotation: [-45],
          x: 0
        },
        title: {
          rotation: 0
        }
      },
      init: function(chart, userOptions) {
        var isXAxis = userOptions.isX,
          axis = this;
        axis.chart = chart;
        axis.horiz = chart.inverted ? !isXAxis : isXAxis;
        axis.isXAxis = isXAxis;
        axis.coll = axis.coll || (isXAxis ? 'xAxis' : 'yAxis');
        axis.opposite = userOptions.opposite;
        axis.side = userOptions.side || (axis.horiz ?
          (axis.opposite ? 0 : 2) :
          (axis.opposite ? 1 : 3));
        axis.setOptions(userOptions);
        var options = this.options,
          type = options.type,
          isDatetimeAxis = type === 'datetime';
        axis.labelFormatter = options.labels.formatter || axis.defaultLabelFormatter;
        axis.userOptions = userOptions;
        axis.minPixelPadding = 0;
        axis.reversed = options.reversed;
        axis.visible = options.visible !== false;
        axis.zoomEnabled = options.zoomEnabled !== false;
        axis.hasNames = type === 'category' || options.categories === true;
        axis.categories = options.categories || axis.hasNames;
        axis.names = axis.names || [];
        axis.isLog = type === 'logarithmic';
        axis.isDatetimeAxis = isDatetimeAxis;
        axis.isLinked = defined(options.linkedTo);
        axis.ticks = {};
        axis.labelEdge = [];
        axis.minorTicks = {};
        axis.plotLinesAndBands = [];
        axis.alternateBands = {};
        axis.len = 0;
        axis.minRange = axis.userMinRange = options.minRange || options.maxZoom;
        axis.range = options.range;
        axis.offset = options.offset || 0;
        axis.stacks = {};
        axis.oldStacks = {};
        axis.stacksTouched = 0;
        axis.max = null;
        axis.min = null;
        axis.crosshair = pick(options.crosshair, splat(chart.options.tooltip.crosshairs)[isXAxis ? 0 : 1], false);
        var eventType,
          events = axis.options.events;
        if (inArray(axis, chart.axes) === -1) {
          if (isXAxis) {
            chart.axes.splice(chart.xAxis.length, 0, axis);
          } else {
            chart.axes.push(axis);
          }
          chart[axis.coll].push(axis);
        }
        axis.series = axis.series || [];
        if (chart.inverted && isXAxis && axis.reversed === undefined) {
          axis.reversed = true;
        }
        axis.removePlotBand = axis.removePlotBandOrLine;
        axis.removePlotLine = axis.removePlotBandOrLine;
        for (eventType in events) {
          addEvent(axis, eventType, events[eventType]);
        }
        if (axis.isLog) {
          axis.val2lin = axis.log2lin;
          axis.lin2val = axis.lin2log;
        }
      },
      setOptions: function(userOptions) {
        this.options = merge(
          this.defaultOptions,
          this.coll === 'yAxis' && this.defaultYAxisOptions, [this.defaultTopAxisOptions, this.defaultRightAxisOptions,
            this.defaultBottomAxisOptions, this.defaultLeftAxisOptions
          ][this.side],
          merge(
            defaultOptions[this.coll],
            userOptions
          )
        );
      },
      defaultLabelFormatter: function() {
        var axis = this.axis,
          value = this.value,
          categories = axis.categories,
          dateTimeLabelFormat = this.dateTimeLabelFormat,
          lang = defaultOptions.lang,
          numericSymbols = lang.numericSymbols,
          numSymMagnitude = lang.numericSymbolMagnitude || 1000,
          i = numericSymbols && numericSymbols.length,
          multi,
          ret,
          formatOption = axis.options.labels.format,
          numericSymbolDetector = axis.isLog ? value : axis.tickInterval;
        if (formatOption) {
          ret = format(formatOption, this);
        } else if (categories) {
          ret = value;
        } else if (dateTimeLabelFormat) {
          ret = H.dateFormat(dateTimeLabelFormat, value);
        } else if (i && numericSymbolDetector >= 1000) {
          while (i-- && ret === undefined) {
            multi = Math.pow(numSymMagnitude, i + 1);
            if (numericSymbolDetector >= multi && (value * 10) % multi === 0 && numericSymbols[i] !== null && value !== 0) {
              ret = H.numberFormat(value / multi, -1) + numericSymbols[i];
            }
          }
        }
        if (ret === undefined) {
          if (Math.abs(value) >= 10000) {
            ret = H.numberFormat(value, -1);
          } else {
            ret = H.numberFormat(value, -1, undefined, '');
          }
        }
        return ret;
      },
      getSeriesExtremes: function() {
        var axis = this,
          chart = axis.chart;
        axis.hasVisibleSeries = false;
        axis.dataMin = axis.dataMax = axis.threshold = null;
        axis.softThreshold = !axis.isXAxis;
        if (axis.buildStacks) {
          axis.buildStacks();
        }
        each(axis.series, function(series) {
          if (series.visible || !chart.options.chart.ignoreHiddenSeries) {
            var seriesOptions = series.options,
              xData,
              threshold = seriesOptions.threshold,
              seriesDataMin,
              seriesDataMax;
            axis.hasVisibleSeries = true;
            if (axis.isLog && threshold <= 0) {
              threshold = null;
            }
            if (axis.isXAxis) {
              xData = series.xData;
              if (xData.length) {
                seriesDataMin = arrayMin(xData);
                if (!isNumber(seriesDataMin) && !(seriesDataMin instanceof Date)) {
                  xData = grep(xData, function(x) {
                    return isNumber(x);
                  });
                  seriesDataMin = arrayMin(xData);
                }
                axis.dataMin = Math.min(pick(axis.dataMin, xData[0]), seriesDataMin);
                axis.dataMax = Math.max(pick(axis.dataMax, xData[0]), arrayMax(xData));
              }
            } else {
              series.getExtremes();
              seriesDataMax = series.dataMax;
              seriesDataMin = series.dataMin;
              if (defined(seriesDataMin) && defined(seriesDataMax)) {
                axis.dataMin = Math.min(pick(axis.dataMin, seriesDataMin), seriesDataMin);
                axis.dataMax = Math.max(pick(axis.dataMax, seriesDataMax), seriesDataMax);
              }
              if (defined(threshold)) {
                axis.threshold = threshold;
              }
              if (!seriesOptions.softThreshold || axis.isLog) {
                axis.softThreshold = false;
              }
            }
          }
        });
      },
      translate: function(val, backwards, cvsCoord, old, handleLog, pointPlacement) {
        var axis = this.linkedParent || this,
          sign = 1,
          cvsOffset = 0,
          localA = old ? axis.oldTransA : axis.transA,
          localMin = old ? axis.oldMin : axis.min,
          returnValue,
          minPixelPadding = axis.minPixelPadding,
          doPostTranslate = (axis.isOrdinal || axis.isBroken || (axis.isLog && handleLog)) && axis.lin2val;
        if (!localA) {
          localA = axis.transA;
        }
        if (cvsCoord) {
          sign *= -1;
          cvsOffset = axis.len;
        }
        if (axis.reversed) {
          sign *= -1;
          cvsOffset -= sign * (axis.sector || axis.len);
        }
        if (backwards) {
          val = val * sign + cvsOffset;
          val -= minPixelPadding;
          returnValue = val / localA + localMin;
          if (doPostTranslate) {
            returnValue = axis.lin2val(returnValue);
          }
        } else {
          if (doPostTranslate) {
            val = axis.val2lin(val);
          }
          returnValue = sign * (val - localMin) * localA + cvsOffset +
            (sign * minPixelPadding) +
            (isNumber(pointPlacement) ? localA * pointPlacement : 0);
        }
        return returnValue;
      },
      toPixels: function(value, paneCoordinates) {
        return this.translate(value, false, !this.horiz, null, true) + (paneCoordinates ? 0 : this.pos);
      },
      toValue: function(pixel, paneCoordinates) {
        return this.translate(pixel - (paneCoordinates ? 0 : this.pos), true, !this.horiz, null, true);
      },
      getPlotLinePath: function(value, lineWidth, old, force, translatedValue) {
        var axis = this,
          chart = axis.chart,
          axisLeft = axis.left,
          axisTop = axis.top,
          x1,
          y1,
          x2,
          y2,
          cHeight = (old && chart.oldChartHeight) || chart.chartHeight,
          cWidth = (old && chart.oldChartWidth) || chart.chartWidth,
          skip,
          transB = axis.transB,
          between = function(x, a, b) {
            if (x < a || x > b) {
              if (force) {
                x = Math.min(Math.max(a, x), b);
              } else {
                skip = true;
              }
            }
            return x;
          };
        translatedValue = pick(translatedValue, axis.translate(value, null, null, old));
        x1 = x2 = Math.round(translatedValue + transB);
        y1 = y2 = Math.round(cHeight - translatedValue - transB);
        if (!isNumber(translatedValue)) {
          skip = true;
        } else if (axis.horiz) {
          y1 = axisTop;
          y2 = cHeight - axis.bottom;
          x1 = x2 = between(x1, axisLeft, axisLeft + axis.width);
        } else {
          x1 = axisLeft;
          x2 = cWidth - axis.right;
          y1 = y2 = between(y1, axisTop, axisTop + axis.height);
        }
        return skip && !force ?
          null :
          chart.renderer.crispLine(['M', x1, y1, 'L', x2, y2], lineWidth || 1);
      },
      getLinearTickPositions: function(tickInterval, min, max) {
        var pos,
          lastPos,
          roundedMin = correctFloat(Math.floor(min / tickInterval) * tickInterval),
          roundedMax = correctFloat(Math.ceil(max / tickInterval) * tickInterval),
          tickPositions = [];
        if (min === max && isNumber(min)) {
          return [min];
        }
        pos = roundedMin;
        while (pos <= roundedMax) {
          tickPositions.push(pos);
          pos = correctFloat(pos + tickInterval);
          if (pos === lastPos) {
            break;
          }
          lastPos = pos;
        }
        return tickPositions;
      },
      getMinorTickPositions: function() {
        var axis = this,
          options = axis.options,
          tickPositions = axis.tickPositions,
          minorTickInterval = axis.minorTickInterval,
          minorTickPositions = [],
          pos,
          i,
          pointRangePadding = axis.pointRangePadding || 0,
          min = axis.min - pointRangePadding,
          max = axis.max + pointRangePadding,
          range = max - min,
          len;
        if (range && range / minorTickInterval < axis.len / 3) {
          if (axis.isLog) {
            len = tickPositions.length;
            for (i = 1; i < len; i++) {
              minorTickPositions = minorTickPositions.concat(
                axis.getLogTickPositions(minorTickInterval, tickPositions[i - 1], tickPositions[i], true)
              );
            }
          } else if (axis.isDatetimeAxis && options.minorTickInterval === 'auto') {
            minorTickPositions = minorTickPositions.concat(
              axis.getTimeTicks(
                axis.normalizeTimeTickInterval(minorTickInterval),
                min,
                max,
                options.startOfWeek
              )
            );
          } else {
            for (
              pos = min + (tickPositions[0] - min) % minorTickInterval; pos <= max; pos += minorTickInterval
            ) {
              if (pos === minorTickPositions[0]) {
                break;
              }
              minorTickPositions.push(pos);
            }
          }
        }
        if (minorTickPositions.length !== 0) {
          axis.trimTicks(minorTickPositions, options.startOnTick, options.endOnTick);
        }
        return minorTickPositions;
      },
      adjustForMinRange: function() {
        var axis = this,
          options = axis.options,
          min = axis.min,
          max = axis.max,
          zoomOffset,
          spaceAvailable = axis.dataMax - axis.dataMin >= axis.minRange,
          closestDataRange,
          i,
          distance,
          xData,
          loopLength,
          minArgs,
          maxArgs,
          minRange;
        if (axis.isXAxis && axis.minRange === undefined && !axis.isLog) {
          if (defined(options.min) || defined(options.max)) {
            axis.minRange = null;
          } else {
            each(axis.series, function(series) {
              xData = series.xData;
              loopLength = series.xIncrement ? 1 : xData.length - 1;
              for (i = loopLength; i > 0; i--) {
                distance = xData[i] - xData[i - 1];
                if (closestDataRange === undefined || distance < closestDataRange) {
                  closestDataRange = distance;
                }
              }
            });
            axis.minRange = Math.min(closestDataRange * 5, axis.dataMax - axis.dataMin);
          }
        }
        if (max - min < axis.minRange) {
          minRange = axis.minRange;
          zoomOffset = (minRange - max + min) / 2;
          minArgs = [min - zoomOffset, pick(options.min, min - zoomOffset)];
          if (spaceAvailable) {
            minArgs[2] = axis.isLog ? axis.log2lin(axis.dataMin) : axis.dataMin;
          }
          min = arrayMax(minArgs);
          maxArgs = [min + minRange, pick(options.max, min + minRange)];
          if (spaceAvailable) {
            maxArgs[2] = axis.isLog ? axis.log2lin(axis.dataMax) : axis.dataMax;
          }
          max = arrayMin(maxArgs);
          if (max - min < minRange) {
            minArgs[0] = max - minRange;
            minArgs[1] = pick(options.min, max - minRange);
            min = arrayMax(minArgs);
          }
        }
        axis.min = min;
        axis.max = max;
      },
      getClosest: function() {
        var ret;
        if (this.categories) {
          ret = 1;
        } else {
          each(this.series, function(series) {
            var seriesClosest = series.closestPointRange,
              visible = series.visible ||
              !series.chart.options.chart.ignoreHiddenSeries;
            if (!series.noSharedTooltip &&
              defined(seriesClosest) &&
              visible
            ) {
              ret = defined(ret) ?
                Math.min(ret, seriesClosest) :
                seriesClosest;
            }
          });
        }
        return ret;
      },
      nameToX: function(point) {
        var explicitCategories = isArray(this.categories),
          names = explicitCategories ? this.categories : this.names,
          nameX = point.options.x,
          x;
        point.series.requireSorting = false;
        if (!defined(nameX)) {
          nameX = this.options.uniqueNames === false ?
            point.series.autoIncrement() :
            inArray(point.name, names);
        }
        if (nameX === -1) {
          if (!explicitCategories) {
            x = names.length;
          }
        } else {
          x = nameX;
        }
        this.names[x] = point.name;
        return x;
      },
      updateNames: function() {
        var axis = this;
        if (this.names.length > 0) {
          this.names.length = 0;
          this.minRange = undefined;
          each(this.series || [], function(series) {
            series.xIncrement = null;
            if (!series.points || series.isDirtyData) {
              series.processData();
              series.generatePoints();
            }
            each(series.points, function(point, i) {
              var x;
              if (point.options) {
                x = axis.nameToX(point);
                if (x !== point.x) {
                  point.x = x;
                  series.xData[i] = x;
                }
              }
            });
          });
        }
      },
      setAxisTranslation: function(saveOld) {
        var axis = this,
          range = axis.max - axis.min,
          pointRange = axis.axisPointRange || 0,
          closestPointRange,
          minPointOffset = 0,
          pointRangePadding = 0,
          linkedParent = axis.linkedParent,
          ordinalCorrection,
          hasCategories = !!axis.categories,
          transA = axis.transA,
          isXAxis = axis.isXAxis;
        if (isXAxis || hasCategories || pointRange) {
          closestPointRange = axis.getClosest();
          if (linkedParent) {
            minPointOffset = linkedParent.minPointOffset;
            pointRangePadding = linkedParent.pointRangePadding;
          } else {
            each(axis.series, function(series) {
              var seriesPointRange = hasCategories ?
                1 :
                (isXAxis ?
                  pick(series.options.pointRange, closestPointRange, 0) :
                  (axis.axisPointRange || 0)),
                pointPlacement = series.options.pointPlacement;
              pointRange = Math.max(pointRange, seriesPointRange);
              if (!axis.single) {
                minPointOffset = Math.max(
                  minPointOffset,
                  isString(pointPlacement) ? 0 : seriesPointRange / 2
                );
                pointRangePadding = Math.max(
                  pointRangePadding,
                  pointPlacement === 'on' ? 0 : seriesPointRange
                );
              }
            });
          }
          ordinalCorrection = axis.ordinalSlope && closestPointRange ? axis.ordinalSlope / closestPointRange : 1;
          axis.minPointOffset = minPointOffset = minPointOffset * ordinalCorrection;
          axis.pointRangePadding = pointRangePadding = pointRangePadding * ordinalCorrection;
          axis.pointRange = Math.min(pointRange, range);
          if (isXAxis) {
            axis.closestPointRange = closestPointRange;
          }
        }
        if (saveOld) {
          axis.oldTransA = transA;
        }
        axis.translationSlope = axis.transA = transA = axis.len / ((range + pointRangePadding) || 1);
        axis.transB = axis.horiz ? axis.left : axis.bottom;
        axis.minPixelPadding = transA * minPointOffset;
      },
      minFromRange: function() {
        return this.max - this.range;
      },
      setTickInterval: function(secondPass) {
        var axis = this,
          chart = axis.chart,
          options = axis.options,
          isLog = axis.isLog,
          log2lin = axis.log2lin,
          isDatetimeAxis = axis.isDatetimeAxis,
          isXAxis = axis.isXAxis,
          isLinked = axis.isLinked,
          maxPadding = options.maxPadding,
          minPadding = options.minPadding,
          length,
          linkedParentExtremes,
          tickIntervalOption = options.tickInterval,
          minTickInterval,
          tickPixelIntervalOption = options.tickPixelInterval,
          categories = axis.categories,
          threshold = axis.threshold,
          softThreshold = axis.softThreshold,
          thresholdMin,
          thresholdMax,
          hardMin,
          hardMax;
        if (!isDatetimeAxis && !categories && !isLinked) {
          this.getTickAmount();
        }
        hardMin = pick(axis.userMin, options.min);
        hardMax = pick(axis.userMax, options.max);
        if (isLinked) {
          axis.linkedParent = chart[axis.coll][options.linkedTo];
          linkedParentExtremes = axis.linkedParent.getExtremes();
          axis.min = pick(linkedParentExtremes.min, linkedParentExtremes.dataMin);
          axis.max = pick(linkedParentExtremes.max, linkedParentExtremes.dataMax);
          if (options.type !== axis.linkedParent.options.type) {
            H.error(11, 1);
          }
        } else {
          if (!softThreshold && defined(threshold)) {
            if (axis.dataMin >= threshold) {
              thresholdMin = threshold;
              minPadding = 0;
            } else if (axis.dataMax <= threshold) {
              thresholdMax = threshold;
              maxPadding = 0;
            }
          }
          axis.min = pick(hardMin, thresholdMin, axis.dataMin);
          axis.max = pick(hardMax, thresholdMax, axis.dataMax);
        }
        if (isLog) {
          if (!secondPass && Math.min(axis.min, pick(axis.dataMin, axis.min)) <= 0) {
            H.error(10, 1);
          }
          axis.min = correctFloat(log2lin(axis.min), 15);
          axis.max = correctFloat(log2lin(axis.max), 15);
        }
        if (axis.range && defined(axis.max)) {
          axis.userMin = axis.min = hardMin = Math.max(axis.min, axis.minFromRange());
          axis.userMax = hardMax = axis.max;
          axis.range = null;
        }
        fireEvent(axis, 'foundExtremes');
        if (axis.beforePadding) {
          axis.beforePadding();
        }
        axis.adjustForMinRange();
        if (!categories && !axis.axisPointRange && !axis.usePercentage && !isLinked && defined(axis.min) && defined(axis.max)) {
          length = axis.max - axis.min;
          if (length) {
            if (!defined(hardMin) && minPadding) {
              axis.min -= length * minPadding;
            }
            if (!defined(hardMax) && maxPadding) {
              axis.max += length * maxPadding;
            }
          }
        }
        if (isNumber(options.floor)) {
          axis.min = Math.max(axis.min, options.floor);
        } else if (isNumber(options.softMin)) {
          axis.min = Math.min(axis.min, options.softMin);
        }
        if (isNumber(options.ceiling)) {
          axis.max = Math.min(axis.max, options.ceiling);
        } else if (isNumber(options.softMax)) {
          axis.max = Math.max(axis.max, options.softMax);
        }
        if (softThreshold && defined(axis.dataMin)) {
          threshold = threshold || 0;
          if (!defined(hardMin) && axis.min < threshold && axis.dataMin >= threshold) {
            axis.min = threshold;
          } else if (!defined(hardMax) && axis.max > threshold && axis.dataMax <= threshold) {
            axis.max = threshold;
          }
        }
        if (axis.min === axis.max || axis.min === undefined || axis.max === undefined) {
          axis.tickInterval = 1;
        } else if (isLinked && !tickIntervalOption &&
          tickPixelIntervalOption === axis.linkedParent.options.tickPixelInterval) {
          axis.tickInterval = tickIntervalOption = axis.linkedParent.tickInterval;
        } else {
          axis.tickInterval = pick(
            tickIntervalOption,
            this.tickAmount ? ((axis.max - axis.min) / Math.max(this.tickAmount - 1, 1)) : undefined,
            categories ?
            1 :
            (axis.max - axis.min) * tickPixelIntervalOption / Math.max(axis.len, tickPixelIntervalOption)
          );
        }
        if (isXAxis && !secondPass) {
          each(axis.series, function(series) {
            series.processData(axis.min !== axis.oldMin || axis.max !== axis.oldMax);
          });
        }
        axis.setAxisTranslation(true);
        if (axis.beforeSetTickPositions) {
          axis.beforeSetTickPositions();
        }
        if (axis.postProcessTickInterval) {
          axis.tickInterval = axis.postProcessTickInterval(axis.tickInterval);
        }
        if (axis.pointRange && !tickIntervalOption) {
          axis.tickInterval = Math.max(axis.pointRange, axis.tickInterval);
        }
        minTickInterval = pick(options.minTickInterval, axis.isDatetimeAxis && axis.closestPointRange);
        if (!tickIntervalOption && axis.tickInterval < minTickInterval) {
          axis.tickInterval = minTickInterval;
        }
        if (!isDatetimeAxis && !isLog && !tickIntervalOption) {
          axis.tickInterval = normalizeTickInterval(
            axis.tickInterval,
            null,
            getMagnitude(axis.tickInterval),
            pick(options.allowDecimals, !(axis.tickInterval > 0.5 && axis.tickInterval < 5 && axis.max > 1000 && axis.max < 9999)), !!this.tickAmount
          );
        }
        if (!this.tickAmount) {
          axis.tickInterval = axis.unsquish();
        }
        this.setTickPositions();
      },
      setTickPositions: function() {
        var options = this.options,
          tickPositions,
          tickPositionsOption = options.tickPositions,
          tickPositioner = options.tickPositioner,
          startOnTick = options.startOnTick,
          endOnTick = options.endOnTick,
          single;
        this.tickmarkOffset = (this.categories && options.tickmarkPlacement === 'between' &&
          this.tickInterval === 1) ? 0.5 : 0;
        this.minorTickInterval = options.minorTickInterval === 'auto' && this.tickInterval ?
          this.tickInterval / 5 : options.minorTickInterval;
        this.tickPositions = tickPositions = tickPositionsOption && tickPositionsOption.slice();
        if (!tickPositions) {
          if (this.isDatetimeAxis) {
            tickPositions = this.getTimeTicks(
              this.normalizeTimeTickInterval(this.tickInterval, options.units),
              this.min,
              this.max,
              options.startOfWeek,
              this.ordinalPositions,
              this.closestPointRange,
              true
            );
          } else if (this.isLog) {
            tickPositions = this.getLogTickPositions(this.tickInterval, this.min, this.max);
          } else {
            tickPositions = this.getLinearTickPositions(this.tickInterval, this.min, this.max);
          }
          if (tickPositions.length > this.len) {
            tickPositions = [tickPositions[0], tickPositions.pop()];
          }
          this.tickPositions = tickPositions;
          if (tickPositioner) {
            tickPositioner = tickPositioner.apply(this, [this.min, this.max]);
            if (tickPositioner) {
              this.tickPositions = tickPositions = tickPositioner;
            }
          }
        }
        this.trimTicks(tickPositions, startOnTick, endOnTick);
        if (!this.isLinked) {
          if (this.min === this.max && defined(this.min) && !this.tickAmount) {
            single = true;
            this.min -= 0.5;
            this.max += 0.5;
          }
          this.single = single;
          if (!tickPositionsOption && !tickPositioner) {
            this.adjustTickAmount();
          }
        }
      },
      trimTicks: function(tickPositions, startOnTick, endOnTick) {
        var roundedMin = tickPositions[0],
          roundedMax = tickPositions[tickPositions.length - 1],
          minPointOffset = this.minPointOffset || 0;
        if (!this.isLinked) {
          if (startOnTick) {
            this.min = roundedMin;
          } else {
            while (this.min - minPointOffset > tickPositions[0]) {
              tickPositions.shift();
            }
          }
          if (endOnTick) {
            this.max = roundedMax;
          } else {
            while (this.max + minPointOffset < tickPositions[tickPositions.length - 1]) {
              tickPositions.pop();
            }
          }
          if (tickPositions.length === 0 && defined(roundedMin)) {
            tickPositions.push((roundedMax + roundedMin) / 2);
          }
        }
      },
      alignToOthers: function() {
        var others = {},
          hasOther,
          options = this.options;
        if (
          this.chart.options.chart.alignTicks !== false &&
          options.alignTicks !== false &&
          !this.isLog
        ) {
          each(this.chart[this.coll], function(axis) {
            var otherOptions = axis.options,
              horiz = axis.horiz,
              key = [
                horiz ? otherOptions.left : otherOptions.top,
                otherOptions.width,
                otherOptions.height,
                otherOptions.pane
              ].join(',');
            if (axis.series.length) {
              if (others[key]) {
                hasOther = true;
              } else {
                others[key] = 1;
              }
            }
          });
        }
        return hasOther;
      },
      getTickAmount: function() {
        var options = this.options,
          tickAmount = options.tickAmount,
          tickPixelInterval = options.tickPixelInterval;
        if (!defined(options.tickInterval) && this.len < tickPixelInterval && !this.isRadial &&
          !this.isLog && options.startOnTick && options.endOnTick) {
          tickAmount = 2;
        }
        if (!tickAmount && this.alignToOthers()) {
          tickAmount = Math.ceil(this.len / tickPixelInterval) + 1;
        }
        if (tickAmount < 4) {
          this.finalTickAmt = tickAmount;
          tickAmount = 5;
        }
        this.tickAmount = tickAmount;
      },
      adjustTickAmount: function() {
        var tickInterval = this.tickInterval,
          tickPositions = this.tickPositions,
          tickAmount = this.tickAmount,
          finalTickAmt = this.finalTickAmt,
          currentTickAmount = tickPositions && tickPositions.length,
          i,
          len;
        if (currentTickAmount < tickAmount) {
          while (tickPositions.length < tickAmount) {
            tickPositions.push(correctFloat(
              tickPositions[tickPositions.length - 1] + tickInterval
            ));
          }
          this.transA *= (currentTickAmount - 1) / (tickAmount - 1);
          this.max = tickPositions[tickPositions.length - 1];
        } else if (currentTickAmount > tickAmount) {
          this.tickInterval *= 2;
          this.setTickPositions();
        }
        if (defined(finalTickAmt)) {
          i = len = tickPositions.length;
          while (i--) {
            if (
              (finalTickAmt === 3 && i % 2 === 1) ||
              (finalTickAmt <= 2 && i > 0 && i < len - 1)
            ) {
              tickPositions.splice(i, 1);
            }
          }
          this.finalTickAmt = undefined;
        }
      },
      setScale: function() {
        var axis = this,
          isDirtyData,
          isDirtyAxisLength;
        axis.oldMin = axis.min;
        axis.oldMax = axis.max;
        axis.oldAxisLength = axis.len;
        axis.setAxisSize();
        isDirtyAxisLength = axis.len !== axis.oldAxisLength;
        each(axis.series, function(series) {
          if (series.isDirtyData || series.isDirty ||
            series.xAxis.isDirty) {
            isDirtyData = true;
          }
        });
        if (isDirtyAxisLength || isDirtyData || axis.isLinked || axis.forceRedraw ||
          axis.userMin !== axis.oldUserMin || axis.userMax !== axis.oldUserMax || axis.alignToOthers()) {
          if (axis.resetStacks) {
            axis.resetStacks();
          }
          axis.forceRedraw = false;
          axis.getSeriesExtremes();
          axis.setTickInterval();
          axis.oldUserMin = axis.userMin;
          axis.oldUserMax = axis.userMax;
          if (!axis.isDirty) {
            axis.isDirty = isDirtyAxisLength || axis.min !== axis.oldMin || axis.max !== axis.oldMax;
          }
        } else if (axis.cleanStacks) {
          axis.cleanStacks();
        }
      },
      setExtremes: function(newMin, newMax, redraw, animation, eventArguments) {
        var axis = this,
          chart = axis.chart;
        redraw = pick(redraw, true);
        each(axis.series, function(serie) {
          delete serie.kdTree;
        });
        eventArguments = extend(eventArguments, {
          min: newMin,
          max: newMax
        });
        fireEvent(axis, 'setExtremes', eventArguments, function() {
          axis.userMin = newMin;
          axis.userMax = newMax;
          axis.eventArgs = eventArguments;
          if (redraw) {
            chart.redraw(animation);
          }
        });
      },
      zoom: function(newMin, newMax) {
        var dataMin = this.dataMin,
          dataMax = this.dataMax,
          options = this.options,
          min = Math.min(dataMin, pick(options.min, dataMin)),
          max = Math.max(dataMax, pick(options.max, dataMax));
        if (newMin !== this.min || newMax !== this.max) {
          if (!this.allowZoomOutside) {
            if (defined(dataMin)) {
              if (newMin < min) {
                newMin = min;
              }
              if (newMin > max) {
                newMin = max;
              }
            }
            if (defined(dataMax)) {
              if (newMax < min) {
                newMax = min;
              }
              if (newMax > max) {
                newMax = max;
              }
            }
          }
          this.displayBtn = newMin !== undefined || newMax !== undefined;
          this.setExtremes(
            newMin,
            newMax,
            false,
            undefined, {
              trigger: 'zoom'
            }
          );
        }
        return true;
      },
      setAxisSize: function() {
        var chart = this.chart,
          options = this.options,
          offsets = options.offsets || [0, 0, 0, 0],
          horiz = this.horiz,
          width = pick(options.width, chart.plotWidth - offsets[3] + offsets[1]),
          height = pick(options.height, chart.plotHeight - offsets[0] + offsets[2]),
          top = pick(options.top, chart.plotTop + offsets[0]),
          left = pick(options.left, chart.plotLeft + offsets[3]),
          percentRegex = /%$/;
        if (percentRegex.test(height)) {
          height = Math.round(parseFloat(height) / 100 * chart.plotHeight);
        }
        if (percentRegex.test(top)) {
          top = Math.round(parseFloat(top) / 100 * chart.plotHeight + chart.plotTop);
        }
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.bottom = chart.chartHeight - height - top;
        this.right = chart.chartWidth - width - left;
        this.len = Math.max(horiz ? width : height, 0);
        this.pos = horiz ? left : top;
      },
      getExtremes: function() {
        var axis = this,
          isLog = axis.isLog,
          lin2log = axis.lin2log;
        return {
          min: isLog ? correctFloat(lin2log(axis.min)) : axis.min,
          max: isLog ? correctFloat(lin2log(axis.max)) : axis.max,
          dataMin: axis.dataMin,
          dataMax: axis.dataMax,
          userMin: axis.userMin,
          userMax: axis.userMax
        };
      },
      getThreshold: function(threshold) {
        var axis = this,
          isLog = axis.isLog,
          lin2log = axis.lin2log,
          realMin = isLog ? lin2log(axis.min) : axis.min,
          realMax = isLog ? lin2log(axis.max) : axis.max;
        if (threshold === null) {
          threshold = realMin;
        } else if (realMin > threshold) {
          threshold = realMin;
        } else if (realMax < threshold) {
          threshold = realMax;
        }
        return axis.translate(threshold, 0, 1, 0, 1);
      },
      autoLabelAlign: function(rotation) {
        var ret,
          angle = (pick(rotation, 0) - (this.side * 90) + 720) % 360;
        if (angle > 15 && angle < 165) {
          ret = 'right';
        } else if (angle > 195 && angle < 345) {
          ret = 'left';
        } else {
          ret = 'center';
        }
        return ret;
      },
      tickSize: function(prefix) {
        var options = this.options,
          tickLength = options[prefix + 'Length'],
          tickWidth = pick(options[prefix + 'Width'], prefix === 'tick' && this.isXAxis ? 1 : 0);
        if (tickWidth && tickLength) {
          if (options[prefix + 'Position'] === 'inside') {
            tickLength = -tickLength;
          }
          return [tickLength, tickWidth];
        }
      },
      labelMetrics: function() {
        return this.chart.renderer.fontMetrics(
          this.options.labels.style && this.options.labels.style.fontSize,
          this.ticks[0] && this.ticks[0].label
        );
      },
      unsquish: function() {
        var labelOptions = this.options.labels,
          horiz = this.horiz,
          tickInterval = this.tickInterval,
          newTickInterval = tickInterval,
          slotSize = this.len / (((this.categories ? 1 : 0) + this.max - this.min) / tickInterval),
          rotation,
          rotationOption = labelOptions.rotation,
          labelMetrics = this.labelMetrics(),
          step,
          bestScore = Number.MAX_VALUE,
          autoRotation,
          getStep = function(spaceNeeded) {
            var step = spaceNeeded / (slotSize || 1);
            step = step > 1 ? Math.ceil(step) : 1;
            return step * tickInterval;
          };
        if (horiz) {
          autoRotation = !labelOptions.staggerLines && !labelOptions.step && (
            defined(rotationOption) ? [rotationOption] :
            slotSize < pick(labelOptions.autoRotationLimit, 80) && labelOptions.autoRotation
          );
          if (autoRotation) {
            each(autoRotation, function(rot) {
              var score;
              if (rot === rotationOption || (rot && rot >= -90 && rot <= 90)) {
                step = getStep(Math.abs(labelMetrics.h / Math.sin(deg2rad * rot)));
                score = step + Math.abs(rot / 360);
                if (score < bestScore) {
                  bestScore = score;
                  rotation = rot;
                  newTickInterval = step;
                }
              }
            });
          }
        } else if (!labelOptions.step) {
          newTickInterval = getStep(labelMetrics.h);
        }
        this.autoRotation = autoRotation;
        this.labelRotation = pick(rotation, rotationOption);
        return newTickInterval;
      },
      getSlotWidth: function() {
        var chart = this.chart,
          horiz = this.horiz,
          labelOptions = this.options.labels,
          slotCount = Math.max(this.tickPositions.length - (this.categories ? 0 : 1), 1),
          marginLeft = chart.margin[3];
        return (
          horiz &&
          (labelOptions.step || 0) < 2 &&
          !labelOptions.rotation &&
          ((this.staggerLines || 1) * this.len) / slotCount
        ) || (!horiz && (
          (marginLeft && (marginLeft - chart.spacing[3])) ||
          chart.chartWidth * 0.33
        ));
      },
      renderUnsquish: function() {
        var chart = this.chart,
          renderer = chart.renderer,
          tickPositions = this.tickPositions,
          ticks = this.ticks,
          labelOptions = this.options.labels,
          horiz = this.horiz,
          slotWidth = this.getSlotWidth(),
          innerWidth = Math.max(1, Math.round(slotWidth - 2 * (labelOptions.padding || 5))),
          attr = {},
          labelMetrics = this.labelMetrics(),
          textOverflowOption = labelOptions.style && labelOptions.style.textOverflow,
          css,
          maxLabelLength = 0,
          label,
          i,
          pos;
        if (!isString(labelOptions.rotation)) {
          attr.rotation = labelOptions.rotation || 0;
        }
        each(tickPositions, function(tick) {
          tick = ticks[tick];
          if (tick && tick.labelLength > maxLabelLength) {
            maxLabelLength = tick.labelLength;
          }
        });
        this.maxLabelLength = maxLabelLength;
        if (this.autoRotation) {
          if (maxLabelLength > innerWidth && maxLabelLength > labelMetrics.h) {
            attr.rotation = this.labelRotation;
          } else {
            this.labelRotation = 0;
          }
        } else if (slotWidth) {
          css = {
            width: innerWidth + 'px'
          };
          if (!textOverflowOption) {
            css.textOverflow = 'clip';
            i = tickPositions.length;
            while (!horiz && i--) {
              pos = tickPositions[i];
              label = ticks[pos].label;
              if (label) {
                if (label.styles && label.styles.textOverflow === 'ellipsis') {
                  label.css({
                    textOverflow: 'clip'
                  });
                } else if (ticks[pos].labelLength > slotWidth) {
                  label.css({
                    width: slotWidth + 'px'
                  });
                }
                if (label.getBBox().height > this.len / tickPositions.length - (labelMetrics.h - labelMetrics.f)) {
                  label.specCss = {
                    textOverflow: 'ellipsis'
                  };
                }
              }
            }
          }
        }
        if (attr.rotation) {
          css = {
            width: (maxLabelLength > chart.chartHeight * 0.5 ? chart.chartHeight * 0.33 : chart.chartHeight) + 'px'
          };
          if (!textOverflowOption) {
            css.textOverflow = 'ellipsis';
          }
        }
        this.labelAlign = labelOptions.align || this.autoLabelAlign(this.labelRotation);
        if (this.labelAlign) {
          attr.align = this.labelAlign;
        }
        each(tickPositions, function(pos) {
          var tick = ticks[pos],
            label = tick && tick.label;
          if (label) {
            label.attr(attr);
            if (css) {
              label.css(merge(css, label.specCss));
            }
            delete label.specCss;
            tick.rotation = attr.rotation;
          }
        });
        this.tickRotCorr = renderer.rotCorr(labelMetrics.b, this.labelRotation || 0, this.side !== 0);
      },
      hasData: function() {
        return this.hasVisibleSeries || (defined(this.min) && defined(this.max) && !!this.tickPositions);
      },
      addTitle: function(display) {
        var axis = this,
          renderer = axis.chart.renderer,
          horiz = axis.horiz,
          opposite = axis.opposite,
          options = axis.options,
          axisTitleOptions = options.title,
          textAlign;
        if (!axis.axisTitle) {
          textAlign = axisTitleOptions.textAlign;
          if (!textAlign) {
            textAlign = (horiz ? {
              low: 'left',
              middle: 'center',
              high: 'right'
            } : {
              low: opposite ? 'right' : 'left',
              middle: 'center',
              high: opposite ? 'left' : 'right'
            })[axisTitleOptions.align];
          }
          axis.axisTitle = renderer.text(
              axisTitleOptions.text,
              0,
              0,
              axisTitleOptions.useHTML
            )
            .attr({
              zIndex: 7,
              rotation: axisTitleOptions.rotation || 0,
              align: textAlign
            })
            .addClass('highcharts-axis-title')
            .css(axisTitleOptions.style)
            .add(axis.axisGroup);
          axis.axisTitle.isNew = true;
        }
        axis.axisTitle[display ? 'show' : 'hide'](true);
      },
      generateTick: function(pos) {
        var ticks = this.ticks;
        if (!ticks[pos]) {
          ticks[pos] = new Tick(this, pos);
        } else {
          ticks[pos].addLabel();
        }
      },
      getOffset: function() {
        var axis = this,
          chart = axis.chart,
          renderer = chart.renderer,
          options = axis.options,
          tickPositions = axis.tickPositions,
          ticks = axis.ticks,
          horiz = axis.horiz,
          side = axis.side,
          invertedSide = chart.inverted ? [1, 0, 3, 2][side] : side,
          hasData,
          showAxis,
          titleOffset = 0,
          titleOffsetOption,
          titleMargin = 0,
          axisTitleOptions = options.title,
          labelOptions = options.labels,
          labelOffset = 0,
          labelOffsetPadded,
          axisOffset = chart.axisOffset,
          clipOffset = chart.clipOffset,
          clip,
          directionFactor = [-1, 1, 1, -1][side],
          n,
          className = options.className,
          axisParent = axis.axisParent,
          lineHeightCorrection,
          tickSize = this.tickSize('tick');
        hasData = axis.hasData();
        axis.showAxis = showAxis = hasData || pick(options.showEmpty, true);
        axis.staggerLines = axis.horiz && labelOptions.staggerLines;
        if (!axis.axisGroup) {
          axis.gridGroup = renderer.g('grid')
            .attr({
              zIndex: options.gridZIndex || 1
            })
            .addClass('highcharts-' + this.coll.toLowerCase() + '-grid ' + (className || ''))
            .add(axisParent);
          axis.axisGroup = renderer.g('axis')
            .attr({
              zIndex: options.zIndex || 2
            })
            .addClass('highcharts-' + this.coll.toLowerCase() + ' ' + (className || ''))
            .add(axisParent);
          axis.labelGroup = renderer.g('axis-labels')
            .attr({
              zIndex: labelOptions.zIndex || 7
            })
            .addClass('highcharts-' + axis.coll.toLowerCase() + '-labels ' + (className || ''))
            .add(axisParent);
        }
        if (hasData || axis.isLinked) {
          each(tickPositions, function(pos, i) {
            axis.generateTick(pos, i);
          });
          axis.renderUnsquish();
          if (labelOptions.reserveSpace !== false && (side === 0 || side === 2 || {
              1: 'left',
              3: 'right'
            }[side] === axis.labelAlign || axis.labelAlign === 'center')) {
            each(tickPositions, function(pos) {
              labelOffset = Math.max(
                ticks[pos].getLabelSize(),
                labelOffset
              );
            });
          }
          if (axis.staggerLines) {
            labelOffset *= axis.staggerLines;
            axis.labelOffset = labelOffset * (axis.opposite ? -1 : 1);
          }
        } else {
          for (n in ticks) {
            ticks[n].destroy();
            delete ticks[n];
          }
        }
        if (axisTitleOptions && axisTitleOptions.text && axisTitleOptions.enabled !== false) {
          axis.addTitle(showAxis);
          if (showAxis) {
            titleOffset = axis.axisTitle.getBBox()[horiz ? 'height' : 'width'];
            titleOffsetOption = axisTitleOptions.offset;
            titleMargin = defined(titleOffsetOption) ? 0 : pick(axisTitleOptions.margin, horiz ? 5 : 10);
          }
        }
        axis.renderLine();
        axis.offset = directionFactor * pick(options.offset, axisOffset[side]);
        axis.tickRotCorr = axis.tickRotCorr || {
          x: 0,
          y: 0
        };
        if (side === 0) {
          lineHeightCorrection = -axis.labelMetrics().h;
        } else if (side === 2) {
          lineHeightCorrection = axis.tickRotCorr.y;
        } else {
          lineHeightCorrection = 0;
        }
        labelOffsetPadded = Math.abs(labelOffset) + titleMargin;
        if (labelOffset) {
          labelOffsetPadded -= lineHeightCorrection;
          labelOffsetPadded += directionFactor * (horiz ? pick(labelOptions.y, axis.tickRotCorr.y + directionFactor * 8) : labelOptions.x);
        }
        axis.axisTitleMargin = pick(titleOffsetOption, labelOffsetPadded);
        axisOffset[side] = Math.max(
          axisOffset[side],
          axis.axisTitleMargin + titleOffset + directionFactor * axis.offset,
          labelOffsetPadded,
          hasData && tickPositions.length && tickSize ? tickSize[0] : 0
        );
        clip = options.offset ? 0 : Math.floor(axis.axisLine.strokeWidth() / 2) * 2;
        clipOffset[invertedSide] = Math.max(clipOffset[invertedSide], clip);
      },
      getLinePath: function(lineWidth) {
        var chart = this.chart,
          opposite = this.opposite,
          offset = this.offset,
          horiz = this.horiz,
          lineLeft = this.left + (opposite ? this.width : 0) + offset,
          lineTop = chart.chartHeight - this.bottom - (opposite ? this.height : 0) + offset;
        if (opposite) {
          lineWidth *= -1;
        }
        return chart.renderer
          .crispLine([
            'M',
            horiz ?
            this.left :
            lineLeft,
            horiz ?
            lineTop :
            this.top,
            'L',
            horiz ?
            chart.chartWidth - this.right :
            lineLeft,
            horiz ?
            lineTop :
            chart.chartHeight - this.bottom
          ], lineWidth);
      },
      renderLine: function() {
        if (!this.axisLine) {
          this.axisLine = this.chart.renderer.path()
            .addClass('highcharts-axis-line')
            .add(this.axisGroup);
          this.axisLine.attr({
            stroke: this.options.lineColor,
            'stroke-width': this.options.lineWidth,
            zIndex: 7
          });
        }
      },
      getTitlePosition: function() {
        var horiz = this.horiz,
          axisLeft = this.left,
          axisTop = this.top,
          axisLength = this.len,
          axisTitleOptions = this.options.title,
          margin = horiz ? axisLeft : axisTop,
          opposite = this.opposite,
          offset = this.offset,
          xOption = axisTitleOptions.x || 0,
          yOption = axisTitleOptions.y || 0,
          fontSize = this.chart.renderer.fontMetrics(axisTitleOptions.style && axisTitleOptions.style.fontSize, this.axisTitle).f,
          alongAxis = {
            low: margin + (horiz ? 0 : axisLength),
            middle: margin + axisLength / 2,
            high: margin + (horiz ? axisLength : 0)
          }[axisTitleOptions.align],
          offAxis = (horiz ? axisTop + this.height : axisLeft) +
          (horiz ? 1 : -1) *
          (opposite ? -1 : 1) *
          this.axisTitleMargin +
          (this.side === 2 ? fontSize : 0);
        return {
          x: horiz ?
            alongAxis + xOption : offAxis + (opposite ? this.width : 0) + offset + xOption,
          y: horiz ?
            offAxis + yOption - (opposite ? this.height : 0) + offset : alongAxis + yOption
        };
      },
      renderMinorTick: function(pos) {
        var slideInTicks = this.chart.hasRendered && isNumber(this.oldMin),
          minorTicks = this.minorTicks;
        if (!minorTicks[pos]) {
          minorTicks[pos] = new Tick(this, pos, 'minor');
        }
        if (slideInTicks && minorTicks[pos].isNew) {
          minorTicks[pos].render(null, true);
        }
        minorTicks[pos].render(null, false, 1);
      },
      renderTick: function(pos, i) {
        var isLinked = this.isLinked,
          ticks = this.ticks,
          slideInTicks = this.chart.hasRendered && isNumber(this.oldMin);
        if (!isLinked || (pos >= this.min && pos <= this.max)) {
          if (!ticks[pos]) {
            ticks[pos] = new Tick(this, pos);
          }
          if (slideInTicks && ticks[pos].isNew) {
            ticks[pos].render(i, true, 0.1);
          }
          ticks[pos].render(i);
        }
      },
      render: function() {
        var axis = this,
          chart = axis.chart,
          renderer = chart.renderer,
          options = axis.options,
          isLog = axis.isLog,
          lin2log = axis.lin2log,
          isLinked = axis.isLinked,
          tickPositions = axis.tickPositions,
          axisTitle = axis.axisTitle,
          ticks = axis.ticks,
          minorTicks = axis.minorTicks,
          alternateBands = axis.alternateBands,
          stackLabelOptions = options.stackLabels,
          alternateGridColor = options.alternateGridColor,
          tickmarkOffset = axis.tickmarkOffset,
          axisLine = axis.axisLine,
          showAxis = axis.showAxis,
          animation = animObject(renderer.globalAnimation),
          from,
          to;
        axis.labelEdge.length = 0;
        axis.overlap = false;
        each([ticks, minorTicks, alternateBands], function(coll) {
          var pos;
          for (pos in coll) {
            coll[pos].isActive = false;
          }
        });
        if (axis.hasData() || isLinked) {
          if (axis.minorTickInterval && !axis.categories) {
            each(axis.getMinorTickPositions(), function(pos) {
              axis.renderMinorTick(pos);
            });
          }
          if (tickPositions.length) {
            each(tickPositions, function(pos, i) {
              axis.renderTick(pos, i);
            });
            if (tickmarkOffset && (axis.min === 0 || axis.single)) {
              if (!ticks[-1]) {
                ticks[-1] = new Tick(axis, -1, null, true);
              }
              ticks[-1].render(-1);
            }
          }
          if (alternateGridColor) {
            each(tickPositions, function(pos, i) {
              to = tickPositions[i + 1] !== undefined ? tickPositions[i + 1] + tickmarkOffset : axis.max - tickmarkOffset;
              if (i % 2 === 0 && pos < axis.max && to <= axis.max + (chart.polar ? -tickmarkOffset : tickmarkOffset)) {
                if (!alternateBands[pos]) {
                  alternateBands[pos] = new PlotLineOrBand(axis);
                }
                from = pos + tickmarkOffset;
                alternateBands[pos].options = {
                  from: isLog ? lin2log(from) : from,
                  to: isLog ? lin2log(to) : to,
                  color: alternateGridColor
                };
                alternateBands[pos].render();
                alternateBands[pos].isActive = true;
              }
            });
          }
          if (!axis._addedPlotLB) {
            each((options.plotLines || []).concat(options.plotBands || []), function(plotLineOptions) {
              axis.addPlotBandOrLine(plotLineOptions);
            });
            axis._addedPlotLB = true;
          }
        }
        each([ticks, minorTicks, alternateBands], function(coll) {
          var pos,
            i,
            forDestruction = [],
            delay = animation.duration,
            destroyInactiveItems = function() {
              i = forDestruction.length;
              while (i--) {
                if (coll[forDestruction[i]] && !coll[forDestruction[i]].isActive) {
                  coll[forDestruction[i]].destroy();
                  delete coll[forDestruction[i]];
                }
              }
            };
          for (pos in coll) {
            if (!coll[pos].isActive) {
              coll[pos].render(pos, false, 0);
              coll[pos].isActive = false;
              forDestruction.push(pos);
            }
          }
          syncTimeout(
            destroyInactiveItems,
            coll === alternateBands || !chart.hasRendered || !delay ? 0 : delay
          );
        });
        if (axisLine) {
          axisLine[axisLine.isPlaced ? 'animate' : 'attr']({
            d: this.getLinePath(axisLine.strokeWidth())
          });
          axisLine.isPlaced = true;
          axisLine[showAxis ? 'show' : 'hide'](true);
        }
        if (axisTitle && showAxis) {
          axisTitle[axisTitle.isNew ? 'attr' : 'animate'](
            axis.getTitlePosition()
          );
          axisTitle.isNew = false;
        }
        if (stackLabelOptions && stackLabelOptions.enabled) {
          axis.renderStackTotals();
        }
        axis.isDirty = false;
      },
      redraw: function() {
        if (this.visible) {
          this.render();
          each(this.plotLinesAndBands, function(plotLine) {
            plotLine.render();
          });
        }
        each(this.series, function(series) {
          series.isDirty = true;
        });
      },
      keepProps: ['extKey', 'hcEvents', 'names', 'series', 'userMax', 'userMin'],
      destroy: function(keepEvents) {
        var axis = this,
          stacks = axis.stacks,
          stackKey,
          plotLinesAndBands = axis.plotLinesAndBands,
          i,
          n;
        if (!keepEvents) {
          removeEvent(axis);
        }
        for (stackKey in stacks) {
          destroyObjectProperties(stacks[stackKey]);
          stacks[stackKey] = null;
        }
        each([axis.ticks, axis.minorTicks, axis.alternateBands], function(coll) {
          destroyObjectProperties(coll);
        });
        if (plotLinesAndBands) {
          i = plotLinesAndBands.length;
          while (i--) {
            plotLinesAndBands[i].destroy();
          }
        }
        each(['stackTotalGroup', 'axisLine', 'axisTitle', 'axisGroup', 'gridGroup', 'labelGroup', 'cross'], function(prop) {
          if (axis[prop]) {
            axis[prop] = axis[prop].destroy();
          }
        });
        for (n in axis) {
          if (axis.hasOwnProperty(n) && inArray(n, axis.keepProps) === -1) {
            delete axis[n];
          }
        }
      },
      drawCrosshair: function(e, point) {
        var path,
          options = this.crosshair,
          snap = pick(options.snap, true),
          pos,
          categorized,
          graphic = this.cross;
        if (!e) {
          e = this.cross && this.cross.e;
        }
        if (!this.crosshair ||
          ((defined(point) || !snap) === false)
        ) {
          this.hideCrosshair();
        } else {
          if (!snap) {
            pos = e && (this.horiz ? e.chartX - this.pos : this.len - e.chartY + this.pos);
          } else if (defined(point)) {
            pos = this.isXAxis ? point.plotX : this.len - point.plotY;
          }
          if (defined(pos)) {
            path = this.getPlotLinePath(
              point && (this.isXAxis ? point.x : pick(point.stackY, point.y)),
              null,
              null,
              null,
              pos
            ) || null;
          }
          if (!defined(path)) {
            this.hideCrosshair();
            return;
          }
          categorized = this.categories && !this.isRadial;
          if (!graphic) {
            this.cross = graphic = this.chart.renderer
              .path()
              .addClass('highcharts-crosshair highcharts-crosshair-' +
                (categorized ? 'category ' : 'thin ') + options.className)
              .attr({
                zIndex: pick(options.zIndex, 2)
              })
              .add();
            graphic.attr({
              'stroke': options.color || (categorized ? color('#ccd6eb').setOpacity(0.25).get() : '#cccccc'),
              'stroke-width': pick(options.width, 1)
            });
            if (options.dashStyle) {
              graphic.attr({
                dashstyle: options.dashStyle
              });
            }
          }
          graphic.show().attr({
            d: path
          });
          if (categorized && !options.width) {
            graphic.attr({
              'stroke-width': this.transA
            });
          }
          this.cross.e = e;
        }
      },
      hideCrosshair: function() {
        if (this.cross) {
          this.cross.hide();
        }
      }
    };
    extend(H.Axis.prototype, AxisPlotLineOrBandExtension);
  }(Highcharts));
  (function(H) {
    'use strict';
    var Axis = H.Axis,
      Date = H.Date,
      dateFormat = H.dateFormat,
      defaultOptions = H.defaultOptions,
      defined = H.defined,
      each = H.each,
      extend = H.extend,
      getMagnitude = H.getMagnitude,
      getTZOffset = H.getTZOffset,
      normalizeTickInterval = H.normalizeTickInterval,
      pick = H.pick,
      timeUnits = H.timeUnits;
    Axis.prototype.getTimeTicks = function(normalizedInterval, min, max, startOfWeek) {
      var tickPositions = [],
        i,
        higherRanks = {},
        useUTC = defaultOptions.global.useUTC,
        minYear,
        minDate = new Date(min - getTZOffset(min)),
        makeTime = Date.hcMakeTime,
        interval = normalizedInterval.unitRange,
        count = normalizedInterval.count,
        variableDayLength;
      if (defined(min)) {
        minDate[Date.hcSetMilliseconds](interval >= timeUnits.second ? 0 :
          count * Math.floor(minDate.getMilliseconds() / count));
        if (interval >= timeUnits.second) {
          minDate[Date.hcSetSeconds](interval >= timeUnits.minute ? 0 :
            count * Math.floor(minDate.getSeconds() / count));
        }
        if (interval >= timeUnits.minute) {
          minDate[Date.hcSetMinutes](interval >= timeUnits.hour ? 0 :
            count * Math.floor(minDate[Date.hcGetMinutes]() / count));
        }
        if (interval >= timeUnits.hour) {
          minDate[Date.hcSetHours](interval >= timeUnits.day ? 0 :
            count * Math.floor(minDate[Date.hcGetHours]() / count));
        }
        if (interval >= timeUnits.day) {
          minDate[Date.hcSetDate](interval >= timeUnits.month ? 1 :
            count * Math.floor(minDate[Date.hcGetDate]() / count));
        }
        if (interval >= timeUnits.month) {
          minDate[Date.hcSetMonth](interval >= timeUnits.year ? 0 :
            count * Math.floor(minDate[Date.hcGetMonth]() / count));
          minYear = minDate[Date.hcGetFullYear]();
        }
        if (interval >= timeUnits.year) {
          minYear -= minYear % count;
          minDate[Date.hcSetFullYear](minYear);
        }
        if (interval === timeUnits.week) {
          minDate[Date.hcSetDate](minDate[Date.hcGetDate]() - minDate[Date.hcGetDay]() +
            pick(startOfWeek, 1));
        }
        minYear = minDate[Date.hcGetFullYear]();
        var minMonth = minDate[Date.hcGetMonth](),
          minDateDate = minDate[Date.hcGetDate](),
          minHours = minDate[Date.hcGetHours]();
        if (Date.hcTimezoneOffset || Date.hcGetTimezoneOffset) {
          variableDayLength =
            (!useUTC || !!Date.hcGetTimezoneOffset) &&
            (
              max - min > 4 * timeUnits.month ||
              getTZOffset(min) !== getTZOffset(max)
            );
          minDate = minDate.getTime();
          minDate = new Date(minDate + getTZOffset(minDate));
        }
        var time = minDate.getTime();
        i = 1;
        while (time < max) {
          tickPositions.push(time);
          if (interval === timeUnits.year) {
            time = makeTime(minYear + i * count, 0);
          } else if (interval === timeUnits.month) {
            time = makeTime(minYear, minMonth + i * count);
          } else if (variableDayLength && (interval === timeUnits.day || interval === timeUnits.week)) {
            time = makeTime(minYear, minMonth, minDateDate +
              i * count * (interval === timeUnits.day ? 1 : 7));
          } else if (variableDayLength && interval === timeUnits.hour) {
            time = makeTime(minYear, minMonth, minDateDate, minHours + i * count);
          } else {
            time += interval * count;
          }
          i++;
        }
        tickPositions.push(time);
        if (interval <= timeUnits.hour && tickPositions.length < 10000) {
          each(tickPositions, function(time) {
            if (
              time % 1800000 === 0 &&
              dateFormat('%H%M%S%L', time) === '000000000'
            ) {
              higherRanks[time] = 'day';
            }
          });
        }
      }
      tickPositions.info = extend(normalizedInterval, {
        higherRanks: higherRanks,
        totalRange: interval * count
      });
      return tickPositions;
    };
    Axis.prototype.normalizeTimeTickInterval = function(tickInterval, unitsOption) {
      var units = unitsOption || [
          [
            'millisecond', [1, 2, 5, 10, 20, 25, 50, 100, 200, 500]
          ],
          [
            'second', [1, 2, 5, 10, 15, 30]
          ],
          [
            'minute', [1, 2, 5, 10, 15, 30]
          ],
          [
            'hour', [1, 2, 3, 4, 6, 8, 12]
          ],
          [
            'day', [1, 2]
          ],
          [
            'week', [1, 2]
          ],
          [
            'month', [1, 2, 3, 4, 6]
          ],
          [
            'year',
            null
          ]
        ],
        unit = units[units.length - 1],
        interval = timeUnits[unit[0]],
        multiples = unit[1],
        count,
        i;
      for (i = 0; i < units.length; i++) {
        unit = units[i];
        interval = timeUnits[unit[0]];
        multiples = unit[1];
        if (units[i + 1]) {
          var lessThan = (interval * multiples[multiples.length - 1] +
            timeUnits[units[i + 1][0]]) / 2;
          if (tickInterval <= lessThan) {
            break;
          }
        }
      }
      if (interval === timeUnits.year && tickInterval < 5 * interval) {
        multiples = [1, 2, 5];
      }
      count = normalizeTickInterval(
        tickInterval / interval,
        multiples,
        unit[0] === 'year' ? Math.max(getMagnitude(tickInterval / interval), 1) : 1
      );
      return {
        unitRange: interval,
        count: count,
        unitName: unit[0]
      };
    };
  }(Highcharts));
  (function(H) {
    'use strict';
    var Axis = H.Axis,
      getMagnitude = H.getMagnitude,
      map = H.map,
      normalizeTickInterval = H.normalizeTickInterval,
      pick = H.pick;
    Axis.prototype.getLogTickPositions = function(interval, min, max, minor) {
      var axis = this,
        options = axis.options,
        axisLength = axis.len,
        lin2log = axis.lin2log,
        log2lin = axis.log2lin,
        positions = [];
      if (!minor) {
        axis._minorAutoInterval = null;
      }
      if (interval >= 0.5) {
        interval = Math.round(interval);
        positions = axis.getLinearTickPositions(interval, min, max);
      } else if (interval >= 0.08) {
        var roundedMin = Math.floor(min),
          intermediate,
          i,
          j,
          len,
          pos,
          lastPos,
          break2;
        if (interval > 0.3) {
          intermediate = [1, 2, 4];
        } else if (interval > 0.15) {
          intermediate = [1, 2, 4, 6, 8];
        } else {
          intermediate = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        }
        for (i = roundedMin; i < max + 1 && !break2; i++) {
          len = intermediate.length;
          for (j = 0; j < len && !break2; j++) {
            pos = log2lin(lin2log(i) * intermediate[j]);
            if (pos > min && (!minor || lastPos <= max) && lastPos !== undefined) {
              positions.push(lastPos);
            }
            if (lastPos > max) {
              break2 = true;
            }
            lastPos = pos;
          }
        }
      } else {
        var realMin = lin2log(min),
          realMax = lin2log(max),
          tickIntervalOption = options[minor ? 'minorTickInterval' : 'tickInterval'],
          filteredTickIntervalOption = tickIntervalOption === 'auto' ? null : tickIntervalOption,
          tickPixelIntervalOption = options.tickPixelInterval / (minor ? 5 : 1),
          totalPixelLength = minor ? axisLength / axis.tickPositions.length : axisLength;
        interval = pick(
          filteredTickIntervalOption,
          axis._minorAutoInterval,
          (realMax - realMin) * tickPixelIntervalOption / (totalPixelLength || 1)
        );
        interval = normalizeTickInterval(
          interval,
          null,
          getMagnitude(interval)
        );
        positions = map(axis.getLinearTickPositions(
          interval,
          realMin,
          realMax
        ), log2lin);
        if (!minor) {
          axis._minorAutoInterval = interval / 5;
        }
      }
      if (!minor) {
        axis.tickInterval = interval;
      }
      return positions;
    };
    Axis.prototype.log2lin = function(num) {
      return Math.log(num) / Math.LN10;
    };
    Axis.prototype.lin2log = function(num) {
      return Math.pow(10, num);
    };
  }(Highcharts));
  (function(H) {
    'use strict';
    var dateFormat = H.dateFormat,
      each = H.each,
      extend = H.extend,
      format = H.format,
      isNumber = H.isNumber,
      map = H.map,
      merge = H.merge,
      pick = H.pick,
      splat = H.splat,
      syncTimeout = H.syncTimeout,
      timeUnits = H.timeUnits;
    H.Tooltip = function() {
      this.init.apply(this, arguments);
    };
    H.Tooltip.prototype = {
      init: function(chart, options) {
        this.chart = chart;
        this.options = options;
        this.crosshairs = [];
        this.now = {
          x: 0,
          y: 0
        };
        this.isHidden = true;
        this.split = options.split && !chart.inverted;
        this.shared = options.shared || this.split;
      },
      cleanSplit: function(force) {
        each(this.chart.series, function(series) {
          var tt = series && series.tt;
          if (tt) {
            if (!tt.isActive || force) {
              series.tt = tt.destroy();
            } else {
              tt.isActive = false;
            }
          }
        });
      },
      getLabel: function() {
        var renderer = this.chart.renderer,
          options = this.options;
        if (!this.label) {
          if (this.split) {
            this.label = renderer.g('tooltip');
          } else {
            this.label = renderer.label(
                '',
                0,
                0,
                options.shape || 'callout',
                null,
                null,
                options.useHTML,
                null,
                'tooltip'
              )
              .attr({
                padding: options.padding,
                r: options.borderRadius
              });
            this.label
              .attr({
                'fill': options.backgroundColor,
                'stroke-width': options.borderWidth
              })
              .css(options.style)
              .shadow(options.shadow);
          }
          this.label
            .attr({
              zIndex: 8
            })
            .add();
        }
        return this.label;
      },
      update: function(options) {
        this.destroy();
        this.init(this.chart, merge(true, this.options, options));
      },
      destroy: function() {
        if (this.label) {
          this.label = this.label.destroy();
        }
        if (this.split && this.tt) {
          this.cleanSplit(this.chart, true);
          this.tt = this.tt.destroy();
        }
        clearTimeout(this.hideTimer);
        clearTimeout(this.tooltipTimeout);
      },
      move: function(x, y, anchorX, anchorY) {
        var tooltip = this,
          now = tooltip.now,
          animate = tooltip.options.animation !== false && !tooltip.isHidden &&
          (Math.abs(x - now.x) > 1 || Math.abs(y - now.y) > 1),
          skipAnchor = tooltip.followPointer || tooltip.len > 1;
        extend(now, {
          x: animate ? (2 * now.x + x) / 3 : x,
          y: animate ? (now.y + y) / 2 : y,
          anchorX: skipAnchor ? undefined : animate ? (2 * now.anchorX + anchorX) / 3 : anchorX,
          anchorY: skipAnchor ? undefined : animate ? (now.anchorY + anchorY) / 2 : anchorY
        });
        tooltip.getLabel().attr(now);
        if (animate) {
          clearTimeout(this.tooltipTimeout);
          this.tooltipTimeout = setTimeout(function() {
            if (tooltip) {
              tooltip.move(x, y, anchorX, anchorY);
            }
          }, 32);
        }
      },
      hide: function(delay) {
        var tooltip = this;
        clearTimeout(this.hideTimer);
        delay = pick(delay, this.options.hideDelay, 500);
        if (!this.isHidden) {
          this.hideTimer = syncTimeout(function() {
            tooltip.getLabel()[delay ? 'fadeOut' : 'hide']();
            tooltip.isHidden = true;
          }, delay);
        }
      },
      getAnchor: function(points, mouseEvent) {
        var ret,
          chart = this.chart,
          inverted = chart.inverted,
          plotTop = chart.plotTop,
          plotLeft = chart.plotLeft,
          plotX = 0,
          plotY = 0,
          yAxis,
          xAxis;
        points = splat(points);
        ret = points[0].tooltipPos;
        if (this.followPointer && mouseEvent) {
          if (mouseEvent.chartX === undefined) {
            mouseEvent = chart.pointer.normalize(mouseEvent);
          }
          ret = [
            mouseEvent.chartX - chart.plotLeft,
            mouseEvent.chartY - plotTop
          ];
        }
        if (!ret) {
          each(points, function(point) {
            yAxis = point.series.yAxis;
            xAxis = point.series.xAxis;
            plotX += point.plotX + (!inverted && xAxis ? xAxis.left - plotLeft : 0);
            plotY += (point.plotLow ? (point.plotLow + point.plotHigh) / 2 : point.plotY) +
              (!inverted && yAxis ? yAxis.top - plotTop : 0);
          });
          plotX /= points.length;
          plotY /= points.length;
          ret = [
            inverted ? chart.plotWidth - plotY : plotX,
            this.shared && !inverted && points.length > 1 && mouseEvent ?
            mouseEvent.chartY - plotTop :
            inverted ? chart.plotHeight - plotX : plotY
          ];
        }
        return map(ret, Math.round);
      },
      getPosition: function(boxWidth, boxHeight, point) {
        var chart = this.chart,
          distance = this.distance,
          ret = {},
          h = point.h || 0,
          swapped,
          first = ['y', chart.chartHeight, boxHeight,
            point.plotY + chart.plotTop, chart.plotTop,
            chart.plotTop + chart.plotHeight
          ],
          second = ['x', chart.chartWidth, boxWidth,
            point.plotX + chart.plotLeft, chart.plotLeft,
            chart.plotLeft + chart.plotWidth
          ],
          preferFarSide = !this.followPointer && pick(point.ttBelow, !chart.inverted === !!point.negative),
          firstDimension = function(dim, outerSize, innerSize, point, min, max) {
            var roomLeft = innerSize < point - distance,
              roomRight = point + distance + innerSize < outerSize,
              alignedLeft = point - distance - innerSize,
              alignedRight = point + distance;
            if (preferFarSide && roomRight) {
              ret[dim] = alignedRight;
            } else if (!preferFarSide && roomLeft) {
              ret[dim] = alignedLeft;
            } else if (roomLeft) {
              ret[dim] = Math.min(max - innerSize, alignedLeft - h < 0 ? alignedLeft : alignedLeft - h);
            } else if (roomRight) {
              ret[dim] = Math.max(
                min,
                alignedRight + h + innerSize > outerSize ?
                alignedRight :
                alignedRight + h
              );
            } else {
              return false;
            }
          },
          secondDimension = function(dim, outerSize, innerSize, point) {
            var retVal;
            if (point < distance || point > outerSize - distance) {
              retVal = false;
            } else if (point < innerSize / 2) {
              ret[dim] = 1;
            } else if (point > outerSize - innerSize / 2) {
              ret[dim] = outerSize - innerSize - 2;
            } else {
              ret[dim] = point - innerSize / 2;
            }
            return retVal;
          },
          swap = function(count) {
            var temp = first;
            first = second;
            second = temp;
            swapped = count;
          },
          run = function() {
            if (firstDimension.apply(0, first) !== false) {
              if (secondDimension.apply(0, second) === false && !swapped) {
                swap(true);
                run();
              }
            } else if (!swapped) {
              swap(true);
              run();
            } else {
              ret.x = ret.y = 0;
            }
          };
        if (chart.inverted || this.len > 1) {
          swap();
        }
        run();
        return ret;
      },
      defaultFormatter: function(tooltip) {
        var items = this.points || splat(this),
          s;
        s = [tooltip.tooltipFooterHeaderFormatter(items[0])];
        s = s.concat(tooltip.bodyFormatter(items));
        s.push(tooltip.tooltipFooterHeaderFormatter(items[0], true));
        return s;
      },
      refresh: function(point, mouseEvent) {
        var tooltip = this,
          chart = tooltip.chart,
          label,
          options = tooltip.options,
          x,
          y,
          anchor,
          textConfig = {},
          text,
          pointConfig = [],
          formatter = options.formatter || tooltip.defaultFormatter,
          hoverPoints = chart.hoverPoints,
          shared = tooltip.shared,
          currentSeries;
        clearTimeout(this.hideTimer);
        tooltip.followPointer = splat(point)[0].series.tooltipOptions.followPointer;
        anchor = tooltip.getAnchor(point, mouseEvent);
        x = anchor[0];
        y = anchor[1];
        if (shared && !(point.series && point.series.noSharedTooltip)) {
          chart.hoverPoints = point;
          if (hoverPoints) {
            each(hoverPoints, function(point) {
              point.setState();
            });
          }
          each(point, function(item) {
            item.setState('hover');
            pointConfig.push(item.getLabelConfig());
          });
          textConfig = {
            x: point[0].category,
            y: point[0].y
          };
          textConfig.points = pointConfig;
          point = point[0];
        } else {
          textConfig = point.getLabelConfig();
        }
        this.len = pointConfig.length;
        text = formatter.call(textConfig, tooltip);
        currentSeries = point.series;
        this.distance = pick(currentSeries.tooltipOptions.distance, 16);
        if (text === false) {
          this.hide();
        } else {
          label = tooltip.getLabel();
          if (tooltip.isHidden) {
            label.attr({
              opacity: 1
            }).show();
          }
          if (tooltip.split) {
            this.renderSplit(text, chart.hoverPoints);
          } else {
            label.attr({
              text: text && text.join ? text.join('') : text
            });
            label.removeClass(/highcharts-color-[\d]+/g)
              .addClass('highcharts-color-' + pick(point.colorIndex, currentSeries.colorIndex));
            label.attr({
              stroke: options.borderColor || point.color || currentSeries.color || '#666666'
            });
            tooltip.updatePosition({
              plotX: x,
              plotY: y,
              negative: point.negative,
              ttBelow: point.ttBelow,
              h: anchor[2] || 0
            });
          }
          this.isHidden = false;
        }
      },
      renderSplit: function(labels, points) {
        var tooltip = this,
          boxes = [],
          chart = this.chart,
          ren = chart.renderer,
          rightAligned = true,
          options = this.options,
          headerHeight,
          tooltipLabel = this.getLabel();
        each(labels.slice(0, points.length + 1), function(str, i) {
          var point = points[i - 1] || {
              isHeader: true,
              plotX: points[0].plotX
            },
            owner = point.series || tooltip,
            tt = owner.tt,
            series = point.series || {},
            colorClass = 'highcharts-color-' + pick(point.colorIndex, series.colorIndex, 'none'),
            target,
            x,
            bBox,
            boxWidth;
          if (!tt) {
            owner.tt = tt = ren.label(null, null, null, 'callout')
              .addClass('highcharts-tooltip-box ' + colorClass)
              .attr({
                'padding': options.padding,
                'r': options.borderRadius,
                'fill': options.backgroundColor,
                'stroke': point.color || series.color || '#333333',
                'stroke-width': options.borderWidth
              })
              .add(tooltipLabel);
          }
          tt.isActive = true;
          tt.attr({
            text: str
          });
          tt.css(options.style);
          bBox = tt.getBBox();
          boxWidth = bBox.width + tt.strokeWidth();
          if (point.isHeader) {
            headerHeight = bBox.height;
            x = Math.max(
              0,
              Math.min(
                point.plotX + chart.plotLeft - boxWidth / 2,
                chart.chartWidth - boxWidth
              )
            );
          } else {
            x = point.plotX + chart.plotLeft - pick(options.distance, 16) -
              boxWidth;
          }
          if (x < 0) {
            rightAligned = false;
          }
          target = (point.series && point.series.yAxis && point.series.yAxis.pos) + (point.plotY || 0);
          target -= chart.plotTop;
          boxes.push({
            target: point.isHeader ? chart.plotHeight + headerHeight : target,
            rank: point.isHeader ? 1 : 0,
            size: owner.tt.getBBox().height + 1,
            point: point,
            x: x,
            tt: tt
          });
        });
        this.cleanSplit();
        H.distribute(boxes, chart.plotHeight + headerHeight);
        each(boxes, function(box) {
          var point = box.point,
            series = point.series;
          box.tt.attr({
            visibility: box.pos === undefined ? 'hidden' : 'inherit',
            x: (rightAligned || point.isHeader ?
              box.x :
              point.plotX + chart.plotLeft + pick(options.distance, 16)),
            y: box.pos + chart.plotTop,
            anchorX: point.isHeader ?
              point.plotX + chart.plotLeft : point.plotX + series.xAxis.pos,
            anchorY: point.isHeader ?
              box.pos + chart.plotTop - 15 : point.plotY + series.yAxis.pos
          });
        });
      },
      updatePosition: function(point) {
        var chart = this.chart,
          label = this.getLabel(),
          pos = (this.options.positioner || this.getPosition).call(
            this,
            label.width,
            label.height,
            point
          );
        this.move(
          Math.round(pos.x),
          Math.round(pos.y || 0),
          point.plotX + chart.plotLeft,
          point.plotY + chart.plotTop
        );
      },
      getDateFormat: function(range, date, startOfWeek, dateTimeLabelFormats) {
        var dateStr = dateFormat('%m-%d %H:%M:%S.%L', date),
          format,
          n,
          blank = '01-01 00:00:00.000',
          strpos = {
            millisecond: 15,
            second: 12,
            minute: 9,
            hour: 6,
            day: 3
          },
          lastN = 'millisecond';
        for (n in timeUnits) {
          if (range === timeUnits.week && +dateFormat('%w', date) === startOfWeek &&
            dateStr.substr(6) === blank.substr(6)) {
            n = 'week';
            break;
          }
          if (timeUnits[n] > range) {
            n = lastN;
            break;
          }
          if (strpos[n] && dateStr.substr(strpos[n]) !== blank.substr(strpos[n])) {
            break;
          }
          if (n !== 'week') {
            lastN = n;
          }
        }
        if (n) {
          format = dateTimeLabelFormats[n];
        }
        return format;
      },
      getXDateFormat: function(point, options, xAxis) {
        var xDateFormat,
          dateTimeLabelFormats = options.dateTimeLabelFormats,
          closestPointRange = xAxis && xAxis.closestPointRange;
        if (closestPointRange) {
          xDateFormat = this.getDateFormat(
            closestPointRange,
            point.x,
            xAxis.options.startOfWeek,
            dateTimeLabelFormats
          );
        } else {
          xDateFormat = dateTimeLabelFormats.day;
        }
        return xDateFormat || dateTimeLabelFormats.year;
      },
      tooltipFooterHeaderFormatter: function(labelConfig, isFooter) {
        var footOrHead = isFooter ? 'footer' : 'header',
          series = labelConfig.series,
          tooltipOptions = series.tooltipOptions,
          xDateFormat = tooltipOptions.xDateFormat,
          xAxis = series.xAxis,
          isDateTime = xAxis && xAxis.options.type === 'datetime' && isNumber(labelConfig.key),
          formatString = tooltipOptions[footOrHead + 'Format'];
        if (isDateTime && !xDateFormat) {
          xDateFormat = this.getXDateFormat(labelConfig, tooltipOptions, xAxis);
        }
        if (isDateTime && xDateFormat) {
          formatString = formatString.replace('{point.key}', '{point.key:' + xDateFormat + '}');
        }
        return format(formatString, {
          point: labelConfig,
          series: series
        });
      },
      bodyFormatter: function(items) {
        return map(items, function(item) {
          var tooltipOptions = item.series.tooltipOptions;
          return (tooltipOptions.pointFormatter || item.point.tooltipFormatter)
            .call(item.point, tooltipOptions.pointFormat);
        });
      }
    };
  }(Highcharts));
  (function(H) {
    'use strict';
    var addEvent = H.addEvent,
      attr = H.attr,
      charts = H.charts,
      color = H.color,
      css = H.css,
      defined = H.defined,
      doc = H.doc,
      each = H.each,
      extend = H.extend,
      fireEvent = H.fireEvent,
      offset = H.offset,
      pick = H.pick,
      removeEvent = H.removeEvent,
      splat = H.splat,
      Tooltip = H.Tooltip,
      win = H.win;
    H.Pointer = function(chart, options) {
      this.init(chart, options);
    };
    H.Pointer.prototype = {
      init: function(chart, options) {
        this.options = options;
        this.chart = chart;
        this.runChartClick = options.chart.events && !!options.chart.events.click;
        this.pinchDown = [];
        this.lastValidTouch = {};
        if (Tooltip && options.tooltip.enabled) {
          chart.tooltip = new Tooltip(chart, options.tooltip);
          this.followTouchMove = pick(options.tooltip.followTouchMove, true);
        }
        this.setDOMEvents();
      },
      zoomOption: function(e) {
        var chart = this.chart,
          options = chart.options.chart,
          zoomType = options.zoomType || '',
          inverted = chart.inverted,
          zoomX,
          zoomY;
        if (/touch/.test(e.type)) {
          zoomType = pick(options.pinchType, zoomType);
        }
        this.zoomX = zoomX = /x/.test(zoomType);
        this.zoomY = zoomY = /y/.test(zoomType);
        this.zoomHor = (zoomX && !inverted) || (zoomY && inverted);
        this.zoomVert = (zoomY && !inverted) || (zoomX && inverted);
        this.hasZoom = zoomX || zoomY;
      },
      normalize: function(e, chartPosition) {
        var chartX,
          chartY,
          ePos;
        e = e || win.event;
        if (!e.target) {
          e.target = e.srcElement;
        }
        ePos = e.touches ? (e.touches.length ? e.touches.item(0) : e.changedTouches[0]) : e;
        if (!chartPosition) {
          this.chartPosition = chartPosition = offset(this.chart.container);
        }
        if (ePos.pageX === undefined) {
          chartX = Math.max(e.x, e.clientX - chartPosition.left);
          chartY = e.y;
        } else {
          chartX = ePos.pageX - chartPosition.left;
          chartY = ePos.pageY - chartPosition.top;
        }
        return extend(e, {
          chartX: Math.round(chartX),
          chartY: Math.round(chartY)
        });
      },
      getCoordinates: function(e) {
        var coordinates = {
          xAxis: [],
          yAxis: []
        };
        each(this.chart.axes, function(axis) {
          coordinates[axis.isXAxis ? 'xAxis' : 'yAxis'].push({
            axis: axis,
            value: axis.toValue(e[axis.horiz ? 'chartX' : 'chartY'])
          });
        });
        return coordinates;
      },
      runPointActions: function(e) {
        var pointer = this,
          chart = pointer.chart,
          series = chart.series,
          tooltip = chart.tooltip,
          shared = tooltip ? tooltip.shared : false,
          followPointer,
          updatePosition = true,
          hoverPoint = chart.hoverPoint,
          hoverSeries = chart.hoverSeries,
          i,
          anchor,
          noSharedTooltip,
          stickToHoverSeries,
          directTouch,
          kdpoints = [],
          kdpointT;
        if (!shared && !hoverSeries) {
          for (i = 0; i < series.length; i++) {
            if (series[i].directTouch || !series[i].options.stickyTracking) {
              series = [];
            }
          }
        }
        stickToHoverSeries = hoverSeries && (shared ? hoverSeries.noSharedTooltip : hoverSeries.directTouch);
        if (stickToHoverSeries && hoverPoint) {
          kdpoints = [hoverPoint];
        } else {
          if (!shared && hoverSeries && !hoverSeries.options.stickyTracking) {
            series = [hoverSeries];
          }
          each(series, function(s) {
            noSharedTooltip = s.noSharedTooltip && shared;
            directTouch = !shared && s.directTouch;
            if (s.visible && !noSharedTooltip && !directTouch && pick(s.options.enableMouseTracking, true)) {
              kdpointT = s.searchPoint(e, !noSharedTooltip && s.kdDimensions === 1);
              if (kdpointT && kdpointT.series) {
                kdpoints.push(kdpointT);
              }
            }
          });
          kdpoints.sort(function(p1, p2) {
            var isCloserX = p1.distX - p2.distX,
              isCloser = p1.dist - p2.dist,
              isAbove = (p2.series.group && p2.series.group.zIndex) -
              (p1.series.group && p1.series.group.zIndex);
            if (isCloserX !== 0 && shared) {
              return isCloserX;
            }
            if (isCloser !== 0) {
              return isCloser;
            }
            if (isAbove !== 0) {
              return isAbove;
            }
            return p1.series.index > p2.series.index ? -1 : 1;
          });
        }
        if (shared) {
          i = kdpoints.length;
          while (i--) {
            if (kdpoints[i].x !== kdpoints[0].x || kdpoints[i].series.noSharedTooltip) {
              kdpoints.splice(i, 1);
            }
          }
        }
        if (kdpoints[0] && (kdpoints[0] !== this.prevKDPoint || (tooltip && tooltip.isHidden))) {
          if (shared && !kdpoints[0].series.noSharedTooltip) {
            for (i = 0; i < kdpoints.length; i++) {
              kdpoints[i].onMouseOver(e, kdpoints[i] !== ((hoverSeries && hoverSeries.directTouch && hoverPoint) || kdpoints[0]));
            }
            if (kdpoints.length && tooltip) {
              tooltip.refresh(kdpoints.sort(function(p1, p2) {
                return p1.series.index - p2.series.index;
              }), e);
            }
          } else {
            if (tooltip) {
              tooltip.refresh(kdpoints[0], e);
            }
            if (!hoverSeries || !hoverSeries.directTouch) {
              kdpoints[0].onMouseOver(e);
            }
          }
          this.prevKDPoint = kdpoints[0];
          updatePosition = false;
        }
        if (updatePosition) {
          followPointer = hoverSeries && hoverSeries.tooltipOptions.followPointer;
          if (tooltip && followPointer && !tooltip.isHidden) {
            anchor = tooltip.getAnchor([{}], e);
            tooltip.updatePosition({
              plotX: anchor[0],
              plotY: anchor[1]
            });
          }
        }
        if (!pointer.unDocMouseMove) {
          pointer.unDocMouseMove = addEvent(doc, 'mousemove', function(e) {
            if (charts[H.hoverChartIndex]) {
              charts[H.hoverChartIndex].pointer.onDocumentMouseMove(e);
            }
          });
        }
        each(shared ? kdpoints : [pick(hoverPoint, kdpoints[0])], function drawPointCrosshair(point) {
          each(chart.axes, function drawAxisCrosshair(axis) {
            if (!point || point.series && point.series[axis.coll] === axis) {
              axis.drawCrosshair(e, point);
            }
          });
        });
      },
      reset: function(allowMove, delay) {
        var pointer = this,
          chart = pointer.chart,
          hoverSeries = chart.hoverSeries,
          hoverPoint = chart.hoverPoint,
          hoverPoints = chart.hoverPoints,
          tooltip = chart.tooltip,
          tooltipPoints = tooltip && tooltip.shared ? hoverPoints : hoverPoint;
        if (allowMove && tooltipPoints) {
          each(splat(tooltipPoints), function(point) {
            if (point.series.isCartesian && point.plotX === undefined) {
              allowMove = false;
            }
          });
        }
        if (allowMove) {
          if (tooltip && tooltipPoints) {
            tooltip.refresh(tooltipPoints);
            if (hoverPoint) {
              hoverPoint.setState(hoverPoint.state, true);
              each(chart.axes, function(axis) {
                if (axis.crosshair) {
                  axis.drawCrosshair(null, hoverPoint);
                }
              });
            }
          }
        } else {
          if (hoverPoint) {
            hoverPoint.onMouseOut();
          }
          if (hoverPoints) {
            each(hoverPoints, function(point) {
              point.setState();
            });
          }
          if (hoverSeries) {
            hoverSeries.onMouseOut();
          }
          if (tooltip) {
            tooltip.hide(delay);
          }
          if (pointer.unDocMouseMove) {
            pointer.unDocMouseMove = pointer.unDocMouseMove();
          }
          each(chart.axes, function(axis) {
            axis.hideCrosshair();
          });
          pointer.hoverX = pointer.prevKDPoint = chart.hoverPoints = chart.hoverPoint = null;
        }
      },
      scaleGroups: function(attribs, clip) {
        var chart = this.chart,
          seriesAttribs;
        each(chart.series, function(series) {
          seriesAttribs = attribs || series.getPlotBox();
          if (series.xAxis && series.xAxis.zoomEnabled && series.group) {
            series.group.attr(seriesAttribs);
            if (series.markerGroup) {
              series.markerGroup.attr(seriesAttribs);
              series.markerGroup.clip(clip ? chart.clipRect : null);
            }
            if (series.dataLabelsGroup) {
              series.dataLabelsGroup.attr(seriesAttribs);
            }
          }
        });
        chart.clipRect.attr(clip || chart.clipBox);
      },
      dragStart: function(e) {
        var chart = this.chart;
        chart.mouseIsDown = e.type;
        chart.cancelClick = false;
        chart.mouseDownX = this.mouseDownX = e.chartX;
        chart.mouseDownY = this.mouseDownY = e.chartY;
      },
      drag: function(e) {
        var chart = this.chart,
          chartOptions = chart.options.chart,
          chartX = e.chartX,
          chartY = e.chartY,
          zoomHor = this.zoomHor,
          zoomVert = this.zoomVert,
          plotLeft = chart.plotLeft,
          plotTop = chart.plotTop,
          plotWidth = chart.plotWidth,
          plotHeight = chart.plotHeight,
          clickedInside,
          size,
          selectionMarker = this.selectionMarker,
          mouseDownX = this.mouseDownX,
          mouseDownY = this.mouseDownY,
          panKey = chartOptions.panKey && e[chartOptions.panKey + 'Key'];
        if (selectionMarker && selectionMarker.touch) {
          return;
        }
        if (chartX < plotLeft) {
          chartX = plotLeft;
        } else if (chartX > plotLeft + plotWidth) {
          chartX = plotLeft + plotWidth;
        }
        if (chartY < plotTop) {
          chartY = plotTop;
        } else if (chartY > plotTop + plotHeight) {
          chartY = plotTop + plotHeight;
        }
        this.hasDragged = Math.sqrt(
          Math.pow(mouseDownX - chartX, 2) +
          Math.pow(mouseDownY - chartY, 2)
        );
        if (this.hasDragged > 10) {
          clickedInside = chart.isInsidePlot(mouseDownX - plotLeft, mouseDownY - plotTop);
          if (chart.hasCartesianSeries && (this.zoomX || this.zoomY) && clickedInside && !panKey) {
            if (!selectionMarker) {
              this.selectionMarker = selectionMarker = chart.renderer.rect(
                  plotLeft,
                  plotTop,
                  zoomHor ? 1 : plotWidth,
                  zoomVert ? 1 : plotHeight,
                  0
                )
                .attr({
                  fill: chartOptions.selectionMarkerFill || color('#335cad').setOpacity(0.25).get(),
                  'class': 'highcharts-selection-marker',
                  'zIndex': 7
                })
                .add();
            }
          }
          if (selectionMarker && zoomHor) {
            size = chartX - mouseDownX;
            selectionMarker.attr({
              width: Math.abs(size),
              x: (size > 0 ? 0 : size) + mouseDownX
            });
          }
          if (selectionMarker && zoomVert) {
            size = chartY - mouseDownY;
            selectionMarker.attr({
              height: Math.abs(size),
              y: (size > 0 ? 0 : size) + mouseDownY
            });
          }
          if (clickedInside && !selectionMarker && chartOptions.panning) {
            chart.pan(e, chartOptions.panning);
          }
        }
      },
      drop: function(e) {
        var pointer = this,
          chart = this.chart,
          hasPinched = this.hasPinched;
        if (this.selectionMarker) {
          var selectionData = {
              originalEvent: e,
              xAxis: [],
              yAxis: []
            },
            selectionBox = this.selectionMarker,
            selectionLeft = selectionBox.attr ? selectionBox.attr('x') : selectionBox.x,
            selectionTop = selectionBox.attr ? selectionBox.attr('y') : selectionBox.y,
            selectionWidth = selectionBox.attr ? selectionBox.attr('width') : selectionBox.width,
            selectionHeight = selectionBox.attr ? selectionBox.attr('height') : selectionBox.height,
            runZoom;
          if (this.hasDragged || hasPinched) {
            each(chart.axes, function(axis) {
              if (axis.zoomEnabled && defined(axis.min) && (hasPinched || pointer[{
                  xAxis: 'zoomX',
                  yAxis: 'zoomY'
                }[axis.coll]])) {
                var horiz = axis.horiz,
                  minPixelPadding = e.type === 'touchend' ? axis.minPixelPadding : 0,
                  selectionMin = axis.toValue((horiz ? selectionLeft : selectionTop) + minPixelPadding),
                  selectionMax = axis.toValue((horiz ? selectionLeft + selectionWidth : selectionTop + selectionHeight) - minPixelPadding);
                selectionData[axis.coll].push({
                  axis: axis,
                  min: Math.min(selectionMin, selectionMax),
                  max: Math.max(selectionMin, selectionMax)
                });
                runZoom = true;
              }
            });
            if (runZoom) {
              fireEvent(chart, 'selection', selectionData, function(args) {
                chart.zoom(extend(args, hasPinched ? {
                  animation: false
                } : null));
              });
            }
          }
          this.selectionMarker = this.selectionMarker.destroy();
          if (hasPinched) {
            this.scaleGroups();
          }
        }
        if (chart) {
          css(chart.container, {
            cursor: chart._cursor
          });
          chart.cancelClick = this.hasDragged > 10;
          chart.mouseIsDown = this.hasDragged = this.hasPinched = false;
          this.pinchDown = [];
        }
      },
      onContainerMouseDown: function(e) {
        e = this.normalize(e);
        this.zoomOption(e);
        if (e.preventDefault) {
          e.preventDefault();
        }
        this.dragStart(e);
      },
      onDocumentMouseUp: function(e) {
        if (charts[H.hoverChartIndex]) {
          charts[H.hoverChartIndex].pointer.drop(e);
        }
      },
      onDocumentMouseMove: function(e) {
        var chart = this.chart,
          chartPosition = this.chartPosition;
        e = this.normalize(e, chartPosition);
        if (chartPosition && !this.inClass(e.target, 'highcharts-tracker') &&
          !chart.isInsidePlot(e.chartX - chart.plotLeft, e.chartY - chart.plotTop)) {
          this.reset();
        }
      },
      onContainerMouseLeave: function(e) {
        var chart = charts[H.hoverChartIndex];
        if (chart && (e.relatedTarget || e.toElement)) {
          chart.pointer.reset();
          chart.pointer.chartPosition = null;
        }
      },
      onContainerMouseMove: function(e) {
        var chart = this.chart;
        if (!defined(H.hoverChartIndex) || !charts[H.hoverChartIndex] || !charts[H.hoverChartIndex].mouseIsDown) {
          H.hoverChartIndex = chart.index;
        }
        e = this.normalize(e);
        e.returnValue = false;
        if (chart.mouseIsDown === 'mousedown') {
          this.drag(e);
        }
        if ((this.inClass(e.target, 'highcharts-tracker') ||
            chart.isInsidePlot(e.chartX - chart.plotLeft, e.chartY - chart.plotTop)) && !chart.openMenu) {
          this.runPointActions(e);
        }
      },
      inClass: function(element, className) {
        var elemClassName;
        while (element) {
          elemClassName = attr(element, 'class');
          if (elemClassName) {
            if (elemClassName.indexOf(className) !== -1) {
              return true;
            }
            if (elemClassName.indexOf('highcharts-container') !== -1) {
              return false;
            }
          }
          element = element.parentNode;
        }
      },
      onTrackerMouseOut: function(e) {
        var series = this.chart.hoverSeries,
          relatedTarget = e.relatedTarget || e.toElement;
        if (series && relatedTarget && !series.options.stickyTracking &&
          !this.inClass(relatedTarget, 'highcharts-tooltip') &&
          (!this.inClass(relatedTarget, 'highcharts-series-' + series.index) ||
            !this.inClass(relatedTarget, 'highcharts-tracker')
          )
        ) {
          series.onMouseOut();
        }
      },
      onContainerClick: function(e) {
        var chart = this.chart,
          hoverPoint = chart.hoverPoint,
          plotLeft = chart.plotLeft,
          plotTop = chart.plotTop;
        e = this.normalize(e);
        if (!chart.cancelClick) {
          if (hoverPoint && this.inClass(e.target, 'highcharts-tracker')) {
            fireEvent(hoverPoint.series, 'click', extend(e, {
              point: hoverPoint
            }));
            if (chart.hoverPoint) {
              hoverPoint.firePointEvent('click', e);
            }
          } else {
            extend(e, this.getCoordinates(e));
            if (chart.isInsidePlot(e.chartX - plotLeft, e.chartY - plotTop)) {
              fireEvent(chart, 'click', e);
            }
          }
        }
      },
      setDOMEvents: function() {
        var pointer = this,
          container = pointer.chart.container;
        container.onmousedown = function(e) {
          pointer.onContainerMouseDown(e);
        };
        container.onmousemove = function(e) {
          pointer.onContainerMouseMove(e);
        };
        container.onclick = function(e) {
          pointer.onContainerClick(e);
        };
        addEvent(container, 'mouseleave', pointer.onContainerMouseLeave);
        if (H.chartCount === 1) {
          addEvent(doc, 'mouseup', pointer.onDocumentMouseUp);
        }
        if (H.hasTouch) {
          container.ontouchstart = function(e) {
            pointer.onContainerTouchStart(e);
          };
          container.ontouchmove = function(e) {
            pointer.onContainerTouchMove(e);
          };
          if (H.chartCount === 1) {
            addEvent(doc, 'touchend', pointer.onDocumentTouchEnd);
          }
        }
      },
      destroy: function() {
        var prop;
        removeEvent(this.chart.container, 'mouseleave', this.onContainerMouseLeave);
        if (!H.chartCount) {
          removeEvent(doc, 'mouseup', this.onDocumentMouseUp);
          removeEvent(doc, 'touchend', this.onDocumentTouchEnd);
        }
        clearInterval(this.tooltipTimeout);
        for (prop in this) {
          this[prop] = null;
        }
      }
    };
  }(Highcharts));
  (function(H) {
    'use strict';
    var charts = H.charts,
      each = H.each,
      extend = H.extend,
      map = H.map,
      noop = H.noop,
      pick = H.pick,
      Pointer = H.Pointer;
    extend(Pointer.prototype, {
      pinchTranslate: function(pinchDown, touches, transform, selectionMarker, clip, lastValidTouch) {
        if (this.zoomHor) {
          this.pinchTranslateDirection(true, pinchDown, touches, transform, selectionMarker, clip, lastValidTouch);
        }
        if (this.zoomVert) {
          this.pinchTranslateDirection(false, pinchDown, touches, transform, selectionMarker, clip, lastValidTouch);
        }
      },
      pinchTranslateDirection: function(horiz, pinchDown, touches, transform,
        selectionMarker, clip, lastValidTouch, forcedScale) {
        var chart = this.chart,
          xy = horiz ? 'x' : 'y',
          XY = horiz ? 'X' : 'Y',
          sChartXY = 'chart' + XY,
          wh = horiz ? 'width' : 'height',
          plotLeftTop = chart['plot' + (horiz ? 'Left' : 'Top')],
          selectionWH,
          selectionXY,
          clipXY,
          scale = forcedScale || 1,
          inverted = chart.inverted,
          bounds = chart.bounds[horiz ? 'h' : 'v'],
          singleTouch = pinchDown.length === 1,
          touch0Start = pinchDown[0][sChartXY],
          touch0Now = touches[0][sChartXY],
          touch1Start = !singleTouch && pinchDown[1][sChartXY],
          touch1Now = !singleTouch && touches[1][sChartXY],
          outOfBounds,
          transformScale,
          scaleKey,
          setScale = function() {
            if (!singleTouch && Math.abs(touch0Start - touch1Start) > 20) {
              scale = forcedScale || Math.abs(touch0Now - touch1Now) / Math.abs(touch0Start - touch1Start);
            }
            clipXY = ((plotLeftTop - touch0Now) / scale) + touch0Start;
            selectionWH = chart['plot' + (horiz ? 'Width' : 'Height')] / scale;
          };
        setScale();
        selectionXY = clipXY;
        if (selectionXY < bounds.min) {
          selectionXY = bounds.min;
          outOfBounds = true;
        } else if (selectionXY + selectionWH > bounds.max) {
          selectionXY = bounds.max - selectionWH;
          outOfBounds = true;
        }
        if (outOfBounds) {
          touch0Now -= 0.8 * (touch0Now - lastValidTouch[xy][0]);
          if (!singleTouch) {
            touch1Now -= 0.8 * (touch1Now - lastValidTouch[xy][1]);
          }
          setScale();
        } else {
          lastValidTouch[xy] = [touch0Now, touch1Now];
        }
        if (!inverted) {
          clip[xy] = clipXY - plotLeftTop;
          clip[wh] = selectionWH;
        }
        scaleKey = inverted ? (horiz ? 'scaleY' : 'scaleX') : 'scale' + XY;
        transformScale = inverted ? 1 / scale : scale;
        selectionMarker[wh] = selectionWH;
        selectionMarker[xy] = selectionXY;
        transform[scaleKey] = scale;
        transform['translate' + XY] = (transformScale * plotLeftTop) + (touch0Now - (transformScale * touch0Start));
      },
      pinch: function(e) {
        var self = this,
          chart = self.chart,
          pinchDown = self.pinchDown,
          touches = e.touches,
          touchesLength = touches.length,
          lastValidTouch = self.lastValidTouch,
          hasZoom = self.hasZoom,
          selectionMarker = self.selectionMarker,
          transform = {},
          fireClickEvent = touchesLength === 1 && ((self.inClass(e.target, 'highcharts-tracker') &&
            chart.runTrackerClick) || self.runChartClick),
          clip = {};
        if (touchesLength > 1) {
          self.initiated = true;
        }
        if (hasZoom && self.initiated && !fireClickEvent) {
          e.preventDefault();
        }
        map(touches, function(e) {
          return self.normalize(e);
        });
        if (e.type === 'touchstart') {
          each(touches, function(e, i) {
            pinchDown[i] = {
              chartX: e.chartX,
              chartY: e.chartY
            };
          });
          lastValidTouch.x = [pinchDown[0].chartX, pinchDown[1] && pinchDown[1].chartX];
          lastValidTouch.y = [pinchDown[0].chartY, pinchDown[1] && pinchDown[1].chartY];
          each(chart.axes, function(axis) {
            if (axis.zoomEnabled) {
              var bounds = chart.bounds[axis.horiz ? 'h' : 'v'],
                minPixelPadding = axis.minPixelPadding,
                min = axis.toPixels(pick(axis.options.min, axis.dataMin)),
                max = axis.toPixels(pick(axis.options.max, axis.dataMax)),
                absMin = Math.min(min, max),
                absMax = Math.max(min, max);
              bounds.min = Math.min(axis.pos, absMin - minPixelPadding);
              bounds.max = Math.max(axis.pos + axis.len, absMax + minPixelPadding);
            }
          });
          self.res = true;
        } else if (self.followTouchMove && touchesLength === 1) {
          this.runPointActions(self.normalize(e));
        } else if (pinchDown.length) {
          if (!selectionMarker) {
            self.selectionMarker = selectionMarker = extend({
              destroy: noop,
              touch: true
            }, chart.plotBox);
          }
          self.pinchTranslate(pinchDown, touches, transform, selectionMarker, clip, lastValidTouch);
          self.hasPinched = hasZoom;
          self.scaleGroups(transform, clip);
          if (self.res) {
            self.res = false;
            this.reset(false, 0);
          }
        }
      },
      touch: function(e, start) {
        var chart = this.chart,
          hasMoved,
          pinchDown,
          isInside;
        if (chart.index !== H.hoverChartIndex) {
          this.onContainerMouseLeave({
            relatedTarget: true
          });
        }
        H.hoverChartIndex = chart.index;
        if (e.touches.length === 1) {
          e = this.normalize(e);
          isInside = chart.isInsidePlot(
            e.chartX - chart.plotLeft,
            e.chartY - chart.plotTop
          );
          if (isInside && !chart.openMenu) {
            if (start) {
              this.runPointActions(e);
            }
            if (e.type === 'touchmove') {
              pinchDown = this.pinchDown;
              hasMoved = pinchDown[0] ? Math.sqrt(
                Math.pow(pinchDown[0].chartX - e.chartX, 2) +
                Math.pow(pinchDown[0].chartY - e.chartY, 2)
              ) >= 4 : false;
            }
            if (pick(hasMoved, true)) {
              this.pinch(e);
            }
          } else if (start) {
            this.reset();
          }
        } else if (e.touches.length === 2) {
          this.pinch(e);
        }
      },
      onContainerTouchStart: function(e) {
        this.zoomOption(e);
        this.touch(e, true);
      },
      onContainerTouchMove: function(e) {
        this.touch(e);
      },
      onDocumentTouchEnd: function(e) {
        if (charts[H.hoverChartIndex]) {
          charts[H.hoverChartIndex].pointer.drop(e);
        }
      }
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var addEvent = H.addEvent,
      charts = H.charts,
      css = H.css,
      doc = H.doc,
      extend = H.extend,
      noop = H.noop,
      Pointer = H.Pointer,
      removeEvent = H.removeEvent,
      win = H.win,
      wrap = H.wrap;
    if (win.PointerEvent || win.MSPointerEvent) {
      var touches = {},
        hasPointerEvent = !!win.PointerEvent,
        getWebkitTouches = function() {
          var key,
            fake = [];
          fake.item = function(i) {
            return this[i];
          };
          for (key in touches) {
            if (touches.hasOwnProperty(key)) {
              fake.push({
                pageX: touches[key].pageX,
                pageY: touches[key].pageY,
                target: touches[key].target
              });
            }
          }
          return fake;
        },
        translateMSPointer = function(e, method, wktype, func) {
          var p;
          if ((e.pointerType === 'touch' || e.pointerType === e.MSPOINTER_TYPE_TOUCH) && charts[H.hoverChartIndex]) {
            func(e);
            p = charts[H.hoverChartIndex].pointer;
            p[method]({
              type: wktype,
              target: e.currentTarget,
              preventDefault: noop,
              touches: getWebkitTouches()
            });
          }
        };
      extend(Pointer.prototype, {
        onContainerPointerDown: function(e) {
          translateMSPointer(e, 'onContainerTouchStart', 'touchstart', function(e) {
            touches[e.pointerId] = {
              pageX: e.pageX,
              pageY: e.pageY,
              target: e.currentTarget
            };
          });
        },
        onContainerPointerMove: function(e) {
          translateMSPointer(e, 'onContainerTouchMove', 'touchmove', function(e) {
            touches[e.pointerId] = {
              pageX: e.pageX,
              pageY: e.pageY
            };
            if (!touches[e.pointerId].target) {
              touches[e.pointerId].target = e.currentTarget;
            }
          });
        },
        onDocumentPointerUp: function(e) {
          translateMSPointer(e, 'onDocumentTouchEnd', 'touchend', function(e) {
            delete touches[e.pointerId];
          });
        },
        batchMSEvents: function(fn) {
          fn(this.chart.container, hasPointerEvent ? 'pointerdown' : 'MSPointerDown', this.onContainerPointerDown);
          fn(this.chart.container, hasPointerEvent ? 'pointermove' : 'MSPointerMove', this.onContainerPointerMove);
          fn(doc, hasPointerEvent ? 'pointerup' : 'MSPointerUp', this.onDocumentPointerUp);
        }
      });
      wrap(Pointer.prototype, 'init', function(proceed, chart, options) {
        proceed.call(this, chart, options);
        if (this.hasZoom) {
          css(chart.container, {
            '-ms-touch-action': 'none',
            'touch-action': 'none'
          });
        }
      });
      wrap(Pointer.prototype, 'setDOMEvents', function(proceed) {
        proceed.apply(this);
        if (this.hasZoom || this.followTouchMove) {
          this.batchMSEvents(addEvent);
        }
      });
      wrap(Pointer.prototype, 'destroy', function(proceed) {
        this.batchMSEvents(removeEvent);
        proceed.call(this);
      });
    }
  }(Highcharts));
  (function(H) {
    'use strict';
    var Legend,
      addEvent = H.addEvent,
      css = H.css,
      discardElement = H.discardElement,
      defined = H.defined,
      each = H.each,
      extend = H.extend,
      isFirefox = H.isFirefox,
      marginNames = H.marginNames,
      merge = H.merge,
      pick = H.pick,
      setAnimation = H.setAnimation,
      stableSort = H.stableSort,
      win = H.win,
      wrap = H.wrap;
    Legend = H.Legend = function(chart, options) {
      this.init(chart, options);
    };
    Legend.prototype = {
      init: function(chart, options) {
        this.chart = chart;
        this.setOptions(options);
        if (options.enabled) {
          this.render();
          addEvent(this.chart, 'endResize', function() {
            this.legend.positionCheckboxes();
          });
        }
      },
      setOptions: function(options) {
        var padding = pick(options.padding, 8);
        this.options = options;
        this.itemStyle = options.itemStyle;
        this.itemHiddenStyle = merge(this.itemStyle, options.itemHiddenStyle);
        this.itemMarginTop = options.itemMarginTop || 0;
        this.padding = padding;
        this.initialItemX = padding;
        this.initialItemY = padding - 5;
        this.maxItemWidth = 0;
        this.itemHeight = 0;
        this.symbolWidth = pick(options.symbolWidth, 16);
        this.pages = [];
      },
      update: function(options, redraw) {
        var chart = this.chart;
        this.setOptions(merge(true, this.options, options));
        this.destroy();
        chart.isDirtyLegend = chart.isDirtyBox = true;
        if (pick(redraw, true)) {
          chart.redraw();
        }
      },
      colorizeItem: function(item, visible) {
        item.legendGroup[visible ? 'removeClass' : 'addClass']('highcharts-legend-item-hidden');
        var legend = this,
          options = legend.options,
          legendItem = item.legendItem,
          legendLine = item.legendLine,
          legendSymbol = item.legendSymbol,
          hiddenColor = legend.itemHiddenStyle.color,
          textColor = visible ? options.itemStyle.color : hiddenColor,
          symbolColor = visible ? (item.color || hiddenColor) : hiddenColor,
          markerOptions = item.options && item.options.marker,
          symbolAttr = {
            fill: symbolColor
          },
          key;
        if (legendItem) {
          legendItem.css({
            fill: textColor,
            color: textColor
          });
        }
        if (legendLine) {
          legendLine.attr({
            stroke: symbolColor
          });
        }
        if (legendSymbol) {
          if (markerOptions && legendSymbol.isMarker) {
            symbolAttr = item.pointAttribs();
            if (!visible) {
              for (key in symbolAttr) {
                symbolAttr[key] = hiddenColor;
              }
            }
          }
          legendSymbol.attr(symbolAttr);
        }
      },
      positionItem: function(item) {
        var legend = this,
          options = legend.options,
          symbolPadding = options.symbolPadding,
          ltr = !options.rtl,
          legendItemPos = item._legendItemPos,
          itemX = legendItemPos[0],
          itemY = legendItemPos[1],
          checkbox = item.checkbox,
          legendGroup = item.legendGroup;
        if (legendGroup && legendGroup.element) {
          legendGroup.translate(
            ltr ? itemX : legend.legendWidth - itemX - 2 * symbolPadding - 4,
            itemY
          );
        }
        if (checkbox) {
          checkbox.x = itemX;
          checkbox.y = itemY;
        }
      },
      destroyItem: function(item) {
        var checkbox = item.checkbox;
        each(['legendItem', 'legendLine', 'legendSymbol', 'legendGroup'], function(key) {
          if (item[key]) {
            item[key] = item[key].destroy();
          }
        });
        if (checkbox) {
          discardElement(item.checkbox);
        }
      },
      destroy: function() {
        function destroyItems(key) {
          if (this[key]) {
            this[key] = this[key].destroy();
          }
        }
        each(this.getAllItems(), function(item) {
          each(['legendItem', 'legendGroup'], destroyItems, item);
        });
        each(['box', 'title', 'group'], destroyItems, this);
        this.display = null;
      },
      positionCheckboxes: function(scrollOffset) {
        var alignAttr = this.group && this.group.alignAttr,
          translateY,
          clipHeight = this.clipHeight || this.legendHeight,
          titleHeight = this.titleHeight;
        if (alignAttr) {
          translateY = alignAttr.translateY;
          each(this.allItems, function(item) {
            var checkbox = item.checkbox,
              top;
            if (checkbox) {
              top = translateY + titleHeight + checkbox.y + (scrollOffset || 0) + 3;
              css(checkbox, {
                left: (alignAttr.translateX + item.checkboxOffset + checkbox.x - 20) + 'px',
                top: top + 'px',
                display: top > translateY - 6 && top < translateY + clipHeight - 6 ? '' : 'none'
              });
            }
          });
        }
      },
      renderTitle: function() {
        var options = this.options,
          padding = this.padding,
          titleOptions = options.title,
          titleHeight = 0,
          bBox;
        if (titleOptions.text) {
          if (!this.title) {
            this.title = this.chart.renderer.label(titleOptions.text, padding - 3, padding - 4, null, null, null, null, null, 'legend-title')
              .attr({
                zIndex: 1
              })
              .css(titleOptions.style)
              .add(this.group);
          }
          bBox = this.title.getBBox();
          titleHeight = bBox.height;
          this.offsetWidth = bBox.width;
          this.contentGroup.attr({
            translateY: titleHeight
          });
        }
        this.titleHeight = titleHeight;
      },
      setText: function(item) {
        var options = this.options;
        item.legendItem.attr({
          text: options.labelFormat ? H.format(options.labelFormat, item) : options.labelFormatter.call(item)
        });
      },
      renderItem: function(item) {
        var legend = this,
          chart = legend.chart,
          renderer = chart.renderer,
          options = legend.options,
          horizontal = options.layout === 'horizontal',
          symbolWidth = legend.symbolWidth,
          symbolPadding = options.symbolPadding,
          itemStyle = legend.itemStyle,
          itemHiddenStyle = legend.itemHiddenStyle,
          padding = legend.padding,
          itemDistance = horizontal ? pick(options.itemDistance, 20) : 0,
          ltr = !options.rtl,
          itemHeight,
          widthOption = options.width,
          itemMarginBottom = options.itemMarginBottom || 0,
          itemMarginTop = legend.itemMarginTop,
          initialItemX = legend.initialItemX,
          bBox,
          itemWidth,
          li = item.legendItem,
          isSeries = !item.series,
          series = !isSeries && item.series.drawLegendSymbol ? item.series : item,
          seriesOptions = series.options,
          showCheckbox = legend.createCheckboxForItem && seriesOptions && seriesOptions.showCheckbox,
          useHTML = options.useHTML,
          fontSize = 12;
        if (!li) {
          item.legendGroup = renderer.g('legend-item')
            .addClass('highcharts-' + series.type + '-series highcharts-color-' + item.colorIndex +
              (item.options.className ? ' ' + item.options.className : '') +
              (isSeries ? ' highcharts-series-' + item.index : '')
            )
            .attr({
              zIndex: 1
            })
            .add(legend.scrollGroup);
          item.legendItem = li = renderer.text(
              '',
              ltr ? symbolWidth + symbolPadding : -symbolPadding,
              legend.baseline || 0,
              useHTML
            )
            .css(merge(item.visible ? itemStyle : itemHiddenStyle))
            .attr({
              align: ltr ? 'left' : 'right',
              zIndex: 2
            })
            .add(item.legendGroup);
          if (!legend.baseline) {
            fontSize = itemStyle.fontSize;
            legend.fontMetrics = renderer.fontMetrics(
              fontSize,
              li
            );
            legend.baseline = legend.fontMetrics.f + 3 + itemMarginTop;
            li.attr('y', legend.baseline);
          }
          legend.symbolHeight = options.symbolHeight || legend.fontMetrics.f;
          series.drawLegendSymbol(legend, item);
          if (legend.setItemEvents) {
            legend.setItemEvents(item, li, useHTML);
          }
          if (showCheckbox) {
            legend.createCheckboxForItem(item);
          }
        }
        legend.colorizeItem(item, item.visible);
        legend.setText(item);
        bBox = li.getBBox();
        itemWidth = item.checkboxOffset =
          options.itemWidth ||
          item.legendItemWidth ||
          symbolWidth + symbolPadding + bBox.width + itemDistance + (showCheckbox ? 20 : 0);
        legend.itemHeight = itemHeight = Math.round(item.legendItemHeight || bBox.height);
        if (horizontal && legend.itemX - initialItemX + itemWidth >
          (widthOption || (chart.chartWidth - 2 * padding - initialItemX - options.x))) {
          legend.itemX = initialItemX;
          legend.itemY += itemMarginTop + legend.lastLineHeight + itemMarginBottom;
          legend.lastLineHeight = 0;
        }
        legend.maxItemWidth = Math.max(legend.maxItemWidth, itemWidth);
        legend.lastItemY = itemMarginTop + legend.itemY + itemMarginBottom;
        legend.lastLineHeight = Math.max(itemHeight, legend.lastLineHeight);
        item._legendItemPos = [legend.itemX, legend.itemY];
        if (horizontal) {
          legend.itemX += itemWidth;
        } else {
          legend.itemY += itemMarginTop + itemHeight + itemMarginBottom;
          legend.lastLineHeight = itemHeight;
        }
        legend.offsetWidth = widthOption || Math.max(
          (horizontal ? legend.itemX - initialItemX - itemDistance : itemWidth) + padding,
          legend.offsetWidth
        );
      },
      getAllItems: function() {
        var allItems = [];
        each(this.chart.series, function(series) {
          var seriesOptions = series && series.options;
          if (series && pick(seriesOptions.showInLegend, !defined(seriesOptions.linkedTo) ? undefined : false, true)) {
            allItems = allItems.concat(
              series.legendItems ||
              (seriesOptions.legendType === 'point' ?
                series.data :
                series)
            );
          }
        });
        return allItems;
      },
      adjustMargins: function(margin, spacing) {
        var chart = this.chart,
          options = this.options,
          alignment = options.align.charAt(0) + options.verticalAlign.charAt(0) + options.layout.charAt(0);
        if (!options.floating) {
          each([
            /(lth|ct|rth)/,
            /(rtv|rm|rbv)/,
            /(rbh|cb|lbh)/,
            /(lbv|lm|ltv)/
          ], function(alignments, side) {
            if (alignments.test(alignment) && !defined(margin[side])) {
              chart[marginNames[side]] = Math.max(
                chart[marginNames[side]],
                chart.legend[(side + 1) % 2 ? 'legendHeight' : 'legendWidth'] + [1, -1, -1, 1][side] * options[(side % 2) ? 'x' : 'y'] +
                pick(options.margin, 12) +
                spacing[side]
              );
            }
          });
        }
      },
      render: function() {
        var legend = this,
          chart = legend.chart,
          renderer = chart.renderer,
          legendGroup = legend.group,
          allItems,
          display,
          legendWidth,
          legendHeight,
          box = legend.box,
          options = legend.options,
          padding = legend.padding;
        legend.itemX = legend.initialItemX;
        legend.itemY = legend.initialItemY;
        legend.offsetWidth = 0;
        legend.lastItemY = 0;
        if (!legendGroup) {
          legend.group = legendGroup = renderer.g('legend')
            .attr({
              zIndex: 7
            })
            .add();
          legend.contentGroup = renderer.g()
            .attr({
              zIndex: 1
            })
            .add(legendGroup);
          legend.scrollGroup = renderer.g()
            .add(legend.contentGroup);
        }
        legend.renderTitle();
        allItems = legend.getAllItems();
        stableSort(allItems, function(a, b) {
          return ((a.options && a.options.legendIndex) || 0) - ((b.options && b.options.legendIndex) || 0);
        });
        if (options.reversed) {
          allItems.reverse();
        }
        legend.allItems = allItems;
        legend.display = display = !!allItems.length;
        legend.lastLineHeight = 0;
        each(allItems, function(item) {
          legend.renderItem(item);
        });
        legendWidth = (options.width || legend.offsetWidth) + padding;
        legendHeight = legend.lastItemY + legend.lastLineHeight + legend.titleHeight;
        legendHeight = legend.handleOverflow(legendHeight);
        legendHeight += padding;
        if (!box) {
          legend.box = box = renderer.rect()
            .addClass('highcharts-legend-box')
            .attr({
              r: options.borderRadius
            })
            .add(legendGroup);
          box.isNew = true;
        }
        box
          .attr({
            stroke: options.borderColor,
            'stroke-width': options.borderWidth || 0,
            fill: options.backgroundColor || 'none'
          })
          .shadow(options.shadow);
        if (legendWidth > 0 && legendHeight > 0) {
          box[box.isNew ? 'attr' : 'animate'](
            box.crisp({
              x: 0,
              y: 0,
              width: legendWidth,
              height: legendHeight
            }, box.strokeWidth())
          );
          box.isNew = false;
        }
        box[display ? 'show' : 'hide']();
        legend.legendWidth = legendWidth;
        legend.legendHeight = legendHeight;
        each(allItems, function(item) {
          legend.positionItem(item);
        });
        if (display) {
          legendGroup.align(extend({
            width: legendWidth,
            height: legendHeight
          }, options), true, 'spacingBox');
        }
        if (!chart.isResizing) {
          this.positionCheckboxes();
        }
      },
      handleOverflow: function(legendHeight) {
        var legend = this,
          chart = this.chart,
          renderer = chart.renderer,
          options = this.options,
          optionsY = options.y,
          alignTop = options.verticalAlign === 'top',
          spaceHeight = chart.spacingBox.height + (alignTop ? -optionsY : optionsY) - this.padding,
          maxHeight = options.maxHeight,
          clipHeight,
          clipRect = this.clipRect,
          navOptions = options.navigation,
          animation = pick(navOptions.animation, true),
          arrowSize = navOptions.arrowSize || 12,
          nav = this.nav,
          pages = this.pages,
          padding = this.padding,
          lastY,
          allItems = this.allItems,
          clipToHeight = function(height) {
            if (height) {
              clipRect.attr({
                height: height
              });
            } else if (clipRect) {
              legend.clipRect = clipRect.destroy();
              legend.contentGroup.clip();
            }
            if (legend.contentGroup.div) {
              legend.contentGroup.div.style.clip = height ?
                'rect(' + padding + 'px,9999px,' +
                (padding + height) + 'px,0)' :
                'auto';
            }
          };
        if (options.layout === 'horizontal' && options.verticalAlign !== 'middle' && !options.floating) {
          spaceHeight /= 2;
        }
        if (maxHeight) {
          spaceHeight = Math.min(spaceHeight, maxHeight);
        }
        pages.length = 0;
        if (legendHeight > spaceHeight && navOptions.enabled !== false) {
          this.clipHeight = clipHeight = Math.max(spaceHeight - 20 - this.titleHeight - padding, 0);
          this.currentPage = pick(this.currentPage, 1);
          this.fullHeight = legendHeight;
          each(allItems, function(item, i) {
            var y = item._legendItemPos[1],
              h = Math.round(item.legendItem.getBBox().height),
              len = pages.length;
            if (!len || (y - pages[len - 1] > clipHeight && (lastY || y) !== pages[len - 1])) {
              pages.push(lastY || y);
              len++;
            }
            if (i === allItems.length - 1 && y + h - pages[len - 1] > clipHeight) {
              pages.push(y);
            }
            if (y !== lastY) {
              lastY = y;
            }
          });
          if (!clipRect) {
            clipRect = legend.clipRect = renderer.clipRect(0, padding, 9999, 0);
            legend.contentGroup.clip(clipRect);
          }
          clipToHeight(clipHeight);
          if (!nav) {
            this.nav = nav = renderer.g().attr({
              zIndex: 1
            }).add(this.group);
            this.up = renderer.symbol('triangle', 0, 0, arrowSize, arrowSize)
              .on('click', function() {
                legend.scroll(-1, animation);
              })
              .add(nav);
            this.pager = renderer.text('', 15, 10)
              .addClass('highcharts-legend-navigation')
              .css(navOptions.style)
              .add(nav);
            this.down = renderer.symbol('triangle-down', 0, 0, arrowSize, arrowSize)
              .on('click', function() {
                legend.scroll(1, animation);
              })
              .add(nav);
          }
          legend.scroll(0);
          legendHeight = spaceHeight;
        } else if (nav) {
          clipToHeight();
          nav.hide();
          this.scrollGroup.attr({
            translateY: 1
          });
          this.clipHeight = 0;
        }
        return legendHeight;
      },
      scroll: function(scrollBy, animation) {
        var pages = this.pages,
          pageCount = pages.length,
          currentPage = this.currentPage + scrollBy,
          clipHeight = this.clipHeight,
          navOptions = this.options.navigation,
          pager = this.pager,
          padding = this.padding,
          scrollOffset;
        if (currentPage > pageCount) {
          currentPage = pageCount;
        }
        if (currentPage > 0) {
          if (animation !== undefined) {
            setAnimation(animation, this.chart);
          }
          this.nav.attr({
            translateX: padding,
            translateY: clipHeight + this.padding + 7 + this.titleHeight,
            visibility: 'visible'
          });
          this.up.attr({
            'class': currentPage === 1 ? 'highcharts-legend-nav-inactive' : 'highcharts-legend-nav-active'
          });
          pager.attr({
            text: currentPage + '/' + pageCount
          });
          this.down.attr({
            'x': 18 + this.pager.getBBox().width,
            'class': currentPage === pageCount ? 'highcharts-legend-nav-inactive' : 'highcharts-legend-nav-active'
          });
          this.up
            .attr({
              fill: currentPage === 1 ? navOptions.inactiveColor : navOptions.activeColor
            })
            .css({
              cursor: currentPage === 1 ? 'default' : 'pointer'
            });
          this.down
            .attr({
              fill: currentPage === pageCount ? navOptions.inactiveColor : navOptions.activeColor
            })
            .css({
              cursor: currentPage === pageCount ? 'default' : 'pointer'
            });
          scrollOffset = -pages[currentPage - 1] + this.initialItemY;
          this.scrollGroup.animate({
            translateY: scrollOffset
          });
          this.currentPage = currentPage;
          this.positionCheckboxes(scrollOffset);
        }
      }
    };
    H.LegendSymbolMixin = {
      drawRectangle: function(legend, item) {
        var options = legend.options,
          symbolHeight = legend.symbolHeight,
          square = options.squareSymbol,
          symbolWidth = square ? symbolHeight : legend.symbolWidth;
        item.legendSymbol = this.chart.renderer.rect(
            square ? (legend.symbolWidth - symbolHeight) / 2 : 0,
            legend.baseline - symbolHeight + 1,
            symbolWidth,
            symbolHeight,
            pick(legend.options.symbolRadius, symbolHeight / 2)
          )
          .addClass('highcharts-point')
          .attr({
            zIndex: 3
          }).add(item.legendGroup);
      },
      drawLineMarker: function(legend) {
        var options = this.options,
          markerOptions = options.marker,
          radius,
          legendSymbol,
          symbolWidth = legend.symbolWidth,
          symbolHeight = legend.symbolHeight,
          generalRadius = symbolHeight / 2,
          renderer = this.chart.renderer,
          legendItemGroup = this.legendGroup,
          verticalCenter = legend.baseline - Math.round(legend.fontMetrics.b * 0.3),
          attr = {};
        attr = {
          'stroke-width': options.lineWidth || 0
        };
        if (options.dashStyle) {
          attr.dashstyle = options.dashStyle;
        }
        this.legendLine = renderer.path([
            'M',
            0,
            verticalCenter,
            'L',
            symbolWidth,
            verticalCenter
          ])
          .addClass('highcharts-graph')
          .attr(attr)
          .add(legendItemGroup);
        if (markerOptions && markerOptions.enabled !== false) {
          radius = Math.min(
            pick(markerOptions.radius, generalRadius),
            generalRadius
          );
          if (this.symbol.indexOf('url') === 0) {
            markerOptions = merge(markerOptions, {
              width: symbolHeight,
              height: symbolHeight
            });
            radius = 0;
          }
          this.legendSymbol = legendSymbol = renderer.symbol(
              this.symbol,
              (symbolWidth / 2) - radius,
              verticalCenter - radius,
              2 * radius,
              2 * radius,
              markerOptions
            )
            .addClass('highcharts-point')
            .add(legendItemGroup);
          legendSymbol.isMarker = true;
        }
      }
    };
    if (/Trident\/7\.0/.test(win.navigator.userAgent) || isFirefox) {
      wrap(Legend.prototype, 'positionItem', function(proceed, item) {
        var legend = this,
          runPositionItem = function() {
            if (item._legendItemPos) {
              proceed.call(legend, item);
            }
          };
        runPositionItem();
        setTimeout(runPositionItem);
      });
    }
  }(Highcharts));
  (function(H) {
    'use strict';
    var addEvent = H.addEvent,
      animate = H.animate,
      animObject = H.animObject,
      attr = H.attr,
      doc = H.doc,
      Axis = H.Axis,
      createElement = H.createElement,
      defaultOptions = H.defaultOptions,
      discardElement = H.discardElement,
      charts = H.charts,
      css = H.css,
      defined = H.defined,
      each = H.each,
      extend = H.extend,
      find = H.find,
      fireEvent = H.fireEvent,
      getStyle = H.getStyle,
      grep = H.grep,
      isNumber = H.isNumber,
      isObject = H.isObject,
      isString = H.isString,
      Legend = H.Legend,
      marginNames = H.marginNames,
      merge = H.merge,
      Pointer = H.Pointer,
      pick = H.pick,
      pInt = H.pInt,
      removeEvent = H.removeEvent,
      seriesTypes = H.seriesTypes,
      splat = H.splat,
      svg = H.svg,
      syncTimeout = H.syncTimeout,
      win = H.win,
      Renderer = H.Renderer;
    var Chart = H.Chart = function() {
      this.getArgs.apply(this, arguments);
    };
    H.chart = function(a, b, c) {
      return new Chart(a, b, c);
    };
    Chart.prototype = {
      callbacks: [],
      getArgs: function() {
        var args = [].slice.call(arguments);
        if (isString(args[0]) || args[0].nodeName) {
          this.renderTo = args.shift();
        }
        this.init(args[0], args[1]);
      },
      init: function(userOptions, callback) {
        var options,
          seriesOptions = userOptions.series;
        userOptions.series = null;
        options = merge(defaultOptions, userOptions);
        options.series = userOptions.series = seriesOptions;
        this.userOptions = userOptions;
        this.respRules = [];
        var optionsChart = options.chart;
        var chartEvents = optionsChart.events;
        this.margin = [];
        this.spacing = [];
        this.bounds = {
          h: {},
          v: {}
        };
        this.callback = callback;
        this.isResizing = 0;
        this.options = options;
        this.axes = [];
        this.series = [];
        this.hasCartesianSeries = optionsChart.showAxes;
        var chart = this,
          eventType;
        chart.index = charts.length;
        charts.push(chart);
        H.chartCount++;
        if (chartEvents) {
          for (eventType in chartEvents) {
            addEvent(chart, eventType, chartEvents[eventType]);
          }
        }
        chart.xAxis = [];
        chart.yAxis = [];
        chart.pointCount = chart.colorCounter = chart.symbolCounter = 0;
        chart.firstRender();
      },
      initSeries: function(options) {
        var chart = this,
          optionsChart = chart.options.chart,
          type = options.type || optionsChart.type || optionsChart.defaultSeriesType,
          series,
          Constr = seriesTypes[type];
        if (!Constr) {
          H.error(17, true);
        }
        series = new Constr();
        series.init(this, options);
        return series;
      },
      orderSeries: function(fromIndex) {
        var series = this.series,
          i = fromIndex || 0;
        for (; i < series.length; i++) {
          if (series[i]) {
            series[i].index = i;
            series[i].name = series[i].name ||
              'Series ' + (series[i].index + 1);
          }
        }
      },
      isInsidePlot: function(plotX, plotY, inverted) {
        var x = inverted ? plotY : plotX,
          y = inverted ? plotX : plotY;
        return x >= 0 &&
          x <= this.plotWidth &&
          y >= 0 &&
          y <= this.plotHeight;
      },
      redraw: function(animation) {
        var chart = this,
          axes = chart.axes,
          series = chart.series,
          pointer = chart.pointer,
          legend = chart.legend,
          redrawLegend = chart.isDirtyLegend,
          hasStackedSeries,
          hasDirtyStacks,
          hasCartesianSeries = chart.hasCartesianSeries,
          isDirtyBox = chart.isDirtyBox,
          seriesLength = series.length,
          i = seriesLength,
          serie,
          renderer = chart.renderer,
          isHiddenChart = renderer.isHidden(),
          afterRedraw = [];
        if (chart.setResponsive) {
          chart.setResponsive(false);
        }
        H.setAnimation(animation, chart);
        if (isHiddenChart) {
          chart.cloneRenderTo();
        }
        chart.layOutTitles();
        while (i--) {
          serie = series[i];
          if (serie.options.stacking) {
            hasStackedSeries = true;
            if (serie.isDirty) {
              hasDirtyStacks = true;
              break;
            }
          }
        }
        if (hasDirtyStacks) {
          i = seriesLength;
          while (i--) {
            serie = series[i];
            if (serie.options.stacking) {
              serie.isDirty = true;
            }
          }
        }
        each(series, function(serie) {
          if (serie.isDirty) {
            if (serie.options.legendType === 'point') {
              if (serie.updateTotals) {
                serie.updateTotals();
              }
              redrawLegend = true;
            }
          }
          if (serie.isDirtyData) {
            fireEvent(serie, 'updatedData');
          }
        });
        if (redrawLegend && legend.options.enabled) {
          legend.render();
          chart.isDirtyLegend = false;
        }
        if (hasStackedSeries) {
          chart.getStacks();
        }
        if (hasCartesianSeries) {
          each(axes, function(axis) {
            axis.updateNames();
            axis.setScale();
          });
        }
        chart.getMargins();
        if (hasCartesianSeries) {
          each(axes, function(axis) {
            if (axis.isDirty) {
              isDirtyBox = true;
            }
          });
          each(axes, function(axis) {
            var key = axis.min + ',' + axis.max;
            if (axis.extKey !== key) {
              axis.extKey = key;
              afterRedraw.push(function() {
                fireEvent(axis, 'afterSetExtremes', extend(axis.eventArgs, axis.getExtremes()));
                delete axis.eventArgs;
              });
            }
            if (isDirtyBox || hasStackedSeries) {
              axis.redraw();
            }
          });
        }
        if (isDirtyBox) {
          chart.drawChartBox();
        }
        fireEvent(chart, 'predraw');
        each(series, function(serie) {
          if ((isDirtyBox || serie.isDirty) && serie.visible) {
            serie.redraw();
          }
          serie.isDirtyData = false;
        });
        if (pointer) {
          pointer.reset(true);
        }
        renderer.draw();
        fireEvent(chart, 'redraw');
        fireEvent(chart, 'render');
        if (isHiddenChart) {
          chart.cloneRenderTo(true);
        }
        each(afterRedraw, function(callback) {
          callback.call();
        });
      },
      get: function(id) {
        var ret,
          series = this.series,
          i;

        function itemById(item) {
          return item.id === id || (item.options && item.options.id === id);
        }
        ret =
          find(this.axes, itemById) ||
          find(this.series, itemById);
        for (i = 0; !ret && i < series.length; i++) {
          ret = find(series[i].points || [], itemById);
        }
        return ret;
      },
      getAxes: function() {
        var chart = this,
          options = this.options,
          xAxisOptions = options.xAxis = splat(options.xAxis || {}),
          yAxisOptions = options.yAxis = splat(options.yAxis || {}),
          optionsArray;
        each(xAxisOptions, function(axis, i) {
          axis.index = i;
          axis.isX = true;
        });
        each(yAxisOptions, function(axis, i) {
          axis.index = i;
        });
        optionsArray = xAxisOptions.concat(yAxisOptions);
        each(optionsArray, function(axisOptions) {
          new Axis(chart, axisOptions);
        });
      },
      getSelectedPoints: function() {
        var points = [];
        each(this.series, function(serie) {
          points = points.concat(grep(serie.points || [], function(point) {
            return point.selected;
          }));
        });
        return points;
      },
      getSelectedSeries: function() {
        return grep(this.series, function(serie) {
          return serie.selected;
        });
      },
      setTitle: function(titleOptions, subtitleOptions, redraw) {
        var chart = this,
          options = chart.options,
          chartTitleOptions,
          chartSubtitleOptions;
        chartTitleOptions = options.title = merge({
            style: {
              color: '#333333',
              fontSize: options.isStock ? '16px' : '18px'
            }
          },
          options.title,
          titleOptions
        );
        chartSubtitleOptions = options.subtitle = merge({
            style: {
              color: '#666666'
            }
          },
          options.subtitle,
          subtitleOptions
        );
        each([
          ['title', titleOptions, chartTitleOptions],
          ['subtitle', subtitleOptions, chartSubtitleOptions]
        ], function(arr, i) {
          var name = arr[0],
            title = chart[name],
            titleOptions = arr[1],
            chartTitleOptions = arr[2];
          if (title && titleOptions) {
            chart[name] = title = title.destroy();
          }
          if (chartTitleOptions && chartTitleOptions.text && !title) {
            chart[name] = chart.renderer.text(
                chartTitleOptions.text,
                0,
                0,
                chartTitleOptions.useHTML
              )
              .attr({
                align: chartTitleOptions.align,
                'class': 'highcharts-' + name,
                zIndex: chartTitleOptions.zIndex || 4
              })
              .add();
            chart[name].update = function(o) {
              chart.setTitle(!i && o, i && o);
            };
            chart[name].css(chartTitleOptions.style);
          }
        });
        chart.layOutTitles(redraw);
      },
      layOutTitles: function(redraw) {
        var titleOffset = 0,
          requiresDirtyBox,
          renderer = this.renderer,
          spacingBox = this.spacingBox;
        each(['title', 'subtitle'], function(key) {
          var title = this[key],
            titleOptions = this.options[key],
            titleSize;
          if (title) {
            titleSize = titleOptions.style.fontSize;
            titleSize = renderer.fontMetrics(titleSize, title).b;
            title
              .css({
                width: (titleOptions.width || spacingBox.width + titleOptions.widthAdjust) + 'px'
              })
              .align(extend({
                y: titleOffset + titleSize + (key === 'title' ? -3 : 2)
              }, titleOptions), false, 'spacingBox');
            if (!titleOptions.floating && !titleOptions.verticalAlign) {
              titleOffset = Math.ceil(titleOffset + title.getBBox().height);
            }
          }
        }, this);
        requiresDirtyBox = this.titleOffset !== titleOffset;
        this.titleOffset = titleOffset;
        if (!this.isDirtyBox && requiresDirtyBox) {
          this.isDirtyBox = requiresDirtyBox;
          if (this.hasRendered && pick(redraw, true) && this.isDirtyBox) {
            this.redraw();
          }
        }
      },
      getChartSize: function() {
        var chart = this,
          optionsChart = chart.options.chart,
          widthOption = optionsChart.width,
          heightOption = optionsChart.height,
          renderTo = chart.renderToClone || chart.renderTo;
        if (!defined(widthOption)) {
          chart.containerWidth = getStyle(renderTo, 'width');
        }
        if (!defined(heightOption)) {
          chart.containerHeight = getStyle(renderTo, 'height');
        }
        chart.chartWidth = Math.max(
          0,
          widthOption || chart.containerWidth || 600
        );
        chart.chartHeight = Math.max(
          0,
          heightOption || chart.containerHeight || 400
        );
      },
      cloneRenderTo: function(revert) {
        var clone = this.renderToClone,
          container = this.container;
        if (revert) {
          if (clone) {
            while (clone.childNodes.length) {
              this.renderTo.appendChild(clone.firstChild);
            }
            discardElement(clone);
            delete this.renderToClone;
          }
        } else {
          if (container && container.parentNode === this.renderTo) {
            this.renderTo.removeChild(container);
          }
          this.renderToClone = clone = this.renderTo.cloneNode(0);
          css(clone, {
            position: 'absolute',
            top: '-9999px',
            display: 'block'
          });
          if (clone.style.setProperty) {
            clone.style.setProperty('display', 'block', 'important');
          }
          doc.body.appendChild(clone);
          if (container) {
            clone.appendChild(container);
          }
        }
      },
      setClassName: function(className) {
        this.container.className = 'highcharts-container ' + (className || '');
      },
      getContainer: function() {
        var chart = this,
          container,
          options = chart.options,
          optionsChart = options.chart,
          chartWidth,
          chartHeight,
          renderTo = chart.renderTo,
          indexAttrName = 'data-highcharts-chart',
          oldChartIndex,
          Ren,
          containerId = H.uniqueKey(),
          containerStyle,
          key;
        if (!renderTo) {
          chart.renderTo = renderTo = optionsChart.renderTo;
        }
        if (isString(renderTo)) {
          chart.renderTo = renderTo = doc.getElementById(renderTo);
        }
        if (!renderTo) {
          H.error(13, true);
        }
        oldChartIndex = pInt(attr(renderTo, indexAttrName));
        if (isNumber(oldChartIndex) && charts[oldChartIndex] && charts[oldChartIndex].hasRendered) {
          charts[oldChartIndex].destroy();
        }
        attr(renderTo, indexAttrName, chart.index);
        renderTo.innerHTML = '';
        if (!optionsChart.skipClone && !renderTo.offsetWidth) {
          chart.cloneRenderTo();
        }
        chart.getChartSize();
        chartWidth = chart.chartWidth;
        chartHeight = chart.chartHeight;
        containerStyle = extend({
          position: 'relative',
          overflow: 'hidden',
          width: chartWidth + 'px',
          height: chartHeight + 'px',
          textAlign: 'left',
          lineHeight: 'normal',
          zIndex: 0,
          '-webkit-tap-highlight-color': 'rgba(0,0,0,0)'
        }, optionsChart.style);
        chart.container = container = createElement(
          'div', {
            id: containerId
          },
          containerStyle,
          chart.renderToClone || renderTo
        );
        chart._cursor = container.style.cursor;
        Ren = H[optionsChart.renderer] || Renderer;
        chart.renderer = new Ren(
          container,
          chartWidth,
          chartHeight,
          null,
          optionsChart.forExport,
          options.exporting && options.exporting.allowHTML
        );
        chart.setClassName(optionsChart.className);
        chart.renderer.setStyle(optionsChart.style);
        chart.renderer.chartIndex = chart.index;
      },
      getMargins: function(skipAxes) {
        var chart = this,
          spacing = chart.spacing,
          margin = chart.margin,
          titleOffset = chart.titleOffset;
        chart.resetMargins();
        if (titleOffset && !defined(margin[0])) {
          chart.plotTop = Math.max(chart.plotTop, titleOffset + chart.options.title.margin + spacing[0]);
        }
        if (chart.legend && chart.legend.display) {
          chart.legend.adjustMargins(margin, spacing);
        }
        if (chart.extraMargin) {
          chart[chart.extraMargin.type] = (chart[chart.extraMargin.type] || 0) + chart.extraMargin.value;
        }
        if (chart.extraTopMargin) {
          chart.plotTop += chart.extraTopMargin;
        }
        if (!skipAxes) {
          this.getAxisMargins();
        }
      },
      getAxisMargins: function() {
        var chart = this,
          axisOffset = chart.axisOffset = [0, 0, 0, 0],
          margin = chart.margin;
        if (chart.hasCartesianSeries) {
          each(chart.axes, function(axis) {
            if (axis.visible) {
              axis.getOffset();
            }
          });
        }
        each(marginNames, function(m, side) {
          if (!defined(margin[side])) {
            chart[m] += axisOffset[side];
          }
        });
        chart.setChartSize();
      },
      reflow: function(e) {
        var chart = this,
          optionsChart = chart.options.chart,
          renderTo = chart.renderTo,
          hasUserWidth = defined(optionsChart.width),
          width = optionsChart.width || getStyle(renderTo, 'width'),
          height = optionsChart.height || getStyle(renderTo, 'height'),
          target = e ? e.target : win;
        if (!hasUserWidth && !chart.isPrinting && width && height && (target === win || target === doc)) {
          if (width !== chart.containerWidth || height !== chart.containerHeight) {
            clearTimeout(chart.reflowTimeout);
            chart.reflowTimeout = syncTimeout(function() {
              if (chart.container) {
                chart.setSize(undefined, undefined, false);
              }
            }, e ? 100 : 0);
          }
          chart.containerWidth = width;
          chart.containerHeight = height;
        }
      },
      initReflow: function() {
        var chart = this,
          unbind;
        unbind = addEvent(win, 'resize', function(e) {
          chart.reflow(e);
        });
        addEvent(chart, 'destroy', unbind);
      },
      setSize: function(width, height, animation) {
        var chart = this,
          renderer = chart.renderer,
          globalAnimation;
        chart.isResizing += 1;
        H.setAnimation(animation, chart);
        chart.oldChartHeight = chart.chartHeight;
        chart.oldChartWidth = chart.chartWidth;
        if (width !== undefined) {
          chart.options.chart.width = width;
        }
        if (height !== undefined) {
          chart.options.chart.height = height;
        }
        chart.getChartSize();
        globalAnimation = renderer.globalAnimation;
        (globalAnimation ? animate : css)(chart.container, {
          width: chart.chartWidth + 'px',
          height: chart.chartHeight + 'px'
        }, globalAnimation);
        chart.setChartSize(true);
        renderer.setSize(chart.chartWidth, chart.chartHeight, animation);
        each(chart.axes, function(axis) {
          axis.isDirty = true;
          axis.setScale();
        });
        chart.isDirtyLegend = true;
        chart.isDirtyBox = true;
        chart.layOutTitles();
        chart.getMargins();
        chart.redraw(animation);
        chart.oldChartHeight = null;
        fireEvent(chart, 'resize');
        syncTimeout(function() {
          if (chart) {
            fireEvent(chart, 'endResize', null, function() {
              chart.isResizing -= 1;
            });
          }
        }, animObject(globalAnimation).duration);
      },
      setChartSize: function(skipAxes) {
        var chart = this,
          inverted = chart.inverted,
          renderer = chart.renderer,
          chartWidth = chart.chartWidth,
          chartHeight = chart.chartHeight,
          optionsChart = chart.options.chart,
          spacing = chart.spacing,
          clipOffset = chart.clipOffset,
          clipX,
          clipY,
          plotLeft,
          plotTop,
          plotWidth,
          plotHeight,
          plotBorderWidth;
        chart.plotLeft = plotLeft = Math.round(chart.plotLeft);
        chart.plotTop = plotTop = Math.round(chart.plotTop);
        chart.plotWidth = plotWidth = Math.max(0, Math.round(chartWidth - plotLeft - chart.marginRight));
        chart.plotHeight = plotHeight = Math.max(0, Math.round(chartHeight - plotTop - chart.marginBottom));
        chart.plotSizeX = inverted ? plotHeight : plotWidth;
        chart.plotSizeY = inverted ? plotWidth : plotHeight;
        chart.plotBorderWidth = optionsChart.plotBorderWidth || 0;
        chart.spacingBox = renderer.spacingBox = {
          x: spacing[3],
          y: spacing[0],
          width: chartWidth - spacing[3] - spacing[1],
          height: chartHeight - spacing[0] - spacing[2]
        };
        chart.plotBox = renderer.plotBox = {
          x: plotLeft,
          y: plotTop,
          width: plotWidth,
          height: plotHeight
        };
        plotBorderWidth = 2 * Math.floor(chart.plotBorderWidth / 2);
        clipX = Math.ceil(Math.max(plotBorderWidth, clipOffset[3]) / 2);
        clipY = Math.ceil(Math.max(plotBorderWidth, clipOffset[0]) / 2);
        chart.clipBox = {
          x: clipX,
          y: clipY,
          width: Math.floor(chart.plotSizeX - Math.max(plotBorderWidth, clipOffset[1]) / 2 - clipX),
          height: Math.max(0, Math.floor(chart.plotSizeY - Math.max(plotBorderWidth, clipOffset[2]) / 2 - clipY))
        };
        if (!skipAxes) {
          each(chart.axes, function(axis) {
            axis.setAxisSize();
            axis.setAxisTranslation();
          });
        }
      },
      resetMargins: function() {
        var chart = this,
          chartOptions = chart.options.chart;
        each(['margin', 'spacing'], function splashArrays(target) {
          var value = chartOptions[target],
            values = isObject(value) ? value : [value, value, value, value];
          each(['Top', 'Right', 'Bottom', 'Left'], function(sideName, side) {
            chart[target][side] = pick(chartOptions[target + sideName], values[side]);
          });
        });
        each(marginNames, function(m, side) {
          chart[m] = pick(chart.margin[side], chart.spacing[side]);
        });
        chart.axisOffset = [0, 0, 0, 0];
        chart.clipOffset = [0, 0, 0, 0];
      },
      drawChartBox: function() {
        var chart = this,
          optionsChart = chart.options.chart,
          renderer = chart.renderer,
          chartWidth = chart.chartWidth,
          chartHeight = chart.chartHeight,
          chartBackground = chart.chartBackground,
          plotBackground = chart.plotBackground,
          plotBorder = chart.plotBorder,
          chartBorderWidth,
          plotBGImage = chart.plotBGImage,
          chartBackgroundColor = optionsChart.backgroundColor,
          plotBackgroundColor = optionsChart.plotBackgroundColor,
          plotBackgroundImage = optionsChart.plotBackgroundImage,
          mgn,
          bgAttr,
          plotLeft = chart.plotLeft,
          plotTop = chart.plotTop,
          plotWidth = chart.plotWidth,
          plotHeight = chart.plotHeight,
          plotBox = chart.plotBox,
          clipRect = chart.clipRect,
          clipBox = chart.clipBox,
          verb = 'animate';
        if (!chartBackground) {
          chart.chartBackground = chartBackground = renderer.rect()
            .addClass('highcharts-background')
            .add();
          verb = 'attr';
        }
        chartBorderWidth = optionsChart.borderWidth || 0;
        mgn = chartBorderWidth + (optionsChart.shadow ? 8 : 0);
        bgAttr = {
          fill: chartBackgroundColor || 'none'
        };
        if (chartBorderWidth || chartBackground['stroke-width']) {
          bgAttr.stroke = optionsChart.borderColor;
          bgAttr['stroke-width'] = chartBorderWidth;
        }
        chartBackground
          .attr(bgAttr)
          .shadow(optionsChart.shadow);
        chartBackground[verb]({
          x: mgn / 2,
          y: mgn / 2,
          width: chartWidth - mgn - chartBorderWidth % 2,
          height: chartHeight - mgn - chartBorderWidth % 2,
          r: optionsChart.borderRadius
        });
        verb = 'animate';
        if (!plotBackground) {
          verb = 'attr';
          chart.plotBackground = plotBackground = renderer.rect()
            .addClass('highcharts-plot-background')
            .add();
        }
        plotBackground[verb](plotBox);
        plotBackground
          .attr({
            fill: plotBackgroundColor || 'none'
          })
          .shadow(optionsChart.plotShadow);
        if (plotBackgroundImage) {
          if (!plotBGImage) {
            chart.plotBGImage = renderer.image(plotBackgroundImage, plotLeft, plotTop, plotWidth, plotHeight)
              .add();
          } else {
            plotBGImage.animate(plotBox);
          }
        }
        if (!clipRect) {
          chart.clipRect = renderer.clipRect(clipBox);
        } else {
          clipRect.animate({
            width: clipBox.width,
            height: clipBox.height
          });
        }
        verb = 'animate';
        if (!plotBorder) {
          verb = 'attr';
          chart.plotBorder = plotBorder = renderer.rect()
            .addClass('highcharts-plot-border')
            .attr({
              zIndex: 1
            })
            .add();
        }
        plotBorder.attr({
          stroke: optionsChart.plotBorderColor,
          'stroke-width': optionsChart.plotBorderWidth || 0,
          fill: 'none'
        });
        plotBorder[verb](plotBorder.crisp({
          x: plotLeft,
          y: plotTop,
          width: plotWidth,
          height: plotHeight
        }, -plotBorder.strokeWidth()));
        chart.isDirtyBox = false;
      },
      propFromSeries: function() {
        var chart = this,
          optionsChart = chart.options.chart,
          klass,
          seriesOptions = chart.options.series,
          i,
          value;
        each(['inverted', 'angular', 'polar'], function(key) {
          klass = seriesTypes[optionsChart.type || optionsChart.defaultSeriesType];
          value =
            optionsChart[key] ||
            (klass && klass.prototype[key]);
          i = seriesOptions && seriesOptions.length;
          while (!value && i--) {
            klass = seriesTypes[seriesOptions[i].type];
            if (klass && klass.prototype[key]) {
              value = true;
            }
          }
          chart[key] = value;
        });
      },
      linkSeries: function() {
        var chart = this,
          chartSeries = chart.series;
        each(chartSeries, function(series) {
          series.linkedSeries.length = 0;
        });
        each(chartSeries, function(series) {
          var linkedTo = series.options.linkedTo;
          if (isString(linkedTo)) {
            if (linkedTo === ':previous') {
              linkedTo = chart.series[series.index - 1];
            } else {
              linkedTo = chart.get(linkedTo);
            }
            if (linkedTo && linkedTo.linkedParent !== series) {
              linkedTo.linkedSeries.push(series);
              series.linkedParent = linkedTo;
              series.visible = pick(series.options.visible, linkedTo.options.visible, series.visible);
            }
          }
        });
      },
      renderSeries: function() {
        each(this.series, function(serie) {
          serie.translate();
          serie.render();
        });
      },
      renderLabels: function() {
        var chart = this,
          labels = chart.options.labels;
        if (labels.items) {
          each(labels.items, function(label) {
            var style = extend(labels.style, label.style),
              x = pInt(style.left) + chart.plotLeft,
              y = pInt(style.top) + chart.plotTop + 12;
            delete style.left;
            delete style.top;
            chart.renderer.text(
                label.html,
                x,
                y
              )
              .attr({
                zIndex: 2
              })
              .css(style)
              .add();
          });
        }
      },
      render: function() {
        var chart = this,
          axes = chart.axes,
          renderer = chart.renderer,
          options = chart.options,
          tempWidth,
          tempHeight,
          redoHorizontal,
          redoVertical;
        chart.setTitle();
        chart.legend = new Legend(chart, options.legend);
        if (chart.getStacks) {
          chart.getStacks();
        }
        chart.getMargins(true);
        chart.setChartSize();
        tempWidth = chart.plotWidth;
        tempHeight = chart.plotHeight = chart.plotHeight - 21;
        each(axes, function(axis) {
          axis.setScale();
        });
        chart.getAxisMargins();
        redoHorizontal = tempWidth / chart.plotWidth > 1.1;
        redoVertical = tempHeight / chart.plotHeight > 1.05;
        if (redoHorizontal || redoVertical) {
          each(axes, function(axis) {
            if ((axis.horiz && redoHorizontal) || (!axis.horiz && redoVertical)) {
              axis.setTickInterval(true);
            }
          });
          chart.getMargins();
        }
        chart.drawChartBox();
        if (chart.hasCartesianSeries) {
          each(axes, function(axis) {
            if (axis.visible) {
              axis.render();
            }
          });
        }
        if (!chart.seriesGroup) {
          chart.seriesGroup = renderer.g('series-group')
            .attr({
              zIndex: 3
            })
            .add();
        }
        chart.renderSeries();
        chart.renderLabels();
        chart.addCredits();
        if (chart.setResponsive) {
          chart.setResponsive();
        }
        chart.hasRendered = true;
      },
      addCredits: function(credits) {
        var chart = this;
        credits = merge(true, this.options.credits, credits);
        if (credits.enabled && !this.credits) {
          this.credits = this.renderer.text(
              credits.text + (this.mapCredits || ''),
              0,
              0
            )
            .addClass('highcharts-credits')
            .on('click', function() {
              if (credits.href) {
                win.location.href = credits.href;
              }
            })
            .attr({
              align: credits.position.align,
              zIndex: 8
            })
            .css(credits.style)
            .add()
            .align(credits.position);
          this.credits.update = function(options) {
            chart.credits = chart.credits.destroy();
            chart.addCredits(options);
          };
        }
      },
      destroy: function() {
        var chart = this,
          axes = chart.axes,
          series = chart.series,
          container = chart.container,
          i,
          parentNode = container && container.parentNode;
        fireEvent(chart, 'destroy');
        charts[chart.index] = undefined;
        H.chartCount--;
        chart.renderTo.removeAttribute('data-highcharts-chart');
        removeEvent(chart);
        i = axes.length;
        while (i--) {
          axes[i] = axes[i].destroy();
        }
        if (this.scroller && this.scroller.destroy) {
          this.scroller.destroy();
        }
        i = series.length;
        while (i--) {
          series[i] = series[i].destroy();
        }
        each([
          'title', 'subtitle', 'chartBackground', 'plotBackground',
          'plotBGImage', 'plotBorder', 'seriesGroup', 'clipRect', 'credits',
          'pointer', 'rangeSelector', 'legend', 'resetZoomButton', 'tooltip',
          'renderer'
        ], function(name) {
          var prop = chart[name];
          if (prop && prop.destroy) {
            chart[name] = prop.destroy();
          }
        });
        if (container) {
          container.innerHTML = '';
          removeEvent(container);
          if (parentNode) {
            discardElement(container);
          }
        }
        for (i in chart) {
          delete chart[i];
        }
      },
      isReadyToRender: function() {
        var chart = this;
        if ((!svg && (win == win.top && doc.readyState !== 'complete'))) {
          doc.attachEvent('onreadystatechange', function() {
            doc.detachEvent('onreadystatechange', chart.firstRender);
            if (doc.readyState === 'complete') {
              chart.firstRender();
            }
          });
          return false;
        }
        return true;
      },
      firstRender: function() {
        var chart = this,
          options = chart.options;
        if (!chart.isReadyToRender()) {
          return;
        }
        chart.getContainer();
        fireEvent(chart, 'init');
        chart.resetMargins();
        chart.setChartSize();
        chart.propFromSeries();
        chart.getAxes();
        each(options.series || [], function(serieOptions) {
          chart.initSeries(serieOptions);
        });
        chart.linkSeries();
        fireEvent(chart, 'beforeRender');
        if (Pointer) {
          chart.pointer = new Pointer(chart, options);
        }
        chart.render();
        if (!chart.renderer.imgCount && chart.onload) {
          chart.onload();
        }
        chart.cloneRenderTo(true);
      },
      onload: function() {
        each([this.callback].concat(this.callbacks), function(fn) {
          if (fn && this.index !== undefined) {
            fn.apply(this, [this]);
          }
        }, this);
        fireEvent(this, 'load');
        fireEvent(this, 'render');
        if (defined(this.index) && this.options.chart.reflow !== false) {
          this.initReflow();
        }
        this.onload = null;
      }
    };
  }(Highcharts));
  (function(H) {
    'use strict';
    var Point,
      each = H.each,
      extend = H.extend,
      erase = H.erase,
      fireEvent = H.fireEvent,
      format = H.format,
      isArray = H.isArray,
      isNumber = H.isNumber,
      pick = H.pick,
      removeEvent = H.removeEvent;
    Point = H.Point = function() {};
    Point.prototype = {
      init: function(series, options, x) {
        var point = this,
          colors,
          colorCount = series.chart.options.chart.colorCount,
          colorIndex;
        point.series = series;
        point.color = series.color;
        point.applyOptions(options, x);
        if (series.options.colorByPoint) {
          colors = series.options.colors || series.chart.options.colors;
          point.color = point.color || colors[series.colorCounter];
          colorCount = colors.length;
          colorIndex = series.colorCounter;
          series.colorCounter++;
          if (series.colorCounter === colorCount) {
            series.colorCounter = 0;
          }
        } else {
          colorIndex = series.colorIndex;
        }
        point.colorIndex = pick(point.colorIndex, colorIndex);
        series.chart.pointCount++;
        return point;
      },
      applyOptions: function(options, x) {
        var point = this,
          series = point.series,
          pointValKey = series.options.pointValKey || series.pointValKey;
        options = Point.prototype.optionsToObject.call(this, options);
        extend(point, options);
        point.options = point.options ? extend(point.options, options) : options;
        if (options.group) {
          delete point.group;
        }
        if (pointValKey) {
          point.y = point[pointValKey];
        }
        point.isNull = pick(
          point.isValid && !point.isValid(),
          point.x === null || !isNumber(point.y, true)
        );
        if (point.selected) {
          point.state = 'select';
        }
        if ('name' in point && x === undefined && series.xAxis && series.xAxis.hasNames) {
          point.x = series.xAxis.nameToX(point);
        }
        if (point.x === undefined && series) {
          if (x === undefined) {
            point.x = series.autoIncrement(point);
          } else {
            point.x = x;
          }
        }
        return point;
      },
      optionsToObject: function(options) {
        var ret = {},
          series = this.series,
          keys = series.options.keys,
          pointArrayMap = keys || series.pointArrayMap || ['y'],
          valueCount = pointArrayMap.length,
          firstItemType,
          i = 0,
          j = 0;
        if (isNumber(options) || options === null) {
          ret[pointArrayMap[0]] = options;
        } else if (isArray(options)) {
          if (!keys && options.length > valueCount) {
            firstItemType = typeof options[0];
            if (firstItemType === 'string') {
              ret.name = options[0];
            } else if (firstItemType === 'number') {
              ret.x = options[0];
            }
            i++;
          }
          while (j < valueCount) {
            if (!keys || options[i] !== undefined) {
              ret[pointArrayMap[j]] = options[i];
            }
            i++;
            j++;
          }
        } else if (typeof options === 'object') {
          ret = options;
          if (options.dataLabels) {
            series._hasPointLabels = true;
          }
          if (options.marker) {
            series._hasPointMarkers = true;
          }
        }
        return ret;
      },
      getClassName: function() {
        return 'highcharts-point' +
          (this.selected ? ' highcharts-point-select' : '') +
          (this.negative ? ' highcharts-negative' : '') +
          (this.isNull ? ' highcharts-null-point' : '') +
          (this.colorIndex !== undefined ? ' highcharts-color-' +
            this.colorIndex : '') +
          (this.options.className ? ' ' + this.options.className : '') +
          (this.zone && this.zone.className ? ' ' +
            this.zone.className.replace('highcharts-negative', '') : '');
      },
      getZone: function() {
        var series = this.series,
          zones = series.zones,
          zoneAxis = series.zoneAxis || 'y',
          i = 0,
          zone;
        zone = zones[i];
        while (this[zoneAxis] >= zone.value) {
          zone = zones[++i];
        }
        if (zone && zone.color && !this.options.color) {
          this.color = zone.color;
        }
        return zone;
      },
      destroy: function() {
        var point = this,
          series = point.series,
          chart = series.chart,
          hoverPoints = chart.hoverPoints,
          prop;
        chart.pointCount--;
        if (hoverPoints) {
          point.setState();
          erase(hoverPoints, point);
          if (!hoverPoints.length) {
            chart.hoverPoints = null;
          }
        }
        if (point === chart.hoverPoint) {
          point.onMouseOut();
        }
        if (point.graphic || point.dataLabel) {
          removeEvent(point);
          point.destroyElements();
        }
        if (point.legendItem) {
          chart.legend.destroyItem(point);
        }
        for (prop in point) {
          point[prop] = null;
        }
      },
      destroyElements: function() {
        var point = this,
          props = ['graphic', 'dataLabel', 'dataLabelUpper', 'connector', 'shadowGroup'],
          prop,
          i = 6;
        while (i--) {
          prop = props[i];
          if (point[prop]) {
            point[prop] = point[prop].destroy();
          }
        }
      },
      getLabelConfig: function() {
        return {
          x: this.category,
          y: this.y,
          color: this.color,
          colorIndex: this.colorIndex,
          key: this.name || this.category,
          series: this.series,
          point: this,
          percentage: this.percentage,
          total: this.total || this.stackTotal
        };
      },
      tooltipFormatter: function(pointFormat) {
        var series = this.series,
          seriesTooltipOptions = series.tooltipOptions,
          valueDecimals = pick(seriesTooltipOptions.valueDecimals, ''),
          valuePrefix = seriesTooltipOptions.valuePrefix || '',
          valueSuffix = seriesTooltipOptions.valueSuffix || '';
        each(series.pointArrayMap || ['y'], function(key) {
          key = '{point.' + key;
          if (valuePrefix || valueSuffix) {
            pointFormat = pointFormat.replace(key + '}', valuePrefix + key + '}' + valueSuffix);
          }
          pointFormat = pointFormat.replace(key + '}', key + ':,.' + valueDecimals + 'f}');
        });
        return format(pointFormat, {
          point: this,
          series: this.series
        });
      },
      firePointEvent: function(eventType, eventArgs, defaultFunction) {
        var point = this,
          series = this.series,
          seriesOptions = series.options;
        if (seriesOptions.point.events[eventType] || (point.options && point.options.events && point.options.events[eventType])) {
          this.importEvents();
        }
        if (eventType === 'click' && seriesOptions.allowPointSelect) {
          defaultFunction = function(event) {
            if (point.select) {
              point.select(null, event.ctrlKey || event.metaKey || event.shiftKey);
            }
          };
        }
        fireEvent(this, eventType, eventArgs, defaultFunction);
      },
      visible: true
    };
  }(Highcharts));
  (function(H) {
    'use strict';
    var addEvent = H.addEvent,
      animObject = H.animObject,
      arrayMax = H.arrayMax,
      arrayMin = H.arrayMin,
      correctFloat = H.correctFloat,
      Date = H.Date,
      defaultOptions = H.defaultOptions,
      defaultPlotOptions = H.defaultPlotOptions,
      defined = H.defined,
      each = H.each,
      erase = H.erase,
      extend = H.extend,
      fireEvent = H.fireEvent,
      grep = H.grep,
      isArray = H.isArray,
      isNumber = H.isNumber,
      isString = H.isString,
      LegendSymbolMixin = H.LegendSymbolMixin,
      merge = H.merge,
      pick = H.pick,
      Point = H.Point,
      removeEvent = H.removeEvent,
      splat = H.splat,
      SVGElement = H.SVGElement,
      syncTimeout = H.syncTimeout,
      win = H.win;
    H.Series = H.seriesType('line', null, {
      lineWidth: 2,
      allowPointSelect: false,
      showCheckbox: false,
      animation: {
        duration: 1000
      },
      events: {},
      marker: {
        lineWidth: 0,
        lineColor: '#ffffff',
        radius: 4,
        states: {
          hover: {
            animation: {
              duration: 50
            },
            enabled: true,
            radiusPlus: 2,
            lineWidthPlus: 1
          },
          select: {
            fillColor: '#cccccc',
            lineColor: '#000000',
            lineWidth: 2
          }
        }
      },
      point: {
        events: {}
      },
      dataLabels: {
        align: 'center',
        formatter: function() {
          return this.y === null ? '' : H.numberFormat(this.y, -1);
        },
        style: {
          fontSize: '11px',
          fontWeight: 'bold',
          color: 'contrast',
          textOutline: '1px contrast'
        },
        verticalAlign: 'bottom',
        x: 0,
        y: 0,
        padding: 5
      },
      cropThreshold: 300,
      pointRange: 0,
      softThreshold: true,
      states: {
        hover: {
          lineWidthPlus: 1,
          marker: {},
          halo: {
            size: 10,
            opacity: 0.25
          }
        },
        select: {
          marker: {}
        }
      },
      stickyTracking: true,
      turboThreshold: 1000
    }, {
      isCartesian: true,
      pointClass: Point,
      sorted: true,
      requireSorting: true,
      directTouch: false,
      axisTypes: ['xAxis', 'yAxis'],
      colorCounter: 0,
      parallelArrays: ['x', 'y'],
      coll: 'series',
      init: function(chart, options) {
        var series = this,
          eventType,
          events,
          chartSeries = chart.series,
          lastSeries;
        series.chart = chart;
        series.options = options = series.setOptions(options);
        series.linkedSeries = [];
        series.bindAxes();
        extend(series, {
          name: options.name,
          state: '',
          visible: options.visible !== false,
          selected: options.selected === true
        });
        events = options.events;
        for (eventType in events) {
          addEvent(series, eventType, events[eventType]);
        }
        if (
          (events && events.click) ||
          (options.point && options.point.events && options.point.events.click) ||
          options.allowPointSelect
        ) {
          chart.runTrackerClick = true;
        }
        series.getColor();
        series.getSymbol();
        each(series.parallelArrays, function(key) {
          series[key + 'Data'] = [];
        });
        series.setData(options.data, false);
        if (series.isCartesian) {
          chart.hasCartesianSeries = true;
        }
        if (chartSeries.length) {
          lastSeries = chartSeries[chartSeries.length - 1];
        }
        series._i = pick(lastSeries && lastSeries._i, -1) + 1;
        chart.orderSeries(this.insert(chartSeries));
      },
      insert: function(collection) {
        var indexOption = this.options.index,
          i;
        if (isNumber(indexOption)) {
          i = collection.length;
          while (i--) {
            if (indexOption >=
              pick(collection[i].options.index, collection[i]._i)) {
              collection.splice(i + 1, 0, this);
              break;
            }
          }
          if (i === -1) {
            collection.unshift(this);
          }
          i = i + 1;
        } else {
          collection.push(this);
        }
        return pick(i, collection.length - 1);
      },
      bindAxes: function() {
        var series = this,
          seriesOptions = series.options,
          chart = series.chart,
          axisOptions;
        each(series.axisTypes || [], function(AXIS) {
          each(chart[AXIS], function(axis) {
            axisOptions = axis.options;
            if ((seriesOptions[AXIS] === axisOptions.index) ||
              (seriesOptions[AXIS] !== undefined && seriesOptions[AXIS] === axisOptions.id) ||
              (seriesOptions[AXIS] === undefined && axisOptions.index === 0)) {
              series.insert(axis.series);
              series[AXIS] = axis;
              axis.isDirty = true;
            }
          });
          if (!series[AXIS] && series.optionalAxis !== AXIS) {
            H.error(18, true);
          }
        });
      },
      updateParallelArrays: function(point, i) {
        var series = point.series,
          args = arguments,
          fn = isNumber(i) ?
          function(key) {
            var val = key === 'y' && series.toYData ? series.toYData(point) : point[key];
            series[key + 'Data'][i] = val;
          } :
          function(key) {
            Array.prototype[i].apply(series[key + 'Data'], Array.prototype.slice.call(args, 2));
          };
        each(series.parallelArrays, fn);
      },
      autoIncrement: function() {
        var options = this.options,
          xIncrement = this.xIncrement,
          date,
          pointInterval,
          pointIntervalUnit = options.pointIntervalUnit;
        xIncrement = pick(xIncrement, options.pointStart, 0);
        this.pointInterval = pointInterval = pick(this.pointInterval, options.pointInterval, 1);
        if (pointIntervalUnit) {
          date = new Date(xIncrement);
          if (pointIntervalUnit === 'day') {
            date = +date[Date.hcSetDate](date[Date.hcGetDate]() + pointInterval);
          } else if (pointIntervalUnit === 'month') {
            date = +date[Date.hcSetMonth](date[Date.hcGetMonth]() + pointInterval);
          } else if (pointIntervalUnit === 'year') {
            date = +date[Date.hcSetFullYear](date[Date.hcGetFullYear]() + pointInterval);
          }
          pointInterval = date - xIncrement;
        }
        this.xIncrement = xIncrement + pointInterval;
        return xIncrement;
      },
      setOptions: function(itemOptions) {
        var chart = this.chart,
          chartOptions = chart.options,
          plotOptions = chartOptions.plotOptions,
          userOptions = chart.userOptions || {},
          userPlotOptions = userOptions.plotOptions || {},
          typeOptions = plotOptions[this.type],
          options,
          zones;
        this.userOptions = itemOptions;
        options = merge(
          typeOptions,
          plotOptions.series,
          itemOptions
        );
        this.tooltipOptions = merge(
          defaultOptions.tooltip,
          defaultOptions.plotOptions[this.type].tooltip,
          userOptions.tooltip,
          userPlotOptions.series && userPlotOptions.series.tooltip,
          userPlotOptions[this.type] && userPlotOptions[this.type].tooltip,
          itemOptions.tooltip
        );
        if (typeOptions.marker === null) {
          delete options.marker;
        }
        this.zoneAxis = options.zoneAxis;
        zones = this.zones = (options.zones || []).slice();
        if ((options.negativeColor || options.negativeFillColor) && !options.zones) {
          zones.push({
            value: options[this.zoneAxis + 'Threshold'] || options.threshold || 0,
            className: 'highcharts-negative',
            color: options.negativeColor,
            fillColor: options.negativeFillColor
          });
        }
        if (zones.length) {
          if (defined(zones[zones.length - 1].value)) {
            zones.push({
              color: this.color,
              fillColor: this.fillColor
            });
          }
        }
        return options;
      },
      getCyclic: function(prop, value, defaults) {
        var i,
          chart = this.chart,
          userOptions = this.userOptions,
          indexName = prop + 'Index',
          counterName = prop + 'Counter',
          len = defaults ? defaults.length : pick(
            chart.options.chart[prop + 'Count'],
            chart[prop + 'Count']
          ),
          setting;
        if (!value) {
          setting = pick(userOptions[indexName], userOptions['_' + indexName]);
          if (defined(setting)) {
            i = setting;
          } else {
            if (!chart.series.length) {
              chart[counterName] = 0;
            }
            userOptions['_' + indexName] = i = chart[counterName] % len;
            chart[counterName] += 1;
          }
          if (defaults) {
            value = defaults[i];
          }
        }
        if (i !== undefined) {
          this[indexName] = i;
        }
        this[prop] = value;
      },
      getColor: function() {
        if (this.options.colorByPoint) {
          this.options.color = null;
        } else {
          this.getCyclic('color', this.options.color || defaultPlotOptions[this.type].color, this.chart.options.colors);
        }
      },
      getSymbol: function() {
        var seriesMarkerOption = this.options.marker;
        this.getCyclic('symbol', seriesMarkerOption.symbol, this.chart.options.symbols);
      },
      drawLegendSymbol: LegendSymbolMixin.drawLineMarker,
      setData: function(data, redraw, animation, updatePoints) {
        var series = this,
          oldData = series.points,
          oldDataLength = (oldData && oldData.length) || 0,
          dataLength,
          options = series.options,
          chart = series.chart,
          firstPoint = null,
          xAxis = series.xAxis,
          i,
          turboThreshold = options.turboThreshold,
          pt,
          xData = this.xData,
          yData = this.yData,
          pointArrayMap = series.pointArrayMap,
          valueCount = pointArrayMap && pointArrayMap.length;
        data = data || [];
        dataLength = data.length;
        redraw = pick(redraw, true);
        if (updatePoints !== false && dataLength && oldDataLength === dataLength && !series.cropped && !series.hasGroupedData && series.visible) {
          each(data, function(point, i) {
            if (oldData[i].update && point !== options.data[i]) {
              oldData[i].update(point, false, null, false);
            }
          });
        } else {
          series.xIncrement = null;
          series.colorCounter = 0;
          each(this.parallelArrays, function(key) {
            series[key + 'Data'].length = 0;
          });
          if (turboThreshold && dataLength > turboThreshold) {
            i = 0;
            while (firstPoint === null && i < dataLength) {
              firstPoint = data[i];
              i++;
            }
            if (isNumber(firstPoint)) {
              for (i = 0; i < dataLength; i++) {
                xData[i] = this.autoIncrement();
                yData[i] = data[i];
              }
            } else if (isArray(firstPoint)) {
              if (valueCount) {
                for (i = 0; i < dataLength; i++) {
                  pt = data[i];
                  xData[i] = pt[0];
                  yData[i] = pt.slice(1, valueCount + 1);
                }
              } else {
                for (i = 0; i < dataLength; i++) {
                  pt = data[i];
                  xData[i] = pt[0];
                  yData[i] = pt[1];
                }
              }
            } else {
              H.error(12);
            }
          } else {
            for (i = 0; i < dataLength; i++) {
              if (data[i] !== undefined) {
                pt = {
                  series: series
                };
                series.pointClass.prototype.applyOptions.apply(pt, [data[i]]);
                series.updateParallelArrays(pt, i);
              }
            }
          }
          if (isString(yData[0])) {
            H.error(14, true);
          }
          series.data = [];
          series.options.data = series.userOptions.data = data;
          i = oldDataLength;
          while (i--) {
            if (oldData[i] && oldData[i].destroy) {
              oldData[i].destroy();
            }
          }
          if (xAxis) {
            xAxis.minRange = xAxis.userMinRange;
          }
          series.isDirty = chart.isDirtyBox = true;
          series.isDirtyData = !!oldData;
          animation = false;
        }
        if (options.legendType === 'point') {
          this.processData();
          this.generatePoints();
        }
        if (redraw) {
          chart.redraw(animation);
        }
      },
      processData: function(force) {
        var series = this,
          processedXData = series.xData,
          processedYData = series.yData,
          dataLength = processedXData.length,
          croppedData,
          cropStart = 0,
          cropped,
          distance,
          closestPointRange,
          xAxis = series.xAxis,
          i,
          options = series.options,
          cropThreshold = options.cropThreshold,
          getExtremesFromAll = series.getExtremesFromAll || options.getExtremesFromAll,
          isCartesian = series.isCartesian,
          xExtremes,
          val2lin = xAxis && xAxis.val2lin,
          isLog = xAxis && xAxis.isLog,
          min,
          max;
        if (isCartesian && !series.isDirty && !xAxis.isDirty && !series.yAxis.isDirty && !force) {
          return false;
        }
        if (xAxis) {
          xExtremes = xAxis.getExtremes();
          min = xExtremes.min;
          max = xExtremes.max;
        }
        if (isCartesian && series.sorted && !getExtremesFromAll && (!cropThreshold || dataLength > cropThreshold || series.forceCrop)) {
          if (processedXData[dataLength - 1] < min || processedXData[0] > max) {
            processedXData = [];
            processedYData = [];
          } else if (processedXData[0] < min || processedXData[dataLength - 1] > max) {
            croppedData = this.cropData(series.xData, series.yData, min, max);
            processedXData = croppedData.xData;
            processedYData = croppedData.yData;
            cropStart = croppedData.start;
            cropped = true;
          }
        }
        i = processedXData.length || 1;
        while (--i) {
          distance = isLog ?
            val2lin(processedXData[i]) - val2lin(processedXData[i - 1]) :
            processedXData[i] - processedXData[i - 1];
          if (distance > 0 && (closestPointRange === undefined || distance < closestPointRange)) {
            closestPointRange = distance;
          } else if (distance < 0 && series.requireSorting) {
            H.error(15);
          }
        }
        series.cropped = cropped;
        series.cropStart = cropStart;
        series.processedXData = processedXData;
        series.processedYData = processedYData;
        series.closestPointRange = closestPointRange;
      },
      cropData: function(xData, yData, min, max) {
        var dataLength = xData.length,
          cropStart = 0,
          cropEnd = dataLength,
          cropShoulder = pick(this.cropShoulder, 1),
          i,
          j;
        for (i = 0; i < dataLength; i++) {
          if (xData[i] >= min) {
            cropStart = Math.max(0, i - cropShoulder);
            break;
          }
        }
        for (j = i; j < dataLength; j++) {
          if (xData[j] > max) {
            cropEnd = j + cropShoulder;
            break;
          }
        }
        return {
          xData: xData.slice(cropStart, cropEnd),
          yData: yData.slice(cropStart, cropEnd),
          start: cropStart,
          end: cropEnd
        };
      },
      generatePoints: function() {
        var series = this,
          options = series.options,
          dataOptions = options.data,
          data = series.data,
          dataLength,
          processedXData = series.processedXData,
          processedYData = series.processedYData,
          PointClass = series.pointClass,
          processedDataLength = processedXData.length,
          cropStart = series.cropStart || 0,
          cursor,
          hasGroupedData = series.hasGroupedData,
          point,
          points = [],
          i;
        if (!data && !hasGroupedData) {
          var arr = [];
          arr.length = dataOptions.length;
          data = series.data = arr;
        }
        for (i = 0; i < processedDataLength; i++) {
          cursor = cropStart + i;
          if (!hasGroupedData) {
            point = data[cursor];
            if (!point && dataOptions[cursor] !== undefined) {
              data[cursor] = point = (new PointClass()).init(series, dataOptions[cursor], processedXData[i]);
            }
          } else {
            point = (new PointClass()).init(series, [processedXData[i]].concat(splat(processedYData[i])));
            point.dataGroup = series.groupMap[i];
          }
          point.index = cursor;
          points[i] = point;
        }
        if (data && (processedDataLength !== (dataLength = data.length) || hasGroupedData)) {
          for (i = 0; i < dataLength; i++) {
            if (i === cropStart && !hasGroupedData) {
              i += processedDataLength;
            }
            if (data[i]) {
              data[i].destroyElements();
              data[i].plotX = undefined;
            }
          }
        }
        series.data = data;
        series.points = points;
      },
      getExtremes: function(yData) {
        var xAxis = this.xAxis,
          yAxis = this.yAxis,
          xData = this.processedXData,
          yDataLength,
          activeYData = [],
          activeCounter = 0,
          xExtremes = xAxis.getExtremes(),
          xMin = xExtremes.min,
          xMax = xExtremes.max,
          validValue,
          withinRange,
          x,
          y,
          i,
          j;
        yData = yData || this.stackedYData || this.processedYData || [];
        yDataLength = yData.length;
        for (i = 0; i < yDataLength; i++) {
          x = xData[i];
          y = yData[i];
          validValue = (isNumber(y, true) || isArray(y)) && (!yAxis.isLog || (y.length || y > 0));
          withinRange = this.getExtremesFromAll || this.options.getExtremesFromAll || this.cropped ||
            ((xData[i + 1] || x) >= xMin && (xData[i - 1] || x) <= xMax);
          if (validValue && withinRange) {
            j = y.length;
            if (j) {
              while (j--) {
                if (y[j] !== null) {
                  activeYData[activeCounter++] = y[j];
                }
              }
            } else {
              activeYData[activeCounter++] = y;
            }
          }
        }
        this.dataMin = arrayMin(activeYData);
        this.dataMax = arrayMax(activeYData);
      },
      translate: function() {
        if (!this.processedXData) {
          this.processData();
        }
        this.generatePoints();
        var series = this,
          options = series.options,
          stacking = options.stacking,
          xAxis = series.xAxis,
          categories = xAxis.categories,
          yAxis = series.yAxis,
          points = series.points,
          dataLength = points.length,
          hasModifyValue = !!series.modifyValue,
          i,
          pointPlacement = options.pointPlacement,
          dynamicallyPlaced = pointPlacement === 'between' || isNumber(pointPlacement),
          threshold = options.threshold,
          stackThreshold = options.startFromThreshold ? threshold : 0,
          plotX,
          plotY,
          lastPlotX,
          stackIndicator,
          closestPointRangePx = Number.MAX_VALUE;
        if (pointPlacement === 'between') {
          pointPlacement = 0.5;
        }
        if (isNumber(pointPlacement)) {
          pointPlacement *= pick(options.pointRange || xAxis.pointRange);
        }
        for (i = 0; i < dataLength; i++) {
          var point = points[i],
            xValue = point.x,
            yValue = point.y,
            yBottom = point.low,
            stack = stacking && yAxis.stacks[(series.negStacks && yValue < (stackThreshold ? 0 : threshold) ? '-' : '') + series.stackKey],
            pointStack,
            stackValues;
          if (yAxis.isLog && yValue !== null && yValue <= 0) {
            point.isNull = true;
          }
          point.plotX = plotX = correctFloat(
            Math.min(Math.max(-1e5, xAxis.translate(
              xValue,
              0,
              0,
              0,
              1,
              pointPlacement,
              this.type === 'flags'
            )), 1e5)
          );
          if (stacking && series.visible && !point.isNull && stack && stack[xValue]) {
            stackIndicator = series.getStackIndicator(stackIndicator, xValue, series.index);
            pointStack = stack[xValue];
            stackValues = pointStack.points[stackIndicator.key];
            yBottom = stackValues[0];
            yValue = stackValues[1];
            if (yBottom === stackThreshold && stackIndicator.key === stack[xValue].base) {
              yBottom = pick(threshold, yAxis.min);
            }
            if (yAxis.isLog && yBottom <= 0) {
              yBottom = null;
            }
            point.total = point.stackTotal = pointStack.total;
            point.percentage = pointStack.total && (point.y / pointStack.total * 100);
            point.stackY = yValue;
            pointStack.setOffset(series.pointXOffset || 0, series.barW || 0);
          }
          point.yBottom = defined(yBottom) ?
            yAxis.translate(yBottom, 0, 1, 0, 1) :
            null;
          if (hasModifyValue) {
            yValue = series.modifyValue(yValue, point);
          }
          point.plotY = plotY = (typeof yValue === 'number' && yValue !== Infinity) ?
            Math.min(Math.max(-1e5, yAxis.translate(yValue, 0, 1, 0, 1)), 1e5) :
            undefined;
          point.isInside = plotY !== undefined && plotY >= 0 && plotY <= yAxis.len &&
            plotX >= 0 && plotX <= xAxis.len;
          point.clientX = dynamicallyPlaced ? correctFloat(xAxis.translate(xValue, 0, 0, 0, 1, pointPlacement)) : plotX;
          point.negative = point.y < (threshold || 0);
          point.category = categories && categories[point.x] !== undefined ?
            categories[point.x] : point.x;
          if (!point.isNull) {
            if (lastPlotX !== undefined) {
              closestPointRangePx = Math.min(closestPointRangePx, Math.abs(plotX - lastPlotX));
            }
            lastPlotX = plotX;
          }
          point.zone = this.zones.length && point.getZone();
        }
        series.closestPointRangePx = closestPointRangePx;
      },
      getValidPoints: function(points, insideOnly) {
        var chart = this.chart;
        return grep(points || this.points || [], function isValidPoint(point) {
          if (insideOnly && !chart.isInsidePlot(point.plotX, point.plotY, chart.inverted)) {
            return false;
          }
          return !point.isNull;
        });
      },
      setClip: function(animation) {
        var chart = this.chart,
          options = this.options,
          renderer = chart.renderer,
          inverted = chart.inverted,
          seriesClipBox = this.clipBox,
          clipBox = seriesClipBox || chart.clipBox,
          sharedClipKey = this.sharedClipKey || ['_sharedClip', animation && animation.duration, animation && animation.easing, clipBox.height, options.xAxis, options.yAxis].join(','),
          clipRect = chart[sharedClipKey],
          markerClipRect = chart[sharedClipKey + 'm'];
        if (!clipRect) {
          if (animation) {
            clipBox.width = 0;
            chart[sharedClipKey + 'm'] = markerClipRect = renderer.clipRect(-99,
              inverted ? -chart.plotLeft : -chart.plotTop,
              99,
              inverted ? chart.chartWidth : chart.chartHeight
            );
          }
          chart[sharedClipKey] = clipRect = renderer.clipRect(clipBox);
          clipRect.count = {
            length: 0
          };
        }
        if (animation) {
          if (!clipRect.count[this.index]) {
            clipRect.count[this.index] = true;
            clipRect.count.length += 1;
          }
        }
        if (options.clip !== false) {
          this.group.clip(animation || seriesClipBox ? clipRect : chart.clipRect);
          this.markerGroup.clip(markerClipRect);
          this.sharedClipKey = sharedClipKey;
        }
        if (!animation) {
          if (clipRect.count[this.index]) {
            delete clipRect.count[this.index];
            clipRect.count.length -= 1;
          }
          if (clipRect.count.length === 0 && sharedClipKey && chart[sharedClipKey]) {
            if (!seriesClipBox) {
              chart[sharedClipKey] = chart[sharedClipKey].destroy();
            }
            if (chart[sharedClipKey + 'm']) {
              this.markerGroup.clip();
              chart[sharedClipKey + 'm'] = chart[sharedClipKey + 'm'].destroy();
            }
          }
        }
      },
      animate: function(init) {
        var series = this,
          chart = series.chart,
          clipRect,
          animation = animObject(series.options.animation),
          sharedClipKey;
        if (init) {
          series.setClip(animation);
        } else {
          sharedClipKey = this.sharedClipKey;
          clipRect = chart[sharedClipKey];
          if (clipRect) {
            clipRect.animate({
              width: chart.plotSizeX
            }, animation);
          }
          if (chart[sharedClipKey + 'm']) {
            chart[sharedClipKey + 'm'].animate({
              width: chart.plotSizeX + 99
            }, animation);
          }
          series.animate = null;
        }
      },
      afterAnimate: function() {
        this.setClip();
        fireEvent(this, 'afterAnimate');
      },
      drawPoints: function() {
        var series = this,
          points = series.points,
          chart = series.chart,
          plotY,
          i,
          point,
          symbol,
          graphic,
          options = series.options,
          seriesMarkerOptions = options.marker,
          pointMarkerOptions,
          hasPointMarker,
          enabled,
          isInside,
          markerGroup = series.markerGroup,
          xAxis = series.xAxis,
          markerAttribs,
          globallyEnabled = pick(
            seriesMarkerOptions.enabled,
            xAxis.isRadial ? true : null,
            series.closestPointRangePx > 2 * seriesMarkerOptions.radius
          );
        if (seriesMarkerOptions.enabled !== false || series._hasPointMarkers) {
          for (i = 0; i < points.length; i++) {
            point = points[i];
            plotY = point.plotY;
            graphic = point.graphic;
            pointMarkerOptions = point.marker || {};
            hasPointMarker = !!point.marker;
            enabled = (globallyEnabled && pointMarkerOptions.enabled === undefined) || pointMarkerOptions.enabled;
            isInside = point.isInside;
            if (enabled && isNumber(plotY) && point.y !== null) {
              symbol = pick(pointMarkerOptions.symbol, series.symbol);
              point.hasImage = symbol.indexOf('url') === 0;
              markerAttribs = series.markerAttribs(
                point,
                point.selected && 'select'
              );
              if (graphic) {
                graphic[isInside ? 'show' : 'hide'](true)
                  .animate(markerAttribs);
              } else if (isInside && (markerAttribs.width > 0 || point.hasImage)) {
                point.graphic = graphic = chart.renderer.symbol(
                    symbol,
                    markerAttribs.x,
                    markerAttribs.y,
                    markerAttribs.width,
                    markerAttribs.height,
                    hasPointMarker ? pointMarkerOptions : seriesMarkerOptions
                  )
                  .add(markerGroup);
              }
              if (graphic) {
                graphic.attr(series.pointAttribs(point, point.selected && 'select'));
              }
              if (graphic) {
                graphic.addClass(point.getClassName(), true);
              }
            } else if (graphic) {
              point.graphic = graphic.destroy();
            }
          }
        }
      },
      markerAttribs: function(point, state) {
        var seriesMarkerOptions = this.options.marker,
          seriesStateOptions,
          pointMarkerOptions = point.marker || {},
          pointStateOptions,
          radius = pick(
            pointMarkerOptions.radius,
            seriesMarkerOptions.radius
          ),
          attribs;
        if (state) {
          seriesStateOptions = seriesMarkerOptions.states[state];
          pointStateOptions = pointMarkerOptions.states &&
            pointMarkerOptions.states[state];
          radius = pick(
            pointStateOptions && pointStateOptions.radius,
            seriesStateOptions && seriesStateOptions.radius,
            radius + (seriesStateOptions && seriesStateOptions.radiusPlus || 0)
          );
        }
        if (point.hasImage) {
          radius = 0;
        }
        attribs = {
          x: Math.floor(point.plotX) - radius,
          y: point.plotY - radius
        };
        if (radius) {
          attribs.width = attribs.height = 2 * radius;
        }
        return attribs;
      },
      pointAttribs: function(point, state) {
        var seriesMarkerOptions = this.options.marker,
          seriesStateOptions,
          pointOptions = point && point.options,
          pointMarkerOptions = (pointOptions && pointOptions.marker) || {},
          pointStateOptions,
          color = this.color,
          pointColorOption = pointOptions && pointOptions.color,
          pointColor = point && point.color,
          strokeWidth = pick(
            pointMarkerOptions.lineWidth,
            seriesMarkerOptions.lineWidth
          ),
          zoneColor = point && point.zone && point.zone.color,
          fill,
          stroke;
        color = pointColorOption || zoneColor || pointColor || color;
        fill = pointMarkerOptions.fillColor || seriesMarkerOptions.fillColor || color;
        stroke = pointMarkerOptions.lineColor || seriesMarkerOptions.lineColor || color;
        if (state) {
          seriesStateOptions = seriesMarkerOptions.states[state];
          pointStateOptions = (pointMarkerOptions.states && pointMarkerOptions.states[state]) || {};
          strokeWidth = pick(
            pointStateOptions.lineWidth,
            seriesStateOptions.lineWidth,
            strokeWidth + pick(
              pointStateOptions.lineWidthPlus,
              seriesStateOptions.lineWidthPlus,
              0
            )
          );
          fill = pointStateOptions.fillColor || seriesStateOptions.fillColor || fill;
          stroke = pointStateOptions.lineColor || seriesStateOptions.lineColor || stroke;
        }
        return {
          'stroke': stroke,
          'stroke-width': strokeWidth,
          'fill': fill
        };
      },
      destroy: function() {
        var series = this,
          chart = series.chart,
          issue134 = /AppleWebKit\/533/.test(win.navigator.userAgent),
          destroy,
          i,
          data = series.data || [],
          point,
          prop,
          axis;
        fireEvent(series, 'destroy');
        removeEvent(series);
        each(series.axisTypes || [], function(AXIS) {
          axis = series[AXIS];
          if (axis && axis.series) {
            erase(axis.series, series);
            axis.isDirty = axis.forceRedraw = true;
          }
        });
        if (series.legendItem) {
          series.chart.legend.destroyItem(series);
        }
        i = data.length;
        while (i--) {
          point = data[i];
          if (point && point.destroy) {
            point.destroy();
          }
        }
        series.points = null;
        clearTimeout(series.animationTimeout);
        for (prop in series) {
          if (series[prop] instanceof SVGElement && !series[prop].survive) {
            destroy = issue134 && prop === 'group' ?
              'hide' :
              'destroy';
            series[prop][destroy]();
          }
        }
        if (chart.hoverSeries === series) {
          chart.hoverSeries = null;
        }
        erase(chart.series, series);
        chart.orderSeries();
        for (prop in series) {
          delete series[prop];
        }
      },
      getGraphPath: function(points, nullsAsZeroes, connectCliffs) {
        var series = this,
          options = series.options,
          step = options.step,
          reversed,
          graphPath = [],
          xMap = [],
          gap;
        points = points || series.points;
        reversed = points.reversed;
        if (reversed) {
          points.reverse();
        }
        step = {
          right: 1,
          center: 2
        }[step] || (step && 3);
        if (step && reversed) {
          step = 4 - step;
        }
        if (options.connectNulls && !nullsAsZeroes && !connectCliffs) {
          points = this.getValidPoints(points);
        }
        each(points, function(point, i) {
          var plotX = point.plotX,
            plotY = point.plotY,
            lastPoint = points[i - 1],
            pathToPoint;
          if ((point.leftCliff || (lastPoint && lastPoint.rightCliff)) && !connectCliffs) {
            gap = true;
          }
          if (point.isNull && !defined(nullsAsZeroes) && i > 0) {
            gap = !options.connectNulls;
          } else if (point.isNull && !nullsAsZeroes) {
            gap = true;
          } else {
            if (i === 0 || gap) {
              pathToPoint = ['M', point.plotX, point.plotY];
            } else if (series.getPointSpline) {
              pathToPoint = series.getPointSpline(points, point, i);
            } else if (step) {
              if (step === 1) {
                pathToPoint = [
                  'L',
                  lastPoint.plotX,
                  plotY
                ];
              } else if (step === 2) {
                pathToPoint = [
                  'L',
                  (lastPoint.plotX + plotX) / 2,
                  lastPoint.plotY,
                  'L',
                  (lastPoint.plotX + plotX) / 2,
                  plotY
                ];
              } else {
                pathToPoint = [
                  'L',
                  plotX,
                  lastPoint.plotY
                ];
              }
              pathToPoint.push('L', plotX, plotY);
            } else {
              pathToPoint = [
                'L',
                plotX,
                plotY
              ];
            }
            xMap.push(point.x);
            if (step) {
              xMap.push(point.x);
            }
            graphPath.push.apply(graphPath, pathToPoint);
            gap = false;
          }
        });
        graphPath.xMap = xMap;
        series.graphPath = graphPath;
        return graphPath;
      },
      drawGraph: function() {
        var series = this,
          options = this.options,
          graphPath = (this.gappedPath || this.getGraphPath).call(this),
          props = [
            [
              'graph',
              'highcharts-graph',
              options.lineColor || this.color,
              options.dashStyle
            ]
          ];
        each(this.zones, function(zone, i) {
          props.push([
            'zone-graph-' + i,
            'highcharts-graph highcharts-zone-graph-' + i + ' ' + (zone.className || ''),
            zone.color || series.color,
            zone.dashStyle || options.dashStyle
          ]);
        });
        each(props, function(prop, i) {
          var graphKey = prop[0],
            graph = series[graphKey],
            attribs;
          if (graph) {
            graph.endX = graphPath.xMap;
            graph.animate({
              d: graphPath
            });
          } else if (graphPath.length) {
            series[graphKey] = series.chart.renderer.path(graphPath)
              .addClass(prop[1])
              .attr({
                zIndex: 1
              })
              .add(series.group);
            attribs = {
              'stroke': prop[2],
              'stroke-width': options.lineWidth,
              'fill': (series.fillGraph && series.color) || 'none'
            };
            if (prop[3]) {
              attribs.dashstyle = prop[3];
            } else if (options.linecap !== 'square') {
              attribs['stroke-linecap'] = attribs['stroke-linejoin'] = 'round';
            }
            graph = series[graphKey]
              .attr(attribs)
              .shadow((i < 2) && options.shadow);
          }
          if (graph) {
            graph.startX = graphPath.xMap;
            graph.isArea = graphPath.isArea;
          }
        });
      },
      applyZones: function() {
        var series = this,
          chart = this.chart,
          renderer = chart.renderer,
          zones = this.zones,
          translatedFrom,
          translatedTo,
          clips = this.clips || [],
          clipAttr,
          graph = this.graph,
          area = this.area,
          chartSizeMax = Math.max(chart.chartWidth, chart.chartHeight),
          axis = this[(this.zoneAxis || 'y') + 'Axis'],
          extremes,
          reversed,
          inverted = chart.inverted,
          horiz,
          pxRange,
          pxPosMin,
          pxPosMax,
          ignoreZones = false;
        if (zones.length && (graph || area) && axis && axis.min !== undefined) {
          reversed = axis.reversed;
          horiz = axis.horiz;
          if (graph) {
            graph.hide();
          }
          if (area) {
            area.hide();
          }
          extremes = axis.getExtremes();
          each(zones, function(threshold, i) {
            translatedFrom = reversed ?
              (horiz ? chart.plotWidth : 0) :
              (horiz ? 0 : axis.toPixels(extremes.min));
            translatedFrom = Math.min(Math.max(pick(translatedTo, translatedFrom), 0), chartSizeMax);
            translatedTo = Math.min(Math.max(Math.round(axis.toPixels(pick(threshold.value, extremes.max), true)), 0), chartSizeMax);
            if (ignoreZones) {
              translatedFrom = translatedTo = axis.toPixels(extremes.max);
            }
            pxRange = Math.abs(translatedFrom - translatedTo);
            pxPosMin = Math.min(translatedFrom, translatedTo);
            pxPosMax = Math.max(translatedFrom, translatedTo);
            if (axis.isXAxis) {
              clipAttr = {
                x: inverted ? pxPosMax : pxPosMin,
                y: 0,
                width: pxRange,
                height: chartSizeMax
              };
              if (!horiz) {
                clipAttr.x = chart.plotHeight - clipAttr.x;
              }
            } else {
              clipAttr = {
                x: 0,
                y: inverted ? pxPosMax : pxPosMin,
                width: chartSizeMax,
                height: pxRange
              };
              if (horiz) {
                clipAttr.y = chart.plotWidth - clipAttr.y;
              }
            }
            if (inverted && renderer.isVML) {
              if (axis.isXAxis) {
                clipAttr = {
                  x: 0,
                  y: reversed ? pxPosMin : pxPosMax,
                  height: clipAttr.width,
                  width: chart.chartWidth
                };
              } else {
                clipAttr = {
                  x: clipAttr.y - chart.plotLeft - chart.spacingBox.x,
                  y: 0,
                  width: clipAttr.height,
                  height: chart.chartHeight
                };
              }
            }
            if (clips[i]) {
              clips[i].animate(clipAttr);
            } else {
              clips[i] = renderer.clipRect(clipAttr);
              if (graph) {
                series['zone-graph-' + i].clip(clips[i]);
              }
              if (area) {
                series['zone-area-' + i].clip(clips[i]);
              }
            }
            ignoreZones = threshold.value > extremes.max;
          });
          this.clips = clips;
        }
      },
      invertGroups: function(inverted) {
        var series = this,
          chart = series.chart,
          remover;

        function setInvert() {
          each(['group', 'markerGroup'], function(groupName) {
            if (series[groupName]) {
              series[groupName].width = series.yAxis.len;
              series[groupName].height = series.xAxis.len;
              series[groupName].invert(inverted);
            }
          });
        }
        if (!series.xAxis) {
          return;
        }
        remover = addEvent(chart, 'resize', setInvert);
        addEvent(series, 'destroy', remover);
        setInvert(inverted);
        series.invertGroups = setInvert;
      },
      plotGroup: function(prop, name, visibility, zIndex, parent) {
        var group = this[prop],
          isNew = !group;
        if (isNew) {
          this[prop] = group = this.chart.renderer.g(name)
            .attr({
              zIndex: zIndex || 0.1
            })
            .add(parent);
          group.addClass('highcharts-series-' + this.index + ' highcharts-' + this.type + '-series highcharts-color-' + this.colorIndex +
            ' ' + (this.options.className || ''));
        }
        group.attr({
          visibility: visibility
        })[isNew ? 'attr' : 'animate'](this.getPlotBox());
        return group;
      },
      getPlotBox: function() {
        var chart = this.chart,
          xAxis = this.xAxis,
          yAxis = this.yAxis;
        if (chart.inverted) {
          xAxis = yAxis;
          yAxis = this.xAxis;
        }
        return {
          translateX: xAxis ? xAxis.left : chart.plotLeft,
          translateY: yAxis ? yAxis.top : chart.plotTop,
          scaleX: 1,
          scaleY: 1
        };
      },
      render: function() {
        var series = this,
          chart = series.chart,
          group,
          options = series.options,
          animDuration = !!series.animate && chart.renderer.isSVG && animObject(options.animation).duration,
          visibility = series.visible ? 'inherit' : 'hidden',
          zIndex = options.zIndex,
          hasRendered = series.hasRendered,
          chartSeriesGroup = chart.seriesGroup,
          inverted = chart.inverted;
        group = series.plotGroup(
          'group',
          'series',
          visibility,
          zIndex,
          chartSeriesGroup
        );
        series.markerGroup = series.plotGroup(
          'markerGroup',
          'markers',
          visibility,
          zIndex,
          chartSeriesGroup
        );
        if (animDuration) {
          series.animate(true);
        }
        group.inverted = series.isCartesian ? inverted : false;
        if (series.drawGraph) {
          series.drawGraph();
          series.applyZones();
        }
        if (series.drawDataLabels) {
          series.drawDataLabels();
        }
        if (series.visible) {
          series.drawPoints();
        }
        if (series.drawTracker && series.options.enableMouseTracking !== false) {
          series.drawTracker();
        }
        series.invertGroups(inverted);
        if (options.clip !== false && !series.sharedClipKey && !hasRendered) {
          group.clip(chart.clipRect);
        }
        if (animDuration) {
          series.animate();
        }
        if (!hasRendered) {
          series.animationTimeout = syncTimeout(function() {
            series.afterAnimate();
          }, animDuration);
        }
        series.isDirty = false;
        series.hasRendered = true;
      },
      redraw: function() {
        var series = this,
          chart = series.chart,
          wasDirty = series.isDirty || series.isDirtyData,
          group = series.group,
          xAxis = series.xAxis,
          yAxis = series.yAxis;
        if (group) {
          if (chart.inverted) {
            group.attr({
              width: chart.plotWidth,
              height: chart.plotHeight
            });
          }
          group.animate({
            translateX: pick(xAxis && xAxis.left, chart.plotLeft),
            translateY: pick(yAxis && yAxis.top, chart.plotTop)
          });
        }
        series.translate();
        series.render();
        if (wasDirty) {
          delete this.kdTree;
        }
      },
      kdDimensions: 1,
      kdAxisArray: ['clientX', 'plotY'],
      searchPoint: function(e, compareX) {
        var series = this,
          xAxis = series.xAxis,
          yAxis = series.yAxis,
          inverted = series.chart.inverted;
        return this.searchKDTree({
          clientX: inverted ? xAxis.len - e.chartY + xAxis.pos : e.chartX - xAxis.pos,
          plotY: inverted ? yAxis.len - e.chartX + yAxis.pos : e.chartY - yAxis.pos
        }, compareX);
      },
      buildKDTree: function() {
        this.buildingKdTree = true;
        var series = this,
          dimensions = series.kdDimensions;

        function _kdtree(points, depth, dimensions) {
          var axis,
            median,
            length = points && points.length;
          if (length) {
            axis = series.kdAxisArray[depth % dimensions];
            points.sort(function(a, b) {
              return a[axis] - b[axis];
            });
            median = Math.floor(length / 2);
            return {
              point: points[median],
              left: _kdtree(points.slice(0, median), depth + 1, dimensions),
              right: _kdtree(points.slice(median + 1), depth + 1, dimensions)
            };
          }
        }

        function startRecursive() {
          series.kdTree = _kdtree(
            series.getValidPoints(
              null, !series.directTouch
            ),
            dimensions,
            dimensions
          );
          series.buildingKdTree = false;
        }
        delete series.kdTree;
        syncTimeout(startRecursive, series.options.kdNow ? 0 : 1);
      },
      searchKDTree: function(point, compareX) {
        var series = this,
          kdX = this.kdAxisArray[0],
          kdY = this.kdAxisArray[1],
          kdComparer = compareX ? 'distX' : 'dist';

        function setDistance(p1, p2) {
          var x = (defined(p1[kdX]) && defined(p2[kdX])) ? Math.pow(p1[kdX] - p2[kdX], 2) : null,
            y = (defined(p1[kdY]) && defined(p2[kdY])) ? Math.pow(p1[kdY] - p2[kdY], 2) : null,
            r = (x || 0) + (y || 0);
          p2.dist = defined(r) ? Math.sqrt(r) : Number.MAX_VALUE;
          p2.distX = defined(x) ? Math.sqrt(x) : Number.MAX_VALUE;
        }

        function _search(search, tree, depth, dimensions) {
          var point = tree.point,
            axis = series.kdAxisArray[depth % dimensions],
            tdist,
            sideA,
            sideB,
            ret = point,
            nPoint1,
            nPoint2;
          setDistance(search, point);
          tdist = search[axis] - point[axis];
          sideA = tdist < 0 ? 'left' : 'right';
          sideB = tdist < 0 ? 'right' : 'left';
          if (tree[sideA]) {
            nPoint1 = _search(search, tree[sideA], depth + 1, dimensions);
            ret = (nPoint1[kdComparer] < ret[kdComparer] ? nPoint1 : point);
          }
          if (tree[sideB]) {
            if (Math.sqrt(tdist * tdist) < ret[kdComparer]) {
              nPoint2 = _search(search, tree[sideB], depth + 1, dimensions);
              ret = (nPoint2[kdComparer] < ret[kdComparer] ? nPoint2 : ret);
            }
          }
          return ret;
        }
        if (!this.kdTree && !this.buildingKdTree) {
          this.buildKDTree();
        }
        if (this.kdTree) {
          return _search(point,
            this.kdTree, this.kdDimensions, this.kdDimensions);
        }
      }
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var Axis = H.Axis,
      Chart = H.Chart,
      correctFloat = H.correctFloat,
      defined = H.defined,
      destroyObjectProperties = H.destroyObjectProperties,
      each = H.each,
      format = H.format,
      pick = H.pick,
      Series = H.Series;

    function StackItem(axis, options, isNegative, x, stackOption) {
      var inverted = axis.chart.inverted;
      this.axis = axis;
      this.isNegative = isNegative;
      this.options = options;
      this.x = x;
      this.total = null;
      this.points = {};
      this.stack = stackOption;
      this.leftCliff = 0;
      this.rightCliff = 0;
      this.alignOptions = {
        align: options.align ||
          (inverted ? (isNegative ? 'left' : 'right') : 'center'),
        verticalAlign: options.verticalAlign ||
          (inverted ? 'middle' : (isNegative ? 'bottom' : 'top')),
        y: pick(options.y, inverted ? 4 : (isNegative ? 14 : -6)),
        x: pick(options.x, inverted ? (isNegative ? -6 : 6) : 0)
      };
      this.textAlign = options.textAlign ||
        (inverted ? (isNegative ? 'right' : 'left') : 'center');
    }
    StackItem.prototype = {
      destroy: function() {
        destroyObjectProperties(this, this.axis);
      },
      render: function(group) {
        var options = this.options,
          formatOption = options.format,
          str = formatOption ?
          format(formatOption, this) :
          options.formatter.call(this);
        if (this.label) {
          this.label.attr({
            text: str,
            visibility: 'hidden'
          });
        } else {
          this.label =
            this.axis.chart.renderer.text(str, null, null, options.useHTML)
            .css(options.style)
            .attr({
              align: this.textAlign,
              rotation: options.rotation,
              visibility: 'hidden'
            })
            .add(group);
        }
      },
      setOffset: function(xOffset, xWidth) {
        var stackItem = this,
          axis = stackItem.axis,
          chart = axis.chart,
          inverted = chart.inverted,
          reversed = axis.reversed,
          neg = (this.isNegative && !reversed) ||
          (!this.isNegative && reversed),
          y = axis.translate(
            axis.usePercentage ? 100 : this.total,
            0,
            0,
            0,
            1
          ),
          yZero = axis.translate(0),
          h = Math.abs(y - yZero),
          x = chart.xAxis[0].translate(this.x) + xOffset,
          plotHeight = chart.plotHeight,
          stackBox = {
            x: inverted ? (neg ? y : y - h) : x,
            y: inverted ?
              plotHeight - x - xWidth : (neg ? (plotHeight - y - h) :
                plotHeight - y),
            width: inverted ? h : xWidth,
            height: inverted ? xWidth : h
          },
          label = this.label,
          alignAttr;
        if (label) {
          label.align(this.alignOptions, null, stackBox);
          alignAttr = label.alignAttr;
          label[
            this.options.crop === false || chart.isInsidePlot(
              alignAttr.x,
              alignAttr.y
            ) ? 'show' : 'hide'](true);
        }
      }
    };
    Chart.prototype.getStacks = function() {
      var chart = this;
      each(chart.yAxis, function(axis) {
        if (axis.stacks && axis.hasVisibleSeries) {
          axis.oldStacks = axis.stacks;
        }
      });
      each(chart.series, function(series) {
        if (series.options.stacking && (series.visible === true ||
            chart.options.chart.ignoreHiddenSeries === false)) {
          series.stackKey = series.type + pick(series.options.stack, '');
        }
      });
    };
    Axis.prototype.buildStacks = function() {
      var axisSeries = this.series,
        series,
        reversedStacks = pick(this.options.reversedStacks, true),
        len = axisSeries.length,
        i;
      if (!this.isXAxis) {
        this.usePercentage = false;
        i = len;
        while (i--) {
          axisSeries[reversedStacks ? i : len - i - 1].setStackedPoints();
        }
        i = len;
        while (i--) {
          series = axisSeries[reversedStacks ? i : len - i - 1];
          if (series.setStackCliffs) {
            series.setStackCliffs();
          }
        }
        if (this.usePercentage) {
          for (i = 0; i < len; i++) {
            axisSeries[i].setPercentStacks();
          }
        }
      }
    };
    Axis.prototype.renderStackTotals = function() {
      var axis = this,
        chart = axis.chart,
        renderer = chart.renderer,
        stacks = axis.stacks,
        stackKey,
        oneStack,
        stackCategory,
        stackTotalGroup = axis.stackTotalGroup;
      if (!stackTotalGroup) {
        axis.stackTotalGroup = stackTotalGroup =
          renderer.g('stack-labels')
          .attr({
            visibility: 'visible',
            zIndex: 6
          })
          .add();
      }
      stackTotalGroup.translate(chart.plotLeft, chart.plotTop);
      for (stackKey in stacks) {
        oneStack = stacks[stackKey];
        for (stackCategory in oneStack) {
          oneStack[stackCategory].render(stackTotalGroup);
        }
      }
    };
    Axis.prototype.resetStacks = function() {
      var stacks = this.stacks,
        type,
        i;
      if (!this.isXAxis) {
        for (type in stacks) {
          for (i in stacks[type]) {
            if (stacks[type][i].touched < this.stacksTouched) {
              stacks[type][i].destroy();
              delete stacks[type][i];
            } else {
              stacks[type][i].total = null;
              stacks[type][i].cum = null;
            }
          }
        }
      }
    };
    Axis.prototype.cleanStacks = function() {
      var stacks, type, i;
      if (!this.isXAxis) {
        if (this.oldStacks) {
          stacks = this.stacks = this.oldStacks;
        }
        for (type in stacks) {
          for (i in stacks[type]) {
            stacks[type][i].cum = stacks[type][i].total;
          }
        }
      }
    };
    Series.prototype.setStackedPoints = function() {
      if (!this.options.stacking || (this.visible !== true &&
          this.chart.options.chart.ignoreHiddenSeries !== false)) {
        return;
      }
      var series = this,
        xData = series.processedXData,
        yData = series.processedYData,
        stackedYData = [],
        yDataLength = yData.length,
        seriesOptions = series.options,
        threshold = seriesOptions.threshold,
        stackThreshold = seriesOptions.startFromThreshold ? threshold : 0,
        stackOption = seriesOptions.stack,
        stacking = seriesOptions.stacking,
        stackKey = series.stackKey,
        negKey = '-' + stackKey,
        negStacks = series.negStacks,
        yAxis = series.yAxis,
        stacks = yAxis.stacks,
        oldStacks = yAxis.oldStacks,
        stackIndicator,
        isNegative,
        stack,
        other,
        key,
        pointKey,
        i,
        x,
        y;
      yAxis.stacksTouched += 1;
      for (i = 0; i < yDataLength; i++) {
        x = xData[i];
        y = yData[i];
        stackIndicator = series.getStackIndicator(
          stackIndicator,
          x,
          series.index
        );
        pointKey = stackIndicator.key;
        isNegative = negStacks && y < (stackThreshold ? 0 : threshold);
        key = isNegative ? negKey : stackKey;
        if (!stacks[key]) {
          stacks[key] = {};
        }
        if (!stacks[key][x]) {
          if (oldStacks[key] && oldStacks[key][x]) {
            stacks[key][x] = oldStacks[key][x];
            stacks[key][x].total = null;
          } else {
            stacks[key][x] = new StackItem(
              yAxis,
              yAxis.options.stackLabels,
              isNegative,
              x,
              stackOption
            );
          }
        }
        stack = stacks[key][x];
        if (y !== null) {
          stack.points[pointKey] = stack.points[series.index] = [pick(stack.cum, stackThreshold)];
          if (!defined(stack.cum)) {
            stack.base = pointKey;
          }
          stack.touched = yAxis.stacksTouched;
          if (stackIndicator.index > 0 && series.singleStacks === false) {
            stack.points[pointKey][0] =
              stack.points[series.index + ',' + x + ',0'][0];
          }
        }
        if (stacking === 'percent') {
          other = isNegative ? stackKey : negKey;
          if (negStacks && stacks[other] && stacks[other][x]) {
            other = stacks[other][x];
            stack.total = other.total =
              Math.max(other.total, stack.total) + Math.abs(y) || 0;
          } else {
            stack.total = correctFloat(stack.total + (Math.abs(y) || 0));
          }
        } else {
          stack.total = correctFloat(stack.total + (y || 0));
        }
        stack.cum = pick(stack.cum, stackThreshold) + (y || 0);
        if (y !== null) {
          stack.points[pointKey].push(stack.cum);
          stackedYData[i] = stack.cum;
        }
      }
      if (stacking === 'percent') {
        yAxis.usePercentage = true;
      }
      this.stackedYData = stackedYData;
      yAxis.oldStacks = {};
    };
    Series.prototype.setPercentStacks = function() {
      var series = this,
        stackKey = series.stackKey,
        stacks = series.yAxis.stacks,
        processedXData = series.processedXData,
        stackIndicator;
      each([stackKey, '-' + stackKey], function(key) {
        var i = processedXData.length,
          x,
          stack,
          pointExtremes,
          totalFactor;
        while (i--) {
          x = processedXData[i];
          stackIndicator = series.getStackIndicator(
            stackIndicator,
            x,
            series.index,
            key
          );
          stack = stacks[key] && stacks[key][x];
          pointExtremes = stack && stack.points[stackIndicator.key];
          if (pointExtremes) {
            totalFactor = stack.total ? 100 / stack.total : 0;
            pointExtremes[0] = correctFloat(pointExtremes[0] * totalFactor);
            pointExtremes[1] = correctFloat(pointExtremes[1] * totalFactor);
            series.stackedYData[i] = pointExtremes[1];
          }
        }
      });
    };
    Series.prototype.getStackIndicator = function(stackIndicator, x, index, key) {
      if (!defined(stackIndicator) || stackIndicator.x !== x ||
        (key && stackIndicator.key !== key)) {
        stackIndicator = {
          x: x,
          index: 0,
          key: key
        };
      } else {
        stackIndicator.index++;
      }
      stackIndicator.key = [index, x, stackIndicator.index].join(',');
      return stackIndicator;
    };
  }(Highcharts));
  (function(H) {
    'use strict';
    var addEvent = H.addEvent,
      animate = H.animate,
      Axis = H.Axis,
      Chart = H.Chart,
      createElement = H.createElement,
      css = H.css,
      defined = H.defined,
      each = H.each,
      erase = H.erase,
      extend = H.extend,
      fireEvent = H.fireEvent,
      inArray = H.inArray,
      isNumber = H.isNumber,
      isObject = H.isObject,
      merge = H.merge,
      pick = H.pick,
      Point = H.Point,
      Series = H.Series,
      seriesTypes = H.seriesTypes,
      setAnimation = H.setAnimation,
      splat = H.splat;
    extend(Chart.prototype, {
      addSeries: function(options, redraw, animation) {
        var series,
          chart = this;
        if (options) {
          redraw = pick(redraw, true);
          fireEvent(chart, 'addSeries', {
            options: options
          }, function() {
            series = chart.initSeries(options);
            chart.isDirtyLegend = true;
            chart.linkSeries();
            if (redraw) {
              chart.redraw(animation);
            }
          });
        }
        return series;
      },
      addAxis: function(options, isX, redraw, animation) {
        var key = isX ? 'xAxis' : 'yAxis',
          chartOptions = this.options,
          userOptions = merge(options, {
            index: this[key].length,
            isX: isX
          });
        new Axis(this, userOptions);
        chartOptions[key] = splat(chartOptions[key] || {});
        chartOptions[key].push(userOptions);
        if (pick(redraw, true)) {
          this.redraw(animation);
        }
      },
      showLoading: function(str) {
        var chart = this,
          options = chart.options,
          loadingDiv = chart.loadingDiv,
          loadingOptions = options.loading,
          setLoadingSize = function() {
            if (loadingDiv) {
              css(loadingDiv, {
                left: chart.plotLeft + 'px',
                top: chart.plotTop + 'px',
                width: chart.plotWidth + 'px',
                height: chart.plotHeight + 'px'
              });
            }
          };
        if (!loadingDiv) {
          chart.loadingDiv = loadingDiv = createElement('div', {
            className: 'highcharts-loading highcharts-loading-hidden'
          }, null, chart.container);
          chart.loadingSpan = createElement(
            'span', {
              className: 'highcharts-loading-inner'
            },
            null,
            loadingDiv
          );
          addEvent(chart, 'redraw', setLoadingSize);
        }
        loadingDiv.className = 'highcharts-loading';
        chart.loadingSpan.innerHTML = str || options.lang.loading;
        css(loadingDiv, extend(loadingOptions.style, {
          zIndex: 10
        }));
        css(chart.loadingSpan, loadingOptions.labelStyle);
        if (!chart.loadingShown) {
          css(loadingDiv, {
            opacity: 0,
            display: ''
          });
          animate(loadingDiv, {
            opacity: loadingOptions.style.opacity || 0.5
          }, {
            duration: loadingOptions.showDuration || 0
          });
        }
        chart.loadingShown = true;
        setLoadingSize();
      },
      hideLoading: function() {
        var options = this.options,
          loadingDiv = this.loadingDiv;
        if (loadingDiv) {
          loadingDiv.className = 'highcharts-loading highcharts-loading-hidden';
          animate(loadingDiv, {
            opacity: 0
          }, {
            duration: options.loading.hideDuration || 100,
            complete: function() {
              css(loadingDiv, {
                display: 'none'
              });
            }
          });
        }
        this.loadingShown = false;
      },
      propsRequireDirtyBox: ['backgroundColor', 'borderColor', 'borderWidth', 'margin', 'marginTop', 'marginRight',
        'marginBottom', 'marginLeft', 'spacing', 'spacingTop', 'spacingRight', 'spacingBottom', 'spacingLeft',
        'borderRadius', 'plotBackgroundColor', 'plotBackgroundImage', 'plotBorderColor', 'plotBorderWidth',
        'plotShadow', 'shadow'
      ],
      propsRequireUpdateSeries: ['chart.inverted', 'chart.polar',
        'chart.ignoreHiddenSeries', 'chart.type', 'colors', 'plotOptions'
      ],
      update: function(options, redraw) {
        var key,
          adders = {
            credits: 'addCredits',
            title: 'setTitle',
            subtitle: 'setSubtitle'
          },
          optionsChart = options.chart,
          updateAllAxes,
          updateAllSeries,
          newWidth,
          newHeight;
        if (optionsChart) {
          merge(true, this.options.chart, optionsChart);
          if ('className' in optionsChart) {
            this.setClassName(optionsChart.className);
          }
          if ('inverted' in optionsChart || 'polar' in optionsChart) {
            this.propFromSeries();
            updateAllAxes = true;
          }
          for (key in optionsChart) {
            if (optionsChart.hasOwnProperty(key)) {
              if (inArray('chart.' + key, this.propsRequireUpdateSeries) !== -1) {
                updateAllSeries = true;
              }
              if (inArray(key, this.propsRequireDirtyBox) !== -1) {
                this.isDirtyBox = true;
              }
            }
          }
          if ('style' in optionsChart) {
            this.renderer.setStyle(optionsChart.style);
          }
        }
        for (key in options) {
          if (this[key] && typeof this[key].update === 'function') {
            this[key].update(options[key], false);
          } else if (typeof this[adders[key]] === 'function') {
            this[adders[key]](options[key]);
          }
          if (key !== 'chart' && inArray(key, this.propsRequireUpdateSeries) !== -1) {
            updateAllSeries = true;
          }
        }
        if (options.colors) {
          this.options.colors = options.colors;
        }
        if (options.plotOptions) {
          merge(true, this.options.plotOptions, options.plotOptions);
        }
        each(['xAxis', 'yAxis', 'series'], function(coll) {
          if (options[coll]) {
            each(splat(options[coll]), function(newOptions, i) {
              var item = (
                defined(newOptions.id) &&
                this.get(newOptions.id)
              ) || this[coll][i];
              if (item && item.coll === coll) {
                item.update(newOptions, false);
              }
            }, this);
          }
        }, this);
        if (updateAllAxes) {
          each(this.axes, function(axis) {
            axis.update({}, false);
          });
        }
        if (updateAllSeries) {
          each(this.series, function(series) {
            series.update({}, false);
          });
        }
        if (options.loading) {
          merge(true, this.options.loading, options.loading);
        }
        newWidth = optionsChart && optionsChart.width;
        newHeight = optionsChart && optionsChart.height;
        if ((isNumber(newWidth) && newWidth !== this.chartWidth) ||
          (isNumber(newHeight) && newHeight !== this.chartHeight)) {
          this.setSize(newWidth, newHeight);
        } else if (pick(redraw, true)) {
          this.redraw();
        }
      },
      setSubtitle: function(options) {
        this.setTitle(undefined, options);
      }
    });
    extend(Point.prototype, {
      update: function(options, redraw, animation, runEvent) {
        var point = this,
          series = point.series,
          graphic = point.graphic,
          i,
          chart = series.chart,
          seriesOptions = series.options;
        redraw = pick(redraw, true);

        function update() {
          point.applyOptions(options);
          if (point.y === null && graphic) {
            point.graphic = graphic.destroy();
          }
          if (isObject(options, true)) {
            if (graphic && graphic.element) {
              if (options && options.marker && options.marker.symbol) {
                point.graphic = graphic.destroy();
              }
            }
            if (options && options.dataLabels && point.dataLabel) {
              point.dataLabel = point.dataLabel.destroy();
            }
          }
          i = point.index;
          series.updateParallelArrays(point, i);
          seriesOptions.data[i] = isObject(seriesOptions.data[i], true) ? point.options : options;
          series.isDirty = series.isDirtyData = true;
          if (!series.fixedBox && series.hasCartesianSeries) {
            chart.isDirtyBox = true;
          }
          if (seriesOptions.legendType === 'point') {
            chart.isDirtyLegend = true;
          }
          if (redraw) {
            chart.redraw(animation);
          }
        }
        if (runEvent === false) {
          update();
        } else {
          point.firePointEvent('update', {
            options: options
          }, update);
        }
      },
      remove: function(redraw, animation) {
        this.series.removePoint(inArray(this, this.series.data), redraw, animation);
      }
    });
    extend(Series.prototype, {
      addPoint: function(options, redraw, shift, animation) {
        var series = this,
          seriesOptions = series.options,
          data = series.data,
          chart = series.chart,
          xAxis = series.xAxis,
          names = xAxis && xAxis.hasNames && xAxis.names,
          dataOptions = seriesOptions.data,
          point,
          isInTheMiddle,
          xData = series.xData,
          i,
          x;
        redraw = pick(redraw, true);
        point = {
          series: series
        };
        series.pointClass.prototype.applyOptions.apply(point, [options]);
        x = point.x;
        i = xData.length;
        if (series.requireSorting && x < xData[i - 1]) {
          isInTheMiddle = true;
          while (i && xData[i - 1] > x) {
            i--;
          }
        }
        series.updateParallelArrays(point, 'splice', i, 0, 0);
        series.updateParallelArrays(point, i);
        if (names && point.name) {
          names[x] = point.name;
        }
        dataOptions.splice(i, 0, options);
        if (isInTheMiddle) {
          series.data.splice(i, 0, null);
          series.processData();
        }
        if (seriesOptions.legendType === 'point') {
          series.generatePoints();
        }
        if (shift) {
          if (data[0] && data[0].remove) {
            data[0].remove(false);
          } else {
            data.shift();
            series.updateParallelArrays(point, 'shift');
            dataOptions.shift();
          }
        }
        series.isDirty = true;
        series.isDirtyData = true;
        if (redraw) {
          chart.redraw(animation);
        }
      },
      removePoint: function(i, redraw, animation) {
        var series = this,
          data = series.data,
          point = data[i],
          points = series.points,
          chart = series.chart,
          remove = function() {
            if (points && points.length === data.length) {
              points.splice(i, 1);
            }
            data.splice(i, 1);
            series.options.data.splice(i, 1);
            series.updateParallelArrays(point || {
              series: series
            }, 'splice', i, 1);
            if (point) {
              point.destroy();
            }
            series.isDirty = true;
            series.isDirtyData = true;
            if (redraw) {
              chart.redraw();
            }
          };
        setAnimation(animation, chart);
        redraw = pick(redraw, true);
        if (point) {
          point.firePointEvent('remove', null, remove);
        } else {
          remove();
        }
      },
      remove: function(redraw, animation, withEvent) {
        var series = this,
          chart = series.chart;

        function remove() {
          series.destroy();
          chart.isDirtyLegend = chart.isDirtyBox = true;
          chart.linkSeries();
          if (pick(redraw, true)) {
            chart.redraw(animation);
          }
        }
        if (withEvent !== false) {
          fireEvent(series, 'remove', null, remove);
        } else {
          remove();
        }
      },
      update: function(newOptions, redraw) {
        var series = this,
          chart = this.chart,
          oldOptions = this.userOptions,
          oldType = this.type,
          newType = newOptions.type || oldOptions.type || chart.options.chart.type,
          proto = seriesTypes[oldType].prototype,
          preserve = ['group', 'markerGroup', 'dataLabelsGroup'],
          n;
        if ((newType && newType !== oldType) || newOptions.zIndex !== undefined) {
          preserve.length = 0;
        }
        each(preserve, function(prop) {
          preserve[prop] = series[prop];
          delete series[prop];
        });
        newOptions = merge(oldOptions, {
          animation: false,
          index: this.index,
          pointStart: this.xData[0]
        }, {
          data: this.options.data
        }, newOptions);
        this.remove(false, null, false);
        for (n in proto) {
          this[n] = undefined;
        }
        extend(this, seriesTypes[newType || oldType].prototype);
        each(preserve, function(prop) {
          series[prop] = preserve[prop];
        });
        this.init(chart, newOptions);
        chart.linkSeries();
        if (pick(redraw, true)) {
          chart.redraw(false);
        }
      }
    });
    extend(Axis.prototype, {
      update: function(newOptions, redraw) {
        var chart = this.chart;
        newOptions = chart.options[this.coll][this.options.index] = merge(this.userOptions, newOptions);
        this.destroy(true);
        this.init(chart, extend(newOptions, {
          events: undefined
        }));
        chart.isDirtyBox = true;
        if (pick(redraw, true)) {
          chart.redraw();
        }
      },
      remove: function(redraw) {
        var chart = this.chart,
          key = this.coll,
          axisSeries = this.series,
          i = axisSeries.length;
        while (i--) {
          if (axisSeries[i]) {
            axisSeries[i].remove(false);
          }
        }
        erase(chart.axes, this);
        erase(chart[key], this);
        chart.options[key].splice(this.options.index, 1);
        each(chart[key], function(axis, i) {
          axis.options.index = i;
        });
        this.destroy();
        chart.isDirtyBox = true;
        if (pick(redraw, true)) {
          chart.redraw();
        }
      },
      setTitle: function(newTitleOptions, redraw) {
        this.update({
          title: newTitleOptions
        }, redraw);
      },
      setCategories: function(categories, redraw) {
        this.update({
          categories: categories
        }, redraw);
      }
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var color = H.color,
      each = H.each,
      LegendSymbolMixin = H.LegendSymbolMixin,
      map = H.map,
      pick = H.pick,
      Series = H.Series,
      seriesType = H.seriesType;
    seriesType('area', 'line', {
      softThreshold: false,
      threshold: 0
    }, {
      singleStacks: false,
      getStackPoints: function() {
        var series = this,
          segment = [],
          keys = [],
          xAxis = this.xAxis,
          yAxis = this.yAxis,
          stack = yAxis.stacks[this.stackKey],
          pointMap = {},
          points = this.points,
          seriesIndex = series.index,
          yAxisSeries = yAxis.series,
          seriesLength = yAxisSeries.length,
          visibleSeries,
          upOrDown = pick(yAxis.options.reversedStacks, true) ? 1 : -1,
          i,
          x;
        if (this.options.stacking) {
          for (i = 0; i < points.length; i++) {
            pointMap[points[i].x] = points[i];
          }
          for (x in stack) {
            if (stack[x].total !== null) {
              keys.push(x);
            }
          }
          keys.sort(function(a, b) {
            return a - b;
          });
          visibleSeries = map(yAxisSeries, function() {
            return this.visible;
          });
          each(keys, function(x, idx) {
            var y = 0,
              stackPoint,
              stackedValues;
            if (pointMap[x] && !pointMap[x].isNull) {
              segment.push(pointMap[x]);
              each([-1, 1], function(direction) {
                var nullName = direction === 1 ? 'rightNull' : 'leftNull',
                  cliffName = direction === 1 ? 'rightCliff' : 'leftCliff',
                  cliff = 0,
                  otherStack = stack[keys[idx + direction]];
                if (otherStack) {
                  i = seriesIndex;
                  while (i >= 0 && i < seriesLength) {
                    stackPoint = otherStack.points[i];
                    if (!stackPoint) {
                      if (i === seriesIndex) {
                        pointMap[x][nullName] = true;
                      } else if (visibleSeries[i]) {
                        stackedValues = stack[x].points[i];
                        if (stackedValues) {
                          cliff -= stackedValues[1] - stackedValues[0];
                        }
                      }
                    }
                    i += upOrDown;
                  }
                }
                pointMap[x][cliffName] = cliff;
              });
            } else {
              i = seriesIndex;
              while (i >= 0 && i < seriesLength) {
                stackPoint = stack[x].points[i];
                if (stackPoint) {
                  y = stackPoint[1];
                  break;
                }
                i += upOrDown;
              }
              y = yAxis.toPixels(y, true);
              segment.push({
                isNull: true,
                plotX: xAxis.toPixels(x, true),
                plotY: y,
                yBottom: y
              });
            }
          });
        }
        return segment;
      },
      getGraphPath: function(points) {
        var getGraphPath = Series.prototype.getGraphPath,
          graphPath,
          options = this.options,
          stacking = options.stacking,
          yAxis = this.yAxis,
          topPath,
          bottomPath,
          bottomPoints = [],
          graphPoints = [],
          seriesIndex = this.index,
          i,
          areaPath,
          plotX,
          stacks = yAxis.stacks[this.stackKey],
          threshold = options.threshold,
          translatedThreshold = yAxis.getThreshold(options.threshold),
          isNull,
          yBottom,
          connectNulls = options.connectNulls || stacking === 'percent',
          addDummyPoints = function(i, otherI, side) {
            var point = points[i],
              stackedValues = stacking && stacks[point.x].points[seriesIndex],
              nullVal = point[side + 'Null'] || 0,
              cliffVal = point[side + 'Cliff'] || 0,
              top,
              bottom,
              isNull = true;
            if (cliffVal || nullVal) {
              top = (nullVal ? stackedValues[0] : stackedValues[1]) + cliffVal;
              bottom = stackedValues[0] + cliffVal;
              isNull = !!nullVal;
            } else if (!stacking && points[otherI] && points[otherI].isNull) {
              top = bottom = threshold;
            }
            if (top !== undefined) {
              graphPoints.push({
                plotX: plotX,
                plotY: top === null ? translatedThreshold : yAxis.getThreshold(top),
                isNull: isNull
              });
              bottomPoints.push({
                plotX: plotX,
                plotY: bottom === null ? translatedThreshold : yAxis.getThreshold(bottom),
                doCurve: false
              });
            }
          };
        points = points || this.points;
        if (stacking) {
          points = this.getStackPoints();
        }
        for (i = 0; i < points.length; i++) {
          isNull = points[i].isNull;
          plotX = pick(points[i].rectPlotX, points[i].plotX);
          yBottom = pick(points[i].yBottom, translatedThreshold);
          if (!isNull || connectNulls) {
            if (!connectNulls) {
              addDummyPoints(i, i - 1, 'left');
            }
            if (!(isNull && !stacking && connectNulls)) {
              graphPoints.push(points[i]);
              bottomPoints.push({
                x: i,
                plotX: plotX,
                plotY: yBottom
              });
            }
            if (!connectNulls) {
              addDummyPoints(i, i + 1, 'right');
            }
          }
        }
        topPath = getGraphPath.call(this, graphPoints, true, true);
        bottomPoints.reversed = true;
        bottomPath = getGraphPath.call(this, bottomPoints, true, true);
        if (bottomPath.length) {
          bottomPath[0] = 'L';
        }
        areaPath = topPath.concat(bottomPath);
        graphPath = getGraphPath.call(this, graphPoints, false, connectNulls);
        areaPath.xMap = topPath.xMap;
        this.areaPath = areaPath;
        return graphPath;
      },
      drawGraph: function() {
        this.areaPath = [];
        Series.prototype.drawGraph.apply(this);
        var series = this,
          areaPath = this.areaPath,
          options = this.options,
          zones = this.zones,
          props = [
            [
              'area',
              'highcharts-area',
              this.color,
              options.fillColor
            ]
          ];
        each(zones, function(zone, i) {
          props.push([
            'zone-area-' + i,
            'highcharts-area highcharts-zone-area-' + i + ' ' + zone.className,
            zone.color || series.color,
            zone.fillColor || options.fillColor
          ]);
        });
        each(props, function(prop) {
          var areaKey = prop[0],
            area = series[areaKey];
          if (area) {
            area.endX = areaPath.xMap;
            area.animate({
              d: areaPath
            });
          } else {
            area = series[areaKey] = series.chart.renderer.path(areaPath)
              .addClass(prop[1])
              .attr({
                fill: pick(
                  prop[3],
                  color(prop[2]).setOpacity(pick(options.fillOpacity, 0.75)).get()
                ),
                zIndex: 0
              }).add(series.group);
            area.isArea = true;
          }
          area.startX = areaPath.xMap;
          area.shiftUnit = options.step ? 2 : 1;
        });
      },
      drawLegendSymbol: LegendSymbolMixin.drawRectangle
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var pick = H.pick,
      seriesType = H.seriesType;
    seriesType('spline', 'line', {}, {
      getPointSpline: function(points, point, i) {
        var smoothing = 1.5,
          denom = smoothing + 1,
          plotX = point.plotX,
          plotY = point.plotY,
          lastPoint = points[i - 1],
          nextPoint = points[i + 1],
          leftContX,
          leftContY,
          rightContX,
          rightContY,
          ret;

        function doCurve(otherPoint) {
          return otherPoint && !otherPoint.isNull && otherPoint.doCurve !== false;
        }
        if (doCurve(lastPoint) && doCurve(nextPoint)) {
          var lastX = lastPoint.plotX,
            lastY = lastPoint.plotY,
            nextX = nextPoint.plotX,
            nextY = nextPoint.plotY,
            correction = 0;
          leftContX = (smoothing * plotX + lastX) / denom;
          leftContY = (smoothing * plotY + lastY) / denom;
          rightContX = (smoothing * plotX + nextX) / denom;
          rightContY = (smoothing * plotY + nextY) / denom;
          if (rightContX !== leftContX) {
            correction = ((rightContY - leftContY) * (rightContX - plotX)) /
              (rightContX - leftContX) + plotY - rightContY;
          }
          leftContY += correction;
          rightContY += correction;
          if (leftContY > lastY && leftContY > plotY) {
            leftContY = Math.max(lastY, plotY);
            rightContY = 2 * plotY - leftContY;
          } else if (leftContY < lastY && leftContY < plotY) {
            leftContY = Math.min(lastY, plotY);
            rightContY = 2 * plotY - leftContY;
          }
          if (rightContY > nextY && rightContY > plotY) {
            rightContY = Math.max(nextY, plotY);
            leftContY = 2 * plotY - rightContY;
          } else if (rightContY < nextY && rightContY < plotY) {
            rightContY = Math.min(nextY, plotY);
            leftContY = 2 * plotY - rightContY;
          }
          point.rightContX = rightContX;
          point.rightContY = rightContY;
        }
        ret = [
          'C',
          pick(lastPoint.rightContX, lastPoint.plotX),
          pick(lastPoint.rightContY, lastPoint.plotY),
          pick(leftContX, plotX),
          pick(leftContY, plotY),
          plotX,
          plotY
        ];
        lastPoint.rightContX = lastPoint.rightContY = null;
        return ret;
      }
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var areaProto = H.seriesTypes.area.prototype,
      defaultPlotOptions = H.defaultPlotOptions,
      LegendSymbolMixin = H.LegendSymbolMixin,
      seriesType = H.seriesType;
    seriesType('areaspline', 'spline', defaultPlotOptions.area, {
      getStackPoints: areaProto.getStackPoints,
      getGraphPath: areaProto.getGraphPath,
      setStackCliffs: areaProto.setStackCliffs,
      drawGraph: areaProto.drawGraph,
      drawLegendSymbol: LegendSymbolMixin.drawRectangle
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var animObject = H.animObject,
      color = H.color,
      each = H.each,
      extend = H.extend,
      isNumber = H.isNumber,
      LegendSymbolMixin = H.LegendSymbolMixin,
      merge = H.merge,
      noop = H.noop,
      pick = H.pick,
      Series = H.Series,
      seriesType = H.seriesType,
      svg = H.svg;
    seriesType('column', 'line', {
      borderRadius: 0,
      groupPadding: 0.2,
      marker: null,
      pointPadding: 0.1,
      minPointLength: 0,
      cropThreshold: 50,
      pointRange: null,
      states: {
        hover: {
          halo: false,
          brightness: 0.1,
          shadow: false
        },
        select: {
          color: '#cccccc',
          borderColor: '#000000',
          shadow: false
        }
      },
      dataLabels: {
        align: null,
        verticalAlign: null,
        y: null
      },
      softThreshold: false,
      startFromThreshold: true,
      stickyTracking: false,
      tooltip: {
        distance: 6
      },
      threshold: 0,
      borderColor: '#ffffff'
    }, {
      cropShoulder: 0,
      directTouch: true,
      trackerGroups: ['group', 'dataLabelsGroup'],
      negStacks: true,
      init: function() {
        Series.prototype.init.apply(this, arguments);
        var series = this,
          chart = series.chart;
        if (chart.hasRendered) {
          each(chart.series, function(otherSeries) {
            if (otherSeries.type === series.type) {
              otherSeries.isDirty = true;
            }
          });
        }
      },
      getColumnMetrics: function() {
        var series = this,
          options = series.options,
          xAxis = series.xAxis,
          yAxis = series.yAxis,
          reversedXAxis = xAxis.reversed,
          stackKey,
          stackGroups = {},
          columnCount = 0;
        if (options.grouping === false) {
          columnCount = 1;
        } else {
          each(series.chart.series, function(otherSeries) {
            var otherOptions = otherSeries.options,
              otherYAxis = otherSeries.yAxis,
              columnIndex;
            if (otherSeries.type === series.type && otherSeries.visible &&
              yAxis.len === otherYAxis.len && yAxis.pos === otherYAxis.pos) {
              if (otherOptions.stacking) {
                stackKey = otherSeries.stackKey;
                if (stackGroups[stackKey] === undefined) {
                  stackGroups[stackKey] = columnCount++;
                }
                columnIndex = stackGroups[stackKey];
              } else if (otherOptions.grouping !== false) {
                columnIndex = columnCount++;
              }
              otherSeries.columnIndex = columnIndex;
            }
          });
        }
        var categoryWidth = Math.min(
            Math.abs(xAxis.transA) * (xAxis.ordinalSlope || options.pointRange || xAxis.closestPointRange || xAxis.tickInterval || 1),
            xAxis.len
          ),
          groupPadding = categoryWidth * options.groupPadding,
          groupWidth = categoryWidth - 2 * groupPadding,
          pointOffsetWidth = groupWidth / (columnCount || 1),
          pointWidth = Math.min(
            options.maxPointWidth || xAxis.len,
            pick(options.pointWidth, pointOffsetWidth * (1 - 2 * options.pointPadding))
          ),
          pointPadding = (pointOffsetWidth - pointWidth) / 2,
          colIndex = (series.columnIndex || 0) + (reversedXAxis ? 1 : 0),
          pointXOffset = pointPadding + (groupPadding + colIndex *
            pointOffsetWidth - (categoryWidth / 2)) *
          (reversedXAxis ? -1 : 1);
        series.columnMetrics = {
          width: pointWidth,
          offset: pointXOffset
        };
        return series.columnMetrics;
      },
      crispCol: function(x, y, w, h) {
        var chart = this.chart,
          borderWidth = this.borderWidth,
          xCrisp = -(borderWidth % 2 ? 0.5 : 0),
          yCrisp = borderWidth % 2 ? 0.5 : 1,
          right,
          bottom,
          fromTop;
        if (chart.inverted && chart.renderer.isVML) {
          yCrisp += 1;
        }
        right = Math.round(x + w) + xCrisp;
        x = Math.round(x) + xCrisp;
        w = right - x;
        bottom = Math.round(y + h) + yCrisp;
        fromTop = Math.abs(y) <= 0.5 && bottom > 0.5;
        y = Math.round(y) + yCrisp;
        h = bottom - y;
        if (fromTop && h) {
          y -= 1;
          h += 1;
        }
        return {
          x: x,
          y: y,
          width: w,
          height: h
        };
      },
      translate: function() {
        var series = this,
          chart = series.chart,
          options = series.options,
          dense = series.dense = series.closestPointRange * series.xAxis.transA < 2,
          borderWidth = series.borderWidth = pick(
            options.borderWidth,
            dense ? 0 : 1
          ),
          yAxis = series.yAxis,
          threshold = options.threshold,
          translatedThreshold = series.translatedThreshold = yAxis.getThreshold(threshold),
          minPointLength = pick(options.minPointLength, 5),
          metrics = series.getColumnMetrics(),
          pointWidth = metrics.width,
          seriesBarW = series.barW = Math.max(pointWidth, 1 + 2 * borderWidth),
          pointXOffset = series.pointXOffset = metrics.offset;
        if (chart.inverted) {
          translatedThreshold -= 0.5;
        }
        if (options.pointPadding) {
          seriesBarW = Math.ceil(seriesBarW);
        }
        Series.prototype.translate.apply(series);
        each(series.points, function(point) {
          var yBottom = pick(point.yBottom, translatedThreshold),
            safeDistance = 999 + Math.abs(yBottom),
            plotY = Math.min(Math.max(-safeDistance, point.plotY), yAxis.len + safeDistance),
            barX = point.plotX + pointXOffset,
            barW = seriesBarW,
            barY = Math.min(plotY, yBottom),
            up,
            barH = Math.max(plotY, yBottom) - barY;
          if (Math.abs(barH) < minPointLength) {
            if (minPointLength) {
              barH = minPointLength;
              up = (!yAxis.reversed && !point.negative) || (yAxis.reversed && point.negative);
              barY = Math.abs(barY - translatedThreshold) > minPointLength ?
                yBottom - minPointLength :
                translatedThreshold - (up ? minPointLength : 0);
            }
          }
          point.barX = barX;
          point.pointWidth = pointWidth;
          point.tooltipPos = chart.inverted ? [yAxis.len + yAxis.pos - chart.plotLeft - plotY, series.xAxis.len - barX - barW / 2, barH] : [barX + barW / 2, plotY + yAxis.pos - chart.plotTop, barH];
          point.shapeType = 'rect';
          point.shapeArgs = series.crispCol.apply(
            series,
            point.isNull ? [point.plotX, yAxis.len / 2, 0, 0] : [barX, barY, barW, barH]
          );
        });
      },
      getSymbol: noop,
      drawLegendSymbol: LegendSymbolMixin.drawRectangle,
      drawGraph: function() {
        this.group[this.dense ? 'addClass' : 'removeClass']('highcharts-dense-data');
      },
      pointAttribs: function(point, state) {
        var options = this.options,
          stateOptions,
          ret,
          p2o = this.pointAttrToOptions || {},
          strokeOption = p2o.stroke || 'borderColor',
          strokeWidthOption = p2o['stroke-width'] || 'borderWidth',
          fill = (point && point.color) || this.color,
          stroke = point[strokeOption] || options[strokeOption] ||
          this.color || fill,
          strokeWidth = point[strokeWidthOption] ||
          options[strokeWidthOption] || this[strokeWidthOption] || 0,
          dashstyle = options.dashStyle,
          zone,
          brightness;
        if (point && this.zones.length) {
          zone = point.getZone();
          fill = (zone && zone.color) || point.options.color || this.color;
        }
        if (state) {
          stateOptions = options.states[state];
          brightness = stateOptions.brightness;
          fill = stateOptions.color ||
            (brightness !== undefined && color(fill).brighten(stateOptions.brightness).get()) ||
            fill;
          stroke = stateOptions[strokeOption] || stroke;
          strokeWidth = stateOptions[strokeWidthOption] || strokeWidth;
          dashstyle = stateOptions.dashStyle || dashstyle;
        }
        ret = {
          'fill': fill,
          'stroke': stroke,
          'stroke-width': strokeWidth
        };
        if (options.borderRadius) {
          ret.r = options.borderRadius;
        }
        if (dashstyle) {
          ret.dashstyle = dashstyle;
        }
        return ret;
      },
      drawPoints: function() {
        var series = this,
          chart = this.chart,
          options = series.options,
          renderer = chart.renderer,
          animationLimit = options.animationLimit || 250,
          shapeArgs;
        each(series.points, function(point) {
          var plotY = point.plotY,
            graphic = point.graphic;
          if (isNumber(plotY) && point.y !== null) {
            shapeArgs = point.shapeArgs;
            if (graphic) {
              graphic[chart.pointCount < animationLimit ? 'animate' : 'attr'](
                merge(shapeArgs)
              );
            } else {
              point.graphic = graphic = renderer[point.shapeType](shapeArgs)
                .attr({
                  'class': point.getClassName()
                })
                .add(point.group || series.group);
            }
            graphic
              .attr(series.pointAttribs(point, point.selected && 'select'))
              .shadow(options.shadow, null, options.stacking && !options.borderRadius);
          } else if (graphic) {
            point.graphic = graphic.destroy();
          }
        });
      },
      animate: function(init) {
        var series = this,
          yAxis = this.yAxis,
          options = series.options,
          inverted = this.chart.inverted,
          attr = {},
          translatedThreshold;
        if (svg) {
          if (init) {
            attr.scaleY = 0.001;
            translatedThreshold = Math.min(yAxis.pos + yAxis.len, Math.max(yAxis.pos, yAxis.toPixels(options.threshold)));
            if (inverted) {
              attr.translateX = translatedThreshold - yAxis.len;
            } else {
              attr.translateY = translatedThreshold;
            }
            series.group.attr(attr);
          } else {
            attr[inverted ? 'translateX' : 'translateY'] = yAxis.pos;
            series.group.animate(attr, extend(animObject(series.options.animation), {
              step: function(val, fx) {
                series.group.attr({
                  scaleY: Math.max(0.001, fx.pos)
                });
              }
            }));
            series.animate = null;
          }
        }
      },
      remove: function() {
        var series = this,
          chart = series.chart;
        if (chart.hasRendered) {
          each(chart.series, function(otherSeries) {
            if (otherSeries.type === series.type) {
              otherSeries.isDirty = true;
            }
          });
        }
        Series.prototype.remove.apply(series, arguments);
      }
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var seriesType = H.seriesType;
    seriesType('bar', 'column', null, {
      inverted: true
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var Series = H.Series,
      seriesType = H.seriesType;
    seriesType('scatter', 'line', {
      lineWidth: 0,
      marker: {
        enabled: true
      },
      tooltip: {
        headerFormat: '<span style="color:{point.color}">\u25CF</span> ' +
          '<span style="font-size: 0.85em"> {series.name}</span><br/>',
        pointFormat: 'x: <b>{point.x}</b><br/>y: <b>{point.y}</b><br/>'
      }
    }, {
      sorted: false,
      requireSorting: false,
      noSharedTooltip: true,
      trackerGroups: ['group', 'markerGroup', 'dataLabelsGroup'],
      takeOrdinalPosition: false,
      kdDimensions: 2,
      drawGraph: function() {
        if (this.options.lineWidth) {
          Series.prototype.drawGraph.call(this);
        }
      }
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var pick = H.pick,
      relativeLength = H.relativeLength;
    H.CenteredSeriesMixin = {
      getCenter: function() {
        var options = this.options,
          chart = this.chart,
          slicingRoom = 2 * (options.slicedOffset || 0),
          handleSlicingRoom,
          plotWidth = chart.plotWidth - 2 * slicingRoom,
          plotHeight = chart.plotHeight - 2 * slicingRoom,
          centerOption = options.center,
          positions = [pick(centerOption[0], '50%'), pick(centerOption[1], '50%'), options.size || '100%', options.innerSize || 0],
          smallestSize = Math.min(plotWidth, plotHeight),
          i,
          value;
        for (i = 0; i < 4; ++i) {
          value = positions[i];
          handleSlicingRoom = i < 2 || (i === 2 && /%$/.test(value));
          positions[i] = relativeLength(value, [plotWidth, plotHeight, smallestSize, positions[2]][i]) +
            (handleSlicingRoom ? slicingRoom : 0);
        }
        if (positions[3] > positions[2]) {
          positions[3] = positions[2];
        }
        return positions;
      }
    };
  }(Highcharts));
  (function(H) {
    'use strict';
    var addEvent = H.addEvent,
      CenteredSeriesMixin = H.CenteredSeriesMixin,
      defined = H.defined,
      each = H.each,
      extend = H.extend,
      inArray = H.inArray,
      LegendSymbolMixin = H.LegendSymbolMixin,
      noop = H.noop,
      pick = H.pick,
      Point = H.Point,
      Series = H.Series,
      seriesType = H.seriesType,
      seriesTypes = H.seriesTypes,
      setAnimation = H.setAnimation;
    seriesType('pie', 'line', {
      center: [null, null],
      clip: false,
      colorByPoint: true,
      dataLabels: {
        distance: 30,
        enabled: true,
        formatter: function() {
          return this.y === null ? undefined : this.point.name;
        },
        x: 0
      },
      ignoreHiddenPoint: true,
      legendType: 'point',
      marker: null,
      size: null,
      showInLegend: false,
      slicedOffset: 10,
      stickyTracking: false,
      tooltip: {
        followPointer: true
      },
      borderColor: '#ffffff',
      borderWidth: 1,
      states: {
        hover: {
          brightness: 0.1,
          shadow: false
        }
      }
    }, {
      isCartesian: false,
      requireSorting: false,
      directTouch: true,
      noSharedTooltip: true,
      trackerGroups: ['group', 'dataLabelsGroup'],
      axisTypes: [],
      pointAttribs: seriesTypes.column.prototype.pointAttribs,
      animate: function(init) {
        var series = this,
          points = series.points,
          startAngleRad = series.startAngleRad;
        if (!init) {
          each(points, function(point) {
            var graphic = point.graphic,
              args = point.shapeArgs;
            if (graphic) {
              graphic.attr({
                r: point.startR || (series.center[3] / 2),
                start: startAngleRad,
                end: startAngleRad
              });
              graphic.animate({
                r: args.r,
                start: args.start,
                end: args.end
              }, series.options.animation);
            }
          });
          series.animate = null;
        }
      },
      updateTotals: function() {
        var i,
          total = 0,
          points = this.points,
          len = points.length,
          point,
          ignoreHiddenPoint = this.options.ignoreHiddenPoint;
        for (i = 0; i < len; i++) {
          point = points[i];
          if (point.y < 0) {
            point.y = null;
          }
          total += (ignoreHiddenPoint && !point.visible) ? 0 : point.y;
        }
        this.total = total;
        for (i = 0; i < len; i++) {
          point = points[i];
          point.percentage = (total > 0 && (point.visible || !ignoreHiddenPoint)) ? point.y / total * 100 : 0;
          point.total = total;
        }
      },
      generatePoints: function() {
        Series.prototype.generatePoints.call(this);
        this.updateTotals();
      },
      translate: function(positions) {
        this.generatePoints();
        var series = this,
          cumulative = 0,
          precision = 1000,
          options = series.options,
          slicedOffset = options.slicedOffset,
          connectorOffset = slicedOffset + (options.borderWidth || 0),
          start,
          end,
          angle,
          startAngle = options.startAngle || 0,
          startAngleRad = series.startAngleRad = Math.PI / 180 * (startAngle - 90),
          endAngleRad = series.endAngleRad = Math.PI / 180 * ((pick(options.endAngle, startAngle + 360)) - 90),
          circ = endAngleRad - startAngleRad,
          points = series.points,
          radiusX,
          radiusY,
          labelDistance = options.dataLabels.distance,
          ignoreHiddenPoint = options.ignoreHiddenPoint,
          i,
          len = points.length,
          point;
        if (!positions) {
          series.center = positions = series.getCenter();
        }
        series.getX = function(y, left) {
          angle = Math.asin(Math.min((y - positions[1]) / (positions[2] / 2 + labelDistance), 1));
          return positions[0] +
            (left ? -1 : 1) *
            (Math.cos(angle) * (positions[2] / 2 + labelDistance));
        };
        for (i = 0; i < len; i++) {
          point = points[i];
          start = startAngleRad + (cumulative * circ);
          if (!ignoreHiddenPoint || point.visible) {
            cumulative += point.percentage / 100;
          }
          end = startAngleRad + (cumulative * circ);
          point.shapeType = 'arc';
          point.shapeArgs = {
            x: positions[0],
            y: positions[1],
            r: positions[2] / 2,
            innerR: positions[3] / 2,
            start: Math.round(start * precision) / precision,
            end: Math.round(end * precision) / precision
          };
          angle = (end + start) / 2;
          if (angle > 1.5 * Math.PI) {
            angle -= 2 * Math.PI;
          } else if (angle < -Math.PI / 2) {
            angle += 2 * Math.PI;
          }
          point.slicedTranslation = {
            translateX: Math.round(Math.cos(angle) * slicedOffset),
            translateY: Math.round(Math.sin(angle) * slicedOffset)
          };
          radiusX = Math.cos(angle) * positions[2] / 2;
          radiusY = Math.sin(angle) * positions[2] / 2;
          point.tooltipPos = [
            positions[0] + radiusX * 0.7,
            positions[1] + radiusY * 0.7
          ];
          point.half = angle < -Math.PI / 2 || angle > Math.PI / 2 ? 1 : 0;
          point.angle = angle;
          connectorOffset = Math.min(connectorOffset, labelDistance / 5);
          point.labelPos = [
            positions[0] + radiusX + Math.cos(angle) * labelDistance,
            positions[1] + radiusY + Math.sin(angle) * labelDistance,
            positions[0] + radiusX + Math.cos(angle) * connectorOffset,
            positions[1] + radiusY + Math.sin(angle) * connectorOffset,
            positions[0] + radiusX,
            positions[1] + radiusY,
            labelDistance < 0 ?
            'center' :
            point.half ? 'right' : 'left',
            angle
          ];
        }
      },
      drawGraph: null,
      drawPoints: function() {
        var series = this,
          chart = series.chart,
          renderer = chart.renderer,
          groupTranslation,
          graphic,
          pointAttr,
          shapeArgs;
        var shadow = series.options.shadow;
        if (shadow && !series.shadowGroup) {
          series.shadowGroup = renderer.g('shadow')
            .add(series.group);
        }
        each(series.points, function(point) {
          if (point.y !== null) {
            graphic = point.graphic;
            shapeArgs = point.shapeArgs;
            groupTranslation = point.sliced ? point.slicedTranslation : {};
            var shadowGroup = point.shadowGroup;
            if (shadow && !shadowGroup) {
              shadowGroup = point.shadowGroup = renderer.g('shadow')
                .add(series.shadowGroup);
            }
            if (shadowGroup) {
              shadowGroup.attr(groupTranslation);
            }
            pointAttr = series.pointAttribs(point, point.selected && 'select');
            if (graphic) {
              graphic
                .setRadialReference(series.center)
                .attr(pointAttr)
                .animate(extend(shapeArgs, groupTranslation));
            } else {
              point.graphic = graphic = renderer[point.shapeType](shapeArgs)
                .addClass(point.getClassName())
                .setRadialReference(series.center)
                .attr(groupTranslation)
                .add(series.group);
              if (!point.visible) {
                graphic.attr({
                  visibility: 'hidden'
                });
              }
              graphic
                .attr(pointAttr)
                .attr({
                  'stroke-linejoin': 'round'
                })
                .shadow(shadow, shadowGroup);
            }
          }
        });
      },
      searchPoint: noop,
      sortByAngle: function(points, sign) {
        points.sort(function(a, b) {
          return a.angle !== undefined && (b.angle - a.angle) * sign;
        });
      },
      drawLegendSymbol: LegendSymbolMixin.drawRectangle,
      getCenter: CenteredSeriesMixin.getCenter,
      getSymbol: noop
    }, {
      init: function() {
        Point.prototype.init.apply(this, arguments);
        var point = this,
          toggleSlice;
        point.name = pick(point.name, 'Slice');
        toggleSlice = function(e) {
          point.slice(e.type === 'select');
        };
        addEvent(point, 'select', toggleSlice);
        addEvent(point, 'unselect', toggleSlice);
        return point;
      },
      setVisible: function(vis, redraw) {
        var point = this,
          series = point.series,
          chart = series.chart,
          ignoreHiddenPoint = series.options.ignoreHiddenPoint;
        redraw = pick(redraw, ignoreHiddenPoint);
        if (vis !== point.visible) {
          point.visible = point.options.visible = vis = vis === undefined ? !point.visible : vis;
          series.options.data[inArray(point, series.data)] = point.options;
          each(['graphic', 'dataLabel', 'connector', 'shadowGroup'], function(key) {
            if (point[key]) {
              point[key][vis ? 'show' : 'hide'](true);
            }
          });
          if (point.legendItem) {
            chart.legend.colorizeItem(point, vis);
          }
          if (!vis && point.state === 'hover') {
            point.setState('');
          }
          if (ignoreHiddenPoint) {
            series.isDirty = true;
          }
          if (redraw) {
            chart.redraw();
          }
        }
      },
      slice: function(sliced, redraw, animation) {
        var point = this,
          series = point.series,
          chart = series.chart,
          translation;
        setAnimation(animation, chart);
        redraw = pick(redraw, true);
        point.sliced = point.options.sliced = sliced = defined(sliced) ? sliced : !point.sliced;
        series.options.data[inArray(point, series.data)] = point.options;
        translation = sliced ? point.slicedTranslation : {
          translateX: 0,
          translateY: 0
        };
        point.graphic.animate(translation);
        if (point.shadowGroup) {
          point.shadowGroup.animate(translation);
        }
      },
      haloPath: function(size) {
        var shapeArgs = this.shapeArgs;
        return this.sliced || !this.visible ? [] :
          this.series.chart.renderer.symbols.arc(
            shapeArgs.x,
            shapeArgs.y,
            shapeArgs.r + size,
            shapeArgs.r + size, {
              innerR: this.shapeArgs.r,
              start: shapeArgs.start,
              end: shapeArgs.end
            }
          );
      }
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var addEvent = H.addEvent,
      arrayMax = H.arrayMax,
      defined = H.defined,
      each = H.each,
      extend = H.extend,
      format = H.format,
      map = H.map,
      merge = H.merge,
      noop = H.noop,
      pick = H.pick,
      relativeLength = H.relativeLength,
      Series = H.Series,
      seriesTypes = H.seriesTypes,
      stableSort = H.stableSort;
    H.distribute = function(boxes, len) {
      var i,
        overlapping = true,
        origBoxes = boxes,
        restBoxes = [],
        box,
        target,
        total = 0;

      function sortByTarget(a, b) {
        return a.target - b.target;
      }
      i = boxes.length;
      while (i--) {
        total += boxes[i].size;
      }
      if (total > len) {
        stableSort(boxes, function(a, b) {
          return (b.rank || 0) - (a.rank || 0);
        });
        i = 0;
        total = 0;
        while (total <= len) {
          total += boxes[i].size;
          i++;
        }
        restBoxes = boxes.splice(i - 1, boxes.length);
      }
      stableSort(boxes, sortByTarget);
      boxes = map(boxes, function(box) {
        return {
          size: box.size,
          targets: [box.target]
        };
      });
      while (overlapping) {
        i = boxes.length;
        while (i--) {
          box = boxes[i];
          target = (Math.min.apply(0, box.targets) + Math.max.apply(0, box.targets)) / 2;
          box.pos = Math.min(Math.max(0, target - box.size / 2), len - box.size);
        }
        i = boxes.length;
        overlapping = false;
        while (i--) {
          if (i > 0 && boxes[i - 1].pos + boxes[i - 1].size > boxes[i].pos) {
            boxes[i - 1].size += boxes[i].size;
            boxes[i - 1].targets = boxes[i - 1].targets.concat(boxes[i].targets);
            if (boxes[i - 1].pos + boxes[i - 1].size > len) {
              boxes[i - 1].pos = len - boxes[i - 1].size;
            }
            boxes.splice(i, 1);
            overlapping = true;
          }
        }
      }
      i = 0;
      each(boxes, function(box) {
        var posInCompositeBox = 0;
        each(box.targets, function() {
          origBoxes[i].pos = box.pos + posInCompositeBox;
          posInCompositeBox += origBoxes[i].size;
          i++;
        });
      });
      origBoxes.push.apply(origBoxes, restBoxes);
      stableSort(origBoxes, sortByTarget);
    };
    Series.prototype.drawDataLabels = function() {
      var series = this,
        seriesOptions = series.options,
        options = seriesOptions.dataLabels,
        points = series.points,
        pointOptions,
        generalOptions,
        hasRendered = series.hasRendered || 0,
        str,
        dataLabelsGroup,
        defer = pick(options.defer, true),
        renderer = series.chart.renderer;
      if (options.enabled || series._hasPointLabels) {
        if (series.dlProcessOptions) {
          series.dlProcessOptions(options);
        }
        dataLabelsGroup = series.plotGroup(
          'dataLabelsGroup',
          'data-labels',
          defer && !hasRendered ? 'hidden' : 'visible',
          options.zIndex || 6
        );
        if (defer) {
          dataLabelsGroup.attr({
            opacity: +hasRendered
          });
          if (!hasRendered) {
            addEvent(series, 'afterAnimate', function() {
              if (series.visible) {
                dataLabelsGroup.show(true);
              }
              dataLabelsGroup[seriesOptions.animation ? 'animate' : 'attr']({
                opacity: 1
              }, {
                duration: 200
              });
            });
          }
        }
        generalOptions = options;
        each(points, function(point) {
          var enabled,
            dataLabel = point.dataLabel,
            labelConfig,
            attr,
            name,
            rotation,
            connector = point.connector,
            isNew = !dataLabel,
            style;
          pointOptions = point.dlOptions || (point.options && point.options.dataLabels);
          enabled = pick(pointOptions && pointOptions.enabled, generalOptions.enabled) && point.y !== null;
          if (enabled) {
            options = merge(generalOptions, pointOptions);
            labelConfig = point.getLabelConfig();
            str = options.format ?
              format(options.format, labelConfig) :
              options.formatter.call(labelConfig, options);
            style = options.style;
            rotation = options.rotation;
            style.color = pick(options.color, style.color, series.color, '#000000');
            if (style.color === 'contrast') {
              style.color = options.inside || options.distance < 0 || !!seriesOptions.stacking ?
                renderer.getContrast(point.color || series.color) :
                '#000000';
            }
            if (seriesOptions.cursor) {
              style.cursor = seriesOptions.cursor;
            }
            attr = {
              fill: options.backgroundColor,
              stroke: options.borderColor,
              'stroke-width': options.borderWidth,
              r: options.borderRadius || 0,
              rotation: rotation,
              padding: options.padding,
              zIndex: 1
            };
            for (name in attr) {
              if (attr[name] === undefined) {
                delete attr[name];
              }
            }
          }
          if (dataLabel && (!enabled || !defined(str))) {
            point.dataLabel = dataLabel = dataLabel.destroy();
            if (connector) {
              point.connector = connector.destroy();
            }
          } else if (enabled && defined(str)) {
            if (!dataLabel) {
              dataLabel = point.dataLabel = renderer[rotation ? 'text' : 'label'](
                str,
                0, -9999,
                options.shape,
                null,
                null,
                options.useHTML,
                null,
                'data-label'
              );
              dataLabel.addClass(
                'highcharts-data-label-color-' + point.colorIndex +
                ' ' + (options.className || '') +
                (options.useHTML ? 'highcharts-tracker' : '')
              );
            } else {
              attr.text = str;
            }
            dataLabel.attr(attr);
            dataLabel.css(style).shadow(options.shadow);
            if (!dataLabel.added) {
              dataLabel.add(dataLabelsGroup);
            }
            series.alignDataLabel(point, dataLabel, options, null, isNew);
          }
        });
      }
    };
    Series.prototype.alignDataLabel = function(point, dataLabel, options, alignTo, isNew) {
      var chart = this.chart,
        inverted = chart.inverted,
        plotX = pick(point.plotX, -9999),
        plotY = pick(point.plotY, -9999),
        bBox = dataLabel.getBBox(),
        fontSize,
        baseline,
        rotation = options.rotation,
        normRotation,
        negRotation,
        align = options.align,
        rotCorr,
        visible =
        this.visible &&
        (
          point.series.forceDL ||
          chart.isInsidePlot(plotX, Math.round(plotY), inverted) ||
          (
            alignTo && chart.isInsidePlot(
              plotX,
              inverted ? alignTo.x + 1 : alignTo.y + alignTo.height - 1,
              inverted
            )
          )
        ),
        alignAttr,
        justify = pick(options.overflow, 'justify') === 'justify';
      if (visible) {
        fontSize = options.style.fontSize;
        baseline = chart.renderer.fontMetrics(fontSize, dataLabel).b;
        alignTo = extend({
          x: inverted ? chart.plotWidth - plotY : plotX,
          y: Math.round(inverted ? chart.plotHeight - plotX : plotY),
          width: 0,
          height: 0
        }, alignTo);
        extend(options, {
          width: bBox.width,
          height: bBox.height
        });
        if (rotation) {
          justify = false;
          rotCorr = chart.renderer.rotCorr(baseline, rotation);
          alignAttr = {
            x: alignTo.x + options.x + alignTo.width / 2 + rotCorr.x,
            y: alignTo.y + options.y + {
              top: 0,
              middle: 0.5,
              bottom: 1
            }[options.verticalAlign] * alignTo.height
          };
          dataLabel[isNew ? 'attr' : 'animate'](alignAttr)
            .attr({
              align: align
            });
          normRotation = (rotation + 720) % 360;
          negRotation = normRotation > 180 && normRotation < 360;
          if (align === 'left') {
            alignAttr.y -= negRotation ? bBox.height : 0;
          } else if (align === 'center') {
            alignAttr.x -= bBox.width / 2;
            alignAttr.y -= bBox.height / 2;
          } else if (align === 'right') {
            alignAttr.x -= bBox.width;
            alignAttr.y -= negRotation ? 0 : bBox.height;
          }
        } else {
          dataLabel.align(options, null, alignTo);
          alignAttr = dataLabel.alignAttr;
        }
        if (justify) {
          this.justifyDataLabel(dataLabel, options, alignAttr, bBox, alignTo, isNew);
        } else if (pick(options.crop, true)) {
          visible = chart.isInsidePlot(alignAttr.x, alignAttr.y) && chart.isInsidePlot(alignAttr.x + bBox.width, alignAttr.y + bBox.height);
        }
        if (options.shape && !rotation) {
          dataLabel.attr({
            anchorX: point.plotX,
            anchorY: point.plotY
          });
        }
      }
      if (!visible) {
        dataLabel.attr({
          y: -9999
        });
        dataLabel.placed = false;
      }
    };
    Series.prototype.justifyDataLabel = function(dataLabel, options, alignAttr, bBox, alignTo, isNew) {
      var chart = this.chart,
        align = options.align,
        verticalAlign = options.verticalAlign,
        off,
        justified,
        padding = dataLabel.box ? 0 : (dataLabel.padding || 0);
      off = alignAttr.x + padding;
      if (off < 0) {
        if (align === 'right') {
          options.align = 'left';
        } else {
          options.x = -off;
        }
        justified = true;
      }
      off = alignAttr.x + bBox.width - padding;
      if (off > chart.plotWidth) {
        if (align === 'left') {
          options.align = 'right';
        } else {
          options.x = chart.plotWidth - off;
        }
        justified = true;
      }
      off = alignAttr.y + padding;
      if (off < 0) {
        if (verticalAlign === 'bottom') {
          options.verticalAlign = 'top';
        } else {
          options.y = -off;
        }
        justified = true;
      }
      off = alignAttr.y + bBox.height - padding;
      if (off > chart.plotHeight) {
        if (verticalAlign === 'top') {
          options.verticalAlign = 'bottom';
        } else {
          options.y = chart.plotHeight - off;
        }
        justified = true;
      }
      if (justified) {
        dataLabel.placed = !isNew;
        dataLabel.align(options, null, alignTo);
      }
    };
    if (seriesTypes.pie) {
      seriesTypes.pie.prototype.drawDataLabels = function() {
        var series = this,
          data = series.data,
          point,
          chart = series.chart,
          options = series.options.dataLabels,
          connectorPadding = pick(options.connectorPadding, 10),
          connectorWidth = pick(options.connectorWidth, 1),
          plotWidth = chart.plotWidth,
          plotHeight = chart.plotHeight,
          connector,
          distanceOption = options.distance,
          seriesCenter = series.center,
          radius = seriesCenter[2] / 2,
          centerY = seriesCenter[1],
          outside = distanceOption > 0,
          dataLabel,
          dataLabelWidth,
          labelPos,
          labelHeight,
          halves = [
            [],
            []
          ],
          x,
          y,
          visibility,
          j,
          overflow = [0, 0, 0, 0];
        if (!series.visible || (!options.enabled && !series._hasPointLabels)) {
          return;
        }
        Series.prototype.drawDataLabels.apply(series);
        each(data, function(point) {
          if (point.dataLabel && point.visible) {
            halves[point.half].push(point);
            point.dataLabel._pos = null;
          }
        });
        each(halves, function(points, i) {
          var top,
            bottom,
            length = points.length,
            positions,
            naturalY,
            size;
          if (!length) {
            return;
          }
          series.sortByAngle(points, i - 0.5);
          if (distanceOption > 0) {
            top = Math.max(0, centerY - radius - distanceOption);
            bottom = Math.min(centerY + radius + distanceOption, chart.plotHeight);
            positions = map(points, function(point) {
              if (point.dataLabel) {
                size = point.dataLabel.getBBox().height || 21;
                return {
                  target: point.labelPos[1] - top + size / 2,
                  size: size,
                  rank: point.y
                };
              }
            });
            H.distribute(positions, bottom + size - top);
          }
          for (j = 0; j < length; j++) {
            point = points[j];
            labelPos = point.labelPos;
            dataLabel = point.dataLabel;
            visibility = point.visible === false ? 'hidden' : 'inherit';
            naturalY = labelPos[1];
            if (positions) {
              if (positions[j].pos === undefined) {
                visibility = 'hidden';
              } else {
                labelHeight = positions[j].size;
                y = top + positions[j].pos;
              }
            } else {
              y = naturalY;
            }
            if (options.justify) {
              x = seriesCenter[0] + (i ? -1 : 1) * (radius + distanceOption);
            } else {
              x = series.getX(y < top + 2 || y > bottom - 2 ? naturalY : y, i);
            }
            dataLabel._attr = {
              visibility: visibility,
              align: labelPos[6]
            };
            dataLabel._pos = {
              x: x + options.x +
                ({
                  left: connectorPadding,
                  right: -connectorPadding
                }[labelPos[6]] || 0),
              y: y + options.y - 10
            };
            labelPos.x = x;
            labelPos.y = y;
            if (series.options.size === null) {
              dataLabelWidth = dataLabel.width;
              if (x - dataLabelWidth < connectorPadding) {
                overflow[3] = Math.max(Math.round(dataLabelWidth - x + connectorPadding), overflow[3]);
              } else if (x + dataLabelWidth > plotWidth - connectorPadding) {
                overflow[1] = Math.max(Math.round(x + dataLabelWidth - plotWidth + connectorPadding), overflow[1]);
              }
              if (y - labelHeight / 2 < 0) {
                overflow[0] = Math.max(Math.round(-y + labelHeight / 2), overflow[0]);
              } else if (y + labelHeight / 2 > plotHeight) {
                overflow[2] = Math.max(Math.round(y + labelHeight / 2 - plotHeight), overflow[2]);
              }
            }
          }
        });
        if (arrayMax(overflow) === 0 || this.verifyDataLabelOverflow(overflow)) {
          this.placeDataLabels();
          if (outside && connectorWidth) {
            each(this.points, function(point) {
              var isNew;
              connector = point.connector;
              dataLabel = point.dataLabel;
              if (dataLabel && dataLabel._pos && point.visible) {
                visibility = dataLabel._attr.visibility;
                isNew = !connector;
                if (isNew) {
                  point.connector = connector = chart.renderer.path()
                    .addClass('highcharts-data-label-connector highcharts-color-' + point.colorIndex)
                    .add(series.dataLabelsGroup);
                  connector.attr({
                    'stroke-width': connectorWidth,
                    'stroke': options.connectorColor || point.color || '#666666'
                  });
                }
                connector[isNew ? 'attr' : 'animate']({
                  d: series.connectorPath(point.labelPos)
                });
                connector.attr('visibility', visibility);
              } else if (connector) {
                point.connector = connector.destroy();
              }
            });
          }
        }
      };
      seriesTypes.pie.prototype.connectorPath = function(labelPos) {
        var x = labelPos.x,
          y = labelPos.y;
        return pick(this.options.dataLabels.softConnector, true) ? [
          'M',
          x + (labelPos[6] === 'left' ? 5 : -5), y,
          'C',
          x, y,
          2 * labelPos[2] - labelPos[4], 2 * labelPos[3] - labelPos[5],
          labelPos[2], labelPos[3],
          'L',
          labelPos[4], labelPos[5]
        ] : [
          'M',
          x + (labelPos[6] === 'left' ? 5 : -5), y,
          'L',
          labelPos[2], labelPos[3],
          'L',
          labelPos[4], labelPos[5]
        ];
      };
      seriesTypes.pie.prototype.placeDataLabels = function() {
        each(this.points, function(point) {
          var dataLabel = point.dataLabel,
            _pos;
          if (dataLabel && point.visible) {
            _pos = dataLabel._pos;
            if (_pos) {
              dataLabel.attr(dataLabel._attr);
              dataLabel[dataLabel.moved ? 'animate' : 'attr'](_pos);
              dataLabel.moved = true;
            } else if (dataLabel) {
              dataLabel.attr({
                y: -9999
              });
            }
          }
        });
      };
      seriesTypes.pie.prototype.alignDataLabel = noop;
      seriesTypes.pie.prototype.verifyDataLabelOverflow = function(overflow) {
        var center = this.center,
          options = this.options,
          centerOption = options.center,
          minSize = options.minSize || 80,
          newSize = minSize,
          ret;
        if (centerOption[0] !== null) {
          newSize = Math.max(center[2] - Math.max(overflow[1], overflow[3]), minSize);
        } else {
          newSize = Math.max(
            center[2] - overflow[1] - overflow[3],
            minSize
          );
          center[0] += (overflow[3] - overflow[1]) / 2;
        }
        if (centerOption[1] !== null) {
          newSize = Math.max(Math.min(newSize, center[2] - Math.max(overflow[0], overflow[2])), minSize);
        } else {
          newSize = Math.max(
            Math.min(
              newSize,
              center[2] - overflow[0] - overflow[2]
            ),
            minSize
          );
          center[1] += (overflow[0] - overflow[2]) / 2;
        }
        if (newSize < center[2]) {
          center[2] = newSize;
          center[3] = Math.min(relativeLength(options.innerSize || 0, newSize), newSize);
          this.translate(center);
          if (this.drawDataLabels) {
            this.drawDataLabels();
          }
        } else {
          ret = true;
        }
        return ret;
      };
    }
    if (seriesTypes.column) {
      seriesTypes.column.prototype.alignDataLabel = function(point, dataLabel, options, alignTo, isNew) {
        var inverted = this.chart.inverted,
          series = point.series,
          dlBox = point.dlBox || point.shapeArgs,
          below = pick(point.below, point.plotY > pick(this.translatedThreshold, series.yAxis.len)),
          inside = pick(options.inside, !!this.options.stacking),
          overshoot;
        if (dlBox) {
          alignTo = merge(dlBox);
          if (alignTo.y < 0) {
            alignTo.height += alignTo.y;
            alignTo.y = 0;
          }
          overshoot = alignTo.y + alignTo.height - series.yAxis.len;
          if (overshoot > 0) {
            alignTo.height -= overshoot;
          }
          if (inverted) {
            alignTo = {
              x: series.yAxis.len - alignTo.y - alignTo.height,
              y: series.xAxis.len - alignTo.x - alignTo.width,
              width: alignTo.height,
              height: alignTo.width
            };
          }
          if (!inside) {
            if (inverted) {
              alignTo.x += below ? 0 : alignTo.width;
              alignTo.width = 0;
            } else {
              alignTo.y += below ? alignTo.height : 0;
              alignTo.height = 0;
            }
          }
        }
        options.align = pick(
          options.align, !inverted || inside ? 'center' : below ? 'right' : 'left'
        );
        options.verticalAlign = pick(
          options.verticalAlign,
          inverted || inside ? 'middle' : below ? 'top' : 'bottom'
        );
        Series.prototype.alignDataLabel.call(this, point, dataLabel, options, alignTo, isNew);
      };
    }
  }(Highcharts));
  (function(H) {
    'use strict';
    var Chart = H.Chart,
      each = H.each,
      pick = H.pick,
      addEvent = H.addEvent;
    Chart.prototype.callbacks.push(function(chart) {
      function collectAndHide() {
        var labels = [];
        each(chart.series, function(series) {
          var dlOptions = series.options.dataLabels,
            collections = series.dataLabelCollections || ['dataLabel'];
          if ((dlOptions.enabled || series._hasPointLabels) && !dlOptions.allowOverlap && series.visible) {
            each(collections, function(coll) {
              each(series.points, function(point) {
                if (point[coll]) {
                  point[coll].labelrank = pick(point.labelrank, point.shapeArgs && point.shapeArgs.height);
                  labels.push(point[coll]);
                }
              });
            });
          }
        });
        chart.hideOverlappingLabels(labels);
      }
      collectAndHide();
      addEvent(chart, 'redraw', collectAndHide);
    });
    Chart.prototype.hideOverlappingLabels = function(labels) {
      var len = labels.length,
        label,
        i,
        j,
        label1,
        label2,
        isIntersecting,
        pos1,
        pos2,
        parent1,
        parent2,
        padding,
        intersectRect = function(x1, y1, w1, h1, x2, y2, w2, h2) {
          return !(
            x2 > x1 + w1 ||
            x2 + w2 < x1 ||
            y2 > y1 + h1 ||
            y2 + h2 < y1
          );
        };
      for (i = 0; i < len; i++) {
        label = labels[i];
        if (label) {
          label.oldOpacity = label.opacity;
          label.newOpacity = 1;
        }
      }
      labels.sort(function(a, b) {
        return (b.labelrank || 0) - (a.labelrank || 0);
      });
      for (i = 0; i < len; i++) {
        label1 = labels[i];
        for (j = i + 1; j < len; ++j) {
          label2 = labels[j];
          if (label1 && label2 && label1.placed && label2.placed && label1.newOpacity !== 0 && label2.newOpacity !== 0) {
            pos1 = label1.alignAttr;
            pos2 = label2.alignAttr;
            parent1 = label1.parentGroup;
            parent2 = label2.parentGroup;
            padding = 2 * (label1.box ? 0 : label1.padding);
            isIntersecting = intersectRect(
              pos1.x + parent1.translateX,
              pos1.y + parent1.translateY,
              label1.width - padding,
              label1.height - padding,
              pos2.x + parent2.translateX,
              pos2.y + parent2.translateY,
              label2.width - padding,
              label2.height - padding
            );
            if (isIntersecting) {
              (label1.labelrank < label2.labelrank ? label1 : label2).newOpacity = 0;
            }
          }
        }
      }
      each(labels, function(label) {
        var complete,
          newOpacity;
        if (label) {
          newOpacity = label.newOpacity;
          if (label.oldOpacity !== newOpacity && label.placed) {
            if (newOpacity) {
              label.show(true);
            } else {
              complete = function() {
                label.hide();
              };
            }
            label.alignAttr.opacity = newOpacity;
            label[label.isOld ? 'animate' : 'attr'](label.alignAttr, null, complete);
          }
          label.isOld = true;
        }
      });
    };
  }(Highcharts));
  (function(H) {
    'use strict';
    var addEvent = H.addEvent,
      Chart = H.Chart,
      createElement = H.createElement,
      css = H.css,
      defaultOptions = H.defaultOptions,
      defaultPlotOptions = H.defaultPlotOptions,
      each = H.each,
      extend = H.extend,
      fireEvent = H.fireEvent,
      hasTouch = H.hasTouch,
      inArray = H.inArray,
      isObject = H.isObject,
      Legend = H.Legend,
      merge = H.merge,
      pick = H.pick,
      Point = H.Point,
      Series = H.Series,
      seriesTypes = H.seriesTypes,
      svg = H.svg,
      TrackerMixin;
    TrackerMixin = H.TrackerMixin = {
      drawTrackerPoint: function() {
        var series = this,
          chart = series.chart,
          pointer = chart.pointer,
          onMouseOver = function(e) {
            var target = e.target,
              point;
            while (target && !point) {
              point = target.point;
              target = target.parentNode;
            }
            if (point !== undefined && point !== chart.hoverPoint) {
              point.onMouseOver(e);
            }
          };
        each(series.points, function(point) {
          if (point.graphic) {
            point.graphic.element.point = point;
          }
          if (point.dataLabel) {
            if (point.dataLabel.div) {
              point.dataLabel.div.point = point;
            } else {
              point.dataLabel.element.point = point;
            }
          }
        });
        if (!series._hasTracking) {
          each(series.trackerGroups, function(key) {
            if (series[key]) {
              series[key]
                .addClass('highcharts-tracker')
                .on('mouseover', onMouseOver)
                .on('mouseout', function(e) {
                  pointer.onTrackerMouseOut(e);
                });
              if (hasTouch) {
                series[key].on('touchstart', onMouseOver);
              }
              if (series.options.cursor) {
                series[key]
                  .css(css)
                  .css({
                    cursor: series.options.cursor
                  });
              }
            }
          });
          series._hasTracking = true;
        }
      },
      drawTrackerGraph: function() {
        var series = this,
          options = series.options,
          trackByArea = options.trackByArea,
          trackerPath = [].concat(trackByArea ? series.areaPath : series.graphPath),
          trackerPathLength = trackerPath.length,
          chart = series.chart,
          pointer = chart.pointer,
          renderer = chart.renderer,
          snap = chart.options.tooltip.snap,
          tracker = series.tracker,
          i,
          onMouseOver = function() {
            if (chart.hoverSeries !== series) {
              series.onMouseOver();
            }
          },
          TRACKER_FILL = 'rgba(192,192,192,' + (svg ? 0.0001 : 0.002) + ')';
        if (trackerPathLength && !trackByArea) {
          i = trackerPathLength + 1;
          while (i--) {
            if (trackerPath[i] === 'M') {
              trackerPath.splice(i + 1, 0, trackerPath[i + 1] - snap, trackerPath[i + 2], 'L');
            }
            if ((i && trackerPath[i] === 'M') || i === trackerPathLength) {
              trackerPath.splice(i, 0, 'L', trackerPath[i - 2] + snap, trackerPath[i - 1]);
            }
          }
        }
        if (tracker) {
          tracker.attr({
            d: trackerPath
          });
        } else if (series.graph) {
          series.tracker = renderer.path(trackerPath)
            .attr({
              'stroke-linejoin': 'round',
              visibility: series.visible ? 'visible' : 'hidden',
              stroke: TRACKER_FILL,
              fill: trackByArea ? TRACKER_FILL : 'none',
              'stroke-width': series.graph.strokeWidth() + (trackByArea ? 0 : 2 * snap),
              zIndex: 2
            })
            .add(series.group);
          each([series.tracker, series.markerGroup], function(tracker) {
            tracker.addClass('highcharts-tracker')
              .on('mouseover', onMouseOver)
              .on('mouseout', function(e) {
                pointer.onTrackerMouseOut(e);
              });
            if (options.cursor) {
              tracker.css({
                cursor: options.cursor
              });
            }
            if (hasTouch) {
              tracker.on('touchstart', onMouseOver);
            }
          });
        }
      }
    };
    if (seriesTypes.column) {
      seriesTypes.column.prototype.drawTracker = TrackerMixin.drawTrackerPoint;
    }
    if (seriesTypes.pie) {
      seriesTypes.pie.prototype.drawTracker = TrackerMixin.drawTrackerPoint;
    }
    if (seriesTypes.scatter) {
      seriesTypes.scatter.prototype.drawTracker = TrackerMixin.drawTrackerPoint;
    }
    extend(Legend.prototype, {
      setItemEvents: function(item, legendItem, useHTML) {
        var legend = this,
          chart = legend.chart,
          activeClass = 'highcharts-legend-' + (item.series ? 'point' : 'series') + '-active';
        (useHTML ? legendItem : item.legendGroup).on('mouseover', function() {
            item.setState('hover');
            chart.seriesGroup.addClass(activeClass);
            legendItem.css(legend.options.itemHoverStyle);
          })
          .on('mouseout', function() {
            legendItem.css(item.visible ? legend.itemStyle : legend.itemHiddenStyle);
            chart.seriesGroup.removeClass(activeClass);
            item.setState();
          })
          .on('click', function(event) {
            var strLegendItemClick = 'legendItemClick',
              fnLegendItemClick = function() {
                if (item.setVisible) {
                  item.setVisible();
                }
              };
            event = {
              browserEvent: event
            };
            if (item.firePointEvent) {
              item.firePointEvent(strLegendItemClick, event, fnLegendItemClick);
            } else {
              fireEvent(item, strLegendItemClick, event, fnLegendItemClick);
            }
          });
      },
      createCheckboxForItem: function(item) {
        var legend = this;
        item.checkbox = createElement('input', {
          type: 'checkbox',
          checked: item.selected,
          defaultChecked: item.selected
        }, legend.options.itemCheckboxStyle, legend.chart.container);
        addEvent(item.checkbox, 'click', function(event) {
          var target = event.target;
          fireEvent(
            item.series || item,
            'checkboxClick', {
              checked: target.checked,
              item: item
            },
            function() {
              item.select();
            }
          );
        });
      }
    });
    defaultOptions.legend.itemStyle.cursor = 'pointer';
    extend(Chart.prototype, {
      showResetZoom: function() {
        var chart = this,
          lang = defaultOptions.lang,
          btnOptions = chart.options.chart.resetZoomButton,
          theme = btnOptions.theme,
          states = theme.states,
          alignTo = btnOptions.relativeTo === 'chart' ? null : 'plotBox';

        function zoomOut() {
          chart.zoomOut();
        }
        this.resetZoomButton = chart.renderer.button(lang.resetZoom, null, null, zoomOut, theme, states && states.hover)
          .attr({
            align: btnOptions.position.align,
            title: lang.resetZoomTitle
          })
          .addClass('highcharts-reset-zoom')
          .add()
          .align(btnOptions.position, false, alignTo);
      },
      zoomOut: function() {
        var chart = this;
        fireEvent(chart, 'selection', {
          resetSelection: true
        }, function() {
          chart.zoom();
        });
      },
      zoom: function(event) {
        var chart = this,
          hasZoomed,
          pointer = chart.pointer,
          displayButton = false,
          resetZoomButton;
        if (!event || event.resetSelection) {
          each(chart.axes, function(axis) {
            hasZoomed = axis.zoom();
          });
        } else {
          each(event.xAxis.concat(event.yAxis), function(axisData) {
            var axis = axisData.axis,
              isXAxis = axis.isXAxis;
            if (pointer[isXAxis ? 'zoomX' : 'zoomY']) {
              hasZoomed = axis.zoom(axisData.min, axisData.max);
              if (axis.displayBtn) {
                displayButton = true;
              }
            }
          });
        }
        resetZoomButton = chart.resetZoomButton;
        if (displayButton && !resetZoomButton) {
          chart.showResetZoom();
        } else if (!displayButton && isObject(resetZoomButton)) {
          chart.resetZoomButton = resetZoomButton.destroy();
        }
        if (hasZoomed) {
          chart.redraw(
            pick(chart.options.chart.animation, event && event.animation, chart.pointCount < 100)
          );
        }
      },
      pan: function(e, panning) {
        var chart = this,
          hoverPoints = chart.hoverPoints,
          doRedraw;
        if (hoverPoints) {
          each(hoverPoints, function(point) {
            point.setState();
          });
        }
        each(panning === 'xy' ? [1, 0] : [1], function(isX) {
          var axis = chart[isX ? 'xAxis' : 'yAxis'][0],
            horiz = axis.horiz,
            mousePos = e[horiz ? 'chartX' : 'chartY'],
            mouseDown = horiz ? 'mouseDownX' : 'mouseDownY',
            startPos = chart[mouseDown],
            halfPointRange = (axis.pointRange || 0) / 2,
            extremes = axis.getExtremes(),
            panMin = axis.toValue(startPos - mousePos, true) +
            halfPointRange,
            panMax = axis.toValue(startPos + axis.len - mousePos, true) -
            halfPointRange,
            flipped = panMax < panMin,
            newMin = flipped ? panMax : panMin,
            newMax = flipped ? panMin : panMax,
            distMin = Math.min(extremes.dataMin, extremes.min) - newMin,
            distMax = newMax - Math.max(extremes.dataMax, extremes.max);
          if (axis.series.length && distMin < 0 && distMax < 0) {
            axis.setExtremes(
              newMin,
              newMax,
              false,
              false, {
                trigger: 'pan'
              }
            );
            doRedraw = true;
          }
          chart[mouseDown] = mousePos;
        });
        if (doRedraw) {
          chart.redraw(false);
        }
        css(chart.container, {
          cursor: 'move'
        });
      }
    });
    extend(Point.prototype, {
      select: function(selected, accumulate) {
        var point = this,
          series = point.series,
          chart = series.chart;
        selected = pick(selected, !point.selected);
        point.firePointEvent(selected ? 'select' : 'unselect', {
          accumulate: accumulate
        }, function() {
          point.selected = point.options.selected = selected;
          series.options.data[inArray(point, series.data)] = point.options;
          point.setState(selected && 'select');
          if (!accumulate) {
            each(chart.getSelectedPoints(), function(loopPoint) {
              if (loopPoint.selected && loopPoint !== point) {
                loopPoint.selected = loopPoint.options.selected = false;
                series.options.data[inArray(loopPoint, series.data)] = loopPoint.options;
                loopPoint.setState('');
                loopPoint.firePointEvent('unselect');
              }
            });
          }
        });
      },
      onMouseOver: function(e, byProximity) {
        var point = this,
          series = point.series,
          chart = series.chart,
          tooltip = chart.tooltip,
          hoverPoint = chart.hoverPoint;
        if (point.series) {
          if (!byProximity) {
            if (hoverPoint && hoverPoint !== point) {
              hoverPoint.onMouseOut();
            }
            if (chart.hoverSeries !== series) {
              series.onMouseOver();
            }
            chart.hoverPoint = point;
          }
          if (tooltip && (!tooltip.shared || series.noSharedTooltip)) {
            point.setState('hover');
            tooltip.refresh(point, e);
          } else if (!tooltip) {
            point.setState('hover');
          }
          point.firePointEvent('mouseOver');
        }
      },
      onMouseOut: function() {
        var chart = this.series.chart,
          hoverPoints = chart.hoverPoints;
        this.firePointEvent('mouseOut');
        if (!hoverPoints || inArray(this, hoverPoints) === -1) {
          this.setState();
          chart.hoverPoint = null;
        }
      },
      importEvents: function() {
        if (!this.hasImportedEvents) {
          var point = this,
            options = merge(point.series.options.point, point.options),
            events = options.events,
            eventType;
          point.events = events;
          for (eventType in events) {
            addEvent(point, eventType, events[eventType]);
          }
          this.hasImportedEvents = true;
        }
      },
      setState: function(state, move) {
        var point = this,
          plotX = Math.floor(point.plotX),
          plotY = point.plotY,
          series = point.series,
          stateOptions = series.options.states[state] || {},
          markerOptions = defaultPlotOptions[series.type].marker &&
          series.options.marker,
          normalDisabled = markerOptions && markerOptions.enabled === false,
          markerStateOptions = (markerOptions && markerOptions.states &&
            markerOptions.states[state]) || {},
          stateDisabled = markerStateOptions.enabled === false,
          stateMarkerGraphic = series.stateMarkerGraphic,
          pointMarker = point.marker || {},
          chart = series.chart,
          halo = series.halo,
          haloOptions,
          markerAttribs,
          hasMarkers = markerOptions && series.markerAttribs,
          newSymbol;
        state = state || '';
        if (
          (state === point.state && !move) ||
          (point.selected && state !== 'select') ||
          (stateOptions.enabled === false) ||
          (state && (stateDisabled || (normalDisabled && markerStateOptions.enabled === false))) ||
          (state && pointMarker.states && pointMarker.states[state] && pointMarker.states[state].enabled === false)
        ) {
          return;
        }
        if (hasMarkers) {
          markerAttribs = series.markerAttribs(point, state);
        }
        if (point.graphic) {
          if (point.state) {
            point.graphic.removeClass('highcharts-point-' + point.state);
          }
          if (state) {
            point.graphic.addClass('highcharts-point-' + state);
          }
          point.graphic.attr(series.pointAttribs(point, state));
          if (markerAttribs) {
            point.graphic.animate(
              markerAttribs,
              pick(
                chart.options.chart.animation,
                markerStateOptions.animation,
                markerOptions.animation
              )
            );
          }
          if (stateMarkerGraphic) {
            stateMarkerGraphic.hide();
          }
        } else {
          if (state && markerStateOptions) {
            newSymbol = pointMarker.symbol || series.symbol;
            if (stateMarkerGraphic && stateMarkerGraphic.currentSymbol !== newSymbol) {
              stateMarkerGraphic = stateMarkerGraphic.destroy();
            }
            if (!stateMarkerGraphic) {
              if (newSymbol) {
                series.stateMarkerGraphic = stateMarkerGraphic = chart.renderer.symbol(
                    newSymbol,
                    markerAttribs.x,
                    markerAttribs.y,
                    markerAttribs.width,
                    markerAttribs.height
                  )
                  .add(series.markerGroup);
                stateMarkerGraphic.currentSymbol = newSymbol;
              }
            } else {
              stateMarkerGraphic[move ? 'animate' : 'attr']({
                x: markerAttribs.x,
                y: markerAttribs.y
              });
            }
            if (stateMarkerGraphic) {
              stateMarkerGraphic.attr(series.pointAttribs(point, state));
            }
          }
          if (stateMarkerGraphic) {
            stateMarkerGraphic[state && chart.isInsidePlot(plotX, plotY, chart.inverted) ? 'show' : 'hide']();
            stateMarkerGraphic.element.point = point;
          }
        }
        haloOptions = stateOptions.halo;
        if (haloOptions && haloOptions.size) {
          if (!halo) {
            series.halo = halo = chart.renderer.path()
              .add(hasMarkers ? series.markerGroup : series.group);
          }
          halo[move ? 'animate' : 'attr']({
            d: point.haloPath(haloOptions.size)
          });
          halo.attr({
            'class': 'highcharts-halo highcharts-color-' +
              pick(point.colorIndex, series.colorIndex)
          });
          halo.point = point;
          halo.attr(extend({
            'fill': point.color || series.color,
            'fill-opacity': haloOptions.opacity,
            'zIndex': -1
          }, haloOptions.attributes));
        } else if (halo && halo.point && halo.point.haloPath) {
          halo.animate({
            d: halo.point.haloPath(0)
          });
        }
        point.state = state;
      },
      haloPath: function(size) {
        var series = this.series,
          chart = series.chart;
        return chart.renderer.symbols.circle(
          Math.floor(this.plotX) - size,
          this.plotY - size,
          size * 2,
          size * 2
        );
      }
    });
    extend(Series.prototype, {
      onMouseOver: function() {
        var series = this,
          chart = series.chart,
          hoverSeries = chart.hoverSeries;
        if (hoverSeries && hoverSeries !== series) {
          hoverSeries.onMouseOut();
        }
        if (series.options.events.mouseOver) {
          fireEvent(series, 'mouseOver');
        }
        series.setState('hover');
        chart.hoverSeries = series;
      },
      onMouseOut: function() {
        var series = this,
          options = series.options,
          chart = series.chart,
          tooltip = chart.tooltip,
          hoverPoint = chart.hoverPoint;
        chart.hoverSeries = null;
        if (hoverPoint) {
          hoverPoint.onMouseOut();
        }
        if (series && options.events.mouseOut) {
          fireEvent(series, 'mouseOut');
        }
        if (tooltip && !options.stickyTracking && (!tooltip.shared || series.noSharedTooltip)) {
          tooltip.hide();
        }
        series.setState();
      },
      setState: function(state) {
        var series = this,
          options = series.options,
          graph = series.graph,
          stateOptions = options.states,
          lineWidth = options.lineWidth,
          attribs,
          i = 0;
        state = state || '';
        if (series.state !== state) {
          each([series.group, series.markerGroup], function(group) {
            if (group) {
              if (series.state) {
                group.removeClass('highcharts-series-' + series.state);
              }
              if (state) {
                group.addClass('highcharts-series-' + state);
              }
            }
          });
          series.state = state;
          if (stateOptions[state] && stateOptions[state].enabled === false) {
            return;
          }
          if (state) {
            lineWidth = stateOptions[state].lineWidth || lineWidth + (stateOptions[state].lineWidthPlus || 0);
          }
          if (graph && !graph.dashstyle) {
            attribs = {
              'stroke-width': lineWidth
            };
            graph.attr(attribs);
            while (series['zone-graph-' + i]) {
              series['zone-graph-' + i].attr(attribs);
              i = i + 1;
            }
          }
        }
      },
      setVisible: function(vis, redraw) {
        var series = this,
          chart = series.chart,
          legendItem = series.legendItem,
          showOrHide,
          ignoreHiddenSeries = chart.options.chart.ignoreHiddenSeries,
          oldVisibility = series.visible;
        series.visible = vis = series.options.visible = series.userOptions.visible = vis === undefined ? !oldVisibility : vis;
        showOrHide = vis ? 'show' : 'hide';
        each(['group', 'dataLabelsGroup', 'markerGroup', 'tracker', 'tt'], function(key) {
          if (series[key]) {
            series[key][showOrHide]();
          }
        });
        if (chart.hoverSeries === series || (chart.hoverPoint && chart.hoverPoint.series) === series) {
          series.onMouseOut();
        }
        if (legendItem) {
          chart.legend.colorizeItem(series, vis);
        }
        series.isDirty = true;
        if (series.options.stacking) {
          each(chart.series, function(otherSeries) {
            if (otherSeries.options.stacking && otherSeries.visible) {
              otherSeries.isDirty = true;
            }
          });
        }
        each(series.linkedSeries, function(otherSeries) {
          otherSeries.setVisible(vis, false);
        });
        if (ignoreHiddenSeries) {
          chart.isDirtyBox = true;
        }
        if (redraw !== false) {
          chart.redraw();
        }
        fireEvent(series, showOrHide);
      },
      show: function() {
        this.setVisible(true);
      },
      hide: function() {
        this.setVisible(false);
      },
      select: function(selected) {
        var series = this;
        series.selected = selected = (selected === undefined) ? !series.selected : selected;
        if (series.checkbox) {
          series.checkbox.checked = selected;
        }
        fireEvent(series, selected ? 'select' : 'unselect');
      },
      drawTracker: TrackerMixin.drawTrackerGraph
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var Chart = H.Chart,
      each = H.each,
      inArray = H.inArray,
      isObject = H.isObject,
      pick = H.pick,
      splat = H.splat;
    Chart.prototype.setResponsive = function(redraw) {
      var options = this.options.responsive;
      if (options && options.rules) {
        each(options.rules, function(rule) {
          this.matchResponsiveRule(rule, redraw);
        }, this);
      }
    };
    Chart.prototype.matchResponsiveRule = function(rule, redraw) {
      var respRules = this.respRules,
        condition = rule.condition,
        matches,
        fn = condition.callback || function() {
          return this.chartWidth <= pick(condition.maxWidth, Number.MAX_VALUE) &&
            this.chartHeight <= pick(condition.maxHeight, Number.MAX_VALUE) &&
            this.chartWidth >= pick(condition.minWidth, 0) &&
            this.chartHeight >= pick(condition.minHeight, 0);
        };
      if (rule._id === undefined) {
        rule._id = H.uniqueKey();
      }
      matches = fn.call(this);
      if (!respRules[rule._id] && matches) {
        if (rule.chartOptions) {
          respRules[rule._id] = this.currentOptions(rule.chartOptions);
          this.update(rule.chartOptions, redraw);
        }
      } else if (respRules[rule._id] && !matches) {
        this.update(respRules[rule._id], redraw);
        delete respRules[rule._id];
      }
    };
    Chart.prototype.currentOptions = function(options) {
      var ret = {};

      function getCurrent(options, curr, ret, depth) {
        var key, i;
        for (key in options) {
          if (!depth && inArray(key, ['series', 'xAxis', 'yAxis']) > -1) {
            options[key] = splat(options[key]);
            ret[key] = [];
            for (i = 0; i < options[key].length; i++) {
              ret[key][i] = {};
              getCurrent(
                options[key][i],
                curr[key][i],
                ret[key][i],
                depth + 1
              );
            }
          } else if (isObject(options[key])) {
            ret[key] = {};
            getCurrent(
              options[key],
              curr[key] || {},
              ret[key],
              depth + 1
            );
          } else {
            ret[key] = curr[key] || null;
          }
        }
      }
      getCurrent(options, this.options, ret, 0);
      return ret;
    };
  }(Highcharts));
  var Highcharts = (function(Highcharts) {
    'use strict';
    return Highcharts;
  }(Highcharts));
  (function(H) {
    'use strict';
    var addEvent = H.addEvent,
      Axis = H.Axis,
      Chart = H.Chart,
      css = H.css,
      dateFormat = H.dateFormat,
      defined = H.defined,
      each = H.each,
      extend = H.extend,
      noop = H.noop,
      Series = H.Series,
      timeUnits = H.timeUnits,
      wrap = H.wrap;
    wrap(Series.prototype, 'init', function(proceed) {
      var series = this,
        xAxis;
      proceed.apply(this, Array.prototype.slice.call(arguments, 1));
      xAxis = series.xAxis;
      if (xAxis && xAxis.options.ordinal) {
        addEvent(series, 'updatedData', function() {
          delete xAxis.ordinalIndex;
        });
      }
    });
    wrap(Axis.prototype, 'getTimeTicks', function(proceed, normalizedInterval, min, max, startOfWeek, positions, closestDistance, findHigherRanks) {
      var start = 0,
        end,
        segmentPositions,
        higherRanks = {},
        hasCrossedHigherRank,
        info,
        posLength,
        outsideMax,
        groupPositions = [],
        lastGroupPosition = -Number.MAX_VALUE,
        tickPixelIntervalOption = this.options.tickPixelInterval;
      if ((!this.options.ordinal && !this.options.breaks) || !positions || positions.length < 3 || min === undefined) {
        return proceed.call(this, normalizedInterval, min, max, startOfWeek);
      }
      posLength = positions.length;
      for (end = 0; end < posLength; end++) {
        outsideMax = end && positions[end - 1] > max;
        if (positions[end] < min) {
          start = end;
        }
        if (end === posLength - 1 || positions[end + 1] - positions[end] > closestDistance * 5 || outsideMax) {
          if (positions[end] > lastGroupPosition) {
            segmentPositions = proceed.call(this, normalizedInterval, positions[start], positions[end], startOfWeek);
            while (segmentPositions.length && segmentPositions[0] <= lastGroupPosition) {
              segmentPositions.shift();
            }
            if (segmentPositions.length) {
              lastGroupPosition = segmentPositions[segmentPositions.length - 1];
            }
            groupPositions = groupPositions.concat(segmentPositions);
          }
          start = end + 1;
        }
        if (outsideMax) {
          break;
        }
      }
      info = segmentPositions.info;
      if (findHigherRanks && info.unitRange <= timeUnits.hour) {
        end = groupPositions.length - 1;
        for (start = 1; start < end; start++) {
          if (dateFormat('%d', groupPositions[start]) !== dateFormat('%d', groupPositions[start - 1])) {
            higherRanks[groupPositions[start]] = 'day';
            hasCrossedHigherRank = true;
          }
        }
        if (hasCrossedHigherRank) {
          higherRanks[groupPositions[0]] = 'day';
        }
        info.higherRanks = higherRanks;
      }
      groupPositions.info = info;
      if (findHigherRanks && defined(tickPixelIntervalOption)) {
        var length = groupPositions.length,
          i = length,
          itemToRemove,
          translated,
          translatedArr = [],
          lastTranslated,
          medianDistance,
          distance,
          distances = [];
        while (i--) {
          translated = this.translate(groupPositions[i]);
          if (lastTranslated) {
            distances[i] = lastTranslated - translated;
          }
          translatedArr[i] = lastTranslated = translated;
        }
        distances.sort();
        medianDistance = distances[Math.floor(distances.length / 2)];
        if (medianDistance < tickPixelIntervalOption * 0.6) {
          medianDistance = null;
        }
        i = groupPositions[length - 1] > max ? length - 1 : length;
        lastTranslated = undefined;
        while (i--) {
          translated = translatedArr[i];
          distance = Math.abs(lastTranslated - translated);
          if (lastTranslated && distance < tickPixelIntervalOption * 0.8 &&
            (medianDistance === null || distance < medianDistance * 0.8)) {
            if (higherRanks[groupPositions[i]] && !higherRanks[groupPositions[i + 1]]) {
              itemToRemove = i + 1;
              lastTranslated = translated;
            } else {
              itemToRemove = i;
            }
            groupPositions.splice(itemToRemove, 1);
          } else {
            lastTranslated = translated;
          }
        }
      }
      return groupPositions;
    });
    extend(Axis.prototype, {
      beforeSetTickPositions: function() {
        var axis = this,
          len,
          ordinalPositions = [],
          useOrdinal = false,
          dist,
          extremes = axis.getExtremes(),
          min = extremes.min,
          max = extremes.max,
          minIndex,
          maxIndex,
          slope,
          hasBreaks = axis.isXAxis && !!axis.options.breaks,
          isOrdinal = axis.options.ordinal,
          ignoreHiddenSeries = axis.chart.options.chart.ignoreHiddenSeries,
          i;
        if (isOrdinal || hasBreaks) {
          each(axis.series, function(series, i) {
            if ((!ignoreHiddenSeries || series.visible !== false) && (series.takeOrdinalPosition !== false || hasBreaks)) {
              ordinalPositions = ordinalPositions.concat(series.processedXData);
              len = ordinalPositions.length;
              ordinalPositions.sort(function(a, b) {
                return a - b;
              });
              if (len) {
                i = len - 1;
                while (i--) {
                  if (ordinalPositions[i] === ordinalPositions[i + 1]) {
                    ordinalPositions.splice(i, 1);
                  }
                }
              }
            }
          });
          len = ordinalPositions.length;
          if (len > 2) {
            dist = ordinalPositions[1] - ordinalPositions[0];
            i = len - 1;
            while (i-- && !useOrdinal) {
              if (ordinalPositions[i + 1] - ordinalPositions[i] !== dist) {
                useOrdinal = true;
              }
            }
            if (!axis.options.keepOrdinalPadding && (ordinalPositions[0] - min > dist || max - ordinalPositions[ordinalPositions.length - 1] > dist)) {
              useOrdinal = true;
            }
          }
          if (useOrdinal) {
            axis.ordinalPositions = ordinalPositions;
            minIndex = axis.ordinal2lin(
              Math.max(
                min,
                ordinalPositions[0]
              ),
              true
            );
            maxIndex = Math.max(axis.ordinal2lin(
              Math.min(
                max,
                ordinalPositions[ordinalPositions.length - 1]
              ),
              true
            ), 1);
            axis.ordinalSlope = slope = (max - min) / (maxIndex - minIndex);
            axis.ordinalOffset = min - (minIndex * slope);
          } else {
            axis.ordinalPositions = axis.ordinalSlope = axis.ordinalOffset = undefined;
          }
        }
        axis.isOrdinal = isOrdinal && useOrdinal;
        axis.groupIntervalFactor = null;
      },
      val2lin: function(val, toIndex) {
        var axis = this,
          ordinalPositions = axis.ordinalPositions,
          ret;
        if (!ordinalPositions) {
          ret = val;
        } else {
          var ordinalLength = ordinalPositions.length,
            i,
            distance,
            ordinalIndex;
          i = ordinalLength;
          while (i--) {
            if (ordinalPositions[i] === val) {
              ordinalIndex = i;
              break;
            }
          }
          i = ordinalLength - 1;
          while (i--) {
            if (val > ordinalPositions[i] || i === 0) {
              distance = (val - ordinalPositions[i]) / (ordinalPositions[i + 1] - ordinalPositions[i]);
              ordinalIndex = i + distance;
              break;
            }
          }
          ret = toIndex ?
            ordinalIndex :
            axis.ordinalSlope * (ordinalIndex || 0) + axis.ordinalOffset;
        }
        return ret;
      },
      lin2val: function(val, fromIndex) {
        var axis = this,
          ordinalPositions = axis.ordinalPositions,
          ret;
        if (!ordinalPositions) {
          ret = val;
        } else {
          var ordinalSlope = axis.ordinalSlope,
            ordinalOffset = axis.ordinalOffset,
            i = ordinalPositions.length - 1,
            linearEquivalentLeft,
            linearEquivalentRight,
            distance;
          if (fromIndex) {
            if (val < 0) {
              val = ordinalPositions[0];
            } else if (val > i) {
              val = ordinalPositions[i];
            } else {
              i = Math.floor(val);
              distance = val - i;
            }
          } else {
            while (i--) {
              linearEquivalentLeft = (ordinalSlope * i) + ordinalOffset;
              if (val >= linearEquivalentLeft) {
                linearEquivalentRight = (ordinalSlope * (i + 1)) + ordinalOffset;
                distance = (val - linearEquivalentLeft) / (linearEquivalentRight - linearEquivalentLeft);
                break;
              }
            }
          }
          return distance !== undefined && ordinalPositions[i] !== undefined ?
            ordinalPositions[i] + (distance ? distance * (ordinalPositions[i + 1] - ordinalPositions[i]) : 0) :
            val;
        }
        return ret;
      },
      getExtendedPositions: function() {
        var axis = this,
          chart = axis.chart,
          grouping = axis.series[0].currentDataGrouping,
          ordinalIndex = axis.ordinalIndex,
          key = grouping ? grouping.count + grouping.unitName : 'raw',
          extremes = axis.getExtremes(),
          fakeAxis,
          fakeSeries;
        if (!ordinalIndex) {
          ordinalIndex = axis.ordinalIndex = {};
        }
        if (!ordinalIndex[key]) {
          fakeAxis = {
            series: [],
            chart: chart,
            getExtremes: function() {
              return {
                min: extremes.dataMin,
                max: extremes.dataMax
              };
            },
            options: {
              ordinal: true
            },
            val2lin: Axis.prototype.val2lin
          };
          each(axis.series, function(series) {
            fakeSeries = {
              xAxis: fakeAxis,
              xData: series.xData,
              chart: chart,
              destroyGroupedData: noop
            };
            fakeSeries.options = {
              dataGrouping: grouping ? {
                enabled: true,
                forced: true,
                approximation: 'open',
                units: [
                  [grouping.unitName, [grouping.count]]
                ]
              } : {
                enabled: false
              }
            };
            series.processData.apply(fakeSeries);
            fakeAxis.series.push(fakeSeries);
          });
          axis.beforeSetTickPositions.apply(fakeAxis);
          ordinalIndex[key] = fakeAxis.ordinalPositions;
        }
        return ordinalIndex[key];
      },
      getGroupIntervalFactor: function(xMin, xMax, series) {
        var i,
          processedXData = series.processedXData,
          len = processedXData.length,
          distances = [],
          median,
          groupIntervalFactor = this.groupIntervalFactor;
        if (!groupIntervalFactor) {
          for (i = 0; i < len - 1; i++) {
            distances[i] = processedXData[i + 1] - processedXData[i];
          }
          distances.sort(function(a, b) {
            return a - b;
          });
          median = distances[Math.floor(len / 2)];
          xMin = Math.max(xMin, processedXData[0]);
          xMax = Math.min(xMax, processedXData[len - 1]);
          this.groupIntervalFactor = groupIntervalFactor = (len * median) / (xMax - xMin);
        }
        return groupIntervalFactor;
      },
      postProcessTickInterval: function(tickInterval) {
        var ordinalSlope = this.ordinalSlope,
          ret;
        if (ordinalSlope) {
          if (!this.options.breaks) {
            ret = tickInterval / (ordinalSlope / this.closestPointRange);
          } else {
            ret = this.closestPointRange;
          }
        } else {
          ret = tickInterval;
        }
        return ret;
      }
    });
    Axis.prototype.ordinal2lin = Axis.prototype.val2lin;
    wrap(Chart.prototype, 'pan', function(proceed, e) {
      var chart = this,
        xAxis = chart.xAxis[0],
        chartX = e.chartX,
        runBase = false;
      if (xAxis.options.ordinal && xAxis.series.length) {
        var mouseDownX = chart.mouseDownX,
          extremes = xAxis.getExtremes(),
          dataMax = extremes.dataMax,
          min = extremes.min,
          max = extremes.max,
          trimmedRange,
          hoverPoints = chart.hoverPoints,
          closestPointRange = xAxis.closestPointRange,
          pointPixelWidth = xAxis.translationSlope * (xAxis.ordinalSlope || closestPointRange),
          movedUnits = (mouseDownX - chartX) / pointPixelWidth,
          extendedAxis = {
            ordinalPositions: xAxis.getExtendedPositions()
          },
          ordinalPositions,
          searchAxisLeft,
          lin2val = xAxis.lin2val,
          val2lin = xAxis.val2lin,
          searchAxisRight;
        if (!extendedAxis.ordinalPositions) {
          runBase = true;
        } else if (Math.abs(movedUnits) > 1) {
          if (hoverPoints) {
            each(hoverPoints, function(point) {
              point.setState();
            });
          }
          if (movedUnits < 0) {
            searchAxisLeft = extendedAxis;
            searchAxisRight = xAxis.ordinalPositions ? xAxis : extendedAxis;
          } else {
            searchAxisLeft = xAxis.ordinalPositions ? xAxis : extendedAxis;
            searchAxisRight = extendedAxis;
          }
          ordinalPositions = searchAxisRight.ordinalPositions;
          if (dataMax > ordinalPositions[ordinalPositions.length - 1]) {
            ordinalPositions.push(dataMax);
          }
          chart.fixedRange = max - min;
          trimmedRange = xAxis.toFixedRange(null, null,
            lin2val.apply(searchAxisLeft, [
              val2lin.apply(searchAxisLeft, [min, true]) + movedUnits,
              true
            ]),
            lin2val.apply(searchAxisRight, [
              val2lin.apply(searchAxisRight, [max, true]) + movedUnits,
              true
            ])
          );
          if (trimmedRange.min >= Math.min(extremes.dataMin, min) && trimmedRange.max <= Math.max(dataMax, max)) {
            xAxis.setExtremes(trimmedRange.min, trimmedRange.max, true, false, {
              trigger: 'pan'
            });
          }
          chart.mouseDownX = chartX;
          css(chart.container, {
            cursor: 'move'
          });
        }
      } else {
        runBase = true;
      }
      if (runBase) {
        proceed.apply(this, Array.prototype.slice.call(arguments, 1));
      }
    });
    Series.prototype.gappedPath = function() {
      var gapSize = this.options.gapSize,
        points = this.points.slice(),
        i = points.length - 1;
      if (gapSize && i > 0) {
        while (i--) {
          if (points[i + 1].x - points[i].x > this.closestPointRange * gapSize) {
            points.splice(
              i + 1,
              0, {
                isNull: true
              }
            );
          }
        }
      }
      return this.getGraphPath(points);
    };
  }(Highcharts));
  (function(H) {
    'use strict';
    var pick = H.pick,
      wrap = H.wrap,
      each = H.each,
      extend = H.extend,
      isArray = H.isArray,
      fireEvent = H.fireEvent,
      Axis = H.Axis,
      Series = H.Series;

    function stripArguments() {
      return Array.prototype.slice.call(arguments, 1);
    }
    extend(Axis.prototype, {
      isInBreak: function(brk, val) {
        var ret,
          repeat = brk.repeat || Infinity,
          from = brk.from,
          length = brk.to - brk.from,
          test = (val >= from ? (val - from) % repeat : repeat - ((from - val) % repeat));
        if (!brk.inclusive) {
          ret = test < length && test !== 0;
        } else {
          ret = test <= length;
        }
        return ret;
      },
      isInAnyBreak: function(val, testKeep) {
        var breaks = this.options.breaks,
          i = breaks && breaks.length,
          inbrk,
          keep,
          ret;
        if (i) {
          while (i--) {
            if (this.isInBreak(breaks[i], val)) {
              inbrk = true;
              if (!keep) {
                keep = pick(breaks[i].showPoints, this.isXAxis ? false : true);
              }
            }
          }
          if (inbrk && testKeep) {
            ret = inbrk && !keep;
          } else {
            ret = inbrk;
          }
        }
        return ret;
      }
    });
    wrap(Axis.prototype, 'setTickPositions', function(proceed) {
      proceed.apply(this, Array.prototype.slice.call(arguments, 1));
      if (this.options.breaks) {
        var axis = this,
          tickPositions = this.tickPositions,
          info = this.tickPositions.info,
          newPositions = [],
          i;
        for (i = 0; i < tickPositions.length; i++) {
          if (!axis.isInAnyBreak(tickPositions[i])) {
            newPositions.push(tickPositions[i]);
          }
        }
        this.tickPositions = newPositions;
        this.tickPositions.info = info;
      }
    });
    wrap(Axis.prototype, 'init', function(proceed, chart, userOptions) {
      var axis = this,
        breaks;
      if (userOptions.breaks && userOptions.breaks.length) {
        userOptions.ordinal = false;
      }
      proceed.call(this, chart, userOptions);
      breaks = this.options.breaks;
      axis.isBroken = (isArray(breaks) && !!breaks.length);
      if (axis.isBroken) {
        axis.val2lin = function(val) {
          var nval = val,
            brk,
            i;
          for (i = 0; i < axis.breakArray.length; i++) {
            brk = axis.breakArray[i];
            if (brk.to <= val) {
              nval -= brk.len;
            } else if (brk.from >= val) {
              break;
            } else if (axis.isInBreak(brk, val)) {
              nval -= (val - brk.from);
              break;
            }
          }
          return nval;
        };
        axis.lin2val = function(val) {
          var nval = val,
            brk,
            i;
          for (i = 0; i < axis.breakArray.length; i++) {
            brk = axis.breakArray[i];
            if (brk.from >= nval) {
              break;
            } else if (brk.to < nval) {
              nval += brk.len;
            } else if (axis.isInBreak(brk, nval)) {
              nval += brk.len;
            }
          }
          return nval;
        };
        axis.setExtremes = function(newMin, newMax, redraw, animation, eventArguments) {
          while (this.isInAnyBreak(newMin)) {
            newMin -= this.closestPointRange;
          }
          while (this.isInAnyBreak(newMax)) {
            newMax -= this.closestPointRange;
          }
          Axis.prototype.setExtremes.call(this, newMin, newMax, redraw, animation, eventArguments);
        };
        axis.setAxisTranslation = function(saveOld) {
          Axis.prototype.setAxisTranslation.call(this, saveOld);
          var breaks = axis.options.breaks,
            breakArrayT = [],
            breakArray = [],
            length = 0,
            inBrk,
            repeat,
            brk,
            min = axis.userMin || axis.min,
            max = axis.userMax || axis.max,
            start,
            i,
            j;
          for (i in breaks) {
            brk = breaks[i];
            repeat = brk.repeat || Infinity;
            if (axis.isInBreak(brk, min)) {
              min += (brk.to % repeat) - (min % repeat);
            }
            if (axis.isInBreak(brk, max)) {
              max -= (max % repeat) - (brk.from % repeat);
            }
          }
          for (i in breaks) {
            brk = breaks[i];
            start = brk.from;
            repeat = brk.repeat || Infinity;
            while (start - repeat > min) {
              start -= repeat;
            }
            while (start < min) {
              start += repeat;
            }
            for (j = start; j < max; j += repeat) {
              breakArrayT.push({
                value: j,
                move: 'in'
              });
              breakArrayT.push({
                value: j + (brk.to - brk.from),
                move: 'out',
                size: brk.breakSize
              });
            }
          }
          breakArrayT.sort(function(a, b) {
            var ret;
            if (a.value === b.value) {
              ret = (a.move === 'in' ? 0 : 1) - (b.move === 'in' ? 0 : 1);
            } else {
              ret = a.value - b.value;
            }
            return ret;
          });
          inBrk = 0;
          start = min;
          for (i in breakArrayT) {
            brk = breakArrayT[i];
            inBrk += (brk.move === 'in' ? 1 : -1);
            if (inBrk === 1 && brk.move === 'in') {
              start = brk.value;
            }
            if (inBrk === 0) {
              breakArray.push({
                from: start,
                to: brk.value,
                len: brk.value - start - (brk.size || 0)
              });
              length += brk.value - start - (brk.size || 0);
            }
          }
          axis.breakArray = breakArray;
          fireEvent(axis, 'afterBreaks');
          axis.transA *= ((max - axis.min) / (max - min - length));
          axis.min = min;
          axis.max = max;
        };
      }
    });
    wrap(Series.prototype, 'generatePoints', function(proceed) {
      proceed.apply(this, stripArguments(arguments));
      var series = this,
        xAxis = series.xAxis,
        yAxis = series.yAxis,
        points = series.points,
        point,
        i = points.length,
        connectNulls = series.options.connectNulls,
        nullGap;
      if (xAxis && yAxis && (xAxis.options.breaks || yAxis.options.breaks)) {
        while (i--) {
          point = points[i];
          nullGap = point.y === null && connectNulls === false;
          if (!nullGap && (xAxis.isInAnyBreak(point.x, true) || yAxis.isInAnyBreak(point.y, true))) {
            points.splice(i, 1);
            if (this.data[i]) {
              this.data[i].destroyElements();
            }
          }
        }
      }
    });

    function drawPointsWrapped(proceed) {
      proceed.apply(this);
      this.drawBreaks(this.xAxis, ['x']);
      this.drawBreaks(this.yAxis, pick(this.pointArrayMap, ['y']));
    }
    H.Series.prototype.drawBreaks = function(axis, keys) {
      var series = this,
        points = series.points,
        breaks,
        threshold,
        eventName,
        y;
      if (!axis) {
        return;
      }
      each(keys, function(key) {
        breaks = axis.breakArray || [];
        threshold = axis.isXAxis ? axis.min : pick(series.options.threshold, axis.min);
        each(points, function(point) {
          y = pick(point['stack' + key.toUpperCase()], point[key]);
          each(breaks, function(brk) {
            eventName = false;
            if ((threshold < brk.from && y > brk.to) || (threshold > brk.from && y < brk.from)) {
              eventName = 'pointBreak';
            } else if ((threshold < brk.from && y > brk.from && y < brk.to) || (threshold > brk.from && y > brk.to && y < brk.from)) {
              eventName = 'pointInBreak';
            }
            if (eventName) {
              fireEvent(axis, eventName, {
                point: point,
                brk: brk
              });
            }
          });
        });
      });
    };
    wrap(H.seriesTypes.column.prototype, 'drawPoints', drawPointsWrapped);
    wrap(H.Series.prototype, 'drawPoints', drawPointsWrapped);
  }(Highcharts));
  (function() {
    'use strict';
  }());
  (function(H) {
    'use strict';
    var arrayMax = H.arrayMax,
      arrayMin = H.arrayMin,
      Axis = H.Axis,
      defaultPlotOptions = H.defaultPlotOptions,
      defined = H.defined,
      each = H.each,
      extend = H.extend,
      format = H.format,
      isNumber = H.isNumber,
      merge = H.merge,
      pick = H.pick,
      Point = H.Point,
      Series = H.Series,
      Tooltip = H.Tooltip,
      wrap = H.wrap;
    var seriesProto = Series.prototype,
      baseProcessData = seriesProto.processData,
      baseGeneratePoints = seriesProto.generatePoints,
      baseDestroy = seriesProto.destroy,
      commonOptions = {
        approximation: 'average',
        groupPixelWidth: 2,
        dateTimeLabelFormats: {
          millisecond: ['%A, %b %e, %H:%M:%S.%L', '%A, %b %e, %H:%M:%S.%L', '-%H:%M:%S.%L'],
          second: ['%A, %b %e, %H:%M:%S', '%A, %b %e, %H:%M:%S', '-%H:%M:%S'],
          minute: ['%A, %b %e, %H:%M', '%A, %b %e, %H:%M', '-%H:%M'],
          hour: ['%A, %b %e, %H:%M', '%A, %b %e, %H:%M', '-%H:%M'],
          day: ['%A, %b %e, %Y', '%A, %b %e', '-%A, %b %e, %Y'],
          week: ['Week from %A, %b %e, %Y', '%A, %b %e', '-%A, %b %e, %Y'],
          month: ['%B %Y', '%B', '-%B %Y'],
          year: ['%Y', '%Y', '-%Y']
        }
      },
      specificOptions = {
        line: {},
        spline: {},
        area: {},
        areaspline: {},
        column: {
          approximation: 'sum',
          groupPixelWidth: 10
        },
        arearange: {
          approximation: 'range'
        },
        areasplinerange: {
          approximation: 'range'
        },
        columnrange: {
          approximation: 'range',
          groupPixelWidth: 10
        },
        candlestick: {
          approximation: 'ohlc',
          groupPixelWidth: 10
        },
        ohlc: {
          approximation: 'ohlc',
          groupPixelWidth: 5
        }
      },
      defaultDataGroupingUnits = H.defaultDataGroupingUnits = [
        [
          'millisecond', [1, 2, 5, 10, 20, 25, 50, 100, 200, 500]
        ],
        [
          'second', [1, 2, 5, 10, 15, 30]
        ],
        [
          'minute', [1, 2, 5, 10, 15, 30]
        ],
        [
          'hour', [1, 2, 3, 4, 6, 8, 12]
        ],
        [
          'day', [1]
        ],
        [
          'week', [1]
        ],
        [
          'month', [1, 3, 6]
        ],
        [
          'year',
          null
        ]
      ],
      approximations = {
        sum: function(arr) {
          var len = arr.length,
            ret;
          if (!len && arr.hasNulls) {
            ret = null;
          } else if (len) {
            ret = 0;
            while (len--) {
              ret += arr[len];
            }
          }
          return ret;
        },
        average: function(arr) {
          var len = arr.length,
            ret = approximations.sum(arr);
          if (isNumber(ret) && len) {
            ret = ret / len;
          }
          return ret;
        },
        open: function(arr) {
          return arr.length ? arr[0] : (arr.hasNulls ? null : undefined);
        },
        high: function(arr) {
          return arr.length ? arrayMax(arr) : (arr.hasNulls ? null : undefined);
        },
        low: function(arr) {
          return arr.length ? arrayMin(arr) : (arr.hasNulls ? null : undefined);
        },
        close: function(arr) {
          return arr.length ? arr[arr.length - 1] : (arr.hasNulls ? null : undefined);
        },
        ohlc: function(open, high, low, close) {
          open = approximations.open(open);
          high = approximations.high(high);
          low = approximations.low(low);
          close = approximations.close(close);
          if (isNumber(open) || isNumber(high) || isNumber(low) || isNumber(close)) {
            return [open, high, low, close];
          }
        },
        range: function(low, high) {
          low = approximations.low(low);
          high = approximations.high(high);
          if (isNumber(low) || isNumber(high)) {
            return [low, high];
          }
        }
      };
    seriesProto.groupData = function(xData, yData, groupPositions, approximation) {
      var series = this,
        data = series.data,
        dataOptions = series.options.data,
        groupedXData = [],
        groupedYData = [],
        groupMap = [],
        dataLength = xData.length,
        pointX,
        pointY,
        groupedY,
        handleYData = !!yData,
        values = [
          [],
          [],
          [],
          []
        ],
        approximationFn = typeof approximation === 'function' ? approximation : approximations[approximation],
        pointArrayMap = series.pointArrayMap,
        pointArrayMapLength = pointArrayMap && pointArrayMap.length,
        i,
        pos = 0,
        start = 0;
      for (i = 0; i <= dataLength; i++) {
        if (xData[i] >= groupPositions[0]) {
          break;
        }
      }
      for (i; i <= dataLength; i++) {
        while ((groupPositions[pos + 1] !== undefined && xData[i] >= groupPositions[pos + 1]) ||
          i === dataLength) {
          pointX = groupPositions[pos];
          series.dataGroupInfo = {
            start: start,
            length: values[0].length
          };
          groupedY = approximationFn.apply(series, values);
          if (groupedY !== undefined) {
            groupedXData.push(pointX);
            groupedYData.push(groupedY);
            groupMap.push(series.dataGroupInfo);
          }
          start = i;
          values[0] = [];
          values[1] = [];
          values[2] = [];
          values[3] = [];
          pos += 1;
          if (i === dataLength) {
            break;
          }
        }
        if (i === dataLength) {
          break;
        }
        if (pointArrayMap) {
          var index = series.cropStart + i,
            point = (data && data[index]) || series.pointClass.prototype.applyOptions.apply({
              series: series
            }, [dataOptions[index]]),
            j,
            val;
          for (j = 0; j < pointArrayMapLength; j++) {
            val = point[pointArrayMap[j]];
            if (isNumber(val)) {
              values[j].push(val);
            } else if (val === null) {
              values[j].hasNulls = true;
            }
          }
        } else {
          pointY = handleYData ? yData[i] : null;
          if (isNumber(pointY)) {
            values[0].push(pointY);
          } else if (pointY === null) {
            values[0].hasNulls = true;
          }
        }
      }
      return [groupedXData, groupedYData, groupMap];
    };
    seriesProto.processData = function() {
      var series = this,
        chart = series.chart,
        options = series.options,
        dataGroupingOptions = options.dataGrouping,
        groupingEnabled = series.allowDG !== false && dataGroupingOptions &&
        pick(dataGroupingOptions.enabled, chart.options.isStock),
        visible = series.visible || !chart.options.chart.ignoreHiddenSeries,
        hasGroupedData,
        skip;
      series.forceCrop = groupingEnabled;
      series.groupPixelWidth = null;
      series.hasProcessed = true;
      skip = baseProcessData.apply(series, arguments) === false ||
        !groupingEnabled || !visible;
      if (!skip) {
        series.destroyGroupedData();
        var i,
          processedXData = series.processedXData,
          processedYData = series.processedYData,
          plotSizeX = chart.plotSizeX,
          xAxis = series.xAxis,
          ordinal = xAxis.options.ordinal,
          groupPixelWidth = series.groupPixelWidth = xAxis.getGroupPixelWidth && xAxis.getGroupPixelWidth();
        if (groupPixelWidth) {
          hasGroupedData = true;
          series.isDirty = true;
          var extremes = xAxis.getExtremes(),
            xMin = extremes.min,
            xMax = extremes.max,
            groupIntervalFactor = (ordinal && xAxis.getGroupIntervalFactor(xMin, xMax, series)) || 1,
            interval = (groupPixelWidth * (xMax - xMin) / plotSizeX) * groupIntervalFactor,
            groupPositions = xAxis.getTimeTicks(
              xAxis.normalizeTimeTickInterval(interval, dataGroupingOptions.units || defaultDataGroupingUnits),
              Math.min(xMin, processedXData[0]),
              Math.max(xMax, processedXData[processedXData.length - 1]),
              xAxis.options.startOfWeek,
              processedXData,
              series.closestPointRange
            ),
            groupedData = seriesProto.groupData.apply(series, [processedXData, processedYData, groupPositions, dataGroupingOptions.approximation]),
            groupedXData = groupedData[0],
            groupedYData = groupedData[1];
          if (dataGroupingOptions.smoothed) {
            i = groupedXData.length - 1;
            groupedXData[i] = Math.min(groupedXData[i], xMax);
            while (i-- && i > 0) {
              groupedXData[i] += interval / 2;
            }
            groupedXData[0] = Math.max(groupedXData[0], xMin);
          }
          series.currentDataGrouping = groupPositions.info;
          series.closestPointRange = groupPositions.info.totalRange;
          series.groupMap = groupedData[2];
          if (defined(groupedXData[0]) && groupedXData[0] < xAxis.dataMin) {
            if (xAxis.min === xAxis.dataMin) {
              xAxis.min = groupedXData[0];
            }
            xAxis.dataMin = groupedXData[0];
          }
          series.processedXData = groupedXData;
          series.processedYData = groupedYData;
        } else {
          series.currentDataGrouping = series.groupMap = null;
        }
        series.hasGroupedData = hasGroupedData;
      }
    };
    seriesProto.destroyGroupedData = function() {
      var groupedData = this.groupedData;
      each(groupedData || [], function(point, i) {
        if (point) {
          groupedData[i] = point.destroy ? point.destroy() : null;
        }
      });
      this.groupedData = null;
    };
    seriesProto.generatePoints = function() {
      baseGeneratePoints.apply(this);
      this.destroyGroupedData();
      this.groupedData = this.hasGroupedData ? this.points : null;
    };
    wrap(Point.prototype, 'update', function(proceed) {
      if (this.dataGroup) {
        H.error(24);
      } else {
        proceed.apply(this, [].slice.call(arguments, 1));
      }
    });
    wrap(Tooltip.prototype, 'tooltipFooterHeaderFormatter', function(proceed, labelConfig, isFooter) {
      var tooltip = this,
        series = labelConfig.series,
        options = series.options,
        tooltipOptions = series.tooltipOptions,
        dataGroupingOptions = options.dataGrouping,
        xDateFormat = tooltipOptions.xDateFormat,
        xDateFormatEnd,
        xAxis = series.xAxis,
        dateFormat = H.dateFormat,
        currentDataGrouping,
        dateTimeLabelFormats,
        labelFormats,
        formattedKey;
      if (xAxis && xAxis.options.type === 'datetime' && dataGroupingOptions && isNumber(labelConfig.key)) {
        currentDataGrouping = series.currentDataGrouping;
        dateTimeLabelFormats = dataGroupingOptions.dateTimeLabelFormats;
        if (currentDataGrouping) {
          labelFormats = dateTimeLabelFormats[currentDataGrouping.unitName];
          if (currentDataGrouping.count === 1) {
            xDateFormat = labelFormats[0];
          } else {
            xDateFormat = labelFormats[1];
            xDateFormatEnd = labelFormats[2];
          }
        } else if (!xDateFormat && dateTimeLabelFormats) {
          xDateFormat = tooltip.getXDateFormat(labelConfig, tooltipOptions, xAxis);
        }
        formattedKey = dateFormat(xDateFormat, labelConfig.key);
        if (xDateFormatEnd) {
          formattedKey += dateFormat(xDateFormatEnd, labelConfig.key + currentDataGrouping.totalRange - 1);
        }
        return format(tooltipOptions[(isFooter ? 'footer' : 'header') + 'Format'], {
          point: extend(labelConfig.point, {
            key: formattedKey
          }),
          series: series
        });
      }
      return proceed.call(tooltip, labelConfig, isFooter);
    });
    seriesProto.destroy = function() {
      var series = this,
        groupedData = series.groupedData || [],
        i = groupedData.length;
      while (i--) {
        if (groupedData[i]) {
          groupedData[i].destroy();
        }
      }
      baseDestroy.apply(series);
    };
    wrap(seriesProto, 'setOptions', function(proceed, itemOptions) {
      var options = proceed.call(this, itemOptions),
        type = this.type,
        plotOptions = this.chart.options.plotOptions,
        defaultOptions = defaultPlotOptions[type].dataGrouping;
      if (specificOptions[type]) {
        if (!defaultOptions) {
          defaultOptions = merge(commonOptions, specificOptions[type]);
        }
        options.dataGrouping = merge(
          defaultOptions,
          plotOptions.series && plotOptions.series.dataGrouping,
          plotOptions[type].dataGrouping,
          itemOptions.dataGrouping
        );
      }
      if (this.chart.options.isStock) {
        this.requireSorting = true;
      }
      return options;
    });
    wrap(Axis.prototype, 'setScale', function(proceed) {
      proceed.call(this);
      each(this.series, function(series) {
        series.hasProcessed = false;
      });
    });
    Axis.prototype.getGroupPixelWidth = function() {
      var series = this.series,
        len = series.length,
        i,
        groupPixelWidth = 0,
        doGrouping = false,
        dataLength,
        dgOptions;
      i = len;
      while (i--) {
        dgOptions = series[i].options.dataGrouping;
        if (dgOptions) {
          groupPixelWidth = Math.max(groupPixelWidth, dgOptions.groupPixelWidth);
        }
      }
      i = len;
      while (i--) {
        dgOptions = series[i].options.dataGrouping;
        if (dgOptions && series[i].hasProcessed) {
          dataLength = (series[i].processedXData || series[i].data).length;
          if (series[i].groupPixelWidth || dataLength > (this.chart.plotSizeX / groupPixelWidth) || (dataLength && dgOptions.forced)) {
            doGrouping = true;
          }
        }
      }
      return doGrouping ? groupPixelWidth : 0;
    };
    Axis.prototype.setDataGrouping = function(dataGrouping, redraw) {
      var i;
      redraw = pick(redraw, true);
      if (!dataGrouping) {
        dataGrouping = {
          forced: false,
          units: null
        };
      }
      if (this instanceof Axis) {
        i = this.series.length;
        while (i--) {
          this.series[i].update({
            dataGrouping: dataGrouping
          }, false);
        }
      } else {
        each(this.chart.options.series, function(seriesOptions) {
          seriesOptions.dataGrouping = dataGrouping;
        }, false);
      }
      if (redraw) {
        this.chart.redraw();
      }
    };
  }(Highcharts));
  (function(H) {
    'use strict';
    var each = H.each,
      Point = H.Point,
      seriesType = H.seriesType,
      seriesTypes = H.seriesTypes;
    seriesType('ohlc', 'column', {
      lineWidth: 1,
      tooltip: {
        pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> {series.name}</b><br/>' +
          'Open: {point.open}<br/>' +
          'High: {point.high}<br/>' +
          'Low: {point.low}<br/>' +
          'Close: {point.close}<br/>'
      },
      threshold: null,
      states: {
        hover: {
          lineWidth: 3
        }
      }
    }, {
      pointArrayMap: ['open', 'high', 'low', 'close'],
      toYData: function(point) {
        return [point.open, point.high, point.low, point.close];
      },
      pointValKey: 'high',
      pointAttrToOptions: {
        'stroke': 'color',
        'stroke-width': 'lineWidth'
      },
      pointAttribs: function(point, state) {
        var attribs = seriesTypes.column.prototype.pointAttribs.call(
            this,
            point,
            state
          ),
          options = this.options;
        delete attribs.fill;
        if (!point.options.color &&
          options.upColor &&
          point.open < point.close
        ) {
          attribs.stroke = options.upColor;
        }
        return attribs;
      },
      translate: function() {
        var series = this,
          yAxis = series.yAxis,
          hasModifyValue = !!series.modifyValue,
          translatedOLC = ['plotOpen', 'yBottom', 'plotClose'];
        seriesTypes.column.prototype.translate.apply(series);
        each(series.points, function(point) {
          each([point.open, point.low, point.close], function(value, i) {
            if (value !== null) {
              if (hasModifyValue) {
                value = series.modifyValue(value);
              }
              point[translatedOLC[i]] = yAxis.toPixels(value, true);
            }
          });
        });
      },
      drawPoints: function() {
        var series = this,
          points = series.points,
          chart = series.chart;
        each(points, function(point) {
          var plotOpen,
            plotClose,
            crispCorr,
            halfWidth,
            path,
            graphic = point.graphic,
            crispX,
            isNew = !graphic;
          if (point.plotY !== undefined) {
            if (!graphic) {
              point.graphic = graphic = chart.renderer.path()
                .add(series.group);
            }
            graphic.attr(series.pointAttribs(point, point.selected && 'select'));
            crispCorr = (graphic.strokeWidth() % 2) / 2;
            crispX = Math.round(point.plotX) - crispCorr;
            halfWidth = Math.round(point.shapeArgs.width / 2);
            path = [
              'M',
              crispX, Math.round(point.yBottom),
              'L',
              crispX, Math.round(point.plotY)
            ];
            if (point.open !== null) {
              plotOpen = Math.round(point.plotOpen) + crispCorr;
              path.push(
                'M',
                crispX,
                plotOpen,
                'L',
                crispX - halfWidth,
                plotOpen
              );
            }
            if (point.close !== null) {
              plotClose = Math.round(point.plotClose) + crispCorr;
              path.push(
                'M',
                crispX,
                plotClose,
                'L',
                crispX + halfWidth,
                plotClose
              );
            }
            graphic[isNew ? 'attr' : 'animate']({
                d: path
              })
              .addClass(point.getClassName(), true);
          }
        });
      },
      animate: null
    }, {
      getClassName: function() {
        return Point.prototype.getClassName.call(this) +
          (this.open < this.close ? ' highcharts-point-up' : ' highcharts-point-down');
      }
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var defaultPlotOptions = H.defaultPlotOptions,
      each = H.each,
      merge = H.merge,
      seriesType = H.seriesType,
      seriesTypes = H.seriesTypes;
    seriesType('candlestick', 'ohlc', merge(defaultPlotOptions.column, {
      states: {
        hover: {
          lineWidth: 2
        }
      },
      tooltip: defaultPlotOptions.ohlc.tooltip,
      threshold: null,
      lineColor: '#000000',
      lineWidth: 1,
      upColor: '#ffffff'
    }), {
      pointAttribs: function(point, state) {
        var attribs = seriesTypes.column.prototype.pointAttribs.call(this, point, state),
          options = this.options,
          isUp = point.open < point.close,
          stroke = options.lineColor || this.color,
          stateOptions;
        attribs['stroke-width'] = options.lineWidth;
        attribs.fill = point.options.color || (isUp ? (options.upColor || this.color) : this.color);
        attribs.stroke = point.lineColor || (isUp ? (options.upLineColor || stroke) : stroke);
        if (state) {
          stateOptions = options.states[state];
          attribs.fill = stateOptions.color || attribs.fill;
          attribs.stroke = stateOptions.lineColor || attribs.stroke;
          attribs['stroke-width'] =
            stateOptions.lineWidth || attribs['stroke-width'];
        }
        return attribs;
      },
      drawPoints: function() {
        var series = this,
          points = series.points,
          chart = series.chart;
        each(points, function(point) {
          var graphic = point.graphic,
            plotOpen,
            plotClose,
            topBox,
            bottomBox,
            hasTopWhisker,
            hasBottomWhisker,
            crispCorr,
            crispX,
            path,
            halfWidth,
            isNew = !graphic;
          if (point.plotY !== undefined) {
            if (!graphic) {
              point.graphic = graphic = chart.renderer.path()
                .add(series.group);
            }
            graphic
              .attr(series.pointAttribs(point, point.selected && 'select'))
              .shadow(series.options.shadow);
            crispCorr = (graphic.strokeWidth() % 2) / 2;
            crispX = Math.round(point.plotX) - crispCorr;
            plotOpen = point.plotOpen;
            plotClose = point.plotClose;
            topBox = Math.min(plotOpen, plotClose);
            bottomBox = Math.max(plotOpen, plotClose);
            halfWidth = Math.round(point.shapeArgs.width / 2);
            hasTopWhisker = Math.round(topBox) !== Math.round(point.plotY);
            hasBottomWhisker = bottomBox !== point.yBottom;
            topBox = Math.round(topBox) + crispCorr;
            bottomBox = Math.round(bottomBox) + crispCorr;
            path = [];
            path.push(
              'M',
              crispX - halfWidth, bottomBox,
              'L',
              crispX - halfWidth, topBox,
              'L',
              crispX + halfWidth, topBox,
              'L',
              crispX + halfWidth, bottomBox,
              'Z',
              'M',
              crispX, topBox,
              'L',
              crispX, hasTopWhisker ? Math.round(point.plotY) : topBox,
              'M',
              crispX, bottomBox,
              'L',
              crispX, hasBottomWhisker ? Math.round(point.yBottom) : bottomBox
            );
            graphic[isNew ? 'attr' : 'animate']({
                d: path
              })
              .addClass(point.getClassName(), true);
          }
        });
      }
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var addEvent = H.addEvent,
      each = H.each,
      merge = H.merge,
      noop = H.noop,
      Renderer = H.Renderer,
      Series = H.Series,
      seriesType = H.seriesType,
      seriesTypes = H.seriesTypes,
      SVGRenderer = H.SVGRenderer,
      TrackerMixin = H.TrackerMixin,
      VMLRenderer = H.VMLRenderer,
      symbols = SVGRenderer.prototype.symbols;
    seriesType('flags', 'column', {
      pointRange: 0,
      shape: 'flag',
      stackDistance: 12,
      textAlign: 'center',
      tooltip: {
        pointFormat: '{point.text}<br/>'
      },
      threshold: null,
      y: -30,
      fillColor: '#ffffff',
      lineWidth: 1,
      states: {
        hover: {
          lineColor: '#000000',
          fillColor: '#ccd6eb'
        }
      },
      style: {
        fontSize: '11px',
        fontWeight: 'bold'
      }
    }, {
      sorted: false,
      noSharedTooltip: true,
      allowDG: false,
      takeOrdinalPosition: false,
      trackerGroups: ['markerGroup'],
      forceCrop: true,
      init: Series.prototype.init,
      pointAttribs: function(point, state) {
        var options = this.options,
          color = (point && point.color) || this.color,
          lineColor = options.lineColor,
          lineWidth = (point && point.lineWidth),
          fill = (point && point.fillColor) || options.fillColor;
        if (state) {
          fill = options.states[state].fillColor;
          lineColor = options.states[state].lineColor;
          lineWidth = options.states[state].lineWidth;
        }
        return {
          'fill': fill || color,
          'stroke': lineColor || color,
          'stroke-width': lineWidth || options.lineWidth || 0
        };
      },
      translate: function() {
        seriesTypes.column.prototype.translate.apply(this);
        var series = this,
          options = series.options,
          chart = series.chart,
          points = series.points,
          cursor = points.length - 1,
          point,
          lastPoint,
          optionsOnSeries = options.onSeries,
          onSeries = optionsOnSeries && chart.get(optionsOnSeries),
          onKey = options.onKey || 'y',
          step = onSeries && onSeries.options.step,
          onData = onSeries && onSeries.points,
          i = onData && onData.length,
          xAxis = series.xAxis,
          xAxisExt = xAxis.getExtremes(),
          xOffset = 0,
          leftPoint,
          lastX,
          rightPoint,
          currentDataGrouping;
        if (onSeries && onSeries.visible && i) {
          xOffset = (onSeries.pointXOffset || 0) + (onSeries.barW || 0) / 2;
          currentDataGrouping = onSeries.currentDataGrouping;
          lastX = onData[i - 1].x + (currentDataGrouping ? currentDataGrouping.totalRange : 0);
          points.sort(function(a, b) {
            return (a.x - b.x);
          });
          onKey = 'plot' + onKey[0].toUpperCase() + onKey.substr(1);
          while (i-- && points[cursor]) {
            point = points[cursor];
            leftPoint = onData[i];
            if (leftPoint.x <= point.x && leftPoint[onKey] !== undefined) {
              if (point.x <= lastX) {
                point.plotY = leftPoint[onKey];
                if (leftPoint.x < point.x && !step) {
                  rightPoint = onData[i + 1];
                  if (rightPoint && rightPoint[onKey] !== undefined) {
                    point.plotY +=
                      ((point.x - leftPoint.x) / (rightPoint.x - leftPoint.x)) *
                      (rightPoint[onKey] - leftPoint[onKey]);
                  }
                }
              }
              cursor--;
              i++;
              if (cursor < 0) {
                break;
              }
            }
          }
        }
        each(points, function(point, i) {
          var stackIndex;
          if (point.plotY === undefined) {
            if (point.x >= xAxisExt.min && point.x <= xAxisExt.max) {
              point.plotY = chart.chartHeight - xAxis.bottom - (xAxis.opposite ? xAxis.height : 0) + xAxis.offset - chart.plotTop;
            } else {
              point.shapeArgs = {};
            }
          }
          point.plotX += xOffset;
          lastPoint = points[i - 1];
          if (lastPoint && lastPoint.plotX === point.plotX) {
            if (lastPoint.stackIndex === undefined) {
              lastPoint.stackIndex = 0;
            }
            stackIndex = lastPoint.stackIndex + 1;
          }
          point.stackIndex = stackIndex;
        });
      },
      drawPoints: function() {
        var series = this,
          points = series.points,
          chart = series.chart,
          renderer = chart.renderer,
          plotX,
          plotY,
          options = series.options,
          optionsY = options.y,
          shape,
          i,
          point,
          graphic,
          stackIndex,
          anchorX,
          anchorY,
          outsideRight,
          yAxis = series.yAxis;
        i = points.length;
        while (i--) {
          point = points[i];
          outsideRight = point.plotX > series.xAxis.len;
          plotX = point.plotX;
          stackIndex = point.stackIndex;
          shape = point.options.shape || options.shape;
          plotY = point.plotY;
          if (plotY !== undefined) {
            plotY = point.plotY + optionsY - (stackIndex !== undefined && stackIndex * options.stackDistance);
          }
          anchorX = stackIndex ? undefined : point.plotX;
          anchorY = stackIndex ? undefined : point.plotY;
          graphic = point.graphic;
          if (plotY !== undefined && plotX >= 0 && !outsideRight) {
            if (!graphic) {
              graphic = point.graphic = renderer.label(
                  '',
                  null,
                  null,
                  shape,
                  null,
                  null,
                  options.useHTML
                )
                .attr(series.pointAttribs(point))
                .css(merge(options.style, point.style))
                .attr({
                  align: shape === 'flag' ? 'left' : 'center',
                  width: options.width,
                  height: options.height,
                  'text-align': options.textAlign
                })
                .addClass('highcharts-point')
                .add(series.markerGroup);
              graphic.shadow(options.shadow);
            }
            if (plotX > 0) {
              plotX -= graphic.strokeWidth() % 2;
            }
            graphic.attr({
              text: point.options.title || options.title || 'A',
              x: plotX,
              y: plotY,
              anchorX: anchorX,
              anchorY: anchorY
            });
            point.tooltipPos = chart.inverted ? [yAxis.len + yAxis.pos - chart.plotLeft - plotY, series.xAxis.len - plotX] : [plotX, plotY];
          } else if (graphic) {
            point.graphic = graphic.destroy();
          }
        }
      },
      drawTracker: function() {
        var series = this,
          points = series.points;
        TrackerMixin.drawTrackerPoint.apply(this);
        each(points, function(point) {
          var graphic = point.graphic;
          if (graphic) {
            addEvent(graphic.element, 'mouseover', function() {
              if (point.stackIndex > 0 && !point.raised) {
                point._y = graphic.y;
                graphic.attr({
                  y: point._y - 8
                });
                point.raised = true;
              }
              each(points, function(otherPoint) {
                if (otherPoint !== point && otherPoint.raised && otherPoint.graphic) {
                  otherPoint.graphic.attr({
                    y: otherPoint._y
                  });
                  otherPoint.raised = false;
                }
              });
            });
          }
        });
      },
      animate: noop,
      buildKDTree: noop,
      setClip: noop
    });
    symbols.flag = function(x, y, w, h, options) {
      var anchorX = (options && options.anchorX) || x,
        anchorY = (options && options.anchorY) || y;
      return [
        'M', anchorX, anchorY,
        'L', x, y + h,
        x, y,
        x + w, y,
        x + w, y + h,
        x, y + h,
        'Z'
      ];
    };
    each(['circle', 'square'], function(shape) {
      symbols[shape + 'pin'] = function(x, y, w, h, options) {
        var anchorX = options && options.anchorX,
          anchorY = options && options.anchorY,
          path,
          labelTopOrBottomY;
        if (shape === 'circle' && h > w) {
          x -= Math.round((h - w) / 2);
          w = h;
        }
        path = symbols[shape](x, y, w, h);
        if (anchorX && anchorY) {
          labelTopOrBottomY = (y > anchorY) ? y : y + h;
          path.push('M', anchorX, labelTopOrBottomY, 'L', anchorX, anchorY);
        }
        return path;
      };
    });
    if (Renderer === VMLRenderer) {
      each(['flag', 'circlepin', 'squarepin'], function(shape) {
        VMLRenderer.prototype.symbols[shape] = symbols[shape];
      });
    }
  }(Highcharts));
  (function(H) {
    'use strict';
    var addEvent = H.addEvent,
      Axis = H.Axis,
      correctFloat = H.correctFloat,
      defaultOptions = H.defaultOptions,
      defined = H.defined,
      destroyObjectProperties = H.destroyObjectProperties,
      doc = H.doc,
      each = H.each,
      fireEvent = H.fireEvent,
      hasTouch = H.hasTouch,
      isTouchDevice = H.isTouchDevice,
      merge = H.merge,
      pick = H.pick,
      removeEvent = H.removeEvent,
      svg = H.svg,
      wrap = H.wrap,
      swapXY;
    var defaultScrollbarOptions = {
      height: isTouchDevice ? 20 : 14,
      barBorderRadius: 0,
      buttonBorderRadius: 0,
      liveRedraw: svg && !isTouchDevice,
      margin: 10,
      minWidth: 6,
      step: 0.2,
      zIndex: 3,
      barBackgroundColor: '#cccccc',
      barBorderWidth: 1,
      barBorderColor: '#cccccc',
      buttonArrowColor: '#333333',
      buttonBackgroundColor: '#e6e6e6',
      buttonBorderColor: '#cccccc',
      buttonBorderWidth: 1,
      rifleColor: '#333333',
      trackBackgroundColor: '#f2f2f2',
      trackBorderColor: '#f2f2f2',
      trackBorderWidth: 1
    };
    defaultOptions.scrollbar = merge(true, defaultScrollbarOptions, defaultOptions.scrollbar);
    H.swapXY = swapXY = function(path, vertical) {
      var i,
        len = path.length,
        temp;
      if (vertical) {
        for (i = 0; i < len; i += 3) {
          temp = path[i + 1];
          path[i + 1] = path[i + 2];
          path[i + 2] = temp;
        }
      }
      return path;
    };

    function Scrollbar(renderer, options, chart) {
      this.init(renderer, options, chart);
    }
    Scrollbar.prototype = {
      init: function(renderer, options, chart) {
        this.scrollbarButtons = [];
        this.renderer = renderer;
        this.userOptions = options;
        this.options = merge(defaultScrollbarOptions, options);
        this.chart = chart;
        this.size = pick(this.options.size, this.options.height);
        if (options.enabled) {
          this.render();
          this.initEvents();
          this.addEvents();
        }
      },
      render: function() {
        var scroller = this,
          renderer = scroller.renderer,
          options = scroller.options,
          size = scroller.size,
          group;
        scroller.group = group = renderer.g('scrollbar').attr({
          zIndex: options.zIndex,
          translateY: -99999
        }).add();
        scroller.track = renderer.rect()
          .addClass('highcharts-scrollbar-track')
          .attr({
            x: 0,
            r: options.trackBorderRadius || 0,
            height: size,
            width: size
          }).add(group);
        scroller.track.attr({
          fill: options.trackBackgroundColor,
          stroke: options.trackBorderColor,
          'stroke-width': options.trackBorderWidth
        });
        this.trackBorderWidth = scroller.track.strokeWidth();
        scroller.track.attr({
          y: -this.trackBorderWidth % 2 / 2
        });
        scroller.scrollbarGroup = renderer.g().add(group);
        scroller.scrollbar = renderer.rect()
          .addClass('highcharts-scrollbar-thumb')
          .attr({
            height: size,
            width: size,
            r: options.barBorderRadius || 0
          }).add(scroller.scrollbarGroup);
        scroller.scrollbarRifles = renderer.path(
            swapXY([
              'M', -3, size / 4,
              'L', -3, 2 * size / 3,
              'M',
              0, size / 4,
              'L',
              0, 2 * size / 3,
              'M',
              3, size / 4,
              'L',
              3, 2 * size / 3
            ], options.vertical))
          .addClass('highcharts-scrollbar-rifles')
          .add(scroller.scrollbarGroup);
        scroller.scrollbar.attr({
          fill: options.barBackgroundColor,
          stroke: options.barBorderColor,
          'stroke-width': options.barBorderWidth
        });
        scroller.scrollbarRifles.attr({
          stroke: options.rifleColor,
          'stroke-width': 1
        });
        scroller.scrollbarStrokeWidth = scroller.scrollbar.strokeWidth();
        scroller.scrollbarGroup.translate(-scroller.scrollbarStrokeWidth % 2 / 2, -scroller.scrollbarStrokeWidth % 2 / 2);
        scroller.drawScrollbarButton(0);
        scroller.drawScrollbarButton(1);
      },
      position: function(x, y, width, height) {
        var scroller = this,
          options = scroller.options,
          vertical = options.vertical,
          xOffset = height,
          yOffset = 0,
          method = scroller.rendered ? 'animate' : 'attr';
        scroller.x = x;
        scroller.y = y + this.trackBorderWidth;
        scroller.width = width;
        scroller.height = height;
        scroller.xOffset = xOffset;
        scroller.yOffset = yOffset;
        if (vertical) {
          scroller.width = scroller.yOffset = width = yOffset = scroller.size;
          scroller.xOffset = xOffset = 0;
          scroller.barWidth = height - width * 2;
          scroller.x = x = x + scroller.options.margin;
        } else {
          scroller.height = scroller.xOffset = height = xOffset = scroller.size;
          scroller.barWidth = width - height * 2;
          scroller.y = scroller.y + scroller.options.margin;
        }
        scroller.group[method]({
          translateX: x,
          translateY: scroller.y
        });
        scroller.track[method]({
          width: width,
          height: height
        });
        scroller.scrollbarButtons[1][method]({
          translateX: vertical ? 0 : width - xOffset,
          translateY: vertical ? height - yOffset : 0
        });
      },
      drawScrollbarButton: function(index) {
        var scroller = this,
          renderer = scroller.renderer,
          scrollbarButtons = scroller.scrollbarButtons,
          options = scroller.options,
          size = scroller.size,
          group,
          tempElem;
        group = renderer.g().add(scroller.group);
        scrollbarButtons.push(group);
        tempElem = renderer.rect()
          .addClass('highcharts-scrollbar-button')
          .add(group);
        tempElem.attr({
          stroke: options.buttonBorderColor,
          'stroke-width': options.buttonBorderWidth,
          fill: options.buttonBackgroundColor
        });
        tempElem.attr(tempElem.crisp({
          x: -0.5,
          y: -0.5,
          width: size + 1,
          height: size + 1,
          r: options.buttonBorderRadius
        }, tempElem.strokeWidth()));
        tempElem = renderer
          .path(swapXY([
            'M',
            size / 2 + (index ? -1 : 1),
            size / 2 - 3,
            'L',
            size / 2 + (index ? -1 : 1),
            size / 2 + 3,
            'L',
            size / 2 + (index ? 2 : -2),
            size / 2
          ], options.vertical))
          .addClass('highcharts-scrollbar-arrow')
          .add(scrollbarButtons[index]);
        tempElem.attr({
          fill: options.buttonArrowColor
        });
      },
      setRange: function(from, to) {
        var scroller = this,
          options = scroller.options,
          vertical = options.vertical,
          minWidth = options.minWidth,
          fullWidth = scroller.barWidth,
          fromPX,
          toPX,
          newPos,
          newSize,
          newRiflesPos,
          method = this.rendered && !this.hasDragged ? 'animate' : 'attr';
        if (!defined(fullWidth)) {
          return;
        }
        from = Math.max(from, 0);
        fromPX = fullWidth * from;
        toPX = fullWidth * Math.min(to, 1);
        scroller.calculatedWidth = newSize = correctFloat(toPX - fromPX);
        if (newSize < minWidth) {
          fromPX = (fullWidth - minWidth + newSize) * from;
          newSize = minWidth;
        }
        newPos = Math.floor(fromPX + scroller.xOffset + scroller.yOffset);
        newRiflesPos = newSize / 2 - 0.5;
        scroller.from = from;
        scroller.to = to;
        if (!vertical) {
          scroller.scrollbarGroup[method]({
            translateX: newPos
          });
          scroller.scrollbar[method]({
            width: newSize
          });
          scroller.scrollbarRifles[method]({
            translateX: newRiflesPos
          });
          scroller.scrollbarLeft = newPos;
          scroller.scrollbarTop = 0;
        } else {
          scroller.scrollbarGroup[method]({
            translateY: newPos
          });
          scroller.scrollbar[method]({
            height: newSize
          });
          scroller.scrollbarRifles[method]({
            translateY: newRiflesPos
          });
          scroller.scrollbarTop = newPos;
          scroller.scrollbarLeft = 0;
        }
        if (newSize <= 12) {
          scroller.scrollbarRifles.hide();
        } else {
          scroller.scrollbarRifles.show(true);
        }
        if (options.showFull === false) {
          if (from <= 0 && to >= 1) {
            scroller.group.hide();
          } else {
            scroller.group.show();
          }
        }
        scroller.rendered = true;
      },
      initEvents: function() {
        var scroller = this;
        scroller.mouseMoveHandler = function(e) {
          var normalizedEvent = scroller.chart.pointer.normalize(e),
            options = scroller.options,
            direction = options.vertical ? 'chartY' : 'chartX',
            initPositions = scroller.initPositions,
            scrollPosition,
            chartPosition,
            change;
          if (scroller.grabbedCenter && (!e.touches || e.touches[0][direction] !== 0)) {
            chartPosition = scroller.cursorToScrollbarPosition(normalizedEvent)[direction];
            scrollPosition = scroller[direction];
            change = chartPosition - scrollPosition;
            scroller.hasDragged = true;
            scroller.updatePosition(initPositions[0] + change, initPositions[1] + change);
            if (scroller.hasDragged) {
              fireEvent(scroller, 'changed', {
                from: scroller.from,
                to: scroller.to,
                trigger: 'scrollbar',
                DOMType: e.type,
                DOMEvent: e
              });
            }
          }
        };
        scroller.mouseUpHandler = function(e) {
          if (scroller.hasDragged) {
            fireEvent(scroller, 'changed', {
              from: scroller.from,
              to: scroller.to,
              trigger: 'scrollbar',
              DOMType: e.type,
              DOMEvent: e
            });
          }
          scroller.grabbedCenter = scroller.hasDragged = scroller.chartX = scroller.chartY = null;
        };
        scroller.mouseDownHandler = function(e) {
          var normalizedEvent = scroller.chart.pointer.normalize(e),
            mousePosition = scroller.cursorToScrollbarPosition(normalizedEvent);
          scroller.chartX = mousePosition.chartX;
          scroller.chartY = mousePosition.chartY;
          scroller.initPositions = [scroller.from, scroller.to];
          scroller.grabbedCenter = true;
        };
        scroller.buttonToMinClick = function(e) {
          var range = correctFloat(scroller.to - scroller.from) * scroller.options.step;
          scroller.updatePosition(correctFloat(scroller.from - range), correctFloat(scroller.to - range));
          fireEvent(scroller, 'changed', {
            from: scroller.from,
            to: scroller.to,
            trigger: 'scrollbar',
            DOMEvent: e
          });
        };
        scroller.buttonToMaxClick = function(e) {
          var range = (scroller.to - scroller.from) * scroller.options.step;
          scroller.updatePosition(scroller.from + range, scroller.to + range);
          fireEvent(scroller, 'changed', {
            from: scroller.from,
            to: scroller.to,
            trigger: 'scrollbar',
            DOMEvent: e
          });
        };
        scroller.trackClick = function(e) {
          var normalizedEvent = scroller.chart.pointer.normalize(e),
            range = scroller.to - scroller.from,
            top = scroller.y + scroller.scrollbarTop,
            left = scroller.x + scroller.scrollbarLeft;
          if ((scroller.options.vertical && normalizedEvent.chartY > top) ||
            (!scroller.options.vertical && normalizedEvent.chartX > left)) {
            scroller.updatePosition(scroller.from + range, scroller.to + range);
          } else {
            scroller.updatePosition(scroller.from - range, scroller.to - range);
          }
          fireEvent(scroller, 'changed', {
            from: scroller.from,
            to: scroller.to,
            trigger: 'scrollbar',
            DOMEvent: e
          });
        };
      },
      cursorToScrollbarPosition: function(normalizedEvent) {
        var scroller = this,
          options = scroller.options,
          minWidthDifference = options.minWidth > scroller.calculatedWidth ? options.minWidth : 0;
        return {
          chartX: (normalizedEvent.chartX - scroller.x - scroller.xOffset) / (scroller.barWidth - minWidthDifference),
          chartY: (normalizedEvent.chartY - scroller.y - scroller.yOffset) / (scroller.barWidth - minWidthDifference)
        };
      },
      updatePosition: function(from, to) {
        if (to > 1) {
          from = correctFloat(1 - correctFloat(to - from));
          to = 1;
        }
        if (from < 0) {
          to = correctFloat(to - from);
          from = 0;
        }
        this.from = from;
        this.to = to;
      },
      update: function(options) {
        this.destroy();
        this.init(this.chart.renderer, merge(true, this.options, options), this.chart);
      },
      addEvents: function() {
        var buttonsOrder = this.options.inverted ? [1, 0] : [0, 1],
          buttons = this.scrollbarButtons,
          bar = this.scrollbarGroup.element,
          track = this.track.element,
          mouseDownHandler = this.mouseDownHandler,
          mouseMoveHandler = this.mouseMoveHandler,
          mouseUpHandler = this.mouseUpHandler,
          _events;
        _events = [
          [buttons[buttonsOrder[0]].element, 'click', this.buttonToMinClick],
          [buttons[buttonsOrder[1]].element, 'click', this.buttonToMaxClick],
          [track, 'click', this.trackClick],
          [bar, 'mousedown', mouseDownHandler],
          [doc, 'mousemove', mouseMoveHandler],
          [doc, 'mouseup', mouseUpHandler]
        ];
        if (hasTouch) {
          _events.push(
            [bar, 'touchstart', mouseDownHandler], [doc, 'touchmove', mouseMoveHandler], [doc, 'touchend', mouseUpHandler]
          );
        }
        each(_events, function(args) {
          addEvent.apply(null, args);
        });
        this._events = _events;
      },
      removeEvents: function() {
        each(this._events, function(args) {
          removeEvent.apply(null, args);
        });
        this._events = undefined;
      },
      destroy: function() {
        var scroller = this.chart.scroller;
        this.removeEvents();
        each(['track', 'scrollbarRifles', 'scrollbar', 'scrollbarGroup', 'group'], function(prop) {
          if (this[prop] && this[prop].destroy) {
            this[prop] = this[prop].destroy();
          }
        }, this);
        if (scroller) {
          scroller.scrollbar = null;
          destroyObjectProperties(scroller.scrollbarButtons);
        }
      }
    };
    wrap(Axis.prototype, 'init', function(proceed) {
      var axis = this;
      proceed.apply(axis, [].slice.call(arguments, 1));
      if (axis.options.scrollbar && axis.options.scrollbar.enabled) {
        axis.options.scrollbar.vertical = !axis.horiz;
        axis.options.startOnTick = axis.options.endOnTick = false;
        axis.scrollbar = new Scrollbar(axis.chart.renderer, axis.options.scrollbar, axis.chart);
        addEvent(axis.scrollbar, 'changed', function(e) {
          var unitedMin = Math.min(pick(axis.options.min, axis.min), axis.min, axis.dataMin),
            unitedMax = Math.max(pick(axis.options.max, axis.max), axis.max, axis.dataMax),
            range = unitedMax - unitedMin,
            to,
            from;
          if ((axis.horiz && !axis.reversed) || (!axis.horiz && axis.reversed)) {
            to = unitedMin + range * this.to;
            from = unitedMin + range * this.from;
          } else {
            to = unitedMin + range * (1 - this.from);
            from = unitedMin + range * (1 - this.to);
          }
          axis.setExtremes(from, to, true, false, e);
        });
      }
    });
    wrap(Axis.prototype, 'render', function(proceed) {
      var axis = this,
        scrollMin = Math.min(pick(axis.options.min, axis.min), axis.min, axis.dataMin),
        scrollMax = Math.max(pick(axis.options.max, axis.max), axis.max, axis.dataMax),
        scrollbar = axis.scrollbar,
        from,
        to;
      proceed.apply(axis, [].slice.call(arguments, 1));
      if (scrollbar) {
        if (axis.horiz) {
          scrollbar.position(
            axis.left,
            axis.top + axis.height + axis.offset + 2 + (axis.opposite ? 0 : axis.axisTitleMargin),
            axis.width,
            axis.height
          );
        } else {
          scrollbar.position(
            axis.left + axis.width + 2 + axis.offset + (axis.opposite ? axis.axisTitleMargin : 0),
            axis.top,
            axis.width,
            axis.height
          );
        }
        if (isNaN(scrollMin) || isNaN(scrollMax) || !defined(axis.min) || !defined(axis.max)) {
          scrollbar.setRange(0, 0);
        } else {
          from = (axis.min - scrollMin) / (scrollMax - scrollMin);
          to = (axis.max - scrollMin) / (scrollMax - scrollMin);
          if ((axis.horiz && !axis.reversed) || (!axis.horiz && axis.reversed)) {
            scrollbar.setRange(from, to);
          } else {
            scrollbar.setRange(1 - to, 1 - from);
          }
        }
      }
    });
    wrap(Axis.prototype, 'getOffset', function(proceed) {
      var axis = this,
        index = axis.horiz ? 2 : 1,
        scrollbar = axis.scrollbar;
      proceed.apply(axis, [].slice.call(arguments, 1));
      if (scrollbar) {
        axis.chart.axisOffset[index] += scrollbar.size + scrollbar.options.margin;
      }
    });
    wrap(Axis.prototype, 'destroy', function(proceed) {
      if (this.scrollbar) {
        this.scrollbar = this.scrollbar.destroy();
      }
      proceed.apply(this, [].slice.call(arguments, 1));
    });
    H.Scrollbar = Scrollbar;
  }(Highcharts));
  (function(H) {
    'use strict';
    var addEvent = H.addEvent,
      Axis = H.Axis,
      Chart = H.Chart,
      color = H.color,
      defaultDataGroupingUnits = H.defaultDataGroupingUnits,
      defaultOptions = H.defaultOptions,
      defined = H.defined,
      destroyObjectProperties = H.destroyObjectProperties,
      doc = H.doc,
      each = H.each,
      erase = H.erase,
      error = H.error,
      extend = H.extend,
      grep = H.grep,
      hasTouch = H.hasTouch,
      isNumber = H.isNumber,
      isObject = H.isObject,
      merge = H.merge,
      pick = H.pick,
      removeEvent = H.removeEvent,
      Scrollbar = H.Scrollbar,
      Series = H.Series,
      seriesTypes = H.seriesTypes,
      wrap = H.wrap,
      swapXY = H.swapXY,
      units = [].concat(defaultDataGroupingUnits),
      defaultSeriesType,
      numExt = function(extreme) {
        var numbers = grep(arguments, isNumber);
        if (numbers.length) {
          return Math[extreme].apply(0, numbers);
        }
      };
    units[4] = ['day', [1, 2, 3, 4]];
    units[5] = ['week', [1, 2, 3]];
    defaultSeriesType = seriesTypes.areaspline === undefined ? 'line' : 'areaspline';
    extend(defaultOptions, {
      navigator: {
        height: 40,
        margin: 25,
        maskInside: true,
        handles: {
          backgroundColor: '#f2f2f2',
          borderColor: '#999999'
        },
        maskFill: color('#6685c2').setOpacity(0.3).get(),
        outlineColor: '#cccccc',
        outlineWidth: 1,
        series: {
          type: defaultSeriesType,
          color: '#335cad',
          fillOpacity: 0.05,
          lineWidth: 1,
          compare: null,
          dataGrouping: {
            approximation: 'average',
            enabled: true,
            groupPixelWidth: 2,
            smoothed: true,
            units: units
          },
          dataLabels: {
            enabled: false,
            zIndex: 2
          },
          id: 'highcharts-navigator-series',
          className: 'highcharts-navigator-series',
          lineColor: null,
          marker: {
            enabled: false
          },
          pointRange: 0,
          shadow: false,
          threshold: null
        },
        xAxis: {
          className: 'highcharts-navigator-xaxis',
          tickLength: 0,
          lineWidth: 0,
          gridLineColor: '#e6e6e6',
          gridLineWidth: 1,
          tickPixelInterval: 200,
          labels: {
            align: 'left',
            style: {
              color: '#999999'
            },
            x: 3,
            y: -4
          },
          crosshair: false
        },
        yAxis: {
          className: 'highcharts-navigator-yaxis',
          gridLineWidth: 0,
          startOnTick: false,
          endOnTick: false,
          minPadding: 0.1,
          maxPadding: 0.1,
          labels: {
            enabled: false
          },
          crosshair: false,
          title: {
            text: null
          },
          tickLength: 0,
          tickWidth: 0
        }
      }
    });

    function Navigator(chart) {
      this.init(chart);
    }
    Navigator.prototype = {
      drawHandle: function(x, index, inverted, verb) {
        var navigator = this;
        navigator.handles[index][verb](inverted ? {
          translateX: Math.round(navigator.left + navigator.height / 2 - 8),
          translateY: Math.round(navigator.top + parseInt(x, 10) + 0.5)
        } : {
          translateX: Math.round(navigator.left + parseInt(x, 10)),
          translateY: Math.round(navigator.top + navigator.height / 2 - 8)
        });
      },
      getHandlePath: function(inverted) {
        return swapXY([
          'M', -4.5, 0.5,
          'L',
          3.5, 0.5,
          'L',
          3.5, 15.5,
          'L', -4.5, 15.5,
          'L', -4.5, 0.5,
          'M', -1.5, 4,
          'L', -1.5, 12,
          'M',
          0.5, 4,
          'L',
          0.5, 12
        ], inverted);
      },
      drawOutline: function(zoomedMin, zoomedMax, inverted, verb) {
        var navigator = this,
          maskInside = navigator.navigatorOptions.maskInside,
          outlineWidth = navigator.outline.strokeWidth(),
          halfOutline = outlineWidth / 2,
          outlineHeight = navigator.outlineHeight,
          scrollbarHeight = navigator.scrollbarHeight,
          navigatorSize = navigator.size,
          left = navigator.left - scrollbarHeight,
          navigatorTop = navigator.top,
          verticalMin,
          path;
        if (inverted) {
          left -= halfOutline;
          verticalMin = navigatorTop + zoomedMax + halfOutline;
          zoomedMax = navigatorTop + zoomedMin + halfOutline;
          path = [
            'M',
            left + outlineHeight,
            navigatorTop - scrollbarHeight - halfOutline,
            'L',
            left + outlineHeight,
            verticalMin,
            'L',
            left,
            verticalMin,
            'L',
            left,
            zoomedMax,
            'L',
            left + outlineHeight,
            zoomedMax,
            'L',
            left + outlineHeight,
            navigatorTop + navigatorSize + scrollbarHeight
          ].concat(maskInside ? [
            'M',
            left + outlineHeight,
            verticalMin - halfOutline,
            'L',
            left + outlineHeight,
            zoomedMax + halfOutline
          ] : []);
        } else {
          zoomedMin += left + scrollbarHeight - halfOutline;
          zoomedMax += left + scrollbarHeight - halfOutline;
          navigatorTop += halfOutline;
          path = [
            'M',
            left,
            navigatorTop,
            'L',
            zoomedMin,
            navigatorTop,
            'L',
            zoomedMin,
            navigatorTop + outlineHeight,
            'L',
            zoomedMax,
            navigatorTop + outlineHeight,
            'L',
            zoomedMax,
            navigatorTop,
            'L',
            left + navigatorSize + scrollbarHeight * 2,
            navigatorTop
          ].concat(maskInside ? [
            'M',
            zoomedMin - halfOutline,
            navigatorTop,
            'L',
            zoomedMax + halfOutline,
            navigatorTop
          ] : []);
        }
        navigator.outline[verb]({
          d: path
        });
      },
      drawMasks: function(zoomedMin, zoomedMax, inverted, verb) {
        var navigator = this,
          left = navigator.left,
          top = navigator.top,
          navigatorHeight = navigator.height,
          height,
          width,
          x,
          y;
        if (inverted) {
          x = [left, left, left];
          y = [top, top + zoomedMin, top + zoomedMax];
          width = [navigatorHeight, navigatorHeight, navigatorHeight];
          height = [
            zoomedMin,
            zoomedMax - zoomedMin,
            navigator.size - zoomedMax
          ];
        } else {
          x = [left, left + zoomedMin, left + zoomedMax];
          y = [top, top, top];
          width = [
            zoomedMin,
            zoomedMax - zoomedMin,
            navigator.size - zoomedMax
          ];
          height = [navigatorHeight, navigatorHeight, navigatorHeight];
        }
        each(navigator.shades, function(shade, i) {
          shade[verb]({
            x: x[i],
            y: y[i],
            width: width[i],
            height: height[i]
          });
        });
      },
      renderElements: function() {
        var navigator = this,
          navigatorOptions = navigator.navigatorOptions,
          maskInside = navigatorOptions.maskInside,
          chart = navigator.chart,
          inverted = chart.inverted,
          renderer = chart.renderer,
          navigatorGroup;
        navigator.navigatorGroup = navigatorGroup = renderer.g('navigator')
          .attr({
            zIndex: 8,
            visibility: 'hidden'
          })
          .add();
        var mouseCursor = {
          cursor: inverted ? 'ns-resize' : 'ew-resize'
        };
        each([!maskInside, maskInside, !maskInside], function(hasMask, index) {
          navigator.shades[index] = renderer.rect()
            .addClass('highcharts-navigator-mask' +
              (index === 1 ? '-inside' : '-outside'))
            .attr({
              fill: hasMask ? navigatorOptions.maskFill : 'transparent'
            })
            .css(index === 1 && mouseCursor)
            .add(navigatorGroup);
        });
        navigator.outline = renderer.path()
          .addClass('highcharts-navigator-outline')
          .attr({
            'stroke-width': navigatorOptions.outlineWidth,
            stroke: navigatorOptions.outlineColor
          })
          .add(navigatorGroup);
        each([0, 1], function(index) {
          navigator.handles[index] = renderer
            .path(navigator.getHandlePath(inverted))
            .attr({
              zIndex: 7 - index
            })
            .addClass(
              'highcharts-navigator-handle highcharts-navigator-handle-' + ['left', 'right'][index]
            ).add(navigatorGroup);
          var handlesOptions = navigatorOptions.handles;
          navigator.handles[index]
            .attr({
              fill: handlesOptions.backgroundColor,
              stroke: handlesOptions.borderColor,
              'stroke-width': 1
            })
            .css(mouseCursor);
        });
      },
      update: function(options) {
        this.destroy();
        var chartOptions = this.chart.options;
        merge(true, chartOptions.navigator, this.options, options);
        this.init(this.chart);
      },
      render: function(min, max, pxMin, pxMax) {
        var navigator = this,
          chart = navigator.chart,
          navigatorWidth,
          scrollbarLeft,
          scrollbarTop,
          scrollbarHeight = navigator.scrollbarHeight,
          navigatorSize,
          xAxis = navigator.xAxis,
          navigatorEnabled = navigator.navigatorEnabled,
          zoomedMin,
          zoomedMax,
          rendered = navigator.rendered,
          inverted = chart.inverted,
          verb,
          newMin,
          newMax,
          minRange = chart.xAxis[0].minRange;
        if (this.hasDragged && !defined(pxMin)) {
          return;
        }
        if (!isNumber(min) || !isNumber(max)) {
          if (rendered) {
            pxMin = 0;
            pxMax = xAxis.width;
          } else {
            return;
          }
        }
        navigator.left = pick(
          xAxis.left,
          chart.plotLeft + scrollbarHeight
        );
        if (inverted) {
          navigator.size = zoomedMax = navigatorSize = pick(
            xAxis.len,
            chart.plotHeight - 2 * scrollbarHeight
          );
          navigatorWidth = scrollbarHeight;
        } else {
          navigator.size = zoomedMax = navigatorSize = pick(
            xAxis.len,
            chart.plotWidth - 2 * scrollbarHeight
          );
          navigatorWidth = navigatorSize + 2 * scrollbarHeight;
        }
        pxMin = pick(pxMin, xAxis.toPixels(min, true));
        pxMax = pick(pxMax, xAxis.toPixels(max, true));
        if (!isNumber(pxMin) || Math.abs(pxMin) === Infinity) {
          pxMin = 0;
          pxMax = navigatorWidth;
        }
        newMin = xAxis.toValue(pxMin, true);
        newMax = xAxis.toValue(pxMax, true);
        if (Math.abs(newMax - newMin) < minRange) {
          if (this.grabbedLeft) {
            pxMin = xAxis.toPixels(newMax - minRange, true);
          } else if (this.grabbedRight) {
            pxMax = xAxis.toPixels(newMin + minRange, true);
          } else {
            return;
          }
        }
        navigator.zoomedMax = Math.min(Math.max(pxMin, pxMax, 0), zoomedMax);
        navigator.zoomedMin = Math.min(
          Math.max(
            navigator.fixedWidth ?
            navigator.zoomedMax - navigator.fixedWidth :
            Math.min(pxMin, pxMax),
            0
          ),
          zoomedMax
        );
        navigator.range = navigator.zoomedMax - navigator.zoomedMin;
        zoomedMax = Math.round(navigator.zoomedMax);
        zoomedMin = Math.round(navigator.zoomedMin);
        if (navigatorEnabled) {
          navigator.navigatorGroup.attr({
            visibility: 'visible'
          });
          verb = rendered && !navigator.hasDragged ? 'animate' : 'attr';
          navigator.drawMasks(zoomedMin, zoomedMax, inverted, verb);
          navigator.drawOutline(zoomedMin, zoomedMax, inverted, verb);
          navigator.drawHandle(zoomedMin, 0, inverted, verb);
          navigator.drawHandle(zoomedMax, 1, inverted, verb);
        }
        if (navigator.scrollbar) {
          if (inverted) {
            scrollbarTop = navigator.top - scrollbarHeight;
            scrollbarLeft = navigator.left - scrollbarHeight +
              (navigatorEnabled ? 0 : navigator.height);
            scrollbarHeight = navigatorSize + 2 * scrollbarHeight;
          } else {
            scrollbarTop = navigator.top +
              (navigatorEnabled ? navigator.height : -scrollbarHeight);
            scrollbarLeft = navigator.left - scrollbarHeight;
          }
          navigator.scrollbar.position(
            scrollbarLeft,
            scrollbarTop,
            navigatorWidth,
            scrollbarHeight
          );
          navigator.scrollbar.setRange(
            zoomedMin / navigatorSize,
            zoomedMax / navigatorSize
          );
        }
        navigator.rendered = true;
      },
      addMouseEvents: function() {
        var navigator = this,
          chart = navigator.chart,
          container = chart.container,
          eventsToUnbind = [],
          mouseMoveHandler,
          mouseUpHandler;
        navigator.mouseMoveHandler = mouseMoveHandler = function(e) {
          navigator.onMouseMove(e);
        };
        navigator.mouseUpHandler = mouseUpHandler = function(e) {
          navigator.onMouseUp(e);
        };
        eventsToUnbind = navigator.getPartsEvents('mousedown');
        eventsToUnbind.push(
          addEvent(container, 'mousemove', mouseMoveHandler),
          addEvent(doc, 'mouseup', mouseUpHandler)
        );
        if (hasTouch) {
          eventsToUnbind.push(
            addEvent(container, 'touchmove', mouseMoveHandler),
            addEvent(doc, 'touchend', mouseUpHandler)
          );
          eventsToUnbind.concat(navigator.getPartsEvents('touchstart'));
        }
        navigator.eventsToUnbind = eventsToUnbind;
        if (navigator.series && navigator.series[0]) {
          eventsToUnbind.push(
            addEvent(navigator.series[0].xAxis, 'foundExtremes', function() {
              chart.navigator.modifyNavigatorAxisExtremes();
            })
          );
        }
      },
      getPartsEvents: function(eventName) {
        var navigator = this,
          events = [];
        each(['shades', 'handles'], function(name) {
          each(navigator[name], function(navigatorItem, index) {
            events.push(
              addEvent(
                navigatorItem.element,
                eventName,
                function(e) {
                  navigator[name + 'Mousedown'](e, index);
                }
              )
            );
          });
        });
        return events;
      },
      shadesMousedown: function(e, index) {
        e = this.chart.pointer.normalize(e);
        var navigator = this,
          chart = navigator.chart,
          xAxis = navigator.xAxis,
          zoomedMin = navigator.zoomedMin,
          navigatorPosition = navigator.left,
          navigatorSize = navigator.size,
          range = navigator.range,
          chartX = e.chartX,
          fixedMax,
          ext,
          left;
        if (chart.inverted) {
          chartX = e.chartY;
          navigatorPosition = navigator.top;
        }
        if (index === 1) {
          navigator.grabbedCenter = chartX;
          navigator.fixedWidth = range;
          navigator.dragOffset = chartX - zoomedMin;
        } else {
          left = chartX - navigatorPosition - range / 2;
          if (index === 0) {
            left = Math.max(0, left);
          } else if (index === 2 && left + range >= navigatorSize) {
            left = navigatorSize - range;
            fixedMax = navigator.getUnionExtremes().dataMax;
          }
          if (left !== zoomedMin) {
            navigator.fixedWidth = range;
            ext = xAxis.toFixedRange(left, left + range, null, fixedMax);
            chart.xAxis[0].setExtremes(
              Math.min(ext.min, ext.max),
              Math.max(ext.min, ext.max),
              true,
              null, {
                trigger: 'navigator'
              }
            );
          }
        }
      },
      handlesMousedown: function(e, index) {
        e = this.chart.pointer.normalize(e);
        var navigator = this,
          chart = navigator.chart,
          baseXAxis = chart.xAxis[0],
          reverse = (chart.inverted && !baseXAxis.reversed) ||
          (!chart.inverted && baseXAxis.reversed);
        if (index === 0) {
          navigator.grabbedLeft = true;
          navigator.otherHandlePos = navigator.zoomedMax;
          navigator.fixedExtreme = reverse ? baseXAxis.min : baseXAxis.max;
        } else {
          navigator.grabbedRight = true;
          navigator.otherHandlePos = navigator.zoomedMin;
          navigator.fixedExtreme = reverse ? baseXAxis.max : baseXAxis.min;
        }
        chart.fixedRange = null;
      },
      onMouseMove: function(e) {
        var navigator = this,
          chart = navigator.chart,
          left = navigator.left,
          navigatorSize = navigator.navigatorSize,
          range = navigator.range,
          dragOffset = navigator.dragOffset,
          inverted = chart.inverted,
          chartX;
        if (!e.touches || e.touches[0].pageX !== 0) {
          e = chart.pointer.normalize(e);
          chartX = e.chartX;
          if (inverted) {
            left = navigator.top;
            chartX = e.chartY;
          }
          if (navigator.grabbedLeft) {
            navigator.hasDragged = true;
            navigator.render(
              0,
              0,
              chartX - left,
              navigator.otherHandlePos
            );
          } else if (navigator.grabbedRight) {
            navigator.hasDragged = true;
            navigator.render(
              0,
              0,
              navigator.otherHandlePos,
              chartX - left
            );
          } else if (navigator.grabbedCenter) {
            navigator.hasDragged = true;
            if (chartX < dragOffset) {
              chartX = dragOffset;
            } else if (chartX > navigatorSize + dragOffset - range) {
              chartX = navigatorSize + dragOffset - range;
            }
            navigator.render(
              0,
              0,
              chartX - dragOffset,
              chartX - dragOffset + range
            );
          }
          if (navigator.hasDragged && navigator.scrollbar && navigator.scrollbar.options.liveRedraw) {
            e.DOMType = e.type;
            setTimeout(function() {
              navigator.onMouseUp(e);
            }, 0);
          }
        }
      },
      onMouseUp: function(e) {
        var navigator = this,
          chart = navigator.chart,
          xAxis = navigator.xAxis,
          fixedMin,
          fixedMax,
          ext,
          DOMEvent = e.DOMEvent || e;
        if (navigator.hasDragged || e.trigger === 'scrollbar') {
          if (navigator.zoomedMin === navigator.otherHandlePos) {
            fixedMin = navigator.fixedExtreme;
          } else if (navigator.zoomedMax === navigator.otherHandlePos) {
            fixedMax = navigator.fixedExtreme;
          }
          if (navigator.zoomedMax === navigator.navigatorSize) {
            fixedMax = navigator.getUnionExtremes().dataMax;
          }
          ext = xAxis.toFixedRange(
            navigator.zoomedMin,
            navigator.zoomedMax,
            fixedMin,
            fixedMax
          );
          if (defined(ext.min)) {
            chart.xAxis[0].setExtremes(
              Math.min(ext.min, ext.max),
              Math.max(ext.min, ext.max),
              true,
              navigator.hasDragged ? false : null, {
                trigger: 'navigator',
                triggerOp: 'navigator-drag',
                DOMEvent: DOMEvent
              }
            );
          }
        }
        if (e.DOMType !== 'mousemove') {
          navigator.grabbedLeft = navigator.grabbedRight =
            navigator.grabbedCenter = navigator.fixedWidth =
            navigator.fixedExtreme = navigator.otherHandlePos =
            navigator.hasDragged = navigator.dragOffset = null;
        }
      },
      removeEvents: function() {
        if (this.eventsToUnbind) {
          each(this.eventsToUnbind, function(unbind) {
            unbind();
          });
          this.eventsToUnbind = undefined;
        }
        this.removeBaseSeriesEvents();
      },
      removeBaseSeriesEvents: function() {
        var baseSeries = this.baseSeries || [];
        if (this.navigatorEnabled && baseSeries[0] && this.navigatorOptions.adaptToUpdatedData !== false) {
          each(baseSeries, function(series) {
            removeEvent(series, 'updatedData', this.updatedDataHandler);
          }, this);
          if (baseSeries[0].xAxis) {
            removeEvent(baseSeries[0].xAxis, 'foundExtremes', this.modifyBaseAxisExtremes);
          }
        }
      },
      init: function(chart) {
        var chartOptions = chart.options,
          navigatorOptions = chartOptions.navigator,
          navigatorEnabled = navigatorOptions.enabled,
          scrollbarOptions = chartOptions.scrollbar,
          scrollbarEnabled = scrollbarOptions.enabled,
          height = navigatorEnabled ? navigatorOptions.height : 0,
          scrollbarHeight = scrollbarEnabled ? scrollbarOptions.height : 0;
        this.handles = [];
        this.shades = [];
        this.chart = chart;
        this.setBaseSeries();
        this.height = height;
        this.scrollbarHeight = scrollbarHeight;
        this.scrollbarEnabled = scrollbarEnabled;
        this.navigatorEnabled = navigatorEnabled;
        this.navigatorOptions = navigatorOptions;
        this.scrollbarOptions = scrollbarOptions;
        this.outlineHeight = height + scrollbarHeight;
        var navigator = this,
          baseSeries = navigator.baseSeries,
          xAxisIndex = chart.xAxis.length,
          yAxisIndex = chart.yAxis.length,
          baseXaxis = baseSeries && baseSeries[0] && baseSeries[0].xAxis || chart.xAxis[0];
        chart.extraMargin = {
          type: navigatorOptions.opposite ? 'plotTop' : 'marginBottom',
          value: navigator.outlineHeight + navigatorOptions.margin
        };
        if (chart.inverted) {
          chart.extraMargin.type = navigatorOptions.opposite ? 'marginRight' : 'plotLeft';
        }
        chart.isDirtyBox = true;
        if (navigator.navigatorEnabled) {
          navigator.xAxis = new Axis(chart, merge({
            breaks: baseXaxis.options.breaks,
            ordinal: baseXaxis.options.ordinal
          }, navigatorOptions.xAxis, {
            id: 'navigator-x-axis',
            yAxis: 'navigator-y-axis',
            isX: true,
            type: 'datetime',
            index: xAxisIndex,
            offset: 0,
            keepOrdinalPadding: true,
            startOnTick: false,
            endOnTick: false,
            minPadding: 0,
            maxPadding: 0,
            zoomEnabled: false
          }, chart.inverted ? {
            offsets: [scrollbarHeight, 0, -scrollbarHeight, 0],
            width: height
          } : {
            offsets: [0, -scrollbarHeight, 0, scrollbarHeight],
            height: height
          }));
          navigator.yAxis = new Axis(chart, merge(navigatorOptions.yAxis, {
            id: 'navigator-y-axis',
            alignTicks: false,
            offset: 0,
            index: yAxisIndex,
            zoomEnabled: false
          }, chart.inverted ? {
            width: height
          } : {
            height: height
          }));
          if (baseSeries || navigatorOptions.series.data) {
            navigator.addBaseSeries();
          } else if (chart.series.length === 0) {
            wrap(chart, 'redraw', function(proceed, animation) {
              if (chart.series.length > 0 && !navigator.series) {
                navigator.setBaseSeries();
                chart.redraw = proceed;
              }
              proceed.call(chart, animation);
            });
          }
          navigator.renderElements();
          navigator.addMouseEvents();
        } else {
          navigator.xAxis = {
            translate: function(value, reverse) {
              var axis = chart.xAxis[0],
                ext = axis.getExtremes(),
                scrollTrackWidth = chart.plotWidth - 2 * scrollbarHeight,
                min = numExt('min', axis.options.min, ext.dataMin),
                valueRange = numExt('max', axis.options.max, ext.dataMax) - min;
              return reverse ?
                (value * valueRange / scrollTrackWidth) + min :
                scrollTrackWidth * (value - min) / valueRange;
            },
            toPixels: function(value) {
              return this.translate(value);
            },
            toValue: function(value) {
              return this.translate(value, true);
            },
            toFixedRange: Axis.prototype.toFixedRange,
            fake: true
          };
        }
        if (chart.options.scrollbar.enabled) {
          chart.scrollbar = navigator.scrollbar = new Scrollbar(
            chart.renderer,
            merge(chart.options.scrollbar, {
              margin: navigator.navigatorEnabled ? 0 : 10,
              vertical: chart.inverted
            }),
            chart
          );
          addEvent(navigator.scrollbar, 'changed', function(e) {
            var range = navigator.size,
              to = range * this.to,
              from = range * this.from;
            navigator.hasDragged = navigator.scrollbar.hasDragged;
            navigator.render(0, 0, from, to);
            if (chart.options.scrollbar.liveRedraw || e.DOMType !== 'mousemove') {
              setTimeout(function() {
                navigator.onMouseUp(e);
              });
            }
          });
        }
        navigator.addBaseSeriesEvents();
        navigator.addChartEvents();
      },
      getUnionExtremes: function(returnFalseOnNoBaseSeries) {
        var baseAxis = this.chart.xAxis[0],
          navAxis = this.xAxis,
          navAxisOptions = navAxis.options,
          baseAxisOptions = baseAxis.options,
          ret;
        if (!returnFalseOnNoBaseSeries || baseAxis.dataMin !== null) {
          ret = {
            dataMin: pick(
              navAxisOptions && navAxisOptions.min,
              numExt(
                'min',
                baseAxisOptions.min,
                baseAxis.dataMin,
                navAxis.dataMin,
                navAxis.min
              )
            ),
            dataMax: pick(
              navAxisOptions && navAxisOptions.max,
              numExt(
                'max',
                baseAxisOptions.max,
                baseAxis.dataMax,
                navAxis.dataMax,
                navAxis.max
              )
            )
          };
        }
        return ret;
      },
      setBaseSeries: function(baseSeriesOptions) {
        var chart = this.chart,
          baseSeries = this.baseSeries = [];
        baseSeriesOptions = baseSeriesOptions || chart.options && chart.options.navigator.baseSeries || 0;
        if (this.series) {
          this.removeBaseSeriesEvents();
          each(this.series, function(s) {
            s.destroy();
          });
        }
        each(chart.series || [], function(series, i) {
          if (series.options.showInNavigator || (i === baseSeriesOptions || series.options.id === baseSeriesOptions) &&
            series.options.showInNavigator !== false) {
            baseSeries.push(series);
          }
        });
        if (this.xAxis && !this.xAxis.fake) {
          this.addBaseSeries();
        }
      },
      addBaseSeries: function() {
        var navigator = this,
          chart = navigator.chart,
          navigatorSeries = navigator.series = [],
          baseSeries = navigator.baseSeries,
          baseOptions,
          mergedNavSeriesOptions,
          chartNavigatorOptions = navigator.navigatorOptions.series,
          baseNavigatorOptions,
          navSeriesMixin = {
            enableMouseTracking: false,
            index: null,
            group: 'nav',
            padXAxis: false,
            xAxis: 'navigator-x-axis',
            yAxis: 'navigator-y-axis',
            showInLegend: false,
            stacking: false,
            isInternal: true,
            visible: true
          };
        if (baseSeries) {
          each(baseSeries, function(base, i) {
            navSeriesMixin.name = 'Navigator ' + (i + 1);
            baseOptions = base.options || {};
            baseNavigatorOptions = baseOptions.navigatorOptions || {};
            mergedNavSeriesOptions = merge(baseOptions, navSeriesMixin, chartNavigatorOptions, baseNavigatorOptions);
            var navigatorSeriesData = baseNavigatorOptions.data || chartNavigatorOptions.data;
            navigator.hasNavigatorData = navigator.hasNavigatorData || !!navigatorSeriesData;
            mergedNavSeriesOptions.data = navigatorSeriesData || baseOptions.data && baseOptions.data.slice(0);
            base.navigatorSeries = chart.initSeries(mergedNavSeriesOptions);
            navigatorSeries.push(base.navigatorSeries);
          });
        } else {
          mergedNavSeriesOptions = merge(chartNavigatorOptions, navSeriesMixin);
          mergedNavSeriesOptions.data = chartNavigatorOptions.data;
          navigator.hasNavigatorData = !!mergedNavSeriesOptions.data;
          navigatorSeries.push(chart.initSeries(mergedNavSeriesOptions));
        }
        this.addBaseSeriesEvents();
      },
      addBaseSeriesEvents: function() {
        var navigator = this,
          baseSeries = navigator.baseSeries || [];
        if (baseSeries[0] && baseSeries[0].xAxis) {
          addEvent(baseSeries[0].xAxis, 'foundExtremes', this.modifyBaseAxisExtremes);
        }
        if (this.navigatorOptions.adaptToUpdatedData !== false) {
          each(baseSeries, function(base) {
            if (base.xAxis) {
              addEvent(base, 'updatedData', this.updatedDataHandler);
              base.userOptions.events = extend(base.userOptions.event, {
                updatedData: this.updatedDataHandler
              });
            }
            addEvent(base, 'remove', function() {
              if (this.navigatorSeries) {
                erase(navigator.series, this.navigatorSeries);
                this.navigatorSeries.remove();
                delete this.navigatorSeries;
              }
            });
          }, this);
        }
      },
      modifyNavigatorAxisExtremes: function() {
        var xAxis = this.xAxis,
          unionExtremes;
        if (xAxis.getExtremes) {
          unionExtremes = this.getUnionExtremes(true);
          if (unionExtremes && (unionExtremes.dataMin !== xAxis.min || unionExtremes.dataMax !== xAxis.max)) {
            xAxis.min = unionExtremes.dataMin;
            xAxis.max = unionExtremes.dataMax;
          }
        }
      },
      modifyBaseAxisExtremes: function() {
        var baseXAxis = this,
          navigator = baseXAxis.chart.navigator,
          baseExtremes = baseXAxis.getExtremes(),
          baseMin = baseExtremes.min,
          baseMax = baseExtremes.max,
          baseDataMin = baseExtremes.dataMin,
          baseDataMax = baseExtremes.dataMax,
          range = baseMax - baseMin,
          stickToMin = navigator.stickToMin,
          stickToMax = navigator.stickToMax,
          newMax,
          newMin,
          navigatorSeries = navigator.series && navigator.series[0],
          hasSetExtremes = !!baseXAxis.setExtremes,
          unmutable = baseXAxis.eventArgs && baseXAxis.eventArgs.trigger === 'rangeSelectorButton';
        if (!unmutable) {
          if (stickToMin) {
            newMin = baseDataMin;
            newMax = newMin + range;
          }
          if (stickToMax) {
            newMax = baseDataMax;
            if (!stickToMin) {
              newMin = Math.max(
                newMax - range,
                navigatorSeries && navigatorSeries.xData ?
                navigatorSeries.xData[0] : -Number.MAX_VALUE
              );
            }
          }
          if (hasSetExtremes && (stickToMin || stickToMax)) {
            if (isNumber(newMin)) {
              baseXAxis.min = baseXAxis.userMin = newMin;
              baseXAxis.max = baseXAxis.userMax = newMax;
            }
          }
        }
        navigator.stickToMin = navigator.stickToMax = null;
      },
      updatedDataHandler: function() {
        var navigator = this.chart.navigator,
          baseSeries = this,
          navigatorSeries = this.navigatorSeries;
        navigator.stickToMin = isNumber(baseSeries.xAxis.min) && (baseSeries.xAxis.min <= baseSeries.xData[0]);
        navigator.stickToMax = Math.round(navigator.zoomedMax) >= Math.round(navigator.size);
        if (navigatorSeries && !navigator.hasNavigatorData) {
          navigatorSeries.options.pointStart = baseSeries.xData[0];
          navigatorSeries.setData(baseSeries.options.data, false, null, false);
        }
      },
      addChartEvents: function() {
        addEvent(this.chart, 'redraw', function() {
          var navigator = this.navigator,
            xAxis = navigator && (
              navigator.baseSeries &&
              navigator.baseSeries[0] &&
              navigator.baseSeries[0].xAxis ||
              navigator.scrollbar && this.xAxis[0]
            );
          if (xAxis) {
            navigator.render(xAxis.min, xAxis.max);
          }
        });
      },
      destroy: function() {
        this.removeEvents();
        if (this.xAxis) {
          erase(this.chart.xAxis, this.xAxis);
          erase(this.chart.axes, this.xAxis);
        }
        if (this.yAxis) {
          erase(this.chart.yAxis, this.yAxis);
          erase(this.chart.axes, this.yAxis);
        }
        each(this.series || [], function(s) {
          if (s.destroy) {
            s.destroy();
          }
        });
        each([
          'series', 'xAxis', 'yAxis', 'shades', 'outline', 'scrollbarTrack',
          'scrollbarRifles', 'scrollbarGroup', 'scrollbar', 'navigatorGroup',
          'rendered'
        ], function(prop) {
          if (this[prop] && this[prop].destroy) {
            this[prop].destroy();
          }
          this[prop] = null;
        }, this);
        each([this.handles], function(coll) {
          destroyObjectProperties(coll);
        }, this);
      }
    };
    H.Navigator = Navigator;
    wrap(Axis.prototype, 'zoom', function(proceed, newMin, newMax) {
      var chart = this.chart,
        chartOptions = chart.options,
        zoomType = chartOptions.chart.zoomType,
        previousZoom,
        navigator = chartOptions.navigator,
        rangeSelector = chartOptions.rangeSelector,
        ret;
      if (this.isXAxis && ((navigator && navigator.enabled) ||
          (rangeSelector && rangeSelector.enabled))) {
        if (zoomType === 'x') {
          chart.resetZoomButton = 'blocked';
        } else if (zoomType === 'y') {
          ret = false;
        } else if (zoomType === 'xy') {
          previousZoom = this.previousZoom;
          if (defined(newMin)) {
            this.previousZoom = [this.min, this.max];
          } else if (previousZoom) {
            newMin = previousZoom[0];
            newMax = previousZoom[1];
            delete this.previousZoom;
          }
        }
      }
      return ret !== undefined ? ret : proceed.call(this, newMin, newMax);
    });
    wrap(Chart.prototype, 'init', function(proceed, options, callback) {
      addEvent(this, 'beforeRender', function() {
        var options = this.options;
        if (options.navigator.enabled || options.scrollbar.enabled) {
          this.scroller = this.navigator = new Navigator(this);
        }
      });
      proceed.call(this, options, callback);
    });
    wrap(Chart.prototype, 'setChartSize', function(proceed) {
      var legend = this.legend,
        navigator = this.navigator,
        scrollbarHeight,
        legendOptions,
        xAxis,
        yAxis;
      proceed.apply(this, [].slice.call(arguments, 1));
      if (navigator) {
        legendOptions = legend && legend.options;
        xAxis = navigator.xAxis;
        yAxis = navigator.yAxis;
        scrollbarHeight = navigator.scrollbarHeight;
        if (this.inverted) {
          navigator.left = navigator.navigatorOptions.opposite ?
            this.chartWidth - scrollbarHeight - navigator.height :
            this.spacing[3] + scrollbarHeight;
          navigator.top = this.plotTop + scrollbarHeight;
        } else {
          navigator.left = this.plotLeft + scrollbarHeight;
          navigator.top = navigator.navigatorOptions.top ||
            this.chartHeight - navigator.height - scrollbarHeight - this.spacing[2] -
            (legendOptions && legendOptions.verticalAlign === 'bottom' && legendOptions.enabled && !legendOptions.floating ?
              legend.legendHeight + pick(legendOptions.margin, 10) : 0);
        }
        if (xAxis && yAxis) {
          if (this.inverted) {
            xAxis.options.left = yAxis.options.left = navigator.left;
          } else {
            xAxis.options.top = yAxis.options.top = navigator.top;
          }
          xAxis.setAxisSize();
          yAxis.setAxisSize();
        }
      }
    });
    wrap(Series.prototype, 'addPoint', function(proceed, options, redraw, shift, animation) {
      var turboThreshold = this.options.turboThreshold;
      if (turboThreshold && this.xData.length > turboThreshold && isObject(options, true) && this.chart.navigator) {
        error(20, true);
      }
      proceed.call(this, options, redraw, shift, animation);
    });
    wrap(Chart.prototype, 'addSeries', function(proceed, options, redraw, animation) {
      var series = proceed.call(this, options, false, animation);
      if (this.navigator) {
        this.navigator.setBaseSeries();
      }
      if (pick(redraw, true)) {
        this.redraw();
      }
      return series;
    });
    wrap(Series.prototype, 'update', function(proceed, newOptions, redraw) {
      proceed.call(this, newOptions, false);
      if (this.chart.navigator) {
        this.chart.navigator.setBaseSeries();
      }
      if (pick(redraw, true)) {
        this.chart.redraw();
      }
    });
    Chart.prototype.callbacks.push(function(chart) {
      var extremes,
        navigator = chart.navigator;
      if (navigator) {
        extremes = chart.xAxis[0].getExtremes();
        navigator.render(extremes.min, extremes.max);
      }
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var addEvent = H.addEvent,
      Axis = H.Axis,
      Chart = H.Chart,
      css = H.css,
      createElement = H.createElement,
      dateFormat = H.dateFormat,
      defaultOptions = H.defaultOptions,
      useUTC = defaultOptions.global.useUTC,
      defined = H.defined,
      destroyObjectProperties = H.destroyObjectProperties,
      discardElement = H.discardElement,
      each = H.each,
      extend = H.extend,
      fireEvent = H.fireEvent,
      HCDate = H.Date,
      isNumber = H.isNumber,
      merge = H.merge,
      pick = H.pick,
      pInt = H.pInt,
      splat = H.splat,
      wrap = H.wrap;
    extend(defaultOptions, {
      rangeSelector: {
        buttonTheme: {
          'stroke-width': 0,
          width: 28,
          height: 18,
          padding: 2,
          zIndex: 7
        },
        height: 35,
        inputPosition: {
          align: 'right'
        },
        labelStyle: {
          color: '#666666'
        }
      }
    });
    defaultOptions.lang = merge(defaultOptions.lang, {
      rangeSelectorZoom: 'Zoom',
      rangeSelectorFrom: 'From',
      rangeSelectorTo: 'To'
    });

    function RangeSelector(chart) {
      this.init(chart);
    }
    RangeSelector.prototype = {
      clickButton: function(i, redraw) {
        var rangeSelector = this,
          chart = rangeSelector.chart,
          rangeOptions = rangeSelector.buttonOptions[i],
          baseAxis = chart.xAxis[0],
          unionExtremes = (chart.scroller && chart.scroller.getUnionExtremes()) || baseAxis || {},
          dataMin = unionExtremes.dataMin,
          dataMax = unionExtremes.dataMax,
          newMin,
          newMax = baseAxis && Math.round(Math.min(baseAxis.max, pick(dataMax, baseAxis.max))),
          type = rangeOptions.type,
          baseXAxisOptions,
          range = rangeOptions._range,
          rangeMin,
          minSetting,
          rangeSetting,
          ctx,
          ytdExtremes,
          dataGrouping = rangeOptions.dataGrouping;
        if (dataMin === null || dataMax === null) {
          return;
        }
        chart.fixedRange = range;
        if (dataGrouping) {
          this.forcedDataGrouping = true;
          Axis.prototype.setDataGrouping.call(baseAxis || {
            chart: this.chart
          }, dataGrouping, false);
        }
        if (type === 'month' || type === 'year') {
          if (!baseAxis) {
            range = rangeOptions;
          } else {
            ctx = {
              range: rangeOptions,
              max: newMax,
              dataMin: dataMin,
              dataMax: dataMax
            };
            newMin = baseAxis.minFromRange.call(ctx);
            if (isNumber(ctx.newMax)) {
              newMax = ctx.newMax;
            }
          }
        } else if (range) {
          newMin = Math.max(newMax - range, dataMin);
          newMax = Math.min(newMin + range, dataMax);
        } else if (type === 'ytd') {
          if (baseAxis) {
            if (dataMax === undefined) {
              dataMin = Number.MAX_VALUE;
              dataMax = Number.MIN_VALUE;
              each(chart.series, function(series) {
                var xData = series.xData;
                dataMin = Math.min(xData[0], dataMin);
                dataMax = Math.max(xData[xData.length - 1], dataMax);
              });
              redraw = false;
            }
            ytdExtremes = rangeSelector.getYTDExtremes(dataMax, dataMin, useUTC);
            newMin = rangeMin = ytdExtremes.min;
            newMax = ytdExtremes.max;
          } else {
            addEvent(chart, 'beforeRender', function() {
              rangeSelector.clickButton(i);
            });
            return;
          }
        } else if (type === 'all' && baseAxis) {
          newMin = dataMin;
          newMax = dataMax;
        }
        rangeSelector.setSelected(i);
        if (!baseAxis) {
          baseXAxisOptions = splat(chart.options.xAxis)[0];
          rangeSetting = baseXAxisOptions.range;
          baseXAxisOptions.range = range;
          minSetting = baseXAxisOptions.min;
          baseXAxisOptions.min = rangeMin;
          addEvent(chart, 'load', function resetMinAndRange() {
            baseXAxisOptions.range = rangeSetting;
            baseXAxisOptions.min = minSetting;
          });
        } else {
          baseAxis.setExtremes(
            newMin,
            newMax,
            pick(redraw, 1),
            null, {
              trigger: 'rangeSelectorButton',
              rangeSelectorButton: rangeOptions
            }
          );
        }
      },
      setSelected: function(selected) {
        this.selected = this.options.selected = selected;
      },
      defaultButtons: [{
        type: 'month',
        count: 1,
        text: '1m'
      }, {
        type: 'month',
        count: 3,
        text: '3m'
      }, {
        type: 'month',
        count: 6,
        text: '6m'
      }, {
        type: 'ytd',
        text: 'YTD'
      }, {
        type: 'year',
        count: 1,
        text: '1y'
      }, {
        type: 'all',
        text: 'All'
      }],
      init: function(chart) {
        var rangeSelector = this,
          options = chart.options.rangeSelector,
          buttonOptions = options.buttons || [].concat(rangeSelector.defaultButtons),
          selectedOption = options.selected,
          blurInputs = function() {
            var minInput = rangeSelector.minInput,
              maxInput = rangeSelector.maxInput;
            if (minInput && minInput.blur) {
              fireEvent(minInput, 'blur');
            }
            if (maxInput && maxInput.blur) {
              fireEvent(maxInput, 'blur');
            }
          };
        rangeSelector.chart = chart;
        rangeSelector.options = options;
        rangeSelector.buttons = [];
        chart.extraTopMargin = options.height;
        rangeSelector.buttonOptions = buttonOptions;
        this.unMouseDown = addEvent(chart.container, 'mousedown', blurInputs);
        this.unResize = addEvent(chart, 'resize', blurInputs);
        each(buttonOptions, rangeSelector.computeButtonRange);
        if (selectedOption !== undefined && buttonOptions[selectedOption]) {
          this.clickButton(selectedOption, false);
        }
        addEvent(chart, 'load', function() {
          addEvent(chart.xAxis[0], 'setExtremes', function(e) {
            if (this.max - this.min !== chart.fixedRange && e.trigger !== 'rangeSelectorButton' &&
              e.trigger !== 'updatedData' && rangeSelector.forcedDataGrouping) {
              this.setDataGrouping(false, false);
            }
          });
        });
      },
      updateButtonStates: function() {
        var rangeSelector = this,
          chart = this.chart,
          baseAxis = chart.xAxis[0],
          actualRange = Math.round(baseAxis.max - baseAxis.min),
          hasNoData = !baseAxis.hasVisibleSeries,
          day = 24 * 36e5,
          unionExtremes = (chart.scroller && chart.scroller.getUnionExtremes()) || baseAxis,
          dataMin = unionExtremes.dataMin,
          dataMax = unionExtremes.dataMax,
          ytdExtremes = rangeSelector.getYTDExtremes(dataMax, dataMin, useUTC),
          ytdMin = ytdExtremes.min,
          ytdMax = ytdExtremes.max,
          selected = rangeSelector.selected,
          selectedExists = isNumber(selected),
          allButtonsEnabled = rangeSelector.options.allButtonsEnabled,
          buttons = rangeSelector.buttons;
        each(rangeSelector.buttonOptions, function(rangeOptions, i) {
          var range = rangeOptions._range,
            type = rangeOptions.type,
            count = rangeOptions.count || 1,
            button = buttons[i],
            state = 0,
            disable,
            select,
            isSelected = i === selected,
            isTooGreatRange = range > dataMax - dataMin,
            isTooSmallRange = range < baseAxis.minRange,
            isYTDButNotSelected = false,
            isAllButAlreadyShowingAll = false,
            isSameRange = range === actualRange;
          if (
            (type === 'month' || type === 'year') &&
            (actualRange >= {
              month: 28,
              year: 365
            }[type] * day * count) &&
            (actualRange <= {
              month: 31,
              year: 366
            }[type] * day * count)
          ) {
            isSameRange = true;
          } else if (type === 'ytd') {
            isSameRange = (ytdMax - ytdMin) === actualRange;
            isYTDButNotSelected = !isSelected;
          } else if (type === 'all') {
            isSameRange = baseAxis.max - baseAxis.min >= dataMax - dataMin;
            isAllButAlreadyShowingAll = !isSelected && selectedExists && isSameRange;
          }
          disable = (!allButtonsEnabled &&
            (
              isTooGreatRange ||
              isTooSmallRange ||
              isAllButAlreadyShowingAll ||
              hasNoData
            )
          );
          select = (
            (isSelected && isSameRange) ||
            (isSameRange && !selectedExists && !isYTDButNotSelected)
          );
          if (disable) {
            state = 3;
          } else if (select) {
            selectedExists = true;
            state = 2;
          }
          if (button.state !== state) {
            button.setState(state);
          }
        });
      },
      computeButtonRange: function(rangeOptions) {
        var type = rangeOptions.type,
          count = rangeOptions.count || 1,
          fixedTimes = {
            millisecond: 1,
            second: 1000,
            minute: 60 * 1000,
            hour: 3600 * 1000,
            day: 24 * 3600 * 1000,
            week: 7 * 24 * 3600 * 1000
          };
        if (fixedTimes[type]) {
          rangeOptions._range = fixedTimes[type] * count;
        } else if (type === 'month' || type === 'year') {
          rangeOptions._range = {
            month: 30,
            year: 365
          }[type] * 24 * 36e5 * count;
        }
      },
      setInputValue: function(name, time) {
        var options = this.chart.options.rangeSelector,
          input = this[name + 'Input'];
        if (defined(time)) {
          input.previousValue = input.HCTime;
          input.HCTime = time;
        }
        input.value = dateFormat(
          options.inputEditDateFormat || '%Y-%m-%d',
          input.HCTime
        );
        this[name + 'DateBox'].attr({
          text: dateFormat(options.inputDateFormat || '%b %e, %Y', input.HCTime)
        });
      },
      showInput: function(name) {
        var inputGroup = this.inputGroup,
          dateBox = this[name + 'DateBox'];
        css(this[name + 'Input'], {
          left: (inputGroup.translateX + dateBox.x) + 'px',
          top: inputGroup.translateY + 'px',
          width: (dateBox.width - 2) + 'px',
          height: (dateBox.height - 2) + 'px',
          border: '2px solid silver'
        });
      },
      hideInput: function(name) {
        css(this[name + 'Input'], {
          border: 0,
          width: '1px',
          height: '1px'
        });
        this.setInputValue(name);
      },
      drawInput: function(name) {
        var rangeSelector = this,
          chart = rangeSelector.chart,
          chartStyle = chart.renderer.style || {},
          renderer = chart.renderer,
          options = chart.options.rangeSelector,
          lang = defaultOptions.lang,
          div = rangeSelector.div,
          isMin = name === 'min',
          input,
          label,
          dateBox,
          inputGroup = this.inputGroup;

        function updateExtremes() {
          var inputValue = input.value,
            value = (options.inputDateParser || Date.parse)(inputValue),
            chartAxis = chart.xAxis[0],
            dataAxis = chart.scroller && chart.scroller.xAxis ? chart.scroller.xAxis : chartAxis,
            dataMin = dataAxis.dataMin,
            dataMax = dataAxis.dataMax;
          if (value !== input.previousValue) {
            input.previousValue = value;
            if (!isNumber(value)) {
              value = inputValue.split('-');
              value = Date.UTC(pInt(value[0]), pInt(value[1]) - 1, pInt(value[2]));
            }
            if (isNumber(value)) {
              if (!useUTC) {
                value = value + new Date().getTimezoneOffset() * 60 * 1000;
              }
              if (isMin) {
                if (value > rangeSelector.maxInput.HCTime) {
                  value = undefined;
                } else if (value < dataMin) {
                  value = dataMin;
                }
              } else {
                if (value < rangeSelector.minInput.HCTime) {
                  value = undefined;
                } else if (value > dataMax) {
                  value = dataMax;
                }
              }
              if (value !== undefined) {
                chartAxis.setExtremes(
                  isMin ? value : chartAxis.min,
                  isMin ? chartAxis.max : value,
                  undefined,
                  undefined, {
                    trigger: 'rangeSelectorInput'
                  }
                );
              }
            }
          }
        }
        this[name + 'Label'] = label = renderer.label(lang[isMin ? 'rangeSelectorFrom' : 'rangeSelectorTo'], this.inputGroup.offset)
          .addClass('highcharts-range-label')
          .attr({
            padding: 2
          })
          .add(inputGroup);
        inputGroup.offset += label.width + 5;
        this[name + 'DateBox'] = dateBox = renderer.label('', inputGroup.offset)
          .addClass('highcharts-range-input')
          .attr({
            padding: 2,
            width: options.inputBoxWidth || 90,
            height: options.inputBoxHeight || 17,
            stroke: options.inputBoxBorderColor || '#cccccc',
            'stroke-width': 1,
            'text-align': 'center'
          })
          .on('click', function() {
            rangeSelector.showInput(name);
            rangeSelector[name + 'Input'].focus();
          })
          .add(inputGroup);
        inputGroup.offset += dateBox.width + (isMin ? 10 : 0);
        this[name + 'Input'] = input = createElement('input', {
          name: name,
          className: 'highcharts-range-selector',
          type: 'text'
        }, {
          top: chart.plotTop + 'px'
        }, div);
        label.css(merge(chartStyle, options.labelStyle));
        dateBox.css(merge({
          color: '#333333'
        }, chartStyle, options.inputStyle));
        css(input, extend({
          position: 'absolute',
          border: 0,
          width: '1px',
          height: '1px',
          padding: 0,
          textAlign: 'center',
          fontSize: chartStyle.fontSize,
          fontFamily: chartStyle.fontFamily,
          left: '-9em'
        }, options.inputStyle));
        input.onfocus = function() {
          rangeSelector.showInput(name);
        };
        input.onblur = function() {
          rangeSelector.hideInput(name);
        };
        input.onchange = updateExtremes;
        input.onkeypress = function(event) {
          if (event.keyCode === 13) {
            updateExtremes();
          }
        };
      },
      getPosition: function() {
        var chart = this.chart,
          options = chart.options.rangeSelector,
          buttonTop = pick((options.buttonPosition || {}).y, chart.plotTop - chart.axisOffset[0] - options.height);
        return {
          buttonTop: buttonTop,
          inputTop: buttonTop - 10
        };
      },
      getYTDExtremes: function(dataMax, dataMin, useUTC) {
        var min,
          now = new HCDate(dataMax),
          year = now[HCDate.hcGetFullYear](),
          startOfYear = useUTC ? HCDate.UTC(year, 0, 1) : +new HCDate(year, 0, 1);
        min = Math.max(dataMin || 0, startOfYear);
        now = now.getTime();
        return {
          max: Math.min(dataMax || now, now),
          min: min
        };
      },
      render: function(min, max) {
        var rangeSelector = this,
          chart = rangeSelector.chart,
          renderer = chart.renderer,
          container = chart.container,
          chartOptions = chart.options,
          navButtonOptions = chartOptions.exporting && chartOptions.exporting.enabled !== false &&
          chartOptions.navigation && chartOptions.navigation.buttonOptions,
          options = chartOptions.rangeSelector,
          buttons = rangeSelector.buttons,
          lang = defaultOptions.lang,
          div = rangeSelector.div,
          inputGroup = rangeSelector.inputGroup,
          buttonTheme = options.buttonTheme,
          buttonPosition = options.buttonPosition || {},
          inputEnabled = options.inputEnabled,
          states = buttonTheme && buttonTheme.states,
          plotLeft = chart.plotLeft,
          buttonLeft,
          pos = this.getPosition(),
          buttonGroup = rangeSelector.group,
          buttonBBox,
          rendered = rangeSelector.rendered;
        if (options.enabled === false) {
          return;
        }
        if (!rendered) {
          rangeSelector.group = buttonGroup = renderer.g('range-selector-buttons').add();
          rangeSelector.zoomText = renderer.text(lang.rangeSelectorZoom, pick(buttonPosition.x, plotLeft), 15)
            .css(options.labelStyle)
            .add(buttonGroup);
          buttonLeft = pick(buttonPosition.x, plotLeft) + rangeSelector.zoomText.getBBox().width + 5;
          each(rangeSelector.buttonOptions, function(rangeOptions, i) {
            buttons[i] = renderer.button(
                rangeOptions.text,
                buttonLeft,
                0,
                function() {
                  rangeSelector.clickButton(i);
                  rangeSelector.isActive = true;
                },
                buttonTheme,
                states && states.hover,
                states && states.select,
                states && states.disabled
              )
              .attr({
                'text-align': 'center'
              })
              .add(buttonGroup);
            buttonLeft += buttons[i].width + pick(options.buttonSpacing, 5);
          });
          if (inputEnabled !== false) {
            rangeSelector.div = div = createElement('div', null, {
              position: 'relative',
              height: 0,
              zIndex: 1
            });
            container.parentNode.insertBefore(div, container);
            rangeSelector.inputGroup = inputGroup = renderer.g('input-group')
              .add();
            inputGroup.offset = 0;
            rangeSelector.drawInput('min');
            rangeSelector.drawInput('max');
          }
        }
        rangeSelector.updateButtonStates();
        buttonGroup[rendered ? 'animate' : 'attr']({
          translateY: pos.buttonTop
        });
        if (inputEnabled !== false) {
          inputGroup.align(extend({
            y: pos.inputTop,
            width: inputGroup.offset,
            x: navButtonOptions && (pos.inputTop < (navButtonOptions.y || 0) + navButtonOptions.height - chart.spacing[0]) ?
              -40 : 0
          }, options.inputPosition), true, chart.spacingBox);
          if (!defined(inputEnabled)) {
            buttonBBox = buttonGroup.getBBox();
            inputGroup[inputGroup.alignAttr.translateX < buttonBBox.x + buttonBBox.width + 10 ? 'hide' : 'show']();
          }
          rangeSelector.setInputValue('min', min);
          rangeSelector.setInputValue('max', max);
        }
        rangeSelector.rendered = true;
      },
      update: function(options) {
        var chart = this.chart;
        merge(true, chart.options.rangeSelector, options);
        this.destroy();
        this.init(chart);
      },
      destroy: function() {
        var minInput = this.minInput,
          maxInput = this.maxInput,
          key;
        this.unMouseDown();
        this.unResize();
        destroyObjectProperties(this.buttons);
        if (minInput) {
          minInput.onfocus = minInput.onblur = minInput.onchange = null;
        }
        if (maxInput) {
          maxInput.onfocus = maxInput.onblur = maxInput.onchange = null;
        }
        for (key in this) {
          if (this[key] && key !== 'chart') {
            if (this[key].destroy) {
              this[key].destroy();
            } else if (this[key].nodeType) {
              discardElement(this[key]);
            }
          }
          if (this[key] !== RangeSelector.prototype[key]) {
            this[key] = null;
          }
        }
      }
    };
    Axis.prototype.toFixedRange = function(pxMin, pxMax, fixedMin, fixedMax) {
      var fixedRange = this.chart && this.chart.fixedRange,
        newMin = pick(fixedMin, this.translate(pxMin, true, !this.horiz)),
        newMax = pick(fixedMax, this.translate(pxMax, true, !this.horiz)),
        changeRatio = fixedRange && (newMax - newMin) / fixedRange;
      if (changeRatio > 0.7 && changeRatio < 1.3) {
        if (fixedMax) {
          newMin = newMax - fixedRange;
        } else {
          newMax = newMin + fixedRange;
        }
      }
      if (!isNumber(newMin)) {
        newMin = newMax = undefined;
      }
      return {
        min: newMin,
        max: newMax
      };
    };
    Axis.prototype.minFromRange = function() {
      var rangeOptions = this.range,
        type = rangeOptions.type,
        timeName = {
          month: 'Month',
          year: 'FullYear'
        }[type],
        min,
        max = this.max,
        dataMin,
        range,
        getTrueRange = function(base, count) {
          var date = new Date(base);
          date['set' + timeName](date['get' + timeName]() + count);
          return date.getTime() - base;
        };
      if (isNumber(rangeOptions)) {
        min = max - rangeOptions;
        range = rangeOptions;
      } else {
        min = max + getTrueRange(max, -rangeOptions.count);
        if (this.chart) {
          this.chart.fixedRange = max - min;
        }
      }
      dataMin = pick(this.dataMin, Number.MIN_VALUE);
      if (!isNumber(min)) {
        min = dataMin;
      }
      if (min <= dataMin) {
        min = dataMin;
        if (range === undefined) {
          range = getTrueRange(min, rangeOptions.count);
        }
        this.newMax = Math.min(min + range, this.dataMax);
      }
      if (!isNumber(max)) {
        min = undefined;
      }
      return min;
    };
    wrap(Chart.prototype, 'init', function(proceed, options, callback) {
      addEvent(this, 'init', function() {
        if (this.options.rangeSelector.enabled) {
          this.rangeSelector = new RangeSelector(this);
        }
      });
      proceed.call(this, options, callback);
    });
    Chart.prototype.callbacks.push(function(chart) {
      var extremes,
        rangeSelector = chart.rangeSelector,
        unbindRender,
        unbindSetExtremes;

      function renderRangeSelector() {
        extremes = chart.xAxis[0].getExtremes();
        if (isNumber(extremes.min)) {
          rangeSelector.render(extremes.min, extremes.max);
        }
      }
      if (rangeSelector) {
        unbindSetExtremes = addEvent(
          chart.xAxis[0],
          'afterSetExtremes',
          function(e) {
            rangeSelector.render(e.min, e.max);
          }
        );
        unbindRender = addEvent(chart, 'redraw', renderRangeSelector);
        renderRangeSelector();
      }
      addEvent(chart, 'destroy', function destroyEvents() {
        if (rangeSelector) {
          unbindRender();
          unbindSetExtremes();
        }
      });
    });
    H.RangeSelector = RangeSelector;
  }(Highcharts));
  (function(H) {
    'use strict';
    var arrayMax = H.arrayMax,
      arrayMin = H.arrayMin,
      Axis = H.Axis,
      Chart = H.Chart,
      defined = H.defined,
      each = H.each,
      extend = H.extend,
      format = H.format,
      inArray = H.inArray,
      isNumber = H.isNumber,
      isString = H.isString,
      map = H.map,
      merge = H.merge,
      pick = H.pick,
      Point = H.Point,
      Renderer = H.Renderer,
      Series = H.Series,
      splat = H.splat,
      SVGRenderer = H.SVGRenderer,
      VMLRenderer = H.VMLRenderer,
      wrap = H.wrap,
      seriesProto = Series.prototype,
      seriesInit = seriesProto.init,
      seriesProcessData = seriesProto.processData,
      pointTooltipFormatter = Point.prototype.tooltipFormatter;
    H.StockChart = H.stockChart = function(a, b, c) {
      var hasRenderToArg = isString(a) || a.nodeName,
        options = arguments[hasRenderToArg ? 1 : 0],
        seriesOptions = options.series,
        defaultOptions = H.getOptions(),
        opposite,
        navigatorEnabled = pick(
          options.navigator && options.navigator.enabled,
          defaultOptions.navigator.enabled,
          true
        ),
        disableStartOnTick = navigatorEnabled ? {
          startOnTick: false,
          endOnTick: false
        } : null,
        lineOptions = {
          marker: {
            enabled: false,
            radius: 2
          }
        },
        columnOptions = {
          shadow: false,
          borderWidth: 0
        };
      options.xAxis = map(splat(options.xAxis || {}), function(xAxisOptions) {
        return merge({
            minPadding: 0,
            maxPadding: 0,
            ordinal: true,
            title: {
              text: null
            },
            labels: {
              overflow: 'justify'
            },
            showLastLabel: true
          },
          defaultOptions.xAxis,
          xAxisOptions, {
            type: 'datetime',
            categories: null
          },
          disableStartOnTick
        );
      });
      options.yAxis = map(splat(options.yAxis || {}), function(yAxisOptions) {
        opposite = pick(yAxisOptions.opposite, true);
        return merge({
            labels: {
              y: -2
            },
            opposite: opposite,
            showLastLabel: false,
            title: {
              text: null
            }
          },
          defaultOptions.yAxis,
          yAxisOptions
        );
      });
      options.series = null;
      options = merge({
          chart: {
            panning: true,
            pinchType: 'x'
          },
          navigator: {
            enabled: navigatorEnabled
          },
          scrollbar: {
            enabled: pick(defaultOptions.scrollbar.enabled, true)
          },
          rangeSelector: {
            enabled: pick(defaultOptions.rangeSelector.enabled, true)
          },
          title: {
            text: null
          },
          tooltip: {
            shared: true,
            crosshairs: true
          },
          legend: {
            enabled: false
          },
          plotOptions: {
            line: lineOptions,
            spline: lineOptions,
            area: lineOptions,
            areaspline: lineOptions,
            arearange: lineOptions,
            areasplinerange: lineOptions,
            column: columnOptions,
            columnrange: columnOptions,
            candlestick: columnOptions,
            ohlc: columnOptions
          }
        },
        options, {
          isStock: true
        }
      );
      options.series = seriesOptions;
      return hasRenderToArg ?
        new Chart(a, options, c) :
        new Chart(options, b);
    };
    wrap(Axis.prototype, 'autoLabelAlign', function(proceed) {
      var chart = this.chart,
        options = this.options,
        panes = chart._labelPanes = chart._labelPanes || {},
        key,
        labelOptions = this.options.labels;
      if (this.chart.options.isStock && this.coll === 'yAxis') {
        key = options.top + ',' + options.height;
        if (!panes[key] && labelOptions.enabled) {
          if (labelOptions.x === 15) {
            labelOptions.x = 0;
          }
          if (labelOptions.align === undefined) {
            labelOptions.align = 'right';
          }
          panes[key] = 1;
          return 'right';
        }
      }
      return proceed.call(this, [].slice.call(arguments, 1));
    });
    wrap(Axis.prototype, 'getPlotLinePath', function(proceed, value, lineWidth, old, force, translatedValue) {
      var axis = this,
        series = (this.isLinked && !this.series ? this.linkedParent.series : this.series),
        chart = axis.chart,
        renderer = chart.renderer,
        axisLeft = axis.left,
        axisTop = axis.top,
        x1,
        y1,
        x2,
        y2,
        result = [],
        axes = [],
        axes2,
        uniqueAxes,
        transVal;

      function getAxis(coll) {
        var otherColl = coll === 'xAxis' ? 'yAxis' : 'xAxis',
          opt = axis.options[otherColl];
        if (isNumber(opt)) {
          return [chart[otherColl][opt]];
        }
        if (isString(opt)) {
          return [chart.get(opt)];
        }
        return map(series, function(s) {
          return s[otherColl];
        });
      }
      if (axis.coll === 'colorAxis') {
        return proceed.apply(this, [].slice.call(arguments, 1));
      }
      axes = getAxis(axis.coll);
      axes2 = (axis.isXAxis ? chart.yAxis : chart.xAxis);
      each(axes2, function(A) {
        if (defined(A.options.id) ? A.options.id.indexOf('navigator') === -1 : true) {
          var a = (A.isXAxis ? 'yAxis' : 'xAxis'),
            rax = (defined(A.options[a]) ? chart[a][A.options[a]] : chart[a][0]);
          if (axis === rax) {
            axes.push(A);
          }
        }
      });
      uniqueAxes = axes.length ? [] : [axis.isXAxis ? chart.yAxis[0] : chart.xAxis[0]];
      each(axes, function(axis2) {
        if (inArray(axis2, uniqueAxes) === -1) {
          uniqueAxes.push(axis2);
        }
      });
      transVal = pick(translatedValue, axis.translate(value, null, null, old));
      if (isNumber(transVal)) {
        if (axis.horiz) {
          each(uniqueAxes, function(axis2) {
            var skip;
            y1 = axis2.pos;
            y2 = y1 + axis2.len;
            x1 = x2 = Math.round(transVal + axis.transB);
            if (x1 < axisLeft || x1 > axisLeft + axis.width) {
              if (force) {
                x1 = x2 = Math.min(Math.max(axisLeft, x1), axisLeft + axis.width);
              } else {
                skip = true;
              }
            }
            if (!skip) {
              result.push('M', x1, y1, 'L', x2, y2);
            }
          });
        } else {
          each(uniqueAxes, function(axis2) {
            var skip;
            x1 = axis2.pos;
            x2 = x1 + axis2.len;
            y1 = y2 = Math.round(axisTop + axis.height - transVal);
            if (y1 < axisTop || y1 > axisTop + axis.height) {
              if (force) {
                y1 = y2 = Math.min(Math.max(axisTop, y1), axis.top + axis.height);
              } else {
                skip = true;
              }
            }
            if (!skip) {
              result.push('M', x1, y1, 'L', x2, y2);
            }
          });
        }
      }
      return result.length > 0 ?
        renderer.crispPolyLine(result, lineWidth || 1) :
        null;
    });
    Axis.prototype.getPlotBandPath = function(from, to) {
      var toPath = this.getPlotLinePath(to, null, null, true),
        path = this.getPlotLinePath(from, null, null, true),
        result = [],
        i;
      if (path && toPath) {
        if (path.toString() === toPath.toString()) {
          result = path;
          result.flat = true;
        } else {
          for (i = 0; i < path.length; i += 6) {
            result.push(
              'M', path[i + 1], path[i + 2],
              'L', path[i + 4], path[i + 5],
              toPath[i + 4], toPath[i + 5],
              toPath[i + 1], toPath[i + 2],
              'z'
            );
          }
        }
      } else {
        result = null;
      }
      return result;
    };
    SVGRenderer.prototype.crispPolyLine = function(points, width) {
      var i;
      for (i = 0; i < points.length; i = i + 6) {
        if (points[i + 1] === points[i + 4]) {
          points[i + 1] = points[i + 4] = Math.round(points[i + 1]) - (width % 2 / 2);
        }
        if (points[i + 2] === points[i + 5]) {
          points[i + 2] = points[i + 5] = Math.round(points[i + 2]) + (width % 2 / 2);
        }
      }
      return points;
    };
    if (Renderer === VMLRenderer) {
      VMLRenderer.prototype.crispPolyLine = SVGRenderer.prototype.crispPolyLine;
    }
    wrap(Axis.prototype, 'hideCrosshair', function(proceed, i) {
      proceed.call(this, i);
      if (this.crossLabel) {
        this.crossLabel = this.crossLabel.hide();
      }
    });
    wrap(Axis.prototype, 'drawCrosshair', function(proceed, e, point) {
      proceed.call(this, e, point);
      if (!defined(this.crosshair.label) || !this.crosshair.label.enabled || !this.cross) {
        return;
      }
      var chart = this.chart,
        options = this.options.crosshair.label,
        horiz = this.horiz,
        opposite = this.opposite,
        left = this.left,
        top = this.top,
        crossLabel = this.crossLabel,
        posx,
        posy,
        crossBox,
        formatOption = options.format,
        formatFormat = '',
        limit,
        align,
        tickInside = this.options.tickPosition === 'inside',
        snap = this.crosshair.snap !== false,
        value,
        offset = 0;
      if (!e) {
        e = this.cross && this.cross.e;
      }
      align = (horiz ? 'center' : opposite ?
        (this.labelAlign === 'right' ? 'right' : 'left') :
        (this.labelAlign === 'left' ? 'left' : 'center'));
      if (!crossLabel) {
        crossLabel = this.crossLabel = chart.renderer.label(null, null, null, options.shape || 'callout')
          .addClass('highcharts-crosshair-label' +
            (this.series[0] && ' highcharts-color-' + this.series[0].colorIndex))
          .attr({
            align: options.align || align,
            padding: pick(options.padding, 8),
            r: pick(options.borderRadius, 3),
            zIndex: 2
          })
          .add(this.labelGroup);
        crossLabel
          .attr({
            fill: options.backgroundColor ||
              (this.series[0] && this.series[0].color) || '#666666',
            stroke: options.borderColor || '',
            'stroke-width': options.borderWidth || 0
          })
          .css(extend({
            color: '#ffffff',
            fontWeight: 'normal',
            fontSize: '11px',
            textAlign: 'center'
          }, options.style));
      }
      if (horiz) {
        posx = snap ? point.plotX + left : e.chartX;
        posy = top + (opposite ? 0 : this.height);
      } else {
        posx = opposite ? this.width + left : 0;
        posy = snap ? point.plotY + top : e.chartY;
      }
      if (!formatOption && !options.formatter) {
        if (this.isDatetimeAxis) {
          formatFormat = '%b %d, %Y';
        }
        formatOption = '{value' + (formatFormat ? ':' + formatFormat : '') + '}';
      }
      value = snap ? point[this.isXAxis ? 'x' : 'y'] : this.toValue(horiz ? e.chartX : e.chartY);
      crossLabel.attr({
        text: formatOption ? format(formatOption, {
          value: value
        }) : options.formatter.call(this, value),
        x: posx,
        y: posy,
        visibility: 'visible'
      });
      crossBox = crossLabel.getBBox();
      if (horiz) {
        if ((tickInside && !opposite) || (!tickInside && opposite)) {
          posy = crossLabel.y - crossBox.height;
        }
      } else {
        posy = crossLabel.y - (crossBox.height / 2);
      }
      if (horiz) {
        limit = {
          left: left - crossBox.x,
          right: left + this.width - crossBox.x
        };
      } else {
        limit = {
          left: this.labelAlign === 'left' ? left : 0,
          right: this.labelAlign === 'right' ? left + this.width : chart.chartWidth
        };
      }
      if (crossLabel.translateX < limit.left) {
        offset = limit.left - crossLabel.translateX;
      }
      if (crossLabel.translateX + crossBox.width >= limit.right) {
        offset = -(crossLabel.translateX + crossBox.width - limit.right);
      }
      crossLabel.attr({
        x: posx + offset,
        y: posy,
        anchorX: horiz ? posx : (this.opposite ? 0 : chart.chartWidth),
        anchorY: horiz ? (this.opposite ? chart.chartHeight : 0) : posy + crossBox.height / 2
      });
    });
    seriesProto.init = function() {
      seriesInit.apply(this, arguments);
      this.setCompare(this.options.compare);
    };
    seriesProto.setCompare = function(compare) {
      this.modifyValue = (compare === 'value' || compare === 'percent') ? function(value, point) {
        var compareValue = this.compareValue;
        if (value !== undefined && compareValue !== undefined) {
          if (compare === 'value') {
            value -= compareValue;
          } else {
            value = 100 * (value / compareValue) -
              (this.options.compareBase === 100 ? 0 : 100);
          }
          if (point) {
            point.change = value;
          }
          return value;
        }
      } : null;
      this.userOptions.compare = compare;
      if (this.chart.hasRendered) {
        this.isDirty = true;
      }
    };
    seriesProto.processData = function() {
      var series = this,
        i,
        keyIndex = -1,
        processedXData,
        processedYData,
        length,
        compareValue;
      seriesProcessData.apply(this, arguments);
      if (series.xAxis && series.processedYData) {
        processedXData = series.processedXData;
        processedYData = series.processedYData;
        length = processedYData.length;
        if (series.pointArrayMap) {
          keyIndex = inArray('close', series.pointArrayMap);
          if (keyIndex === -1) {
            keyIndex = inArray(series.pointValKey || 'y', series.pointArrayMap);
          }
        }
        for (i = 0; i < length - 1; i++) {
          compareValue = keyIndex > -1 ?
            processedYData[i][keyIndex] :
            processedYData[i];
          if (isNumber(compareValue) && processedXData[i + 1] >= series.xAxis.min && compareValue !== 0) {
            series.compareValue = compareValue;
            break;
          }
        }
      }
    };
    wrap(seriesProto, 'getExtremes', function(proceed) {
      var extremes;
      proceed.apply(this, [].slice.call(arguments, 1));
      if (this.modifyValue) {
        extremes = [this.modifyValue(this.dataMin), this.modifyValue(this.dataMax)];
        this.dataMin = arrayMin(extremes);
        this.dataMax = arrayMax(extremes);
      }
    });
    Axis.prototype.setCompare = function(compare, redraw) {
      if (!this.isXAxis) {
        each(this.series, function(series) {
          series.setCompare(compare);
        });
        if (pick(redraw, true)) {
          this.chart.redraw();
        }
      }
    };
    Point.prototype.tooltipFormatter = function(pointFormat) {
      var point = this;
      pointFormat = pointFormat.replace(
        '{point.change}',
        (point.change > 0 ? '+' : '') +
        H.numberFormat(point.change, pick(point.series.tooltipOptions.changeDecimals, 2))
      );
      return pointTooltipFormatter.apply(this, [pointFormat]);
    };
    wrap(Series.prototype, 'render', function(proceed) {
      if (!(this.chart.is3d && this.chart.is3d()) &&
        !this.chart.polar &&
        this.xAxis &&
        !this.xAxis.isRadial
      ) {
        if (!this.clipBox && this.animate) {
          this.clipBox = merge(this.chart.clipBox);
          this.clipBox.width = this.xAxis.len;
          this.clipBox.height = this.yAxis.len;
        } else if (this.chart[this.sharedClipKey]) {
          this.chart[this.sharedClipKey].attr({
            width: this.xAxis.len,
            height: this.yAxis.len
          });
        } else if (this.clipBox) {
          this.clipBox.width = this.xAxis.len;
          this.clipBox.height = this.yAxis.len;
        }
      }
      proceed.call(this);
    });
  }(Highcharts));
  (function() {
    'use strict';
  }());
  return Highcharts
}));;
/*! RESOURCE: /scripts/highcharts/highcharts-more.src.js */
(function(factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory;
  } else {
    factory(Highcharts);
  }
}(function(Highcharts) {
  (function(H) {
    'use strict';
    var each = H.each,
      extend = H.extend,
      merge = H.merge,
      splat = H.splat;

    function Pane(options, chart, firstAxis) {
      this.init(options, chart, firstAxis);
    }
    extend(Pane.prototype, {
      init: function(options, chart, firstAxis) {
        var pane = this,
          backgroundOption,
          defaultOptions = pane.defaultOptions;
        pane.chart = chart;
        pane.options = options = merge(defaultOptions, chart.angular ? {
          background: {}
        } : undefined, options);
        backgroundOption = options.background;
        if (backgroundOption) {
          each([].concat(splat(backgroundOption)).reverse(), function(config) {
            var mConfig,
              axisUserOptions = firstAxis.userOptions;
            mConfig = merge(pane.defaultBackgroundOptions, config);
            if (config.backgroundColor) {
              mConfig.backgroundColor = config.backgroundColor;
            }
            mConfig.color = mConfig.backgroundColor;
            firstAxis.options.plotBands.unshift(mConfig);
            axisUserOptions.plotBands = axisUserOptions.plotBands || [];
            if (axisUserOptions.plotBands !== firstAxis.options.plotBands) {
              axisUserOptions.plotBands.unshift(mConfig);
            }
          });
        }
      },
      defaultOptions: {
        center: ['50%', '50%'],
        size: '85%',
        startAngle: 0
      },
      defaultBackgroundOptions: {
        className: 'highcharts-pane',
        shape: 'circle',
        borderWidth: 1,
        borderColor: '#cccccc',
        backgroundColor: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1
          },
          stops: [
            [0, '#ffffff'],
            [1, '#e6e6e6']
          ]
        },
        from: -Number.MAX_VALUE,
        innerRadius: 0,
        to: Number.MAX_VALUE,
        outerRadius: '105%'
      }
    });
    H.Pane = Pane;
  }(Highcharts));
  (function(H) {
    'use strict';
    var Axis = H.Axis,
      CenteredSeriesMixin = H.CenteredSeriesMixin,
      each = H.each,
      extend = H.extend,
      map = H.map,
      merge = H.merge,
      noop = H.noop,
      Pane = H.Pane,
      pick = H.pick,
      pInt = H.pInt,
      Tick = H.Tick,
      splat = H.splat,
      wrap = H.wrap,
      hiddenAxisMixin,
      radialAxisMixin,
      axisProto = Axis.prototype,
      tickProto = Tick.prototype;
    hiddenAxisMixin = {
      getOffset: noop,
      redraw: function() {
        this.isDirty = false;
      },
      render: function() {
        this.isDirty = false;
      },
      setScale: noop,
      setCategories: noop,
      setTitle: noop
    };
    radialAxisMixin = {
      defaultRadialGaugeOptions: {
        labels: {
          align: 'center',
          x: 0,
          y: null
        },
        minorGridLineWidth: 0,
        minorTickInterval: 'auto',
        minorTickLength: 10,
        minorTickPosition: 'inside',
        minorTickWidth: 1,
        tickLength: 10,
        tickPosition: 'inside',
        tickWidth: 2,
        title: {
          rotation: 0
        },
        zIndex: 2
      },
      defaultRadialXOptions: {
        gridLineWidth: 1,
        labels: {
          align: null,
          distance: 15,
          x: 0,
          y: null
        },
        maxPadding: 0,
        minPadding: 0,
        showLastLabel: false,
        tickLength: 0
      },
      defaultRadialYOptions: {
        gridLineInterpolation: 'circle',
        labels: {
          align: 'right',
          x: -3,
          y: -2
        },
        showLastLabel: false,
        title: {
          x: 4,
          text: null,
          rotation: 90
        }
      },
      setOptions: function(userOptions) {
        var options = this.options = merge(
          this.defaultOptions,
          this.defaultRadialOptions,
          userOptions
        );
        if (!options.plotBands) {
          options.plotBands = [];
        }
      },
      getOffset: function() {
        axisProto.getOffset.call(this);
        this.chart.axisOffset[this.side] = 0;
        this.center = this.pane.center = CenteredSeriesMixin.getCenter.call(this.pane);
      },
      getLinePath: function(lineWidth, radius) {
        var center = this.center,
          end,
          chart = this.chart,
          r = pick(radius, center[2] / 2 - this.offset),
          path;
        if (this.isCircular || radius !== undefined) {
          path = this.chart.renderer.symbols.arc(
            this.left + center[0],
            this.top + center[1],
            r,
            r, {
              start: this.startAngleRad,
              end: this.endAngleRad,
              open: true,
              innerR: 0
            }
          );
        } else {
          end = this.postTranslate(this.angleRad, r);
          path = ['M', center[0] + chart.plotLeft, center[1] + chart.plotTop, 'L', end.x, end.y];
        }
        return path;
      },
      setAxisTranslation: function() {
        axisProto.setAxisTranslation.call(this);
        if (this.center) {
          if (this.isCircular) {
            this.transA = (this.endAngleRad - this.startAngleRad) /
              ((this.max - this.min) || 1);
          } else {
            this.transA = (this.center[2] / 2) / ((this.max - this.min) || 1);
          }
          if (this.isXAxis) {
            this.minPixelPadding = this.transA * this.minPointOffset;
          } else {
            this.minPixelPadding = 0;
          }
        }
      },
      beforeSetTickPositions: function() {
        this.autoConnect = this.isCircular && pick(this.userMax, this.options.max) === undefined &&
          this.endAngleRad - this.startAngleRad === 2 * Math.PI;
        if (this.autoConnect) {
          this.max += (this.categories && 1) || this.pointRange || this.closestPointRange || 0;
        }
      },
      setAxisSize: function() {
        axisProto.setAxisSize.call(this);
        if (this.isRadial) {
          this.center = this.pane.center = CenteredSeriesMixin.getCenter.call(this.pane);
          if (this.isCircular) {
            this.sector = this.endAngleRad - this.startAngleRad;
          }
          this.len = this.width = this.height = this.center[2] * pick(this.sector, 1) / 2;
        }
      },
      getPosition: function(value, length) {
        return this.postTranslate(
          this.isCircular ? this.translate(value) : this.angleRad,
          pick(this.isCircular ? length : this.translate(value), this.center[2] / 2) - this.offset
        );
      },
      postTranslate: function(angle, radius) {
        var chart = this.chart,
          center = this.center;
        angle = this.startAngleRad + angle;
        return {
          x: chart.plotLeft + center[0] + Math.cos(angle) * radius,
          y: chart.plotTop + center[1] + Math.sin(angle) * radius
        };
      },
      getPlotBandPath: function(from, to, options) {
        var center = this.center,
          startAngleRad = this.startAngleRad,
          fullRadius = center[2] / 2,
          radii = [
            pick(options.outerRadius, '100%'),
            options.innerRadius,
            pick(options.thickness, 10)
          ],
          offset = Math.min(this.offset, 0),
          percentRegex = /%$/,
          start,
          end,
          open,
          isCircular = this.isCircular,
          ret;
        if (this.options.gridLineInterpolation === 'polygon') {
          ret = this.getPlotLinePath(from).concat(this.getPlotLinePath(to, true));
        } else {
          from = Math.max(from, this.min);
          to = Math.min(to, this.max);
          if (!isCircular) {
            radii[0] = this.translate(from);
            radii[1] = this.translate(to);
          }
          radii = map(radii, function(radius) {
            if (percentRegex.test(radius)) {
              radius = (pInt(radius, 10) * fullRadius) / 100;
            }
            return radius;
          });
          if (options.shape === 'circle' || !isCircular) {
            start = -Math.PI / 2;
            end = Math.PI * 1.5;
            open = true;
          } else {
            start = startAngleRad + this.translate(from);
            end = startAngleRad + this.translate(to);
          }
          radii[0] -= offset;
          radii[2] -= offset;
          ret = this.chart.renderer.symbols.arc(
            this.left + center[0],
            this.top + center[1],
            radii[0],
            radii[0], {
              start: Math.min(start, end),
              end: Math.max(start, end),
              innerR: pick(radii[1], radii[0] - radii[2]),
              open: open
            }
          );
        }
        return ret;
      },
      getPlotLinePath: function(value, reverse) {
        var axis = this,
          center = axis.center,
          chart = axis.chart,
          end = axis.getPosition(value),
          xAxis,
          xy,
          tickPositions,
          ret;
        if (axis.isCircular) {
          ret = ['M', center[0] + chart.plotLeft, center[1] + chart.plotTop, 'L', end.x, end.y];
        } else if (axis.options.gridLineInterpolation === 'circle') {
          value = axis.translate(value);
          if (value) {
            ret = axis.getLinePath(0, value);
          }
        } else {
          each(chart.xAxis, function(a) {
            if (a.pane === axis.pane) {
              xAxis = a;
            }
          });
          ret = [];
          value = axis.translate(value);
          tickPositions = xAxis.tickPositions;
          if (xAxis.autoConnect) {
            tickPositions = tickPositions.concat([tickPositions[0]]);
          }
          if (reverse) {
            tickPositions = [].concat(tickPositions).reverse();
          }
          each(tickPositions, function(pos, i) {
            xy = xAxis.getPosition(pos, value);
            ret.push(i ? 'L' : 'M', xy.x, xy.y);
          });
        }
        return ret;
      },
      getTitlePosition: function() {
        var center = this.center,
          chart = this.chart,
          titleOptions = this.options.title;
        return {
          x: chart.plotLeft + center[0] + (titleOptions.x || 0),
          y: chart.plotTop + center[1] - ({
              high: 0.5,
              middle: 0.25,
              low: 0
            }[titleOptions.align] *
            center[2]) + (titleOptions.y || 0)
        };
      }
    };
    wrap(axisProto, 'init', function(proceed, chart, userOptions) {
      var axis = this,
        angular = chart.angular,
        polar = chart.polar,
        isX = userOptions.isX,
        isHidden = angular && isX,
        isCircular,
        options,
        chartOptions = chart.options,
        paneIndex = userOptions.pane || 0,
        pane,
        paneOptions;
      if (angular) {
        extend(this, isHidden ? hiddenAxisMixin : radialAxisMixin);
        isCircular = !isX;
        if (isCircular) {
          this.defaultRadialOptions = this.defaultRadialGaugeOptions;
        }
      } else if (polar) {
        extend(this, radialAxisMixin);
        isCircular = isX;
        this.defaultRadialOptions = isX ? this.defaultRadialXOptions : merge(this.defaultYAxisOptions, this.defaultRadialYOptions);
      }
      if (angular || polar) {
        this.isRadial = true;
        chart.inverted = false;
        chartOptions.chart.zoomType = null;
      } else {
        this.isRadial = false;
      }
      proceed.call(this, chart, userOptions);
      if (!isHidden && (angular || polar)) {
        options = this.options;
        if (!chart.panes) {
          chart.panes = [];
        }
        this.pane = pane = chart.panes[paneIndex] = chart.panes[paneIndex] || new Pane(
          splat(chartOptions.pane)[paneIndex],
          chart,
          axis
        );
        paneOptions = pane.options;
        this.angleRad = (options.angle || 0) * Math.PI / 180;
        this.startAngleRad = (paneOptions.startAngle - 90) * Math.PI / 180;
        this.endAngleRad = (pick(paneOptions.endAngle, paneOptions.startAngle + 360) - 90) * Math.PI / 180;
        this.offset = options.offset || 0;
        this.isCircular = isCircular;
      }
    });
    wrap(axisProto, 'autoLabelAlign', function(proceed) {
      if (!this.isRadial) {
        return proceed.apply(this, [].slice.call(arguments, 1));
      }
    });
    wrap(tickProto, 'getPosition', function(proceed, horiz, pos, tickmarkOffset, old) {
      var axis = this.axis;
      return axis.getPosition ?
        axis.getPosition(pos) :
        proceed.call(this, horiz, pos, tickmarkOffset, old);
    });
    wrap(tickProto, 'getLabelPosition', function(proceed, x, y, label, horiz, labelOptions, tickmarkOffset, index, step) {
      var axis = this.axis,
        optionsY = labelOptions.y,
        ret,
        centerSlot = 20,
        align = labelOptions.align,
        angle = ((axis.translate(this.pos) + axis.startAngleRad + Math.PI / 2) / Math.PI * 180) % 360;
      if (axis.isRadial) {
        ret = axis.getPosition(this.pos, (axis.center[2] / 2) + pick(labelOptions.distance, -25));
        if (labelOptions.rotation === 'auto') {
          label.attr({
            rotation: angle
          });
        } else if (optionsY === null) {
          optionsY = axis.chart.renderer.fontMetrics(label.styles.fontSize).b - label.getBBox().height / 2;
        }
        if (align === null) {
          if (axis.isCircular) {
            if (this.label.getBBox().width > axis.len * axis.tickInterval / (axis.max - axis.min)) {
              centerSlot = 0;
            }
            if (angle > centerSlot && angle < 180 - centerSlot) {
              align = 'left';
            } else if (angle > 180 + centerSlot && angle < 360 - centerSlot) {
              align = 'right';
            } else {
              align = 'center';
            }
          } else {
            align = 'center';
          }
          label.attr({
            align: align
          });
        }
        ret.x += labelOptions.x;
        ret.y += optionsY;
      } else {
        ret = proceed.call(this, x, y, label, horiz, labelOptions, tickmarkOffset, index, step);
      }
      return ret;
    });
    wrap(tickProto, 'getMarkPath', function(proceed, x, y, tickLength, tickWidth, horiz, renderer) {
      var axis = this.axis,
        endPoint,
        ret;
      if (axis.isRadial) {
        endPoint = axis.getPosition(this.pos, axis.center[2] / 2 + tickLength);
        ret = [
          'M',
          x,
          y,
          'L',
          endPoint.x,
          endPoint.y
        ];
      } else {
        ret = proceed.call(this, x, y, tickLength, tickWidth, horiz, renderer);
      }
      return ret;
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var each = H.each,
      noop = H.noop,
      pick = H.pick,
      Series = H.Series,
      seriesType = H.seriesType,
      seriesTypes = H.seriesTypes;
    seriesType('arearange', 'area', {
      lineWidth: 1,
      marker: null,
      threshold: null,
      tooltip: {
        pointFormat: '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.low}</b> - <b>{point.high}</b><br/>'
      },
      trackByArea: true,
      dataLabels: {
        align: null,
        verticalAlign: null,
        xLow: 0,
        xHigh: 0,
        yLow: 0,
        yHigh: 0
      },
      states: {
        hover: {
          halo: false
        }
      }
    }, {
      pointArrayMap: ['low', 'high'],
      dataLabelCollections: ['dataLabel', 'dataLabelUpper'],
      toYData: function(point) {
        return [point.low, point.high];
      },
      pointValKey: 'low',
      deferTranslatePolar: true,
      highToXY: function(point) {
        var chart = this.chart,
          xy = this.xAxis.postTranslate(point.rectPlotX, this.yAxis.len - point.plotHigh);
        point.plotHighX = xy.x - chart.plotLeft;
        point.plotHigh = xy.y - chart.plotTop;
      },
      translate: function() {
        var series = this,
          yAxis = series.yAxis,
          hasModifyValue = !!series.modifyValue;
        seriesTypes.area.prototype.translate.apply(series);
        each(series.points, function(point) {
          var low = point.low,
            high = point.high,
            plotY = point.plotY;
          if (high === null || low === null) {
            point.isNull = true;
          } else {
            point.plotLow = plotY;
            point.plotHigh = yAxis.translate(
              hasModifyValue ? series.modifyValue(high, point) : high,
              0,
              1,
              0,
              1
            );
            if (hasModifyValue) {
              point.yBottom = point.plotHigh;
            }
          }
        });
        if (this.chart.polar) {
          each(this.points, function(point) {
            series.highToXY(point);
          });
        }
      },
      getGraphPath: function(points) {
        var highPoints = [],
          highAreaPoints = [],
          i,
          getGraphPath = seriesTypes.area.prototype.getGraphPath,
          point,
          pointShim,
          linePath,
          lowerPath,
          options = this.options,
          connectEnds = this.chart.polar && options.connectEnds !== false,
          step = options.step,
          higherPath,
          higherAreaPath;
        points = points || this.points;
        i = points.length;
        i = points.length;
        while (i--) {
          point = points[i];
          if (!point.isNull &&
            !connectEnds &&
            (!points[i + 1] || points[i + 1].isNull)
          ) {
            highAreaPoints.push({
              plotX: point.plotX,
              plotY: point.plotY,
              doCurve: false
            });
          }
          pointShim = {
            polarPlotY: point.polarPlotY,
            rectPlotX: point.rectPlotX,
            yBottom: point.yBottom,
            plotX: pick(point.plotHighX, point.plotX),
            plotY: point.plotHigh,
            isNull: point.isNull
          };
          highAreaPoints.push(pointShim);
          highPoints.push(pointShim);
          if (!point.isNull &&
            !connectEnds &&
            (!points[i - 1] || points[i - 1].isNull)
          ) {
            highAreaPoints.push({
              plotX: point.plotX,
              plotY: point.plotY,
              doCurve: false
            });
          }
        }
        lowerPath = getGraphPath.call(this, points);
        if (step) {
          if (step === true) {
            step = 'left';
          }
          options.step = {
            left: 'right',
            center: 'center',
            right: 'left'
          }[step];
        }
        higherPath = getGraphPath.call(this, highPoints);
        higherAreaPath = getGraphPath.call(this, highAreaPoints);
        options.step = step;
        linePath = [].concat(lowerPath, higherPath);
        if (!this.chart.polar && higherAreaPath[0] === 'M') {
          higherAreaPath[0] = 'L';
        }
        this.graphPath = linePath;
        this.areaPath = this.areaPath.concat(lowerPath, higherAreaPath);
        linePath.isArea = true;
        linePath.xMap = lowerPath.xMap;
        this.areaPath.xMap = lowerPath.xMap;
        return linePath;
      },
      drawDataLabels: function() {
        var data = this.data,
          length = data.length,
          i,
          originalDataLabels = [],
          seriesProto = Series.prototype,
          dataLabelOptions = this.options.dataLabels,
          align = dataLabelOptions.align,
          verticalAlign = dataLabelOptions.verticalAlign,
          inside = dataLabelOptions.inside,
          point,
          up,
          inverted = this.chart.inverted;
        if (dataLabelOptions.enabled || this._hasPointLabels) {
          i = length;
          while (i--) {
            point = data[i];
            if (point) {
              up = inside ? point.plotHigh < point.plotLow : point.plotHigh > point.plotLow;
              point.y = point.high;
              point._plotY = point.plotY;
              point.plotY = point.plotHigh;
              originalDataLabels[i] = point.dataLabel;
              point.dataLabel = point.dataLabelUpper;
              point.below = up;
              if (inverted) {
                if (!align) {
                  dataLabelOptions.align = up ? 'right' : 'left';
                }
              } else {
                if (!verticalAlign) {
                  dataLabelOptions.verticalAlign = up ? 'top' : 'bottom';
                }
              }
              dataLabelOptions.x = dataLabelOptions.xHigh;
              dataLabelOptions.y = dataLabelOptions.yHigh;
            }
          }
          if (seriesProto.drawDataLabels) {
            seriesProto.drawDataLabels.apply(this, arguments);
          }
          i = length;
          while (i--) {
            point = data[i];
            if (point) {
              up = inside ? point.plotHigh < point.plotLow : point.plotHigh > point.plotLow;
              point.dataLabelUpper = point.dataLabel;
              point.dataLabel = originalDataLabels[i];
              point.y = point.low;
              point.plotY = point._plotY;
              point.below = !up;
              if (inverted) {
                if (!align) {
                  dataLabelOptions.align = up ? 'left' : 'right';
                }
              } else {
                if (!verticalAlign) {
                  dataLabelOptions.verticalAlign = up ? 'bottom' : 'top';
                }
              }
              dataLabelOptions.x = dataLabelOptions.xLow;
              dataLabelOptions.y = dataLabelOptions.yLow;
            }
          }
          if (seriesProto.drawDataLabels) {
            seriesProto.drawDataLabels.apply(this, arguments);
          }
        }
        dataLabelOptions.align = align;
        dataLabelOptions.verticalAlign = verticalAlign;
      },
      alignDataLabel: function() {
        seriesTypes.column.prototype.alignDataLabel.apply(this, arguments);
      },
      setStackedPoints: noop,
      getSymbol: noop,
      drawPoints: noop
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var seriesType = H.seriesType,
      seriesTypes = H.seriesTypes;
    seriesType('areasplinerange', 'arearange', null, {
      getPointSpline: seriesTypes.spline.prototype.getPointSpline
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var defaultPlotOptions = H.defaultPlotOptions,
      each = H.each,
      merge = H.merge,
      noop = H.noop,
      pick = H.pick,
      seriesType = H.seriesType,
      seriesTypes = H.seriesTypes;
    var colProto = seriesTypes.column.prototype;
    seriesType('columnrange', 'arearange', merge(defaultPlotOptions.column, defaultPlotOptions.arearange, {
      lineWidth: 1,
      pointRange: null
    }), {
      translate: function() {
        var series = this,
          yAxis = series.yAxis,
          xAxis = series.xAxis,
          startAngleRad = xAxis.startAngleRad,
          start,
          chart = series.chart,
          isRadial = series.xAxis.isRadial,
          plotHigh;
        colProto.translate.apply(series);
        each(series.points, function(point) {
          var shapeArgs = point.shapeArgs,
            minPointLength = series.options.minPointLength,
            heightDifference,
            height,
            y;
          point.plotHigh = plotHigh = yAxis.translate(point.high, 0, 1, 0, 1);
          point.plotLow = point.plotY;
          y = plotHigh;
          height = pick(point.rectPlotY, point.plotY) - plotHigh;
          if (Math.abs(height) < minPointLength) {
            heightDifference = (minPointLength - height);
            height += heightDifference;
            y -= heightDifference / 2;
          } else if (height < 0) {
            height *= -1;
            y -= height;
          }
          if (isRadial) {
            start = point.barX + startAngleRad;
            point.shapeType = 'path';
            point.shapeArgs = {
              d: series.polarArc(y + height, y, start, start + point.pointWidth)
            };
          } else {
            shapeArgs.height = height;
            shapeArgs.y = y;
            point.tooltipPos = chart.inverted ? [
              yAxis.len + yAxis.pos - chart.plotLeft - y - height / 2,
              xAxis.len + xAxis.pos - chart.plotTop - shapeArgs.x -
              shapeArgs.width / 2,
              height
            ] : [
              xAxis.left - chart.plotLeft + shapeArgs.x +
              shapeArgs.width / 2,
              yAxis.pos - chart.plotTop + y + height / 2,
              height
            ];
          }
        });
      },
      directTouch: true,
      trackerGroups: ['group', 'dataLabelsGroup'],
      drawGraph: noop,
      crispCol: colProto.crispCol,
      drawPoints: colProto.drawPoints,
      drawTracker: colProto.drawTracker,
      getColumnMetrics: colProto.getColumnMetrics,
      animate: function() {
        return colProto.animate.apply(this, arguments);
      },
      polarArc: function() {
        return colProto.polarArc.apply(this, arguments);
      },
      pointAttribs: colProto.pointAttribs
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var each = H.each,
      isNumber = H.isNumber,
      merge = H.merge,
      noop = H.noop,
      pick = H.pick,
      pInt = H.pInt,
      Series = H.Series,
      seriesType = H.seriesType,
      TrackerMixin = H.TrackerMixin;
    seriesType('gauge', 'line', {
      dataLabels: {
        enabled: true,
        defer: false,
        y: 15,
        borderRadius: 3,
        crop: false,
        verticalAlign: 'top',
        zIndex: 2,
        borderWidth: 1,
        borderColor: '#cccccc'
      },
      dial: {},
      pivot: {},
      tooltip: {
        headerFormat: ''
      },
      showInLegend: false
    }, {
      angular: true,
      directTouch: true,
      drawGraph: noop,
      fixedBox: true,
      forceDL: true,
      noSharedTooltip: true,
      trackerGroups: ['group', 'dataLabelsGroup'],
      translate: function() {
        var series = this,
          yAxis = series.yAxis,
          options = series.options,
          center = yAxis.center;
        series.generatePoints();
        each(series.points, function(point) {
          var dialOptions = merge(options.dial, point.dial),
            radius = (pInt(pick(dialOptions.radius, 80)) * center[2]) / 200,
            baseLength = (pInt(pick(dialOptions.baseLength, 70)) * radius) / 100,
            rearLength = (pInt(pick(dialOptions.rearLength, 10)) * radius) / 100,
            baseWidth = dialOptions.baseWidth || 3,
            topWidth = dialOptions.topWidth || 1,
            overshoot = options.overshoot,
            rotation = yAxis.startAngleRad + yAxis.translate(point.y, null, null, null, true);
          if (isNumber(overshoot)) {
            overshoot = overshoot / 180 * Math.PI;
            rotation = Math.max(yAxis.startAngleRad - overshoot, Math.min(yAxis.endAngleRad + overshoot, rotation));
          } else if (options.wrap === false) {
            rotation = Math.max(yAxis.startAngleRad, Math.min(yAxis.endAngleRad, rotation));
          }
          rotation = rotation * 180 / Math.PI;
          point.shapeType = 'path';
          point.shapeArgs = {
            d: dialOptions.path || [
              'M', -rearLength, -baseWidth / 2,
              'L',
              baseLength, -baseWidth / 2,
              radius, -topWidth / 2,
              radius, topWidth / 2,
              baseLength, baseWidth / 2, -rearLength, baseWidth / 2,
              'z'
            ],
            translateX: center[0],
            translateY: center[1],
            rotation: rotation
          };
          point.plotX = center[0];
          point.plotY = center[1];
        });
      },
      drawPoints: function() {
        var series = this,
          center = series.yAxis.center,
          pivot = series.pivot,
          options = series.options,
          pivotOptions = options.pivot,
          renderer = series.chart.renderer;
        each(series.points, function(point) {
          var graphic = point.graphic,
            shapeArgs = point.shapeArgs,
            d = shapeArgs.d,
            dialOptions = merge(options.dial, point.dial);
          if (graphic) {
            graphic.animate(shapeArgs);
            shapeArgs.d = d;
          } else {
            point.graphic = renderer[point.shapeType](shapeArgs)
              .attr({
                rotation: shapeArgs.rotation,
                zIndex: 1
              })
              .addClass('highcharts-dial')
              .add(series.group);
            point.graphic.attr({
              stroke: dialOptions.borderColor || 'none',
              'stroke-width': dialOptions.borderWidth || 0,
              fill: dialOptions.backgroundColor || '#000000'
            });
          }
        });
        if (pivot) {
          pivot.animate({
            translateX: center[0],
            translateY: center[1]
          });
        } else {
          series.pivot = renderer.circle(0, 0, pick(pivotOptions.radius, 5))
            .attr({
              zIndex: 2
            })
            .addClass('highcharts-pivot')
            .translate(center[0], center[1])
            .add(series.group);
          series.pivot.attr({
            'stroke-width': pivotOptions.borderWidth || 0,
            stroke: pivotOptions.borderColor || '#cccccc',
            fill: pivotOptions.backgroundColor || '#000000'
          });
        }
      },
      animate: function(init) {
        var series = this;
        if (!init) {
          each(series.points, function(point) {
            var graphic = point.graphic;
            if (graphic) {
              graphic.attr({
                rotation: series.yAxis.startAngleRad * 180 / Math.PI
              });
              graphic.animate({
                rotation: point.shapeArgs.rotation
              }, series.options.animation);
            }
          });
          series.animate = null;
        }
      },
      render: function() {
        this.group = this.plotGroup(
          'group',
          'series',
          this.visible ? 'visible' : 'hidden',
          this.options.zIndex,
          this.chart.seriesGroup
        );
        Series.prototype.render.call(this);
        this.group.clip(this.chart.clipRect);
      },
      setData: function(data, redraw) {
        Series.prototype.setData.call(this, data, false);
        this.processData();
        this.generatePoints();
        if (pick(redraw, true)) {
          this.chart.redraw();
        }
      },
      drawTracker: TrackerMixin && TrackerMixin.drawTrackerPoint
    }, {
      setState: function(state) {
        this.state = state;
      }
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var each = H.each,
      noop = H.noop,
      pick = H.pick,
      seriesType = H.seriesType,
      seriesTypes = H.seriesTypes;
    seriesType('boxplot', 'column', {
      threshold: null,
      tooltip: {
        pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> {series.name}</b><br/>' +
          'Maximum: {point.high}<br/>' +
          'Upper quartile: {point.q3}<br/>' +
          'Median: {point.median}<br/>' +
          'Lower quartile: {point.q1}<br/>' +
          'Minimum: {point.low}<br/>'
      },
      whiskerLength: '50%',
      fillColor: '#ffffff',
      lineWidth: 1,
      medianWidth: 2,
      states: {
        hover: {
          brightness: -0.3
        }
      },
      whiskerWidth: 2
    }, {
      pointArrayMap: ['low', 'q1', 'median', 'q3', 'high'],
      toYData: function(point) {
        return [point.low, point.q1, point.median, point.q3, point.high];
      },
      pointValKey: 'high',
      pointAttribs: function(point) {
        var options = this.options,
          color = (point && point.color) || this.color;
        return {
          'fill': point.fillColor || options.fillColor || color,
          'stroke': options.lineColor || color,
          'stroke-width': options.lineWidth || 0
        };
      },
      drawDataLabels: noop,
      translate: function() {
        var series = this,
          yAxis = series.yAxis,
          pointArrayMap = series.pointArrayMap;
        seriesTypes.column.prototype.translate.apply(series);
        each(series.points, function(point) {
          each(pointArrayMap, function(key) {
            if (point[key] !== null) {
              point[key + 'Plot'] = yAxis.translate(point[key], 0, 1, 0, 1);
            }
          });
        });
      },
      drawPoints: function() {
        var series = this,
          points = series.points,
          options = series.options,
          chart = series.chart,
          renderer = chart.renderer,
          q1Plot,
          q3Plot,
          highPlot,
          lowPlot,
          medianPlot,
          medianPath,
          crispCorr,
          crispX = 0,
          boxPath,
          width,
          left,
          right,
          halfWidth,
          doQuartiles = series.doQuartiles !== false,
          pointWiskerLength,
          whiskerLength = series.options.whiskerLength;
        each(points, function(point) {
          var graphic = point.graphic,
            verb = graphic ? 'animate' : 'attr',
            shapeArgs = point.shapeArgs;
          var boxAttr,
            stemAttr = {},
            whiskersAttr = {},
            medianAttr = {},
            color = point.color || series.color;
          if (point.plotY !== undefined) {
            width = shapeArgs.width;
            left = Math.floor(shapeArgs.x);
            right = left + width;
            halfWidth = Math.round(width / 2);
            q1Plot = Math.floor(doQuartiles ? point.q1Plot : point.lowPlot);
            q3Plot = Math.floor(doQuartiles ? point.q3Plot : point.lowPlot);
            highPlot = Math.floor(point.highPlot);
            lowPlot = Math.floor(point.lowPlot);
            if (!graphic) {
              point.graphic = graphic = renderer.g('point')
                .add(series.group);
              point.stem = renderer.path()
                .addClass('highcharts-boxplot-stem')
                .add(graphic);
              if (whiskerLength) {
                point.whiskers = renderer.path()
                  .addClass('highcharts-boxplot-whisker')
                  .add(graphic);
              }
              if (doQuartiles) {
                point.box = renderer.path(boxPath)
                  .addClass('highcharts-boxplot-box')
                  .add(graphic);
              }
              point.medianShape = renderer.path(medianPath)
                .addClass('highcharts-boxplot-median')
                .add(graphic);
              stemAttr.stroke = point.stemColor || options.stemColor || color;
              stemAttr['stroke-width'] = pick(point.stemWidth, options.stemWidth, options.lineWidth);
              stemAttr.dashstyle = point.stemDashStyle || options.stemDashStyle;
              point.stem.attr(stemAttr);
              if (whiskerLength) {
                whiskersAttr.stroke = point.whiskerColor || options.whiskerColor || color;
                whiskersAttr['stroke-width'] = pick(point.whiskerWidth, options.whiskerWidth, options.lineWidth);
                point.whiskers.attr(whiskersAttr);
              }
              if (doQuartiles) {
                boxAttr = series.pointAttribs(point);
                point.box.attr(boxAttr);
              }
              medianAttr.stroke = point.medianColor || options.medianColor || color;
              medianAttr['stroke-width'] = pick(point.medianWidth, options.medianWidth, options.lineWidth);
              point.medianShape.attr(medianAttr);
            }
            crispCorr = (point.stem.strokeWidth() % 2) / 2;
            crispX = left + halfWidth + crispCorr;
            point.stem[verb]({
              d: [
                'M',
                crispX, q3Plot,
                'L',
                crispX, highPlot,
                'M',
                crispX, q1Plot,
                'L',
                crispX, lowPlot
              ]
            });
            if (doQuartiles) {
              crispCorr = (point.box.strokeWidth() % 2) / 2;
              q1Plot = Math.floor(q1Plot) + crispCorr;
              q3Plot = Math.floor(q3Plot) + crispCorr;
              left += crispCorr;
              right += crispCorr;
              point.box[verb]({
                d: [
                  'M',
                  left, q3Plot,
                  'L',
                  left, q1Plot,
                  'L',
                  right, q1Plot,
                  'L',
                  right, q3Plot,
                  'L',
                  left, q3Plot,
                  'z'
                ]
              });
            }
            if (whiskerLength) {
              crispCorr = (point.whiskers.strokeWidth() % 2) / 2;
              highPlot = highPlot + crispCorr;
              lowPlot = lowPlot + crispCorr;
              pointWiskerLength = (/%$/).test(whiskerLength) ? halfWidth * parseFloat(whiskerLength) / 100 : whiskerLength / 2;
              point.whiskers[verb]({
                d: [
                  'M',
                  crispX - pointWiskerLength,
                  highPlot,
                  'L',
                  crispX + pointWiskerLength,
                  highPlot,
                  'M',
                  crispX - pointWiskerLength,
                  lowPlot,
                  'L',
                  crispX + pointWiskerLength,
                  lowPlot
                ]
              });
            }
            medianPlot = Math.round(point.medianPlot);
            crispCorr = (point.medianShape.strokeWidth() % 2) / 2;
            medianPlot = medianPlot + crispCorr;
            point.medianShape[verb]({
              d: [
                'M',
                left,
                medianPlot,
                'L',
                right,
                medianPlot
              ]
            });
          }
        });
      },
      setStackedPoints: noop
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var each = H.each,
      noop = H.noop,
      seriesType = H.seriesType,
      seriesTypes = H.seriesTypes;
    seriesType('errorbar', 'boxplot', {
      color: '#000000',
      grouping: false,
      linkedTo: ':previous',
      tooltip: {
        pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.low}</b> - <b>{point.high}</b><br/>'
      },
      whiskerWidth: null
    }, {
      type: 'errorbar',
      pointArrayMap: ['low', 'high'],
      toYData: function(point) {
        return [point.low, point.high];
      },
      pointValKey: 'high',
      doQuartiles: false,
      drawDataLabels: seriesTypes.arearange ? function() {
        var valKey = this.pointValKey;
        seriesTypes.arearange.prototype.drawDataLabels.call(this);
        each(this.data, function(point) {
          point.y = point[valKey];
        });
      } : noop,
      getColumnMetrics: function() {
        return (this.linkedParent && this.linkedParent.columnMetrics) ||
          seriesTypes.column.prototype.getColumnMetrics.call(this);
      }
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var correctFloat = H.correctFloat,
      isNumber = H.isNumber,
      noop = H.noop,
      pick = H.pick,
      Point = H.Point,
      Series = H.Series,
      seriesType = H.seriesType,
      seriesTypes = H.seriesTypes;
    seriesType('waterfall', 'column', {
      dataLabels: {
        inside: true
      },
      lineWidth: 1,
      lineColor: '#333333',
      dashStyle: 'dot',
      borderColor: '#333333',
      states: {
        hover: {
          lineWidthPlus: 0
        }
      }
    }, {
      pointValKey: 'y',
      translate: function() {
        var series = this,
          options = series.options,
          yAxis = series.yAxis,
          len,
          i,
          points,
          point,
          shapeArgs,
          stack,
          y,
          yValue,
          previousY,
          previousIntermediate,
          range,
          minPointLength = pick(options.minPointLength, 5),
          threshold = options.threshold,
          stacking = options.stacking,
          positiveOffset = 0,
          negativeOffset = 0,
          stackIndicator,
          tooltipY;
        seriesTypes.column.prototype.translate.apply(this);
        previousY = previousIntermediate = threshold;
        points = series.points;
        for (i = 0, len = points.length; i < len; i++) {
          point = points[i];
          yValue = this.processedYData[i];
          shapeArgs = point.shapeArgs;
          stack = stacking && yAxis.stacks[(series.negStacks && yValue < threshold ? '-' : '') + series.stackKey];
          stackIndicator = series.getStackIndicator(stackIndicator, point.x);
          range = stack ?
            stack[point.x].points[series.index + ',' + i + ',' + stackIndicator.index] : [0, yValue];
          if (point.isSum) {
            point.y = correctFloat(yValue);
          } else if (point.isIntermediateSum) {
            point.y = correctFloat(yValue - previousIntermediate);
          }
          y = Math.max(previousY, previousY + point.y) + range[0];
          shapeArgs.y = yAxis.toPixels(y, true);
          if (point.isSum) {
            shapeArgs.y = yAxis.toPixels(range[1], true);
            shapeArgs.height = Math.min(yAxis.toPixels(range[0], true), yAxis.len) -
              shapeArgs.y + positiveOffset + negativeOffset;
          } else if (point.isIntermediateSum) {
            shapeArgs.y = yAxis.toPixels(range[1], true);
            shapeArgs.height = Math.min(yAxis.toPixels(previousIntermediate, true), yAxis.len) -
              shapeArgs.y + positiveOffset + negativeOffset;
            previousIntermediate = range[1];
          } else {
            shapeArgs.height = yValue > 0 ?
              yAxis.toPixels(previousY, true) - shapeArgs.y :
              yAxis.toPixels(previousY, true) - yAxis.toPixels(previousY - yValue, true);
            previousY += yValue;
          }
          if (shapeArgs.height < 0) {
            shapeArgs.y += shapeArgs.height;
            shapeArgs.height *= -1;
          }
          point.plotY = shapeArgs.y = Math.round(shapeArgs.y) - (series.borderWidth % 2) / 2;
          shapeArgs.height = Math.max(Math.round(shapeArgs.height), 0.001);
          point.yBottom = shapeArgs.y + shapeArgs.height;
          shapeArgs.y -= negativeOffset;
          if (shapeArgs.height <= minPointLength && !point.isNull) {
            shapeArgs.height = minPointLength;
            if (point.y < 0) {
              negativeOffset -= minPointLength;
            } else {
              positiveOffset += minPointLength;
            }
          }
          shapeArgs.y -= positiveOffset;
          tooltipY = point.plotY - negativeOffset - positiveOffset +
            (point.negative && negativeOffset >= 0 ? shapeArgs.height : 0);
          if (series.chart.inverted) {
            point.tooltipPos[0] = yAxis.len - tooltipY;
          } else {
            point.tooltipPos[1] = tooltipY;
          }
        }
      },
      processData: function(force) {
        var series = this,
          options = series.options,
          yData = series.yData,
          points = series.options.data,
          point,
          dataLength = yData.length,
          threshold = options.threshold || 0,
          subSum,
          sum,
          dataMin,
          dataMax,
          y,
          i;
        sum = subSum = dataMin = dataMax = threshold;
        for (i = 0; i < dataLength; i++) {
          y = yData[i];
          point = points && points[i] ? points[i] : {};
          if (y === 'sum' || point.isSum) {
            yData[i] = correctFloat(sum);
          } else if (y === 'intermediateSum' || point.isIntermediateSum) {
            yData[i] = correctFloat(subSum);
          } else {
            sum += y;
            subSum += y;
          }
          dataMin = Math.min(sum, dataMin);
          dataMax = Math.max(sum, dataMax);
        }
        Series.prototype.processData.call(this, force);
        series.dataMin = dataMin;
        series.dataMax = dataMax;
      },
      toYData: function(pt) {
        if (pt.isSum) {
          return (pt.x === 0 ? null : 'sum');
        }
        if (pt.isIntermediateSum) {
          return (pt.x === 0 ? null : 'intermediateSum');
        }
        return pt.y;
      },
      pointAttribs: function(point, state) {
        var upColor = this.options.upColor,
          attr;
        if (upColor && !point.options.color) {
          point.color = point.y > 0 ? upColor : null;
        }
        attr = seriesTypes.column.prototype.pointAttribs.call(this, point, state);
        delete attr.dashstyle;
        return attr;
      },
      getGraphPath: function() {
        return ['M', 0, 0];
      },
      getCrispPath: function() {
        var data = this.data,
          length = data.length,
          lineWidth = this.graph.strokeWidth() + this.borderWidth,
          normalizer = Math.round(lineWidth) % 2 / 2,
          path = [],
          prevArgs,
          pointArgs,
          i,
          d;
        for (i = 1; i < length; i++) {
          pointArgs = data[i].shapeArgs;
          prevArgs = data[i - 1].shapeArgs;
          d = [
            'M',
            prevArgs.x + prevArgs.width, prevArgs.y + normalizer,
            'L',
            pointArgs.x, prevArgs.y + normalizer
          ];
          if (data[i - 1].y < 0) {
            d[2] += prevArgs.height;
            d[5] += prevArgs.height;
          }
          path = path.concat(d);
        }
        return path;
      },
      drawGraph: function() {
        Series.prototype.drawGraph.call(this);
        this.graph.attr({
          d: this.getCrispPath()
        });
      },
      getExtremes: noop
    }, {
      getClassName: function() {
        var className = Point.prototype.getClassName.call(this);
        if (this.isSum) {
          className += ' highcharts-sum';
        } else if (this.isIntermediateSum) {
          className += ' highcharts-intermediate-sum';
        }
        return className;
      },
      isValid: function() {
        return isNumber(this.y, true) || this.isSum || this.isIntermediateSum;
      }
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var LegendSymbolMixin = H.LegendSymbolMixin,
      noop = H.noop,
      Series = H.Series,
      seriesType = H.seriesType,
      seriesTypes = H.seriesTypes;
    seriesType('polygon', 'scatter', {
      marker: {
        enabled: false,
        states: {
          hover: {
            enabled: false
          }
        }
      },
      stickyTracking: false,
      tooltip: {
        followPointer: true,
        pointFormat: ''
      },
      trackByArea: true
    }, {
      type: 'polygon',
      getGraphPath: function() {
        var graphPath = Series.prototype.getGraphPath.call(this),
          i = graphPath.length + 1;
        while (i--) {
          if ((i === graphPath.length || graphPath[i] === 'M') && i > 0) {
            graphPath.splice(i, 0, 'z');
          }
        }
        this.areaPath = graphPath;
        return graphPath;
      },
      drawGraph: function() {
        this.options.fillColor = this.color;
        seriesTypes.area.prototype.drawGraph.call(this);
      },
      drawLegendSymbol: LegendSymbolMixin.drawRectangle,
      drawTracker: Series.prototype.drawTracker,
      setStackedPoints: noop
    });
  }(Highcharts));
  (function(H) {
    'use strict';
    var arrayMax = H.arrayMax,
      arrayMin = H.arrayMin,
      Axis = H.Axis,
      color = H.color,
      each = H.each,
      isNumber = H.isNumber,
      noop = H.noop,
      pick = H.pick,
      pInt = H.pInt,
      Point = H.Point,
      Series = H.Series,
      seriesType = H.seriesType,
      seriesTypes = H.seriesTypes;
    seriesType('bubble', 'scatter', {
      dataLabels: {
        formatter: function() {
          return this.point.z;
        },
        inside: true,
        verticalAlign: 'middle'
      },
      marker: {
        lineColor: null,
        lineWidth: 1,
        radius: null,
        states: {
          hover: {
            radiusPlus: 0
          }
        },
        symbol: 'circle'
      },
      minSize: 8,
      maxSize: '20%',
      softThreshold: false,
      states: {
        hover: {
          halo: {
            size: 5
          }
        }
      },
      tooltip: {
        pointFormat: '({point.x}, {point.y}), Size: {point.z}'
      },
      turboThreshold: 0,
      zThreshold: 0,
      zoneAxis: 'z'
    }, {
      pointArrayMap: ['y', 'z'],
      parallelArrays: ['x', 'y', 'z'],
      trackerGroups: ['markerGroup', 'dataLabelsGroup'],
      bubblePadding: true,
      zoneAxis: 'z',
      pointAttribs: function(point, state) {
        var markerOptions = this.options.marker,
          fillOpacity = pick(markerOptions.fillOpacity, 0.5),
          attr = Series.prototype.pointAttribs.call(this, point, state);
        if (fillOpacity !== 1) {
          attr.fill = color(attr.fill).setOpacity(fillOpacity).get('rgba');
        }
        return attr;
      },
      getRadii: function(zMin, zMax, minSize, maxSize) {
        var len,
          i,
          pos,
          zData = this.zData,
          radii = [],
          options = this.options,
          sizeByArea = options.sizeBy !== 'width',
          zThreshold = options.zThreshold,
          zRange = zMax - zMin,
          value,
          radius;
        for (i = 0, len = zData.length; i < len; i++) {
          value = zData[i];
          if (options.sizeByAbsoluteValue && value !== null) {
            value = Math.abs(value - zThreshold);
            zMax = Math.max(zMax - zThreshold, Math.abs(zMin - zThreshold));
            zMin = 0;
          }
          if (value === null) {
            radius = null;
          } else if (value < zMin) {
            radius = minSize / 2 - 1;
          } else {
            pos = zRange > 0 ? (value - zMin) / zRange : 0.5;
            if (sizeByArea && pos >= 0) {
              pos = Math.sqrt(pos);
            }
            radius = Math.ceil(minSize + pos * (maxSize - minSize)) / 2;
          }
          radii.push(radius);
        }
        this.radii = radii;
      },
      animate: function(init) {
        var animation = this.options.animation;
        if (!init) {
          each(this.points, function(point) {
            var graphic = point.graphic,
              animationTarget;
            if (graphic && graphic.width) {
              animationTarget = {
                x: graphic.x,
                y: graphic.y,
                width: graphic.width,
                height: graphic.height
              };
              graphic.attr({
                x: point.plotX,
                y: point.plotY,
                width: 1,
                height: 1
              });
              graphic.animate(animationTarget, animation);
            }
          });
          this.animate = null;
        }
      },
      translate: function() {
        var i,
          data = this.data,
          point,
          radius,
          radii = this.radii;
        seriesTypes.scatter.prototype.translate.call(this);
        i = data.length;
        while (i--) {
          point = data[i];
          radius = radii ? radii[i] : 0;
          if (isNumber(radius) && radius >= this.minPxSize / 2) {
            point.marker = {
              radius: radius,
              width: 2 * radius,
              height: 2 * radius
            };
            point.dlBox = {
              x: point.plotX - radius,
              y: point.plotY - radius,
              width: 2 * radius,
              height: 2 * radius
            };
          } else {
            point.shapeArgs = point.plotY = point.dlBox = undefined;
          }
        }
      },
      alignDataLabel: seriesTypes.column.prototype.alignDataLabel,
      buildKDTree: noop,
      applyZones: noop
    }, {
      haloPath: function(size) {
        return Point.prototype.haloPath.call(
          this,
          size === 0 ? 0 : this.marker.radius + size
        );
      },
      ttBelow: false
    });
    Axis.prototype.beforePadding = function() {
      var axis = this,
        axisLength = this.len,
        chart = this.chart,
        pxMin = 0,
        pxMax = axisLength,
        isXAxis = this.isXAxis,
        dataKey = isXAxis ? 'xData' : 'yData',
        min = this.min,
        extremes = {},
        smallestSize = Math.min(chart.plotWidth, chart.plotHeight),
        zMin = Number.MAX_VALUE,
        zMax = -Number.MAX_VALUE,
        range = this.max - min,
        transA = axisLength / range,
        activeSeries = [];
      each(this.series, function(series) {
        var seriesOptions = series.options,
          zData;
        if (series.bubblePadding && (series.visible || !chart.options.chart.ignoreHiddenSeries)) {
          axis.allowZoomOutside = true;
          activeSeries.push(series);
          if (isXAxis) {
            each(['minSize', 'maxSize'], function(prop) {
              var length = seriesOptions[prop],
                isPercent = /%$/.test(length);
              length = pInt(length);
              extremes[prop] = isPercent ?
                smallestSize * length / 100 :
                length;
            });
            series.minPxSize = extremes.minSize;
            series.maxPxSize = Math.max(extremes.maxSize, extremes.minSize);
            zData = series.zData;
            if (zData.length) {
              zMin = pick(seriesOptions.zMin, Math.min(
                zMin,
                Math.max(
                  arrayMin(zData),
                  seriesOptions.displayNegative === false ? seriesOptions.zThreshold : -Number.MAX_VALUE
                )
              ));
              zMax = pick(seriesOptions.zMax, Math.max(zMax, arrayMax(zData)));
            }
          }
        }
      });
      each(activeSeries, function(series) {
        var data = series[dataKey],
          i = data.length,
          radius;
        if (isXAxis) {
          series.getRadii(zMin, zMax, series.minPxSize, series.maxPxSize);
        }
        if (range > 0) {
          while (i--) {
            if (isNumber(data[i]) && axis.dataMin <= data[i] && data[i] <= axis.dataMax) {
              radius = series.radii[i];
              pxMin = Math.min(((data[i] - min) * transA) - radius, pxMin);
              pxMax = Math.max(((data[i] - min) * transA) + radius, pxMax);
            }
          }
        }
      });
      if (activeSeries.length && range > 0 && !this.isLog) {
        pxMax -= axisLength;
        transA *= (axisLength + pxMin - pxMax) / axisLength;
        each([
          ['min', 'userMin', pxMin],
          ['max', 'userMax', pxMax]
        ], function(keys) {
          if (pick(axis.options[keys[0]], axis[keys[1]]) === undefined) {
            axis[keys[0]] += keys[2] / transA;
          }
        });
      }
    };
  }(Highcharts));
  (function(H) {
    'use strict';
    var each = H.each,
      pick = H.pick,
      Pointer = H.Pointer,
      Series = H.Series,
      seriesTypes = H.seriesTypes,
      wrap = H.wrap,
      seriesProto = Series.prototype,
      pointerProto = Pointer.prototype,
      colProto;
    seriesProto.searchPointByAngle = function(e) {
      var series = this,
        chart = series.chart,
        xAxis = series.xAxis,
        center = xAxis.pane.center,
        plotX = e.chartX - center[0] - chart.plotLeft,
        plotY = e.chartY - center[1] - chart.plotTop;
      return this.searchKDTree({
        clientX: 180 + (Math.atan2(plotX, plotY) * (-180 / Math.PI))
      });
    };
    wrap(seriesProto, 'buildKDTree', function(proceed) {
      if (this.chart.polar) {
        if (this.kdByAngle) {
          this.searchPoint = this.searchPointByAngle;
        } else {
          this.kdDimensions = 2;
        }
      }
      proceed.apply(this);
    });
    seriesProto.toXY = function(point) {
      var xy,
        chart = this.chart,
        plotX = point.plotX,
        plotY = point.plotY,
        clientX;
      point.rectPlotX = plotX;
      point.rectPlotY = plotY;
      xy = this.xAxis.postTranslate(point.plotX, this.yAxis.len - plotY);
      point.plotX = point.polarPlotX = xy.x - chart.plotLeft;
      point.plotY = point.polarPlotY = xy.y - chart.plotTop;
      if (this.kdByAngle) {
        clientX = ((plotX / Math.PI * 180) + this.xAxis.pane.options.startAngle) % 360;
        if (clientX < 0) {
          clientX += 360;
        }
        point.clientX = clientX;
      } else {
        point.clientX = point.plotX;
      }
    };
    if (seriesTypes.spline) {
      wrap(seriesTypes.spline.prototype, 'getPointSpline', function(proceed, segment, point, i) {
        var ret,
          smoothing = 1.5,
          denom = smoothing + 1,
          plotX,
          plotY,
          lastPoint,
          nextPoint,
          lastX,
          lastY,
          nextX,
          nextY,
          leftContX,
          leftContY,
          rightContX,
          rightContY,
          distanceLeftControlPoint,
          distanceRightControlPoint,
          leftContAngle,
          rightContAngle,
          jointAngle;
        if (this.chart.polar) {
          plotX = point.plotX;
          plotY = point.plotY;
          lastPoint = segment[i - 1];
          nextPoint = segment[i + 1];
          if (this.connectEnds) {
            if (!lastPoint) {
              lastPoint = segment[segment.length - 2];
            }
            if (!nextPoint) {
              nextPoint = segment[1];
            }
          }
          if (lastPoint && nextPoint) {
            lastX = lastPoint.plotX;
            lastY = lastPoint.plotY;
            nextX = nextPoint.plotX;
            nextY = nextPoint.plotY;
            leftContX = (smoothing * plotX + lastX) / denom;
            leftContY = (smoothing * plotY + lastY) / denom;
            rightContX = (smoothing * plotX + nextX) / denom;
            rightContY = (smoothing * plotY + nextY) / denom;
            distanceLeftControlPoint = Math.sqrt(Math.pow(leftContX - plotX, 2) + Math.pow(leftContY - plotY, 2));
            distanceRightControlPoint = Math.sqrt(Math.pow(rightContX - plotX, 2) + Math.pow(rightContY - plotY, 2));
            leftContAngle = Math.atan2(leftContY - plotY, leftContX - plotX);
            rightContAngle = Math.atan2(rightContY - plotY, rightContX - plotX);
            jointAngle = (Math.PI / 2) + ((leftContAngle + rightContAngle) / 2);
            if (Math.abs(leftContAngle - jointAngle) > Math.PI / 2) {
              jointAngle -= Math.PI;
            }
            leftContX = plotX + Math.cos(jointAngle) * distanceLeftControlPoint;
            leftContY = plotY + Math.sin(jointAngle) * distanceLeftControlPoint;
            rightContX = plotX + Math.cos(Math.PI + jointAngle) * distanceRightControlPoint;
            rightContY = plotY + Math.sin(Math.PI + jointAngle) * distanceRightControlPoint;
            point.rightContX = rightContX;
            point.rightContY = rightContY;
          }
          if (!i) {
            ret = ['M', plotX, plotY];
          } else {
            ret = [
              'C',
              lastPoint.rightContX || lastPoint.plotX,
              lastPoint.rightContY || lastPoint.plotY,
              leftContX || plotX,
              leftContY || plotY,
              plotX,
              plotY
            ];
            lastPoint.rightContX = lastPoint.rightContY = null;
          }
        } else {
          ret = proceed.call(this, segment, point, i);
        }
        return ret;
      });
    }
    wrap(seriesProto, 'translate', function(proceed) {
      var chart = this.chart,
        points,
        i;
      proceed.call(this);
      if (chart.polar) {
        this.kdByAngle = chart.tooltip && chart.tooltip.shared;
        if (!this.preventPostTranslate) {
          points = this.points;
          i = points.length;
          while (i--) {
            this.toXY(points[i]);
          }
        }
      }
    });
    wrap(seriesProto, 'getGraphPath', function(proceed, points) {
      var series = this,
        i,
        firstValid;
      if (this.chart.polar) {
        points = points || this.points;
        for (i = 0; i < points.length; i++) {
          if (!points[i].isNull) {
            firstValid = i;
            break;
          }
        }
        if (this.options.connectEnds !== false && firstValid !== undefined) {
          this.connectEnds = true;
          points.splice(points.length, 0, points[firstValid]);
        }
        each(points, function(point) {
          if (point.polarPlotY === undefined) {
            series.toXY(point);
          }
        });
      }
      return proceed.apply(this, [].slice.call(arguments, 1));
    });

    function polarAnimate(proceed, init) {
      var chart = this.chart,
        animation = this.options.animation,
        group = this.group,
        markerGroup = this.markerGroup,
        center = this.xAxis.center,
        plotLeft = chart.plotLeft,
        plotTop = chart.plotTop,
        attribs;
      if (chart.polar) {
        if (chart.renderer.isSVG) {
          if (animation === true) {
            animation = {};
          }
          if (init) {
            attribs = {
              translateX: center[0] + plotLeft,
              translateY: center[1] + plotTop,
              scaleX: 0.001,
              scaleY: 0.001
            };
            group.attr(attribs);
            if (markerGroup) {
              markerGroup.attr(attribs);
            }
          } else {
            attribs = {
              translateX: plotLeft,
              translateY: plotTop,
              scaleX: 1,
              scaleY: 1
            };
            group.animate(attribs, animation);
            if (markerGroup) {
              markerGroup.animate(attribs, animation);
            }
            this.animate = null;
          }
        }
      } else {
        proceed.call(this, init);
      }
    }
    wrap(seriesProto, 'animate', polarAnimate);
    if (seriesTypes.column) {
      colProto = seriesTypes.column.prototype;
      colProto.polarArc = function(low, high, start, end) {
        var center = this.xAxis.center,
          len = this.yAxis.len;
        return this.chart.renderer.symbols.arc(
          center[0],
          center[1],
          len - high,
          null, {
            start: start,
            end: end,
            innerR: len - pick(low, len)
          }
        );
      };
      wrap(colProto, 'animate', polarAnimate);
      wrap(colProto, 'translate', function(proceed) {
        var xAxis = this.xAxis,
          startAngleRad = xAxis.startAngleRad,
          start,
          points,
          point,
          i;
        this.preventPostTranslate = true;
        proceed.call(this);
        if (xAxis.isRadial) {
          points = this.points;
          i = points.length;
          while (i--) {
            point = points[i];
            start = point.barX + startAngleRad;
            point.shapeType = 'path';
            point.shapeArgs = {
              d: this.polarArc(point.yBottom, point.plotY, start, start + point.pointWidth)
            };
            this.toXY(point);
            point.tooltipPos = [point.plotX, point.plotY];
            point.ttBelow = point.plotY > xAxis.center[1];
          }
        }
      });
      wrap(colProto, 'alignDataLabel', function(proceed, point, dataLabel, options, alignTo, isNew) {
        if (this.chart.polar) {
          var angle = point.rectPlotX / Math.PI * 180,
            align,
            verticalAlign;
          if (options.align === null) {
            if (angle > 20 && angle < 160) {
              align = 'left';
            } else if (angle > 200 && angle < 340) {
              align = 'right';
            } else {
              align = 'center';
            }
            options.align = align;
          }
          if (options.verticalAlign === null) {
            if (angle < 45 || angle > 315) {
              verticalAlign = 'bottom';
            } else if (angle > 135 && angle < 225) {
              verticalAlign = 'top';
            } else {
              verticalAlign = 'middle';
            }
            options.verticalAlign = verticalAlign;
          }
          seriesProto.alignDataLabel.call(this, point, dataLabel, options, alignTo, isNew);
        } else {
          proceed.call(this, point, dataLabel, options, alignTo, isNew);
        }
      });
    }
    wrap(pointerProto, 'getCoordinates', function(proceed, e) {
      var chart = this.chart,
        ret = {
          xAxis: [],
          yAxis: []
        };
      if (chart.polar) {
        each(chart.axes, function(axis) {
          var isXAxis = axis.isXAxis,
            center = axis.center,
            x = e.chartX - center[0] - chart.plotLeft,
            y = e.chartY - center[1] - chart.plotTop;
          ret[isXAxis ? 'xAxis' : 'yAxis'].push({
            axis: axis,
            value: axis.translate(
              isXAxis ?
              Math.PI - Math.atan2(x, y) :
              Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
              true
            )
          });
        });
      } else {
        ret = proceed.call(this, e);
      }
      return ret;
    });
  }(Highcharts));
}));;
/*! RESOURCE: /scripts/highcharts/modules/exporting.js */
(function(h) {
  "object" === typeof module && module.exports ? module.exports = h : h(Highcharts)
})(function(h) {
  (function(f) {
    var h = f.defaultOptions,
      n = f.doc,
      A = f.Chart,
      u = f.addEvent,
      F = f.removeEvent,
      D = f.fireEvent,
      q = f.createElement,
      B = f.discardElement,
      v = f.css,
      p = f.merge,
      C = f.pick,
      k = f.each,
      r = f.extend,
      G = f.isTouchDevice,
      E = f.win,
      H = f.Renderer.prototype.symbols;
    r(h.lang, {
      printChart: "Print chart",
      downloadPNG: "Download PNG image",
      downloadJPEG: "Download JPEG image",
      downloadPDF: "Download PDF document",
      downloadSVG: "Download SVG vector image",
      contextButtonTitle: "Chart context menu"
    });
    h.navigation = {
      buttonOptions: {
        theme: {},
        symbolSize: 14,
        symbolX: 12.5,
        symbolY: 10.5,
        align: "right",
        buttonSpacing: 3,
        height: 22,
        verticalAlign: "top",
        width: 24
      }
    };
    p(!0, h.navigation, {
      menuStyle: {
        border: "1px solid #999999",
        background: "#ffffff",
        padding: "5px 0"
      },
      menuItemStyle: {
        padding: "0.5em 1em",
        background: "none",
        color: "#333333",
        fontSize: G ? "14px" : "11px",
        transition: "background 250ms, color 250ms"
      },
      menuItemHoverStyle: {
        background: "#335cad",
        color: "#ffffff"
      },
      buttonOptions: {
        symbolFill: "#666666",
        symbolStroke: "#666666",
        symbolStrokeWidth: 3,
        theme: {
          fill: "#ffffff",
          stroke: "none",
          padding: 5
        }
      }
    });
    h.exporting = {
      type: "image/png",
      url: "https://export.highcharts.com/",
      printMaxWidth: 780,
      scale: 2,
      buttons: {
        contextButton: {
          className: "highcharts-contextbutton",
          menuClassName: "highcharts-contextmenu",
          symbol: "menu",
          _titleKey: "contextButtonTitle",
          menuItems: [{
              textKey: "printChart",
              onclick: function() {
                this.print()
              }
            }, {
              separator: !0
            }, {
              textKey: "downloadPNG",
              onclick: function() {
                this.exportChart()
              }
            }, {
              textKey: "downloadJPEG",
              onclick: function() {
                this.exportChart({
                  type: "image/jpeg"
                })
              }
            },
            {
              textKey: "downloadPDF",
              onclick: function() {
                this.exportChart({
                  type: "application/pdf"
                })
              }
            }, {
              textKey: "downloadSVG",
              onclick: function() {
                this.exportChart({
                  type: "image/svg+xml"
                })
              }
            }
          ]
        }
      }
    };
    f.post = function(a, c, e) {
      var b;
      a = q("form", p({
        method: "post",
        action: a,
        enctype: "multipart/form-data"
      }, e), {
        display: "none"
      }, n.body);
      for (b in c) q("input", {
        type: "hidden",
        name: b,
        value: c[b]
      }, null, a);
      a.submit();
      B(a)
    };
    r(A.prototype, {
      sanitizeSVG: function(a, c) {
        if (c && c.exporting && c.exporting.allowHTML) {
          var e = a.match(/<\/svg>(.*?$)/);
          e && (e =
            '\x3cforeignObject x\x3d"0" y\x3d"0" width\x3d"' + c.chart.width + '" height\x3d"' + c.chart.height + '"\x3e\x3cbody xmlns\x3d"http://www.w3.org/1999/xhtml"\x3e' + e[1] + "\x3c/body\x3e\x3c/foreignObject\x3e", a = a.replace("\x3c/svg\x3e", e + "\x3c/svg\x3e"))
        }
        a = a.replace(/zIndex="[^"]+"/g, "").replace(/isShadow="[^"]+"/g, "").replace(/symbolName="[^"]+"/g, "").replace(/jQuery[0-9]+="[^"]+"/g, "").replace(/url\(("|&quot;)(\S+)("|&quot;)\)/g, "url($2)").replace(/url\([^#]+#/g, "url(#").replace(/<svg /, '\x3csvg xmlns:xlink\x3d"http://www.w3.org/1999/xlink" ').replace(/ (NS[0-9]+\:)?href=/g,
          " xlink:href\x3d").replace(/\n/, " ").replace(/<\/svg>.*?$/, "\x3c/svg\x3e").replace(/(fill|stroke)="rgba\(([ 0-9]+,[ 0-9]+,[ 0-9]+),([ 0-9\.]+)\)"/g, '$1\x3d"rgb($2)" $1-opacity\x3d"$3"').replace(/&nbsp;/g, "\u00a0").replace(/&shy;/g, "\u00ad");
        return a = a.replace(/<IMG /g, "\x3cimage ").replace(/<(\/?)TITLE>/g, "\x3c$1title\x3e").replace(/height=([^" ]+)/g, 'height\x3d"$1"').replace(/width=([^" ]+)/g, 'width\x3d"$1"').replace(/hc-svg-href="([^"]+)">/g, 'xlink:href\x3d"$1"/\x3e').replace(/ id=([^" >]+)/g, ' id\x3d"$1"').replace(/class=([^" >]+)/g,
          'class\x3d"$1"').replace(/ transform /g, " ").replace(/:(path|rect)/g, "$1").replace(/style="([^"]+)"/g, function(a) {
          return a.toLowerCase()
        })
      },
      getChartHTML: function() {
        return this.container.innerHTML
      },
      getSVG: function(a) {
        var c, e, b, w, m, g = p(this.options, a);
        n.createElementNS || (n.createElementNS = function(a, c) {
          return n.createElement(c)
        });
        e = q("div", null, {
          position: "absolute",
          top: "-9999em",
          width: this.chartWidth + "px",
          height: this.chartHeight + "px"
        }, n.body);
        b = this.renderTo.style.width;
        m = this.renderTo.style.height;
        b = g.exporting.sourceWidth || g.chart.width || /px$/.test(b) && parseInt(b, 10) || 600;
        m = g.exporting.sourceHeight || g.chart.height || /px$/.test(m) && parseInt(m, 10) || 400;
        r(g.chart, {
          animation: !1,
          renderTo: e,
          forExport: !0,
          renderer: "SVGRenderer",
          width: b,
          height: m
        });
        g.exporting.enabled = !1;
        delete g.data;
        g.series = [];
        k(this.series, function(a) {
          w = p(a.userOptions, {
            animation: !1,
            enableMouseTracking: !1,
            showCheckbox: !1,
            visible: a.visible
          });
          w.isInternal || g.series.push(w)
        });
        k(this.axes, function(a) {
          a.userOptions.internalKey = f.uniqueKey()
        });
        c = new f.Chart(g, this.callback);
        a && k(["xAxis", "yAxis", "series"], function(b) {
          var d = {};
          a[b] && (d[b] = a[b], c.update(d))
        });
        k(this.axes, function(a) {
          var b = f.find(c.axes, function(b) {
              return b.options.internalKey === a.userOptions.internalKey
            }),
            d = a.getExtremes(),
            e = d.userMin,
            d = d.userMax;
          !b || void 0 === e && void 0 === d || b.setExtremes(e, d, !0, !1)
        });
        b = c.getChartHTML();
        b = this.sanitizeSVG(b, g);
        g = null;
        c.destroy();
        B(e);
        return b
      },
      getSVGForExport: function(a, c) {
        var e = this.options.exporting;
        return this.getSVG(p({
            chart: {
              borderRadius: 0
            }
          },
          e.chartOptions, c, {
            exporting: {
              sourceWidth: a && a.sourceWidth || e.sourceWidth,
              sourceHeight: a && a.sourceHeight || e.sourceHeight
            }
          }))
      },
      exportChart: function(a, c) {
        c = this.getSVGForExport(a, c);
        a = p(this.options.exporting, a);
        f.post(a.url, {
          filename: a.filename || "chart",
          type: a.type,
          width: a.width || 0,
          scale: a.scale,
          svg: c
        }, a.formAttributes)
      },
      print: function() {
        var a = this,
          c = a.container,
          e = [],
          b = c.parentNode,
          f = n.body,
          m = f.childNodes,
          g = a.options.exporting.printMaxWidth,
          d, t;
        if (!a.isPrinting) {
          a.isPrinting = !0;
          a.pointer.reset(null,
            0);
          D(a, "beforePrint");
          if (t = g && a.chartWidth > g) d = [a.options.chart.width, void 0, !1], a.setSize(g, void 0, !1);
          k(m, function(a, b) {
            1 === a.nodeType && (e[b] = a.style.display, a.style.display = "none")
          });
          f.appendChild(c);
          E.focus();
          E.print();
          setTimeout(function() {
            b.appendChild(c);
            k(m, function(a, b) {
              1 === a.nodeType && (a.style.display = e[b])
            });
            a.isPrinting = !1;
            t && a.setSize.apply(a, d);
            D(a, "afterPrint")
          }, 1E3)
        }
      },
      contextMenu: function(a, c, e, b, f, m, g) {
        var d = this,
          t = d.options.navigation,
          w = d.chartWidth,
          h = d.chartHeight,
          p = "cache-" + a,
          l = d[p],
          x = Math.max(f, m),
          y, z;
        l || (d[p] = l = q("div", {
            className: a
          }, {
            position: "absolute",
            zIndex: 1E3,
            padding: x + "px"
          }, d.container), y = q("div", {
            className: "highcharts-menu"
          }, null, l), v(y, r({
            MozBoxShadow: "3px 3px 10px #888",
            WebkitBoxShadow: "3px 3px 10px #888",
            boxShadow: "3px 3px 10px #888"
          }, t.menuStyle)), z = function() {
            v(l, {
              display: "none"
            });
            g && g.setState(0);
            d.openMenu = !1
          }, u(l, "mouseleave", function() {
            l.hideTimer = setTimeout(z, 500)
          }), u(l, "mouseenter", function() {
            clearTimeout(l.hideTimer)
          }), p = u(n, "mouseup", function(b) {
            d.pointer.inClass(b.target,
              a) || z()
          }), u(d, "destroy", p), k(c, function(a) {
            if (a) {
              var b;
              a.separator ? b = q("hr", null, null, y) : (b = q("div", {
                className: "highcharts-menu-item",
                onclick: function(b) {
                  b && b.stopPropagation();
                  z();
                  a.onclick && a.onclick.apply(d, arguments)
                },
                innerHTML: a.text || d.options.lang[a.textKey]
              }, null, y), b.onmouseover = function() {
                v(this, t.menuItemHoverStyle)
              }, b.onmouseout = function() {
                v(this, t.menuItemStyle)
              }, v(b, r({
                cursor: "pointer"
              }, t.menuItemStyle)));
              d.exportDivElements.push(b)
            }
          }), d.exportDivElements.push(y, l), d.exportMenuWidth =
          l.offsetWidth, d.exportMenuHeight = l.offsetHeight);
        c = {
          display: "block"
        };
        e + d.exportMenuWidth > w ? c.right = w - e - f - x + "px" : c.left = e - x + "px";
        b + m + d.exportMenuHeight > h && "top" !== g.alignOptions.verticalAlign ? c.bottom = h - b - x + "px" : c.top = b + m - x + "px";
        v(l, c);
        d.openMenu = !0
      },
      addButton: function(a) {
        var c = this,
          e = c.renderer,
          b = p(c.options.navigation.buttonOptions, a),
          f = b.onclick,
          m = b.menuItems,
          g, d, h = b.symbolSize || 12;
        c.btnCount || (c.btnCount = 0);
        c.exportDivElements || (c.exportDivElements = [], c.exportSVGElements = []);
        if (!1 !== b.enabled) {
          var k =
            b.theme,
            n = k.states,
            q = n && n.hover,
            n = n && n.select,
            l;
          delete k.states;
          f ? l = function(a) {
            a.stopPropagation();
            f.call(c, a)
          } : m && (l = function() {
            c.contextMenu(d.menuClassName, m, d.translateX, d.translateY, d.width, d.height, d);
            d.setState(2)
          });
          b.text && b.symbol ? k.paddingLeft = C(k.paddingLeft, 25) : b.text || r(k, {
            width: b.width,
            height: b.height,
            padding: 0
          });
          d = e.button(b.text, 0, 0, l, k, q, n).addClass(a.className).attr({
            "stroke-linecap": "round",
            title: c.options.lang[b._titleKey],
            zIndex: 3
          });
          d.menuClassName = a.menuClassName || "highcharts-menu-" +
            c.btnCount++;
          b.symbol && (g = e.symbol(b.symbol, b.symbolX - h / 2, b.symbolY - h / 2, h, h).addClass("highcharts-button-symbol").attr({
            zIndex: 1
          }).add(d), g.attr({
            stroke: b.symbolStroke,
            fill: b.symbolFill,
            "stroke-width": b.symbolStrokeWidth || 1
          }));
          d.add().align(r(b, {
            width: d.width,
            x: C(b.x, c.buttonOffset)
          }), !0, "spacingBox");
          c.buttonOffset += (d.width + b.buttonSpacing) * ("right" === b.align ? -1 : 1);
          c.exportSVGElements.push(d, g)
        }
      },
      destroyExport: function(a) {
        var c = a ? a.target : this;
        a = c.exportSVGElements;
        var e = c.exportDivElements;
        a &&
          (k(a, function(a, e) {
            a && (a.onclick = a.ontouchstart = null, c.exportSVGElements[e] = a.destroy())
          }), a.length = 0);
        e && (k(e, function(a, e) {
          clearTimeout(a.hideTimer);
          F(a, "mouseleave");
          c.exportDivElements[e] = a.onmouseout = a.onmouseover = a.ontouchstart = a.onclick = null;
          B(a)
        }), e.length = 0)
      }
    });
    H.menu = function(a, c, e, b) {
      return ["M", a, c + 2.5, "L", a + e, c + 2.5, "M", a, c + b / 2 + .5, "L", a + e, c + b / 2 + .5, "M", a, c + b - 1.5, "L", a + e, c + b - 1.5]
    };
    A.prototype.renderExporting = function() {
      var a, c = this.options.exporting,
        e = c.buttons,
        b = this.isDirtyExporting || !this.exportSVGElements;
      this.buttonOffset = 0;
      this.isDirtyExporting && this.destroyExport();
      if (b && !1 !== c.enabled) {
        for (a in e) this.addButton(e[a]);
        this.isDirtyExporting = !1
      }
      u(this, "destroy", this.destroyExport)
    };
    A.prototype.callbacks.push(function(a) {
      a.renderExporting();
      u(a, "redraw", a.renderExporting);
      k(["exporting", "navigation"], function(c) {
        a[c] = {
          update: function(e, b) {
            a.isDirtyExporting = !0;
            p(!0, a.options[c], e);
            C(b, !0) && a.redraw()
          }
        }
      })
    })
  })(h)
});;
/*! RESOURCE: /scripts/highcharts/modules/offline-exporting.js */
(function(n) {
  "object" === typeof module && module.exports ? module.exports = n : n(Highcharts)
})(function(n) {
  (function(d) {
    function n(a, d) {
      var c = t.getElementsByTagName("head")[0],
        b = t.createElement("script");
      b.type = "text/javascript";
      b.src = a;
      b.onload = d;
      b.onerror = function() {
        console.error("Error loading script", a)
      };
      c.appendChild(b)
    }
    var C = d.merge,
      e = d.win,
      r = e.navigator,
      t = e.document,
      z = d.each,
      w = e.URL || e.webkitURL || e,
      B = /Edge\/|Trident\/|MSIE /.test(r.userAgent),
      D = /Edge\/\d+/.test(r.userAgent),
      E = B ? 150 : 0;
    d.CanVGRenderer = {};
    d.dataURLtoBlob = function(a) {
      if (e.atob && e.ArrayBuffer && e.Uint8Array && e.Blob && w.createObjectURL) {
        a = a.match(/data:([^;]*)(;base64)?,([0-9A-Za-z+/]+)/);
        for (var d = e.atob(a[3]), c = new e.ArrayBuffer(d.length), c = new e.Uint8Array(c), b = 0; b < c.length; ++b) c[b] = d.charCodeAt(b);
        a = new e.Blob([c], {
          type: a[1]
        });
        return w.createObjectURL(a)
      }
    };
    d.downloadURL = function(a, f) {
      var c = t.createElement("a"),
        b;
      if (r.msSaveOrOpenBlob) r.msSaveOrOpenBlob(a, f);
      else {
        if (2E6 < a.length && (a = d.dataURLtoBlob(a), !a)) throw "Data URL length limit reached";
        if (void 0 !== c.download) c.href = a, c.download = f, c.target = "_blank", t.body.appendChild(c), c.click(), t.body.removeChild(c);
        else try {
          if (b = e.open(a, "chart"), void 0 === b || null === b) throw "Failed to open window";
        } catch (u) {
          e.location.href = a
        }
      }
    };
    d.svgToDataUrl = function(a) {
      var d = -1 < r.userAgent.indexOf("WebKit") && 0 > r.userAgent.indexOf("Chrome");
      try {
        if (!d && 0 > r.userAgent.toLowerCase().indexOf("firefox")) return w.createObjectURL(new e.Blob([a], {
          type: "image/svg+xml;charset-utf-16"
        }))
      } catch (c) {}
      return "data:image/svg+xml;charset\x3dUTF-8," +
        encodeURIComponent(a)
    };
    d.imageToDataUrl = function(a, d, c, b, u, l, k, m, p) {
      var g = new e.Image,
        h, f = function() {
          setTimeout(function() {
            var e = t.createElement("canvas"),
              f = e.getContext && e.getContext("2d"),
              x;
            try {
              if (f) {
                e.height = g.height * b;
                e.width = g.width * b;
                f.drawImage(g, 0, 0, e.width, e.height);
                try {
                  x = e.toDataURL(d), u(x, d, c, b)
                } catch (F) {
                  h(a, d, c, b)
                }
              } else k(a, d, c, b)
            } finally {
              p && p(a, d, c, b)
            }
          }, E)
        },
        q = function() {
          m(a, d, c, b);
          p && p(a, d, c, b)
        };
      h = function() {
        g = new e.Image;
        h = l;
        g.crossOrigin = "Anonymous";
        g.onload = f;
        g.onerror = q;
        g.src = a
      };
      g.onload = f;
      g.onerror = q;
      g.src = a
    };
    d.downloadSVGLocal = function(a, f, c, b) {
      function u(b, a) {
        a = new e.jsPDF("l", "pt", [b.width.baseVal.value + 2 * a, b.height.baseVal.value + 2 * a]);
        e.svg2pdf(b, a, {
          removeInvalid: !0
        });
        return a.output("datauristring")
      }

      function l() {
        y.innerHTML = a;
        var e = y.getElementsByTagName("text"),
          g, f = y.getElementsByTagName("svg")[0].style;
        z(e, function(b) {
          z(["font-family", "font-size"], function(a) {
            !b.style[a] && f[a] && (b.style[a] = f[a])
          });
          b.style["font-family"] = b.style["font-family"] && b.style["font-family"].split(" ").splice(-1);
          g = b.getElementsByTagName("title");
          z(g, function(a) {
            b.removeChild(a)
          })
        });
        e = u(y.firstChild, 0);
        try {
          d.downloadURL(e, v), b && b()
        } catch (G) {
          c()
        }
      }
      var k, m, p = !0,
        g, h = f.libURL || d.getOptions().exporting.libURL,
        y = t.createElement("div"),
        q = f.type || "image/png",
        v = (f.filename || "chart") + "." + ("image/svg+xml" === q ? "svg" : q.split("/")[1]),
        A = f.scale || 1,
        h = "/" !== h.slice(-1) ? h + "/" : h;
      if ("image/svg+xml" === q) try {
        r.msSaveOrOpenBlob ? (m = new MSBlobBuilder, m.append(a), k = m.getBlob("image/svg+xml")) : k = d.svgToDataUrl(a), d.downloadURL(k, v),
          b && b()
      } catch (x) {
        c()
      } else "application/pdf" === q ? e.jsPDF && e.svg2pdf ? l() : (p = !0, n(h + "jspdf.js", function() {
        n(h + "svg2pdf.js", function() {
          l()
        })
      })) : (k = d.svgToDataUrl(a), g = function() {
        try {
          w.revokeObjectURL(k)
        } catch (x) {}
      }, d.imageToDataUrl(k, q, {}, A, function(a) {
        try {
          d.downloadURL(a, v), b && b()
        } catch (F) {
          c()
        }
      }, function() {
        var f = t.createElement("canvas"),
          u = f.getContext("2d"),
          l = a.match(/^<svg[^>]*width\s*=\s*\"?(\d+)\"?[^>]*>/)[1] * A,
          k = a.match(/^<svg[^>]*height\s*=\s*\"?(\d+)\"?[^>]*>/)[1] * A,
          m = function() {
            u.drawSvg(a, 0, 0,
              l, k);
            try {
              d.downloadURL(r.msSaveOrOpenBlob ? f.msToBlob() : f.toDataURL(q), v), b && b()
            } catch (H) {
              c()
            } finally {
              g()
            }
          };
        f.width = l;
        f.height = k;
        e.canvg ? m() : (p = !0, n(h + "rgbcolor.js", function() {
          n(h + "canvg.js", function() {
            m()
          })
        }))
      }, c, c, function() {
        p && g()
      }))
    };
    d.Chart.prototype.getSVGForLocalExport = function(a, e, c, b) {
      var f = this,
        l, k = 0,
        m, p, g, h, n, q = function(a, d, c) {
          ++k;
          c.imageElement.setAttributeNS("http://www.w3.org/1999/xlink", "href", a);
          k === l.length && b(f.sanitizeSVG(m.innerHTML, p))
        };
      d.wrap(d.Chart.prototype, "getChartHTML",
        function(b) {
          var a = b.apply(this, Array.prototype.slice.call(arguments, 1));
          p = this.options;
          m = this.container.cloneNode(!0);
          return a
        });
      f.getSVGForExport(a, e);
      l = m.getElementsByTagName("image");
      try {
        if (l.length)
          for (h = 0, n = l.length; h < n; ++h) g = l[h], d.imageToDataUrl(g.getAttributeNS("http://www.w3.org/1999/xlink", "href"), "image/png", {
            imageElement: g
          }, a.scale, q, c, c, c);
        else b(f.sanitizeSVG(m.innerHTML, p))
      } catch (v) {
        c()
      }
    };
    d.Chart.prototype.exportChartLocal = function(a, e) {
      var c = this,
        b = d.merge(c.options.exporting, a),
        f =
        function() {
          if (!1 === b.fallbackToExportServer)
            if (b.error) b.error(b);
            else throw "Fallback to export server disabled";
          else c.exportChart(b)
        };
      B && ("application/pdf" === b.type || c.container.getElementsByTagName("image").length && "image/svg+xml" !== b.type) || D && "image/svg+xml" !== b.type || "application/pdf" === b.type && c.container.getElementsByTagName("image").length ? f() : c.getSVGForLocalExport(b, e, f, function(a) {
        -1 < a.indexOf("\x3cforeignObject") && "image/svg+xml" !== b.type ? f() : d.downloadSVGLocal(a, b, f)
      })
    };
    C(!0, d.getOptions().exporting, {
      libURL: "https://code.highcharts.com/5.0.7/lib/",
      buttons: {
        contextButton: {
          menuItems: [{
            textKey: "printChart",
            onclick: function() {
              this.print()
            }
          }, {
            separator: !0
          }, {
            textKey: "downloadPNG",
            onclick: function() {
              this.exportChartLocal()
            }
          }, {
            textKey: "downloadJPEG",
            onclick: function() {
              this.exportChartLocal({
                type: "image/jpeg"
              })
            }
          }, {
            textKey: "downloadSVG",
            onclick: function() {
              this.exportChartLocal({
                type: "image/svg+xml"
              })
            }
          }, {
            textKey: "downloadPDF",
            onclick: function() {
              this.exportChartLocal({
                type: "application/pdf"
              })
            }
          }]
        }
      }
    })
  })(n)
});;
/*! RESOURCE: /scripts/highcharts/modules/export-csv.js */
(function(factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory;
  } else {
    factory(Highcharts);
  }
})(function(Highcharts) {
  'use strict';
  var each = Highcharts.each,
    pick = Highcharts.pick,
    seriesTypes = Highcharts.seriesTypes,
    downloadAttrSupported = document.createElement('a').download !== undefined;
  Highcharts.setOptions({
    lang: {
      downloadCSV: 'Download CSV',
      downloadXLS: 'Download XLS',
      viewData: 'View data table'
    }
  });
  Highcharts.Chart.prototype.getDataRows = function() {
    var options = (this.options.exporting || {}).csv || {},
      xAxis = this.xAxis[0],
      rows = {},
      rowArr = [],
      dataRows,
      names = [],
      i,
      x,
      xTitle,
      dateFormat = options.dateFormat || '%Y-%m-%d %H:%M:%S',
      columnHeaderFormatter = options.columnHeaderFormatter || function(item, key, keyLength) {
        if (item instanceof Highcharts.Axis) {
          return (item.options.title && item.options.title.text) ||
            (item.isDatetimeAxis ? 'DateTime' : 'Category');
        }
        return item.name + (keyLength > 1 ? ' (' + key + ')' : '');
      };
    i = 0;
    each(this.series, function(series) {
      var keys = series.options.keys,
        pointArrayMap = keys || series.pointArrayMap || ['y'],
        valueCount = pointArrayMap.length,
        requireSorting = series.requireSorting,
        categoryMap = {},
        j;
      each(pointArrayMap, function(prop) {
        categoryMap[prop] = (series[prop + 'Axis'] && series[prop + 'Axis'].categories) || [];
      });
      if (series.options.includeInCSVExport !== false && series.visible !== false) {
        j = 0;
        while (j < valueCount) {
          names.push(columnHeaderFormatter(series, pointArrayMap[j], pointArrayMap.length));
          j = j + 1;
        }
        each(series.points, function(point, pIdx) {
          var key = requireSorting ? point.x : pIdx,
            prop,
            val;
          j = 0;
          if (!rows[key]) {
            rows[key] = [];
          }
          rows[key].x = point.x;
          if (!series.xAxis || series.exportKey === 'name') {
            rows[key].name = point.name;
          }
          while (j < valueCount) {
            prop = pointArrayMap[j];
            val = point[prop];
            rows[key][i + j] = pick(categoryMap[prop][val], val);
            j = j + 1;
          }
        });
        i = i + j;
      }
    });
    for (x in rows) {
      if (rows.hasOwnProperty(x)) {
        rowArr.push(rows[x]);
      }
    }
    rowArr.sort(function(a, b) {
      return a.x - b.x;
    });
    xTitle = columnHeaderFormatter(xAxis);
    dataRows = [
      [xTitle].concat(names)
    ];
    each(rowArr, function(row) {
      var category = row.name;
      if (!category) {
        if (xAxis.isDatetimeAxis) {
          if (row.x instanceof Date) {
            row.x = row.x.getTime();
          }
          category = Highcharts.dateFormat(dateFormat, row.x);
        } else if (xAxis.categories) {
          category = pick(xAxis.names[row.x], xAxis.categories[row.x], row.x)
        } else {
          category = row.x;
        }
      }
      row.unshift(category);
      dataRows.push(row);
    });
    return dataRows;
  };
  Highcharts.Chart.prototype.getCSV = function(useLocalDecimalPoint) {
    var csv = '',
      rows = this.getDataRows(),
      options = (this.options.exporting || {}).csv || {},
      itemDelimiter = options.itemDelimiter || ',',
      lineDelimiter = options.lineDelimiter || '\n';
    each(rows, function(row, i) {
      var val = '',
        j = row.length,
        n = useLocalDecimalPoint ? (1.1).toLocaleString()[1] : '.';
      while (j--) {
        val = row[j];
        if (typeof val === "string") {
          val = '"' + val + '"';
        }
        if (typeof val === 'number') {
          if (n === ',') {
            val = val.toString().replace(".", ",");
          }
        }
        row[j] = val;
      }
      csv += row.join(itemDelimiter);
      if (i < rows.length - 1) {
        csv += lineDelimiter;
      }
    });
    return csv;
  };
  Highcharts.Chart.prototype.getTable = function(useLocalDecimalPoint) {
    var html = '<table>',
      rows = this.getDataRows();
    each(rows, function(row, i) {
      var tag = i ? 'td' : 'th',
        val,
        j,
        n = useLocalDecimalPoint ? (1.1).toLocaleString()[1] : '.';
      html += '<tr>';
      for (j = 0; j < row.length; j = j + 1) {
        val = row[j];
        if (typeof val === 'number') {
          val = val.toString();
          if (n === ',') {
            val = val.replace('.', n);
          }
          html += '<' + tag + ' class="number">' + val + '</' + tag + '>';
        } else {
          html += '<' + tag + '>' + (val === undefined ? '' : val) + '</' + tag + '>';
        }
      }
      html += '</tr>';
    });
    html += '</table>';
    return html;
  };

  function getContent(chart, href, extension, content, MIME) {
    var a,
      blobObject,
      name,
      options = (chart.options.exporting || {}).csv || {},
      url = options.url || 'http://www.highcharts.com/studies/csv-export/download.php';
    if (chart.options.exporting.filename) {
      name = chart.options.exporting.filename;
    } else if (chart.title) {
      name = chart.title.textStr.replace(/ /g, '-').toLowerCase();
    } else {
      name = 'chart';
    }
    if (window.Blob && window.navigator.msSaveOrOpenBlob) {
      blobObject = new Blob([content]);
      window.navigator.msSaveOrOpenBlob(blobObject, name + '.' + extension);
    } else if (downloadAttrSupported) {
      a = document.createElement('a');
      a.href = href;
      a.target = '_blank';
      a.download = name + '.' + extension;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      Highcharts.post(url, {
        data: content,
        type: MIME,
        extension: extension
      });
    }
  }
  Highcharts.Chart.prototype.downloadCSV = function() {
    var csv = this.getCSV(true);
    getContent(
      this,
      'data:text/csv,\uFEFF' + csv.replace(/\n/g, '%0A'),
      'csv',
      csv,
      'text/csv'
    );
  };
  Highcharts.Chart.prototype.downloadXLS = function() {
    var uri = 'data:application/vnd.ms-excel;base64,',
      template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
      '<x:Name>Ark1</x:Name>' +
      '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' +
      '<style>td{border:none;font-family: Calibri, sans-serif;} .number{mso-number-format:"0.00";}</style>' +
      '<meta name=ProgId content=Excel.Sheet>' +
      '<meta charset=UTF-8>' +
      '</head><body>' +
      this.getTable(true) +
      '</body></html>',
      base64 = function(s) {
        return window.btoa(unescape(encodeURIComponent(s)));
      };
    getContent(
      this,
      uri + base64(template),
      'xls',
      template,
      'application/vnd.ms-excel'
    );
  };
  Highcharts.Chart.prototype.viewData = function() {
    if (!this.insertedTable) {
      var div = document.createElement('div');
      div.className = 'highcharts-data-table';
      this.renderTo.parentNode.insertBefore(div, this.renderTo.nextSibling);
      div.innerHTML = this.getTable();
      this.insertedTable = true;
    }
  };
  if (Highcharts.getOptions().exporting) {
    Highcharts.getOptions().exporting.buttons.contextButton.menuItems.push({
      textKey: 'downloadCSV',
      onclick: function() {
        this.downloadCSV();
      }
    }, {
      textKey: 'downloadXLS',
      onclick: function() {
        this.downloadXLS();
      }
    }, {
      textKey: 'viewData',
      onclick: function() {
        this.viewData();
      }
    });
  }
  if (seriesTypes.map) {
    seriesTypes.map.prototype.exportKey = 'name';
  }
  if (seriesTypes.mapbubble) {
    seriesTypes.mapbubble.prototype.exportKey = 'name';
  }
});;
/*! RESOURCE: /scripts/highcharts/modules/accessibility.js */
(function(n) {
  "object" === typeof module && module.exports ? module.exports = n : n(Highcharts)
})(function(n) {
  (function(e) {
    function n(a) {
      return a.replace(/&/g, "\x26amp;").replace(/</g, "\x26lt;").replace(/>/g, "\x26gt;").replace(/"/g, "\x26quot;").replace(/'/g, "\x26#x27;").replace(/\//g, "\x26#x2F;")
    }

    function A(a) {
      for (var b = a.childNodes.length; b--;) a.appendChild(a.childNodes[b])
    }

    function k(a) {
      var b;
      a && a.onclick && (b = l.createEvent("Events"), b.initEvent("click", !0, !1), a.onclick(b))
    }
    var y = e.win,
      l = y.document,
      g = e.each,
      B = e.erase,
      u = e.addEvent,
      C = e.removeEvent,
      w = e.fireEvent,
      D = e.dateFormat,
      v = e.merge,
      r = {
        "default": ["series", "data point", "data points"],
        line: ["line", "data point", "data points"],
        spline: ["line", "data point", "data points"],
        area: ["line", "data point", "data points"],
        areaspline: ["line", "data point", "data points"],
        pie: ["pie", "slice", "slices"],
        column: ["column series", "column", "columns"],
        bar: ["bar series", "bar", "bars"],
        scatter: ["scatter series", "data point", "data points"],
        boxplot: ["boxplot series", "box", "boxes"],
        arearange: ["arearange series", "data point", "data points"],
        areasplinerange: ["areasplinerange series", "data point", "data points"],
        bubble: ["bubble series", "bubble", "bubbles"],
        columnrange: ["columnrange series", "column", "columns"],
        errorbar: ["errorbar series", "errorbar", "errorbars"],
        funnel: ["funnel", "data point", "data points"],
        pyramid: ["pyramid", "data point", "data points"],
        waterfall: ["waterfall series", "column", "columns"],
        map: ["map", "area", "areas"],
        mapline: ["line", "data point", "data points"],
        mappoint: ["point series",
          "data point", "data points"
        ],
        mapbubble: ["bubble series", "bubble", "bubbles"]
      },
      E = {
        boxplot: " Box plot charts are typically used to display groups of statistical data. Each data point in the chart can have up to 5 values: minimum, lower quartile, median, upper quartile and maximum. ",
        arearange: " Arearange charts are line charts displaying a range between a lower and higher value for each point. ",
        areasplinerange: " These charts are line charts displaying a range between a lower and higher value for each point. ",
        bubble: " Bubble charts are scatter charts where each data point also has a size value. ",
        columnrange: " Columnrange charts are column charts displaying a range between a lower and higher value for each point. ",
        errorbar: " Errorbar series are used to display the variability of the data. ",
        funnel: " Funnel charts are used to display reduction of data in stages. ",
        pyramid: " Pyramid charts consist of a single pyramid with item heights corresponding to each point value. ",
        waterfall: " A waterfall chart is a column chart where each column contributes towards a total end value. "
      },
      F = "name id category x value y".split(" "),
      z = "z open high q3 median q1 low close".split(" ");
    e.setOptions({
      accessibility: {
        enabled: !0,
        pointDescriptionThreshold: 30,
        keyboardNavigation: {
          enabled: !0
        }
      }
    });
    e.wrap(e.Series.prototype, "render", function(a) {
      a.apply(this, Array.prototype.slice.call(arguments, 1));
      this.chart.options.accessibility.enabled && this.setA11yDescription()
    });
    e.Series.prototype.setA11yDescription = function() {
      var a = this.chart.options.accessibility,
        b = this.points && this.points.length && this.points[0].graphic &&
        this.points[0].graphic.element,
        d = b && b.parentNode || this.graph && this.graph.element || this.group && this.group.element;
      d && (d.lastChild === b && A(d), this.points && (this.points.length < a.pointDescriptionThreshold || !1 === a.pointDescriptionThreshold) && g(this.points, function(c) {
          c.graphic && (c.graphic.element.setAttribute("role", "img"), c.graphic.element.setAttribute("tabindex", "-1"), c.graphic.element.setAttribute("aria-label", a.pointDescriptionFormatter && a.pointDescriptionFormatter(c) || c.buildPointInfoString()))
        }),
        1 < this.chart.series.length || a.describeSingleSeries) && (d.setAttribute("role", "region"), d.setAttribute("tabindex", "-1"), d.setAttribute("aria-label", a.seriesDescriptionFormatter && a.seriesDescriptionFormatter(this) || this.buildSeriesInfoString()))
    };
    e.Series.prototype.buildSeriesInfoString = function() {
      var a = r[this.type] || r.default,
        b = this.description || this.options.description;
      return (this.name ? this.name + ", " : "") + (1 === this.chart.types.length ? a[0] : "series") + " " + (this.index + 1) + " of " + this.chart.series.length +
        (1 === this.chart.types.length ? " with " : ". " + a[0] + " with ") + (this.points.length + " " + (1 === this.points.length ? a[1] : a[2])) + (b ? ". " + b : "") + (1 < this.chart.yAxis.length && this.yAxis ? ". Y axis, " + this.yAxis.getDescription() : "") + (1 < this.chart.xAxis.length && this.xAxis ? ". X axis, " + this.xAxis.getDescription() : "")
    };
    e.Point.prototype.buildPointInfoString = function() {
      var a = this,
        b = a.series,
        d = b.chart.options.accessibility,
        c = "",
        f = !1,
        x = b.xAxis && b.xAxis.isDatetimeAxis,
        b = x && D(d.pointDateFormatter && d.pointDateFormatter(a) ||
          d.pointDateFormat || e.Tooltip.prototype.getXDateFormat(a, b.chart.options.tooltip, b.xAxis), a.x);
      g(z, function(c) {
        void 0 !== a[c] && (f = !0)
      });
      f ? (x && (c = b), g(F.concat(z), function(b) {
        void 0 === a[b] || x && "x" === b || (c += (c ? ". " : "") + b + ", " + this[b])
      })) : c = (this.name || b || this.category || this.id || "x, " + this.x) + ", " + (void 0 !== this.value ? this.value : this.y);
      return this.index + 1 + ". " + c + "." + (this.description ? " " + this.description : "")
    };
    e.Axis.prototype.getDescription = function() {
      return this.userOptions && this.userOptions.description ||
        this.axisTitle && this.axisTitle.textStr || this.options.id || this.categories && "categories" || "values"
    };
    e.Axis.prototype.panStep = function(a, b) {
      var d = b || 3;
      b = this.getExtremes();
      var c = (b.max - b.min) / d * a,
        d = b.max + c,
        c = b.min + c,
        f = d - c;
      0 > a && c < b.dataMin ? (c = b.dataMin, d = c + f) : 0 < a && d > b.dataMax && (d = b.dataMax, c = d - f);
      this.setExtremes(c, d)
    };
    e.wrap(e.Series.prototype, "init", function(a) {
      a.apply(this, Array.prototype.slice.call(arguments, 1));
      var b = this.chart;
      b.options.accessibility.enabled && (b.types = b.types || [], 0 > b.types.indexOf(this.type) &&
        b.types.push(this.type), u(this, "remove", function() {
          var a = this,
            c = !1;
          g(b.series, function(f) {
            f !== a && 0 > b.types.indexOf(a.type) && (c = !0)
          });
          c || B(b.types, a.type)
        }))
    });
    e.Chart.prototype.getTypeDescription = function() {
      var a = this.types && this.types[0],
        b = this.series[0] && this.series[0].mapTitle;
      if (a) {
        if ("map" === a) return b ? "Map of " + b : "Map of unspecified region.";
        if (1 < this.types.length) return "Combination chart.";
        if (-1 < ["spline", "area", "areaspline"].indexOf(a)) return "Line chart."
      } else return "Empty chart.";
      return a +
        " chart." + (E[a] || "")
    };
    e.Chart.prototype.getAxesDescription = function() {
      var a = this.xAxis.length,
        b = this.yAxis.length,
        d = {},
        c;
      if (a)
        if (d.xAxis = "The chart has " + a + (1 < a ? " X axes" : " X axis") + " displaying ", 2 > a) d.xAxis += this.xAxis[0].getDescription() + ".";
        else {
          for (c = 0; c < a - 1; ++c) d.xAxis += (c ? ", " : "") + this.xAxis[c].getDescription();
          d.xAxis += " and " + this.xAxis[c].getDescription() + "."
        }
      if (b)
        if (d.yAxis = "The chart has " + b + (1 < b ? " Y axes" : " Y axis") + " displaying ", 2 > b) d.yAxis += this.yAxis[0].getDescription() + ".";
        else {
          for (c =
            0; c < b - 1; ++c) d.yAxis += (c ? ", " : "") + this.yAxis[c].getDescription();
          d.yAxis += " and " + this.yAxis[c].getDescription() + "."
        }
      return d
    };
    e.Chart.prototype.addAccessibleContextMenuAttribs = function() {
      var a = this.exportDivElements;
      a && (g(a, function(b) {
        "DIV" !== b.tagName || b.children && b.children.length || (b.setAttribute("role", "menuitem"), b.setAttribute("tabindex", -1))
      }), a[0].parentNode.setAttribute("role", "menu"), a[0].parentNode.setAttribute("aria-label", "Chart export"))
    };
    e.Point.prototype.highlight = function() {
      var a =
        this.series.chart;
      this.graphic && this.graphic.element.focus && this.graphic.element.focus();
      this.isNull ? a.tooltip.hide(0) : (this.onMouseOver(), a.tooltip.refresh(a.tooltip.shared ? [this] : this));
      a.highlightedPoint = this;
      return this
    };
    e.Chart.prototype.highlightAdjacentPoint = function(a) {
      var b = this.series,
        d = this.highlightedPoint,
        c = d && d.index || 0;
      if (!b[0] || !b[0].points) return !1;
      if (!d) return b[0].points[0].highlight();
      if (d.series.points[c] !== d)
        for (var f = 0; f < d.series.points.length; ++f)
          if (d.series.points[f] === d) {
            c =
              f;
            break
          }
      b = b[d.series.index + (a ? 1 : -1)];
      d = d.series.points[c + (a ? 1 : -1)] || b && b.points[a ? 0 : b.points.length - 1];
      return void 0 === d ? !1 : d.isNull && this.options.accessibility.keyboardNavigation && this.options.accessibility.keyboardNavigation.skipNullPoints ? (this.highlightedPoint = d, this.highlightAdjacentPoint(a)) : d.highlight()
    };
    e.Chart.prototype.showExportMenu = function() {
      this.exportSVGElements && this.exportSVGElements[0] && (this.exportSVGElements[0].element.onclick(), this.highlightExportItem(0))
    };
    e.Chart.prototype.highlightExportItem =
      function(a) {
        var b = this.exportDivElements && this.exportDivElements[a],
          d = this.exportDivElements && this.exportDivElements[this.highlightedExportItem];
        if (b && "DIV" === b.tagName && (!b.children || !b.children.length)) {
          b.focus && b.focus();
          if (d && d.onmouseout) d.onmouseout();
          if (b.onmouseover) b.onmouseover();
          this.highlightedExportItem = a;
          return !0
        }
      };
    e.Chart.prototype.highlightRangeSelectorButton = function(a) {
      var b = this.rangeSelector.buttons;
      b[this.highlightedRangeSelectorItemIx] && b[this.highlightedRangeSelectorItemIx].setState(this.oldRangeSelectorItemState ||
        0);
      this.highlightedRangeSelectorItemIx = a;
      return b[a] ? (b[a].element.focus && b[a].element.focus(), this.oldRangeSelectorItemState = b[a].state, b[a].setState(2), !0) : !1
    };
    e.Chart.prototype.highlightLegendItem = function(a) {
      var b = this.legend.allItems;
      b[this.highlightedLegendItemIx] && w(b[this.highlightedLegendItemIx].legendGroup.element, "mouseout");
      this.highlightedLegendItemIx = a;
      return b[a] ? (b[a].legendGroup.element.focus && b[a].legendGroup.element.focus(), w(b[a].legendGroup.element, "mouseover"), !0) : !1
    };
    e.Chart.prototype.hideExportMenu =
      function() {
        var a = this.exportDivElements;
        if (a) {
          g(a, function(b) {
            w(b, "mouseleave")
          });
          if (a[this.highlightedExportItem] && a[this.highlightedExportItem].onmouseout) a[this.highlightedExportItem].onmouseout();
          this.highlightedExportItem = 0;
          this.renderTo.focus()
        }
      };
    e.Chart.prototype.addKeyboardNavEvents = function() {
      function a(c) {
        this.keyCodeMap = c.keyCodeMap;
        this.move = c.move;
        this.validate = c.validate;
        this.init = c.init;
        this.transformTabs = !1 !== c.transformTabs
      }

      function b(b, d) {
        return new a(v({
          keyCodeMap: b,
          move: function(b) {
            c.keyboardNavigationModuleIndex +=
              b;
            var a = c.keyboardNavigationModules[c.keyboardNavigationModuleIndex];
            if (a) {
              if (a.validate && !a.validate()) return this.move(b);
              if (a.init) return a.init(b), !0
            }
            c.keyboardNavigationModuleIndex = 0;
            c.slipNextTab = !0;
            return !1
          }
        }, d))
      }

      function d(b) {
        b = b || y.event;
        var a = c.keyboardNavigationModules[c.keyboardNavigationModuleIndex];
        9 === (b.which || b.keyCode) && c.slipNextTab ? c.slipNextTab = !1 : (c.slipNextTab = !1, a && a.run(b) && b.preventDefault())
      }
      var c = this;
      a.prototype = {
        run: function(c) {
          var b = this,
            a = c.which || c.keyCode,
            f = !1,
            a =
            this.transformTabs && 9 === a ? c.shiftKey ? 37 : 39 : a;
          g(this.keyCodeMap, function(d) {
            -1 < d[0].indexOf(a) && (f = !1 === d[1].call(b, a, c) ? !1 : !0)
          });
          return f
        }
      };
      c.keyboardNavigationModules = [b([
        [
          [37, 39],
          function(b) {
            if (!c.highlightAdjacentPoint(39 === b)) return this.move(39 === b ? 1 : -1)
          }
        ],
        [
          [38, 40],
          function(b) {
            var a;
            if (c.highlightedPoint)
              if ((a = c.series[c.highlightedPoint.series.index + (38 === b ? -1 : 1)]) && a.points[0]) a.points[0].highlight();
              else return this.move(40 === b ? 1 : -1)
          }
        ],
        [
          [13, 32],
          function() {
            c.highlightedPoint && c.highlightedPoint.firePointEvent("click")
          }
        ]
      ], {
        init: function(b) {
          var a = c.series && c.series[c.series.length - 1],
            a = a && a.points && a.points[a.points.length - 1];
          0 > b && a && a.highlight()
        }
      }), b([
        [
          [37, 38],
          function() {
            for (var a = c.highlightedExportItem || 0, b = !0, d = c.series; a--;)
              if (c.highlightExportItem(a)) {
                b = !1;
                break
              }
            if (b) return c.hideExportMenu(), d && d.length && (a = d[d.length - 1], a.points.length && a.points[a.points.length - 1].highlight()), this.move(-1)
          }
        ],
        [
          [39, 40],
          function() {
            for (var a = !0, b = (c.highlightedExportItem || 0) + 1; b < c.exportDivElements.length; ++b)
              if (c.highlightExportItem(b)) {
                a = !1;
                break
              }
            if (a) return c.hideExportMenu(), this.move(1)
          }
        ],
        [
          [13, 32],
          function() {
            k(c.exportDivElements[c.highlightedExportItem])
          }
        ]
      ], {
        validate: function() {
          return c.exportChart && !(c.options.exporting && !1 === c.options.exporting.enabled)
        },
        init: function(a) {
          c.highlightedPoint = null;
          c.showExportMenu();
          if (0 > a && c.exportDivElements)
            for (a = c.exportDivElements.length; - 1 < a && !c.highlightExportItem(a); --a);
        }
      }), b([
        [
          [38, 40, 37, 39],
          function(a) {
            c[38 === a || 40 === a ? "yAxis" : "xAxis"][0].panStep(39 > a ? -1 : 1)
          }
        ],
        [
          [9],
          function(a, b) {
            c.mapNavButtons[c.focusedMapNavButtonIx].setState(0);
            if (b.shiftKey && !c.focusedMapNavButtonIx || !b.shiftKey && c.focusedMapNavButtonIx) return c.mapZoom(), this.move(b.shiftKey ? -1 : 1);
            c.focusedMapNavButtonIx += b.shiftKey ? -1 : 1;
            a = c.mapNavButtons[c.focusedMapNavButtonIx];
            a.element.focus && a.element.focus();
            a.setState(2)
          }
        ],
        [
          [13, 32],
          function() {
            k(c.mapNavButtons[c.focusedMapNavButtonIx].element)
          }
        ]
      ], {
        validate: function() {
          return c.mapZoom && c.mapNavButtons && 2 === c.mapNavButtons.length
        },
        transformTabs: !1,
        init: function(a) {
          var b = c.mapNavButtons[0],
            d = c.mapNavButtons[1],
            b = 0 <
            a ? b : d;
          g(c.mapNavButtons, function(a, c) {
            a.element.setAttribute("tabindex", -1);
            a.element.setAttribute("role", "button");
            a.element.setAttribute("aria-label", "Zoom " + (c ? "out" : "") + "chart")
          });
          b.element.focus && b.element.focus();
          b.setState(2);
          c.focusedMapNavButtonIx = 0 < a ? 0 : 1
        }
      }), b([
        [
          [37, 39, 38, 40],
          function(a) {
            a = 37 === a || 38 === a ? -1 : 1;
            if (!c.highlightRangeSelectorButton(c.highlightedRangeSelectorItemIx + a)) return this.move(a)
          }
        ],
        [
          [13, 32],
          function() {
            3 !== c.oldRangeSelectorItemState && k(c.rangeSelector.buttons[c.highlightedRangeSelectorItemIx].element)
          }
        ]
      ], {
        validate: function() {
          return c.rangeSelector && c.rangeSelector.buttons && c.rangeSelector.buttons.length
        },
        init: function(a) {
          g(c.rangeSelector.buttons, function(a) {
            a.element.setAttribute("tabindex", "-1");
            a.element.setAttribute("role", "button");
            a.element.setAttribute("aria-label", "Select range " + (a.text && a.text.textStr))
          });
          c.highlightRangeSelectorButton(0 < a ? 0 : c.rangeSelector.buttons.length - 1)
        }
      }), b([
        [
          [9, 38, 40],
          function(a, b) {
            a = 9 === a && b.shiftKey || 38 === a ? -1 : 1;
            b = c.highlightedInputRangeIx += a;
            if (1 < b || 0 > b) return this.move(a);
            c.rangeSelector[b ? "maxInput" : "minInput"].focus()
          }
        ]
      ], {
        validate: function() {
          return c.rangeSelector && c.rangeSelector.inputGroup && "hidden" !== c.rangeSelector.inputGroup.element.getAttribute("visibility") && !1 !== c.options.rangeSelector.inputEnabled && c.rangeSelector.minInput && c.rangeSelector.maxInput
        },
        transformTabs: !1,
        init: function(a) {
          c.highlightedInputRangeIx = 0 < a ? 0 : 1;
          c.rangeSelector[c.highlightedInputRangeIx ? "maxInput" : "minInput"].focus()
        }
      }), b([
        [
          [37, 39, 38, 40],
          function(a) {
            a = 37 === a || 38 === a ? -1 : 1;
            if (!c.highlightLegendItem(c.highlightedLegendItemIx +
                a)) return this.move(a)
          }
        ],
        [
          [13, 32],
          function() {
            k(c.legend.allItems[c.highlightedLegendItemIx].legendItem.element.parentNode)
          }
        ]
      ], {
        validate: function() {
          return c.legend && c.legend.allItems && !c.colorAxis
        },
        init: function(a) {
          g(c.legend.allItems, function(a) {
            a.legendGroup.element.setAttribute("tabindex", "-1");
            a.legendGroup.element.setAttribute("role", "button");
            a.legendGroup.element.setAttribute("aria-label", "Toggle visibility of series " + a.name)
          });
          c.highlightLegendItem(0 < a ? 0 : c.legend.allItems.length - 1)
        }
      })];
      c.keyboardNavigationModuleIndex =
        0;
      c.renderTo.tabIndex || c.renderTo.setAttribute("tabindex", "0");
      u(c.renderTo, "keydown", d);
      u(c, "destroy", function() {
        C(c.renderTo, "keydown", d)
      })
    };
    e.Chart.prototype.addScreenReaderRegion = function(a) {
      var b = this,
        d = b.series,
        c = b.options,
        e = c.accessibility,
        g = b.screenReaderRegion = l.createElement("div"),
        k = l.createElement("h3"),
        p = l.createElement("a"),
        q = l.createElement("h3"),
        t = {
          position: "absolute",
          left: "-9999px",
          top: "auto",
          width: "1px",
          height: "1px",
          overflow: "hidden"
        },
        h = b.types || [],
        h = (1 === h.length && "pie" === h[0] ||
          "map" === h[0]) && {} || b.getAxesDescription(),
        m = d[0] && r[d[0].type] || r.default;
      g.setAttribute("role", "region");
      g.setAttribute("aria-label", "Chart screen reader information.");
      g.innerHTML = e.screenReaderSectionFormatter && e.screenReaderSectionFormatter(b) || '\x3cdiv tabindex\x3d"0"\x3eUse regions/landmarks to skip ahead to chart' + (1 < d.length ? " and navigate between data series" : "") + ".\x3c/div\x3e\x3ch3\x3eSummary.\x3c/h3\x3e\x3cdiv\x3e" + (c.title.text ? n(c.title.text) : "Chart") + (c.subtitle && c.subtitle.text ? ". " +
        n(c.subtitle.text) : "") + "\x3c/div\x3e\x3ch3\x3eLong description.\x3c/h3\x3e\x3cdiv\x3e" + (c.chart.description || "No description available.") + "\x3c/div\x3e\x3ch3\x3eStructure.\x3c/h3\x3e\x3cdiv\x3eChart type: " + (c.chart.typeDescription || b.getTypeDescription()) + "\x3c/div\x3e" + (1 === d.length ? "\x3cdiv\x3e" + m[0] + " with " + d[0].points.length + " " + (1 === d[0].points.length ? m[1] : m[2]) + ".\x3c/div\x3e" : "") + (h.xAxis ? "\x3cdiv\x3e" + h.xAxis + "\x3c/div\x3e" : "") + (h.yAxis ? "\x3cdiv\x3e" + h.yAxis + "\x3c/div\x3e" : "");
      b.getCSV &&
        (p.innerHTML = "View as data table.", p.href = "#" + a, p.setAttribute("tabindex", "-1"), p.onclick = e.onTableAnchorClick || function() {
          b.viewData();
          l.getElementById(a).focus()
        }, k.appendChild(p), g.appendChild(k));
      q.innerHTML = "Chart graphic.";
      b.renderTo.insertBefore(q, b.renderTo.firstChild);
      b.renderTo.insertBefore(g, b.renderTo.firstChild);
      v(!0, q.style, t);
      v(!0, g.style, t)
    };
    e.Chart.prototype.callbacks.push(function(a) {
      var b = a.options,
        d = b.accessibility;
      if (d.enabled) {
        var c = l.createElementNS("http://www.w3.org/2000/svg",
            "title"),
          f = l.createElementNS("http://www.w3.org/2000/svg", "g"),
          k = a.container.getElementsByTagName("desc")[0],
          r = a.container.getElementsByTagName("text"),
          p = "highcharts-title-" + a.index,
          q = "highcharts-data-table-" + a.index,
          t = b.title.text || "Chart",
          h = b.exporting && b.exporting.csv && b.exporting.csv.columnHeaderFormatter,
          m = [];
        c.textContent = n(t);
        c.id = p;
        k.parentNode.insertBefore(c, k);
        a.renderTo.setAttribute("role", "region");
        a.renderTo.setAttribute("aria-label", t + ". Use up and down arrows to navigate.");
        if (a.exportSVGElements &&
          a.exportSVGElements[0] && a.exportSVGElements[0].element) {
          var u = a.exportSVGElements[0].element.onclick,
            c = a.exportSVGElements[0].element.parentNode;
          a.exportSVGElements[0].element.onclick = function() {
            u.apply(this, Array.prototype.slice.call(arguments));
            a.addAccessibleContextMenuAttribs();
            a.highlightExportItem(0)
          };
          a.exportSVGElements[0].element.setAttribute("role", "button");
          a.exportSVGElements[0].element.setAttribute("aria-label", "View export menu");
          f.appendChild(a.exportSVGElements[0].element);
          f.setAttribute("role",
            "region");
          f.setAttribute("aria-label", "Chart export menu");
          c.appendChild(f)
        }
        a.rangeSelector && g(["minInput", "maxInput"], function(b, c) {
          a.rangeSelector[b] && (a.rangeSelector[b].setAttribute("tabindex", "-1"), a.rangeSelector[b].setAttribute("role", "textbox"), a.rangeSelector[b].setAttribute("aria-label", "Select " + (c ? "end" : "start") + " date."))
        });
        g(r, function(a) {
          a.setAttribute("aria-hidden", "true")
        });
        a.addScreenReaderRegion(q);
        d.keyboardNavigation && a.addKeyboardNavEvents();
        v(!0, b.exporting, {
          csv: {
            columnHeaderFormatter: function(a,
              b, c) {
              var d = m[m.length - 1];
              1 < c && (d && d.text) !== a.name && m.push({
                text: a.name,
                span: c
              });
              return h ? h.call(this, a, b, c) : 1 < c ? b : a.name
            }
          }
        });
        e.wrap(a, "getTable", function(a) {
          return a.apply(this, Array.prototype.slice.call(arguments, 1)).replace("\x3ctable\x3e", '\x3ctable id\x3d"' + q + '" summary\x3d"Table representation of chart"\x3e\x3ccaption\x3e' + t + "\x3c/caption\x3e")
        });
        e.wrap(a, "viewData", function(a) {
          if (!this.insertedTable) {
            a.apply(this, Array.prototype.slice.call(arguments, 1));
            var b = l.getElementById(q),
              c = b.getElementsByTagName("tbody")[0],
              d = c.firstChild.children,
              e = "\x3ctr\x3e\x3ctd\x3e\x3c/td\x3e",
              f, h;
            b.setAttribute("tabindex", "-1");
            g(c.children, function(a) {
              f = a.firstChild;
              h = l.createElement("th");
              h.setAttribute("scope", "row");
              h.innerHTML = f.innerHTML;
              f.parentNode.replaceChild(h, f)
            });
            g(d, function(a) {
              "TH" === a.tagName && a.setAttribute("scope", "col")
            });
            m.length && (g(m, function(a) {
              e += '\x3cth scope\x3d"col" colspan\x3d"' + a.span + '"\x3e' + a.text + "\x3c/th\x3e"
            }), c.insertAdjacentHTML("afterbegin", e))
          }
        })
      }
    })
  })(n)
});;
/*! RESOURCE: /scripts/highcharts/modules/pattern-fill-v2.js */
(function(factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory;
  } else {
    factory(Highcharts);
  }
}(function(Highcharts) {
  'use strict';
  var idCounter = 0,
    wrap = Highcharts.wrap,
    each = Highcharts.each;
  Highcharts.SVGRenderer.prototype.addPattern = function(id, options) {
    var pattern,
      path,
      w = options.width || 10,
      h = options.height || 10,
      ren = this;

    function rect(fill) {
      ren.rect(0, 0, w, h)
        .attr({
          fill: fill
        })
        .add(pattern);
    }
    if (!id) {
      id = 'highcharts-pattern-' + idCounter;
      idCounter += 1;
    }
    pattern = this.createElement('pattern').attr({
      id: id,
      patternUnits: 'userSpaceOnUse',
      width: options.width || 10,
      height: options.height || 10
    }).add(this.defs);
    pattern.id = pattern.element.id;
    if (options.path) {
      path = options.path;
      if (path.fill) {
        rect(path.fill);
      }
      this.createElement('path').attr({
        'd': path.d || path,
        'stroke': path.stroke || options.color || '#343434',
        'stroke-width': path.strokeWidth || 2
      }).add(pattern);
      pattern.color = options.color;
    } else if (options.image) {
      this.image(options.image, 0, 0, options.width, options.height).add(pattern);
    } else if (options.color) {
      rect(options.color);
    }
    if (options.opacity !== undefined) {
      each(pattern.element.children, function(child) {
        child.setAttribute('opacity', options.opacity);
      });
    }
    return pattern;
  };
  if (Highcharts.VMLElement) {
    Highcharts.VMLRenderer.prototype.addPattern = function(id, options) {
      var patterns;
      if (!id) {
        id = 'highcharts-pattern-' + idCounter;
        idCounter += 1;
      }
      patterns = this.patterns || {};
      patterns[id] = options;
      this.patterns = patterns;
    };
    Highcharts.wrap(Highcharts.VMLRenderer.prototype.Element.prototype, 'fillSetter', function(proceed, color, prop, elem) {
      if (typeof color === 'string' && color.substring(0, 5) === 'url(#') {
        var id = color.substring(5, color.length - 1),
          pattern = this.renderer.patterns[id],
          markup;
        if (pattern.image) {
          if (elem.getElementsByTagName('fill').length) {
            elem.removeChild(elem.getElementsByTagName('fill')[0]);
          }
          markup = this.renderer.prepVML(['<', prop, ' type="tile" src="', pattern.image, '" />']);
          elem.appendChild(document.createElement(markup));
          if (elem.parentNode.nodeType === 1) {
            elem.outerHTML = elem.outerHTML;
          }
        } else if (pattern.color) {
          proceed.call(this, pattern.color, prop, elem);
        } else {
          proceed.call(this, '#A0A0A0', prop, elem);
        }
      } else {
        proceed.call(this, color, prop, elem);
      }
    });
  }

  function addPredefinedPatterns(renderer) {
    var colors = Highcharts.getOptions().colors;
    each([
      'M 0 0 L 10 10 M 9 -1 L 11 1 M -1 9 L 1 11',
      'M 0 10 L 10 0 M -1 1 L 1 -1 M 9 11 L 11 9',
      'M 3 0 L 3 10 M 8 0 L 8 10',
      'M 0 3 L 10 3 M 0 8 L 10 8',
      'M 0 3 L 5 3 L 5 0 M 5 10 L 5 7 L 10 7',
      'M 3 3 L 8 3 L 8 8 L 3 8 Z',
      'M 5 5 m -4 0 a 4 4 0 1 1 8 0 a 4 4 0 1 1 -8 0',
      'M 10 3 L 5 3 L 5 0 M 5 10 L 5 7 L 0 7',
      'M 2 5 L 5 2 L 8 5 L 5 8 Z',
      'M 0 0 L 5 10 L 10 0'
    ], function(pattern, i) {
      renderer.addPattern('highcharts-default-pattern-' + i, {
        path: pattern,
        color: colors[i]
      });
    });
  }
  wrap(Highcharts.Chart.prototype, 'getContainer', function(proceed) {
    proceed.apply(this);
    var chart = this,
      renderer = chart.renderer,
      options = chart.options,
      patterns = options.defs && options.defs.patterns;
    addPredefinedPatterns(renderer);
    if (patterns) {
      each(patterns, function(pattern) {
        renderer.addPattern(pattern.id, pattern);
      });
    }
  });
}));;
/*! RESOURCE: /scripts/highcharts/modules/funnel.js */
(function(c) {
  "object" === typeof module && module.exports ? module.exports = c : c(Highcharts)
})(function(c) {
  (function(c) {
    var n = c.seriesType,
      z = c.seriesTypes,
      F = c.noop,
      G = c.each;
    n("funnel", "pie", {
      animation: !1,
      center: ["50%", "50%"],
      width: "90%",
      neckWidth: "30%",
      height: "100%",
      neckHeight: "25%",
      reversed: !1,
      size: !0,
      dataLabels: {
        connectorWidth: 1
      },
      states: {
        select: {
          color: "#cccccc",
          borderColor: "#000000",
          shadow: !1
        }
      }
    }, {
      animate: F,
      translate: function() {
        var b = function(a, b) {
            return /%$/.test(a) ? b * parseInt(a, 10) / 100 : parseInt(a, 10)
          },
          c = 0,
          e = this.chart,
          d = this.options,
          r = d.reversed,
          H = d.ignoreHiddenPoint,
          t = e.plotWidth,
          e = e.plotHeight,
          p = 0,
          n = d.center,
          f = b(n[0], t),
          q = b(n[1], e),
          z = b(d.width, t),
          h, v, k = b(d.height, e),
          w = b(d.neckWidth, t),
          D = b(d.neckHeight, e),
          x = q - k / 2 + k - D,
          b = this.data,
          A, B, I = "left" === d.dataLabels.position ? 1 : 0,
          C, l, E, u, g, y, m;
        this.getWidthAt = v = function(a) {
          var b = q - k / 2;
          return a > x || k === D ? w : w + (z - w) * (1 - (a - b) / (k - D))
        };
        this.getX = function(a, b) {
          return f + (b ? -1 : 1) * (v(r ? 2 * q - a : a) / 2 + d.dataLabels.distance)
        };
        this.center = [f, q, k];
        this.centerX = f;
        G(b, function(a) {
          H &&
            !1 === a.visible || (c += a.y)
        });
        G(b, function(a) {
          m = null;
          B = c ? a.y / c : 0;
          l = q - k / 2 + p * k;
          g = l + B * k;
          h = v(l);
          C = f - h / 2;
          E = C + h;
          h = v(g);
          u = f - h / 2;
          y = u + h;
          l > x ? (C = u = f - w / 2, E = y = f + w / 2) : g > x && (m = g, h = v(x), u = f - h / 2, y = u + h, g = x);
          r && (l = 2 * q - l, g = 2 * q - g, m = m ? 2 * q - m : null);
          A = ["M", C, l, "L", E, l, y, g];
          m && A.push(y, m, u, m);
          A.push(u, g, "Z");
          a.shapeType = "path";
          a.shapeArgs = {
            d: A
          };
          a.percentage = 100 * B;
          a.plotX = f;
          a.plotY = (l + (m || g)) / 2;
          a.tooltipPos = [f, a.plotY];
          a.slice = F;
          a.half = I;
          H && !1 === a.visible || (p += B)
        })
      },
      drawPoints: z.column.prototype.drawPoints,
      sortByAngle: function(b) {
        b.sort(function(b,
          c) {
          return b.plotY - c.plotY
        })
      },
      drawDataLabels: function() {
        var b = this.data,
          c = this.options.dataLabels.distance,
          e, d, r, n = b.length,
          t, p;
        for (this.center[2] -= 2 * c; n--;) r = b[n], d = (e = r.half) ? 1 : -1, p = r.plotY, t = this.getX(p, e), r.labelPos = [0, p, t + (c - 5) * d, p, t + c * d, p, e ? "right" : "left", 0];
        z.pie.prototype.drawDataLabels.call(this)
      }
    });
    n("pyramid", "funnel", {
      neckWidth: "0%",
      neckHeight: "0%",
      reversed: !0
    })
  })(c)
});;
/*! RESOURCE: /scripts/highcharts/modules/heatmap.js */
(function(n) {
  "object" === typeof module && module.exports ? module.exports = n : n(Highcharts)
})(function(n) {
  (function(c) {
    var k = c.Axis,
      r = c.Chart,
      m = c.color,
      l, e = c.each,
      v = c.extend,
      w = c.isNumber,
      p = c.Legend,
      f = c.LegendSymbolMixin,
      x = c.noop,
      q = c.merge,
      u = c.pick,
      t = c.wrap;
    l = c.ColorAxis = function() {
      this.init.apply(this, arguments)
    };
    v(l.prototype, k.prototype);
    v(l.prototype, {
      defaultColorAxisOptions: {
        lineWidth: 0,
        minPadding: 0,
        maxPadding: 0,
        gridLineWidth: 1,
        tickPixelInterval: 72,
        startOnTick: !0,
        endOnTick: !0,
        offset: 0,
        marker: {
          animation: {
            duration: 50
          },
          width: .01,
          color: "#999999"
        },
        labels: {
          overflow: "justify",
          rotation: 0
        },
        minColor: "#e6ebf5",
        maxColor: "#003399",
        tickLength: 5,
        showInLegend: !0
      },
      keepProps: ["legendGroup", "legendItem", "legendSymbol"].concat(k.prototype.keepProps),
      init: function(a, b) {
        var d = "vertical" !== a.options.legend.layout,
          g;
        this.coll = "colorAxis";
        g = q(this.defaultColorAxisOptions, {
          side: d ? 2 : 1,
          reversed: !d
        }, b, {
          opposite: !d,
          showEmpty: !1,
          title: null
        });
        k.prototype.init.call(this, a, g);
        b.dataClasses && this.initDataClasses(b);
        this.initStops(b);
        this.horiz =
          d;
        this.zoomEnabled = !1;
        this.defaultLegendLength = 200
      },
      tweenColors: function(a, b, d) {
        var g;
        b.rgba.length && a.rgba.length ? (a = a.rgba, b = b.rgba, g = 1 !== b[3] || 1 !== a[3], a = (g ? "rgba(" : "rgb(") + Math.round(b[0] + (a[0] - b[0]) * (1 - d)) + "," + Math.round(b[1] + (a[1] - b[1]) * (1 - d)) + "," + Math.round(b[2] + (a[2] - b[2]) * (1 - d)) + (g ? "," + (b[3] + (a[3] - b[3]) * (1 - d)) : "") + ")") : a = b.input || "none";
        return a
      },
      initDataClasses: function(a) {
        var b = this,
          d = this.chart,
          g, h = 0,
          c = d.options.chart.colorCount,
          y = this.options,
          f = a.dataClasses.length;
        this.dataClasses = g = [];
        this.legendItems = [];
        e(a.dataClasses, function(a, e) {
          a = q(a);
          g.push(a);
          a.color || ("category" === y.dataClassColor ? (e = d.options.colors, c = e.length, a.color = e[h], a.colorIndex = h, h++, h === c && (h = 0)) : a.color = b.tweenColors(m(y.minColor), m(y.maxColor), 2 > f ? .5 : e / (f - 1)))
        })
      },
      initStops: function(a) {
        this.stops = a.stops || [
          [0, this.options.minColor],
          [1, this.options.maxColor]
        ];
        e(this.stops, function(a) {
          a.color = m(a[1])
        })
      },
      setOptions: function(a) {
        k.prototype.setOptions.call(this, a);
        this.options.crosshair = this.options.marker
      },
      setAxisSize: function() {
        var a =
          this.legendSymbol,
          b = this.chart,
          d = b.options.legend || {},
          g, h;
        a ? (this.left = d = a.attr("x"), this.top = g = a.attr("y"), this.width = h = a.attr("width"), this.height = a = a.attr("height"), this.right = b.chartWidth - d - h, this.bottom = b.chartHeight - g - a, this.len = this.horiz ? h : a, this.pos = this.horiz ? d : g) : this.len = (this.horiz ? d.symbolWidth : d.symbolHeight) || this.defaultLegendLength
      },
      toColor: function(a, b) {
        var d = this.stops,
          g, h, c = this.dataClasses,
          e, f;
        if (c)
          for (f = c.length; f--;) {
            if (e = c[f], g = e.from, d = e.to, (void 0 === g || a >= g) && (void 0 ===
                d || a <= d)) {
              h = e.color;
              b && (b.dataClass = f, b.colorIndex = e.colorIndex);
              break
            }
          } else {
            this.isLog && (a = this.val2lin(a));
            a = 1 - (this.max - a) / (this.max - this.min || 1);
            for (f = d.length; f-- && !(a > d[f][0]););
            g = d[f] || d[f + 1];
            d = d[f + 1] || g;
            a = 1 - (d[0] - a) / (d[0] - g[0] || 1);
            h = this.tweenColors(g.color, d.color, a)
          }
        return h
      },
      getOffset: function() {
        var a = this.legendGroup,
          b = this.chart.axisOffset[this.side];
        a && (this.axisParent = a, k.prototype.getOffset.call(this), this.added || (this.added = !0, this.labelLeft = 0, this.labelRight = this.width), this.chart.axisOffset[this.side] =
          b)
      },
      setLegendColor: function() {
        var a, b = this.options,
          d = this.reversed;
        a = d ? 1 : 0;
        d = d ? 0 : 1;
        a = this.horiz ? [a, 0, d, 0] : [0, d, 0, a];
        this.legendColor = {
          linearGradient: {
            x1: a[0],
            y1: a[1],
            x2: a[2],
            y2: a[3]
          },
          stops: b.stops || [
            [0, b.minColor],
            [1, b.maxColor]
          ]
        }
      },
      drawLegendSymbol: function(a, b) {
        var d = a.padding,
          g = a.options,
          h = this.horiz,
          c = u(g.symbolWidth, h ? this.defaultLegendLength : 12),
          f = u(g.symbolHeight, h ? 12 : this.defaultLegendLength),
          e = u(g.labelPadding, h ? 16 : 30),
          g = u(g.itemDistance, 10);
        this.setLegendColor();
        b.legendSymbol = this.chart.renderer.rect(0,
          a.baseline - 11, c, f).attr({
          zIndex: 1
        }).add(b.legendGroup);
        this.legendItemWidth = c + d + (h ? g : e);
        this.legendItemHeight = f + d + (h ? e : 0)
      },
      setState: x,
      visible: !0,
      setVisible: x,
      getSeriesExtremes: function() {
        var a = this.series,
          b = a.length;
        this.dataMin = Infinity;
        for (this.dataMax = -Infinity; b--;) void 0 !== a[b].valueMin && (this.dataMin = Math.min(this.dataMin, a[b].valueMin), this.dataMax = Math.max(this.dataMax, a[b].valueMax))
      },
      drawCrosshair: function(a, b) {
        var d = b && b.plotX,
          c = b && b.plotY,
          h, f = this.pos,
          e = this.len;
        b && (h = this.toPixels(b[b.series.colorKey]),
          h < f ? h = f - 2 : h > f + e && (h = f + e + 2), b.plotX = h, b.plotY = this.len - h, k.prototype.drawCrosshair.call(this, a, b), b.plotX = d, b.plotY = c, this.cross && (this.cross.addClass("highcharts-coloraxis-marker").add(this.legendGroup), this.cross.attr({
            fill: this.crosshair.color
          })))
      },
      getPlotLinePath: function(a, b, d, c, h) {
        return w(h) ? this.horiz ? ["M", h - 4, this.top - 6, "L", h + 4, this.top - 6, h, this.top, "Z"] : ["M", this.left, h, "L", this.left - 6, h + 6, this.left - 6, h - 6, "Z"] : k.prototype.getPlotLinePath.call(this, a, b, d, c)
      },
      update: function(a, b) {
        var d = this.chart,
          c = d.legend;
        e(this.series, function(a) {
          a.isDirtyData = !0
        });
        a.dataClasses && c.allItems && (e(c.allItems, function(a) {
          a.isDataClass && a.legendGroup.destroy()
        }), d.isDirtyLegend = !0);
        d.options[this.coll] = q(this.userOptions, a);
        k.prototype.update.call(this, a, b);
        this.legendItem && (this.setLegendColor(), c.colorizeItem(this, !0))
      },
      getDataClassLegendSymbols: function() {
        var a = this,
          b = this.chart,
          d = this.legendItems,
          g = b.options.legend,
          h = g.valueDecimals,
          t = g.valueSuffix || "",
          k;
        d.length || e(this.dataClasses, function(g, p) {
          var l = !0,
            q = g.from,
            m = g.to;
          k = "";
          void 0 === q ? k = "\x3c " : void 0 === m && (k = "\x3e ");
          void 0 !== q && (k += c.numberFormat(q, h) + t);
          void 0 !== q && void 0 !== m && (k += " - ");
          void 0 !== m && (k += c.numberFormat(m, h) + t);
          d.push(v({
            chart: b,
            name: k,
            options: {},
            drawLegendSymbol: f.drawRectangle,
            visible: !0,
            setState: x,
            isDataClass: !0,
            setVisible: function() {
              l = this.visible = !l;
              e(a.series, function(a) {
                e(a.points, function(a) {
                  a.dataClass === p && a.setVisible(l)
                })
              });
              b.legend.colorizeItem(this, l)
            }
          }, g))
        });
        return d
      },
      name: ""
    });
    e(["fill", "stroke"], function(a) {
      c.Fx.prototype[a +
        "Setter"] = function() {
        this.elem.attr(a, l.prototype.tweenColors(m(this.start), m(this.end), this.pos), null, !0)
      }
    });
    t(r.prototype, "getAxes", function(a) {
      var b = this.options.colorAxis;
      a.call(this);
      this.colorAxis = [];
      b && new l(this, b)
    });
    t(p.prototype, "getAllItems", function(a) {
      var b = [],
        d = this.chart.colorAxis[0];
      d && d.options && (d.options.showInLegend && (d.options.dataClasses ? b = b.concat(d.getDataClassLegendSymbols()) : b.push(d)), e(d.series, function(a) {
        a.options.showInLegend = !1
      }));
      return b.concat(a.call(this))
    });
    t(p.prototype,
      "colorizeItem",
      function(a, b, d) {
        a.call(this, b, d);
        d && b.legendColor && b.legendSymbol.attr({
          fill: b.legendColor
        })
      })
  })(n);
  (function(c) {
    var k = c.defined,
      r = c.each,
      m = c.noop,
      l = c.seriesTypes;
    c.colorPointMixin = {
      isValid: function() {
        return null !== this.value
      },
      setVisible: function(c) {
        var e = this,
          k = c ? "show" : "hide";
        r(["graphic", "dataLabel"], function(c) {
          if (e[c]) e[c][k]()
        })
      },
      setState: function(e) {
        c.Point.prototype.setState.call(this, e);
        this.graphic && this.graphic.attr({
          zIndex: "hover" === e ? 1 : 0
        })
      }
    };
    c.colorSeriesMixin = {
      pointArrayMap: ["value"],
      axisTypes: ["xAxis", "yAxis", "colorAxis"],
      optionalAxis: "colorAxis",
      trackerGroups: ["group", "markerGroup", "dataLabelsGroup"],
      getSymbol: m,
      parallelArrays: ["x", "y", "value"],
      colorKey: "value",
      pointAttribs: l.column.prototype.pointAttribs,
      translateColors: function() {
        var c = this,
          k = this.options.nullColor,
          l = this.colorAxis,
          m = this.colorKey;
        r(this.data, function(f) {
          var e = f[m];
          if (e = f.options.color || (f.isNull ? k : l && void 0 !== e ? l.toColor(e, f) : f.color || c.color)) f.color = e
        })
      },
      colorAttribs: function(c) {
        var e = {};
        k(c.color) && (e[this.colorProp ||
          "fill"] = c.color);
        return e
      }
    }
  })(n);
  (function(c) {
    var k = c.colorPointMixin,
      r = c.each,
      m = c.merge,
      l = c.noop,
      e = c.pick,
      n = c.Series,
      w = c.seriesType,
      p = c.seriesTypes;
    w("heatmap", "scatter", {
        animation: !1,
        borderWidth: 0,
        nullColor: "#f7f7f7",
        dataLabels: {
          formatter: function() {
            return this.point.value
          },
          inside: !0,
          verticalAlign: "middle",
          crop: !1,
          overflow: !1,
          padding: 0
        },
        marker: null,
        pointRange: null,
        tooltip: {
          pointFormat: "{point.x}, {point.y}: {point.value}\x3cbr/\x3e"
        },
        states: {
          normal: {
            animation: !0
          },
          hover: {
            halo: !1,
            brightness: .2
          }
        }
      },
      m(c.colorSeriesMixin, {
        pointArrayMap: ["y", "value"],
        hasPointSpecificOptions: !0,
        supportsDrilldown: !0,
        getExtremesFromAll: !0,
        directTouch: !0,
        init: function() {
          var c;
          p.scatter.prototype.init.apply(this, arguments);
          c = this.options;
          c.pointRange = e(c.pointRange, c.colsize || 1);
          this.yAxis.axisPointRange = c.rowsize || 1
        },
        translate: function() {
          var c = this.options,
            e = this.xAxis,
            k = this.yAxis,
            l = function(c, a, b) {
              return Math.min(Math.max(a, c), b)
            };
          this.generatePoints();
          r(this.points, function(f) {
            var a = (c.colsize || 1) / 2,
              b = (c.rowsize ||
                1) / 2,
              d = l(Math.round(e.len - e.translate(f.x - a, 0, 1, 0, 1)), -e.len, 2 * e.len),
              a = l(Math.round(e.len - e.translate(f.x + a, 0, 1, 0, 1)), -e.len, 2 * e.len),
              g = l(Math.round(k.translate(f.y - b, 0, 1, 0, 1)), -k.len, 2 * k.len),
              b = l(Math.round(k.translate(f.y + b, 0, 1, 0, 1)), -k.len, 2 * k.len);
            f.plotX = f.clientX = (d + a) / 2;
            f.plotY = (g + b) / 2;
            f.shapeType = "rect";
            f.shapeArgs = {
              x: Math.min(d, a),
              y: Math.min(g, b),
              width: Math.abs(a - d),
              height: Math.abs(b - g)
            }
          });
          this.translateColors()
        },
        drawPoints: function() {
          p.column.prototype.drawPoints.call(this);
          r(this.points,
            function(c) {
              c.graphic.attr(this.colorAttribs(c))
            }, this)
        },
        animate: l,
        getBox: l,
        drawLegendSymbol: c.LegendSymbolMixin.drawRectangle,
        alignDataLabel: p.column.prototype.alignDataLabel,
        getExtremes: function() {
          n.prototype.getExtremes.call(this, this.valueData);
          this.valueMin = this.dataMin;
          this.valueMax = this.dataMax;
          n.prototype.getExtremes.call(this)
        }
      }), k)
  })(n)
});;
/*! RESOURCE: /scripts/highcharts/modules/solid-gauge.js */
(function(l) {
  "object" === typeof module && module.exports ? module.exports = l : l(Highcharts)
})(function(l) {
  (function(f) {
    var l = f.pInt,
      t = f.pick,
      m = f.each,
      v = f.isNumber,
      n;
    n = {
      initDataClasses: function(a) {
        var c = this,
          d = this.chart,
          e, u = 0,
          h = this.options;
        this.dataClasses = e = [];
        m(a.dataClasses, function(g, b) {
          g = f.merge(g);
          e.push(g);
          g.color || ("category" === h.dataClassColor ? (b = d.options.colors, g.color = b[u++], u === b.length && (u = 0)) : g.color = c.tweenColors(f.color(h.minColor), f.color(h.maxColor), b / (a.dataClasses.length - 1)))
        })
      },
      initStops: function(a) {
        this.stops =
          a.stops || [
            [0, this.options.minColor],
            [1, this.options.maxColor]
          ];
        m(this.stops, function(a) {
          a.color = f.color(a[1])
        })
      },
      toColor: function(a, c) {
        var d = this.stops,
          e, f, h = this.dataClasses,
          g, b;
        if (h)
          for (b = h.length; b--;) {
            if (g = h[b], e = g.from, d = g.to, (void 0 === e || a >= e) && (void 0 === d || a <= d)) {
              f = g.color;
              c && (c.dataClass = b);
              break
            }
          } else {
            this.isLog && (a = this.val2lin(a));
            a = 1 - (this.max - a) / (this.max - this.min);
            for (b = d.length; b-- && !(a > d[b][0]););
            e = d[b] || d[b + 1];
            d = d[b + 1] || e;
            a = 1 - (d[0] - a) / (d[0] - e[0] || 1);
            f = this.tweenColors(e.color, d.color,
              a)
          }
        return f
      },
      tweenColors: function(a, c, d) {
        var e;
        c.rgba.length && a.rgba.length ? (a = a.rgba, c = c.rgba, e = 1 !== c[3] || 1 !== a[3], a = (e ? "rgba(" : "rgb(") + Math.round(c[0] + (a[0] - c[0]) * (1 - d)) + "," + Math.round(c[1] + (a[1] - c[1]) * (1 - d)) + "," + Math.round(c[2] + (a[2] - c[2]) * (1 - d)) + (e ? "," + (c[3] + (a[3] - c[3]) * (1 - d)) : "") + ")") : a = c.input || "none";
        return a
      }
    };
    m(["fill", "stroke"], function(a) {
      f.Fx.prototype[a + "Setter"] = function() {
        this.elem.attr(a, n.tweenColors(f.color(this.start), f.color(this.end), this.pos), null, !0)
      }
    });
    f.seriesType("solidgauge",
      "gauge", {
        colorByPoint: !0
      }, {
        translate: function() {
          var a = this.yAxis;
          f.extend(a, n);
          !a.dataClasses && a.options.dataClasses && a.initDataClasses(a.options);
          a.initStops(a.options);
          f.seriesTypes.gauge.prototype.translate.call(this)
        },
        drawPoints: function() {
          var a = this,
            c = a.yAxis,
            d = c.center,
            e = a.options,
            f = a.chart.renderer,
            h = e.overshoot,
            g = v(h) ? h / 180 * Math.PI : 0,
            b;
          v(e.threshold) && (b = c.startAngleRad + c.translate(e.threshold, null, null, null, !0));
          this.thresholdAngleRad = t(b, c.startAngleRad);
          m(a.points, function(b) {
            var h = b.graphic,
              k = c.startAngleRad + c.translate(b.y, null, null, null, !0),
              m = l(t(b.options.radius, e.radius, 100)) * d[2] / 200,
              p = l(t(b.options.innerRadius, e.innerRadius, 60)) * d[2] / 200,
              q = c.toColor(b.y, b),
              r = Math.min(c.startAngleRad, c.endAngleRad),
              n = Math.max(c.startAngleRad, c.endAngleRad);
            "none" === q && (q = b.color || a.color || "none");
            "none" !== q && (b.color = q);
            k = Math.max(r - g, Math.min(n + g, k));
            !1 === e.wrap && (k = Math.max(r, Math.min(n, k)));
            r = Math.min(k, a.thresholdAngleRad);
            k = Math.max(k, a.thresholdAngleRad);
            k - r > 2 * Math.PI && (k = r + 2 * Math.PI);
            b.shapeArgs =
              p = {
                x: d[0],
                y: d[1],
                r: m,
                innerR: p,
                start: r,
                end: k,
                fill: q
              };
            b.startR = m;
            h ? (b = p.d, h.animate(p), b && (p.d = b)) : (b.graphic = f.arc(p).addClass("highcharts-point").attr({
              fill: q,
              "sweep-flag": 0
            }).add(a.group), "square" !== e.linecap && b.graphic.attr({
              "stroke-linecap": "round",
              "stroke-linejoin": "round"
            }), b.graphic.attr({
              stroke: e.borderColor || "none",
              "stroke-width": e.borderWidth || 0
            }))
          })
        },
        animate: function(a) {
          a || (this.startAngleRad = this.thresholdAngleRad, f.seriesTypes.pie.prototype.animate.call(this, a))
        }
      })
  })(l)
});;
/*! RESOURCE: /scripts/highcharts/modules/map.js */
(function(v) {
  "object" === typeof module && module.exports ? module.exports = v : v(Highcharts)
})(function(v) {
  (function(a) {
    var m = a.Axis,
      n = a.each,
      k = a.pick;
    a = a.wrap;
    a(m.prototype, "getSeriesExtremes", function(a) {
      var d = this.isXAxis,
        t, m, u = [],
        q;
      d && n(this.series, function(a, b) {
        a.useMapGeometry && (u[b] = a.xData, a.xData = [])
      });
      a.call(this);
      d && (t = k(this.dataMin, Number.MAX_VALUE), m = k(this.dataMax, -Number.MAX_VALUE), n(this.series, function(a, b) {
        a.useMapGeometry && (t = Math.min(t, k(a.minX, t)), m = Math.max(m, k(a.maxX, t)), a.xData = u[b],
          q = !0)
      }), q && (this.dataMin = t, this.dataMax = m))
    });
    a(m.prototype, "setAxisTranslation", function(a) {
      var g = this.chart,
        d = g.plotWidth / g.plotHeight,
        g = g.xAxis[0],
        k;
      a.call(this);
      "yAxis" === this.coll && void 0 !== g.transA && n(this.series, function(a) {
        a.preserveAspectRatio && (k = !0)
      });
      if (k && (this.transA = g.transA = Math.min(this.transA, g.transA), a = d / ((g.max - g.min) / (this.max - this.min)), a = 1 > a ? this : g, d = (a.max - a.min) * a.transA, a.pixelPadding = a.len - d, a.minPixelPadding = a.pixelPadding / 2, d = a.fixTo)) {
        d = d[1] - a.toValue(d[0], !0);
        d *= a.transA;
        if (Math.abs(d) > a.minPixelPadding || a.min === a.dataMin && a.max === a.dataMax) d = 0;
        a.minPixelPadding -= d
      }
    });
    a(m.prototype, "render", function(a) {
      a.call(this);
      this.fixTo = null
    })
  })(v);
  (function(a) {
    var m = a.Axis,
      n = a.Chart,
      k = a.color,
      d, g = a.each,
      t = a.extend,
      z = a.isNumber,
      u = a.Legend,
      q = a.LegendSymbolMixin,
      c = a.noop,
      b = a.merge,
      f = a.pick,
      r = a.wrap;
    d = a.ColorAxis = function() {
      this.init.apply(this, arguments)
    };
    t(d.prototype, m.prototype);
    t(d.prototype, {
      defaultColorAxisOptions: {
        lineWidth: 0,
        minPadding: 0,
        maxPadding: 0,
        gridLineWidth: 1,
        tickPixelInterval: 72,
        startOnTick: !0,
        endOnTick: !0,
        offset: 0,
        marker: {
          animation: {
            duration: 50
          },
          width: .01,
          color: "#999999"
        },
        labels: {
          overflow: "justify"
        },
        minColor: "#e6ebf5",
        maxColor: "#003399",
        tickLength: 5,
        showInLegend: !0
      },
      keepProps: ["legendGroup", "legendItem", "legendSymbol"].concat(m.prototype.keepProps),
      init: function(a, e) {
        var l = "vertical" !== a.options.legend.layout,
          c;
        this.coll = "colorAxis";
        c = b(this.defaultColorAxisOptions, {
          side: l ? 2 : 1,
          reversed: !l
        }, e, {
          opposite: !l,
          showEmpty: !1,
          title: null
        });
        m.prototype.init.call(this, a, c);
        e.dataClasses &&
          this.initDataClasses(e);
        this.initStops(e);
        this.horiz = l;
        this.zoomEnabled = !1;
        this.defaultLegendLength = 200
      },
      tweenColors: function(b, a, c) {
        var l;
        a.rgba.length && b.rgba.length ? (b = b.rgba, a = a.rgba, l = 1 !== a[3] || 1 !== b[3], b = (l ? "rgba(" : "rgb(") + Math.round(a[0] + (b[0] - a[0]) * (1 - c)) + "," + Math.round(a[1] + (b[1] - a[1]) * (1 - c)) + "," + Math.round(a[2] + (b[2] - a[2]) * (1 - c)) + (l ? "," + (a[3] + (b[3] - a[3]) * (1 - c)) : "") + ")") : b = a.input || "none";
        return b
      },
      initDataClasses: function(a) {
        var l = this,
          c = this.chart,
          f, h = 0,
          p = c.options.chart.colorCount,
          d = this.options,
          q = a.dataClasses.length;
        this.dataClasses = f = [];
        this.legendItems = [];
        g(a.dataClasses, function(a, e) {
          a = b(a);
          f.push(a);
          a.color || ("category" === d.dataClassColor ? (e = c.options.colors, p = e.length, a.color = e[h], a.colorIndex = h, h++, h === p && (h = 0)) : a.color = l.tweenColors(k(d.minColor), k(d.maxColor), 2 > q ? .5 : e / (q - 1)))
        })
      },
      initStops: function(a) {
        this.stops = a.stops || [
          [0, this.options.minColor],
          [1, this.options.maxColor]
        ];
        g(this.stops, function(a) {
          a.color = k(a[1])
        })
      },
      setOptions: function(a) {
        m.prototype.setOptions.call(this, a);
        this.options.crosshair =
          this.options.marker
      },
      setAxisSize: function() {
        var a = this.legendSymbol,
          b = this.chart,
          c = b.options.legend || {},
          f, h;
        a ? (this.left = c = a.attr("x"), this.top = f = a.attr("y"), this.width = h = a.attr("width"), this.height = a = a.attr("height"), this.right = b.chartWidth - c - h, this.bottom = b.chartHeight - f - a, this.len = this.horiz ? h : a, this.pos = this.horiz ? c : f) : this.len = (this.horiz ? c.symbolWidth : c.symbolHeight) || this.defaultLegendLength
      },
      toColor: function(a, b) {
        var c = this.stops,
          e, h, l = this.dataClasses,
          f, d;
        if (l)
          for (d = l.length; d--;) {
            if (f = l[d],
              e = f.from, c = f.to, (void 0 === e || a >= e) && (void 0 === c || a <= c)) {
              h = f.color;
              b && (b.dataClass = d, b.colorIndex = f.colorIndex);
              break
            }
          } else {
            this.isLog && (a = this.val2lin(a));
            a = 1 - (this.max - a) / (this.max - this.min || 1);
            for (d = c.length; d-- && !(a > c[d][0]););
            e = c[d] || c[d + 1];
            c = c[d + 1] || e;
            a = 1 - (c[0] - a) / (c[0] - e[0] || 1);
            h = this.tweenColors(e.color, c.color, a)
          }
        return h
      },
      getOffset: function() {
        var a = this.legendGroup,
          b = this.chart.axisOffset[this.side];
        a && (this.axisParent = a, m.prototype.getOffset.call(this), this.added || (this.added = !0, this.labelLeft =
          0, this.labelRight = this.width), this.chart.axisOffset[this.side] = b)
      },
      setLegendColor: function() {
        var a, b = this.options,
          c = this.reversed;
        a = c ? 1 : 0;
        c = c ? 0 : 1;
        a = this.horiz ? [a, 0, c, 0] : [0, c, 0, a];
        this.legendColor = {
          linearGradient: {
            x1: a[0],
            y1: a[1],
            x2: a[2],
            y2: a[3]
          },
          stops: b.stops || [
            [0, b.minColor],
            [1, b.maxColor]
          ]
        }
      },
      drawLegendSymbol: function(a, b) {
        var c = a.padding,
          e = a.options,
          h = this.horiz,
          l = f(e.symbolWidth, h ? this.defaultLegendLength : 12),
          d = f(e.symbolHeight, h ? 12 : this.defaultLegendLength),
          g = f(e.labelPadding, h ? 16 : 30),
          e = f(e.itemDistance,
            10);
        this.setLegendColor();
        b.legendSymbol = this.chart.renderer.rect(0, a.baseline - 11, l, d).attr({
          zIndex: 1
        }).add(b.legendGroup);
        this.legendItemWidth = l + c + (h ? e : g);
        this.legendItemHeight = d + c + (h ? g : 0)
      },
      setState: c,
      visible: !0,
      setVisible: c,
      getSeriesExtremes: function() {
        var a;
        this.series.length && (a = this.series[0], this.dataMin = a.valueMin, this.dataMax = a.valueMax)
      },
      drawCrosshair: function(a, b) {
        var c = b && b.plotX,
          f = b && b.plotY,
          h, e = this.pos,
          l = this.len;
        b && (h = this.toPixels(b[b.series.colorKey]), h < e ? h = e - 2 : h > e + l && (h = e + l + 2), b.plotX =
          h, b.plotY = this.len - h, m.prototype.drawCrosshair.call(this, a, b), b.plotX = c, b.plotY = f, this.cross && (this.cross.addClass("highcharts-coloraxis-marker").add(this.legendGroup), this.cross.attr({
            fill: this.crosshair.color
          })))
      },
      getPlotLinePath: function(a, b, c, f, h) {
        return z(h) ? this.horiz ? ["M", h - 4, this.top - 6, "L", h + 4, this.top - 6, h, this.top, "Z"] : ["M", this.left, h, "L", this.left - 6, h + 6, this.left - 6, h - 6, "Z"] : m.prototype.getPlotLinePath.call(this, a, b, c, f)
      },
      update: function(a, c) {
        var f = this.chart,
          e = f.legend;
        g(this.series, function(a) {
          a.isDirtyData = !0
        });
        a.dataClasses && e.allItems && (g(e.allItems, function(a) {
          a.isDataClass && a.legendGroup.destroy()
        }), f.isDirtyLegend = !0);
        f.options[this.coll] = b(this.userOptions, a);
        m.prototype.update.call(this, a, c);
        this.legendItem && (this.setLegendColor(), e.colorizeItem(this, !0))
      },
      getDataClassLegendSymbols: function() {
        var b = this,
          f = this.chart,
          d = this.legendItems,
          r = f.options.legend,
          h = r.valueDecimals,
          p = r.valueSuffix || "",
          w;
        d.length || g(this.dataClasses, function(e, l) {
          var r = !0,
            A = e.from,
            k = e.to;
          w = "";
          void 0 === A ? w = "\x3c " : void 0 ===
            k && (w = "\x3e ");
          void 0 !== A && (w += a.numberFormat(A, h) + p);
          void 0 !== A && void 0 !== k && (w += " - ");
          void 0 !== k && (w += a.numberFormat(k, h) + p);
          d.push(t({
            chart: f,
            name: w,
            options: {},
            drawLegendSymbol: q.drawRectangle,
            visible: !0,
            setState: c,
            isDataClass: !0,
            setVisible: function() {
              r = this.visible = !r;
              g(b.series, function(a) {
                g(a.points, function(a) {
                  a.dataClass === l && a.setVisible(r)
                })
              });
              f.legend.colorizeItem(this, r)
            }
          }, e))
        });
        return d
      },
      name: ""
    });
    g(["fill", "stroke"], function(b) {
      a.Fx.prototype[b + "Setter"] = function() {
        this.elem.attr(b,
          d.prototype.tweenColors(k(this.start), k(this.end), this.pos))
      }
    });
    r(n.prototype, "getAxes", function(a) {
      var b = this.options.colorAxis;
      a.call(this);
      this.colorAxis = [];
      b && new d(this, b)
    });
    r(u.prototype, "getAllItems", function(a) {
      var b = [],
        c = this.chart.colorAxis[0];
      c && c.options && (c.options.showInLegend && (c.options.dataClasses ? b = b.concat(c.getDataClassLegendSymbols()) : b.push(c)), g(c.series, function(a) {
        a.options.showInLegend = !1
      }));
      return b.concat(a.call(this))
    });
    r(u.prototype, "colorizeItem", function(a, b, c) {
      a.call(this,
        b, c);
      c && b.legendColor && b.legendSymbol.attr({
        fill: b.legendColor
      })
    })
  })(v);
  (function(a) {
    var m = a.defined,
      n = a.each,
      k = a.noop,
      d = a.seriesTypes;
    a.colorPointMixin = {
      isValid: function() {
        return null !== this.value
      },
      setVisible: function(a) {
        var d = this,
          g = a ? "show" : "hide";
        n(["graphic", "dataLabel"], function(a) {
          if (d[a]) d[a][g]()
        })
      }
    };
    a.colorSeriesMixin = {
      pointArrayMap: ["value"],
      axisTypes: ["xAxis", "yAxis", "colorAxis"],
      optionalAxis: "colorAxis",
      trackerGroups: ["group", "markerGroup", "dataLabelsGroup"],
      getSymbol: k,
      parallelArrays: ["x",
        "y", "value"
      ],
      colorKey: "value",
      pointAttribs: d.column.prototype.pointAttribs,
      translateColors: function() {
        var a = this,
          d = this.options.nullColor,
          k = this.colorAxis,
          m = this.colorKey;
        n(this.data, function(g) {
          var c = g[m];
          if (c = g.options.color || (g.isNull ? d : k && void 0 !== c ? k.toColor(c, g) : g.color || a.color)) g.color = c
        })
      },
      colorAttribs: function(a) {
        var d = {};
        m(a.color) && (d[this.colorProp || "fill"] = a.color);
        return d
      }
    }
  })(v);
  (function(a) {
    function m(a) {
      a && (a.preventDefault && a.preventDefault(), a.stopPropagation && a.stopPropagation(),
        a.cancelBubble = !0)
    }
    var n = a.addEvent,
      k = a.Chart,
      d = a.doc,
      g = a.each,
      t = a.extend,
      z = a.merge,
      u = a.pick;
    a = a.wrap;
    t(k.prototype, {
      renderMapNavigation: function() {
        var a = this,
          c = this.options.mapNavigation,
          b = c.buttons,
          f, d, l, e, g, k = function(b) {
            this.handler.call(a, b);
            m(b)
          };
        if (u(c.enableButtons, c.enabled) && !a.renderer.forExport)
          for (f in a.mapNavButtons = [], b) b.hasOwnProperty(f) && (l = z(c.buttonOptions, b[f]), d = l.theme, d.style = z(l.theme.style, l.style), g = (e = d.states) && e.hover, e = e && e.select, d = a.renderer.button(l.text, 0, 0, k, d,
            g, e, 0, "zoomIn" === f ? "topbutton" : "bottombutton").addClass("highcharts-map-navigation").attr({
            width: l.width,
            height: l.height,
            title: a.options.lang[f],
            padding: l.padding,
            zIndex: 5
          }).add(), d.handler = l.onclick, d.align(t(l, {
            width: d.width,
            height: 2 * d.height
          }), null, l.alignTo), n(d.element, "dblclick", m), a.mapNavButtons.push(d))
      },
      fitToBox: function(a, c) {
        g([
          ["x", "width"],
          ["y", "height"]
        ], function(b) {
          var f = b[0];
          b = b[1];
          a[f] + a[b] > c[f] + c[b] && (a[b] > c[b] ? (a[b] = c[b], a[f] = c[f]) : a[f] = c[f] + c[b] - a[b]);
          a[b] > c[b] && (a[b] = c[b]);
          a[f] <
            c[f] && (a[f] = c[f])
        });
        return a
      },
      mapZoom: function(a, c, b, f, d) {
        var l = this.xAxis[0],
          e = l.max - l.min,
          g = u(c, l.min + e / 2),
          k = e * a,
          e = this.yAxis[0],
          h = e.max - e.min,
          p = u(b, e.min + h / 2),
          h = h * a,
          g = this.fitToBox({
            x: g - k * (f ? (f - l.pos) / l.len : .5),
            y: p - h * (d ? (d - e.pos) / e.len : .5),
            width: k,
            height: h
          }, {
            x: l.dataMin,
            y: e.dataMin,
            width: l.dataMax - l.dataMin,
            height: e.dataMax - e.dataMin
          }),
          k = g.x <= l.dataMin && g.width >= l.dataMax - l.dataMin && g.y <= e.dataMin && g.height >= e.dataMax - e.dataMin;
        f && (l.fixTo = [f - l.pos, c]);
        d && (e.fixTo = [d - e.pos, b]);
        void 0 === a || k ? (l.setExtremes(void 0,
          void 0, !1), e.setExtremes(void 0, void 0, !1)) : (l.setExtremes(g.x, g.x + g.width, !1), e.setExtremes(g.y, g.y + g.height, !1));
        this.redraw()
      }
    });
    a(k.prototype, "render", function(a) {
      var c = this,
        b = c.options.mapNavigation;
      c.renderMapNavigation();
      a.call(c);
      (u(b.enableDoubleClickZoom, b.enabled) || b.enableDoubleClickZoomTo) && n(c.container, "dblclick", function(a) {
        c.pointer.onContainerDblClick(a)
      });
      u(b.enableMouseWheelZoom, b.enabled) && n(c.container, void 0 === d.onmousewheel ? "DOMMouseScroll" : "mousewheel", function(a) {
        c.pointer.onContainerMouseWheel(a);
        m(a);
        return !1
      })
    })
  })(v);
  (function(a) {
    var m = a.extend,
      n = a.pick,
      k = a.Pointer;
    a = a.wrap;
    m(k.prototype, {
      onContainerDblClick: function(a) {
        var d = this.chart;
        a = this.normalize(a);
        d.options.mapNavigation.enableDoubleClickZoomTo ? d.pointer.inClass(a.target, "highcharts-tracker") && d.hoverPoint && d.hoverPoint.zoomTo() : d.isInsidePlot(a.chartX - d.plotLeft, a.chartY - d.plotTop) && d.mapZoom(.5, d.xAxis[0].toValue(a.chartX), d.yAxis[0].toValue(a.chartY), a.chartX, a.chartY)
      },
      onContainerMouseWheel: function(a) {
        var d = this.chart,
          k;
        a =
          this.normalize(a);
        k = a.detail || -(a.wheelDelta / 120);
        d.isInsidePlot(a.chartX - d.plotLeft, a.chartY - d.plotTop) && d.mapZoom(Math.pow(d.options.mapNavigation.mouseWheelSensitivity, k), d.xAxis[0].toValue(a.chartX), d.yAxis[0].toValue(a.chartY), a.chartX, a.chartY)
      }
    });
    a(k.prototype, "zoomOption", function(a) {
      var d = this.chart.options.mapNavigation;
      n(d.enableTouchZoom, d.enabled) && (this.chart.options.chart.pinchType = "xy");
      a.apply(this, [].slice.call(arguments, 1))
    });
    a(k.prototype, "pinchTranslate", function(a, g, k, m, n, q,
      c) {
      a.call(this, g, k, m, n, q, c);
      "map" === this.chart.options.chart.type && this.hasZoom && (a = m.scaleX > m.scaleY, this.pinchTranslateDirection(!a, g, k, m, n, q, c, a ? m.scaleX : m.scaleY))
    })
  })(v);
  (function(a) {
    var m = a.color,
      n = a.ColorAxis,
      k = a.colorPointMixin,
      d = a.each,
      g = a.extend,
      t = a.isNumber,
      v = a.map,
      u = a.merge,
      q = a.noop,
      c = a.pick,
      b = a.isArray,
      f = a.Point,
      r = a.Series,
      l = a.seriesType,
      e = a.seriesTypes,
      A = a.splat,
      x = void 0 !== a.doc.documentElement.style.vectorEffect;
    l("map", "scatter", {
      allAreas: !0,
      animation: !1,
      nullColor: "#f7f7f7",
      borderColor: "#cccccc",
      borderWidth: 1,
      marker: null,
      stickyTracking: !1,
      joinBy: "hc-key",
      dataLabels: {
        formatter: function() {
          return this.point.value
        },
        inside: !0,
        verticalAlign: "middle",
        crop: !1,
        overflow: !1,
        padding: 0
      },
      turboThreshold: 0,
      tooltip: {
        followPointer: !0,
        pointFormat: "{point.name}: {point.value}\x3cbr/\x3e"
      },
      states: {
        normal: {
          animation: !0
        },
        hover: {
          brightness: .2,
          halo: null
        },
        select: {
          color: "#cccccc"
        }
      }
    }, u(a.colorSeriesMixin, {
      type: "map",
      supportsDrilldown: !0,
      getExtremesFromAll: !0,
      useMapGeometry: !0,
      forceDL: !0,
      searchPoint: q,
      directTouch: !0,
      preserveAspectRatio: !0,
      pointArrayMap: ["value"],
      getBox: function(b) {
        var h = Number.MAX_VALUE,
          f = -h,
          e = h,
          l = -h,
          g = h,
          k = h,
          r = this.xAxis,
          m = this.yAxis,
          n;
        d(b || [], function(b) {
          if (b.path) {
            "string" === typeof b.path && (b.path = a.splitPath(b.path));
            var d = b.path || [],
              r = d.length,
              p = !1,
              m = -h,
              w = h,
              B = -h,
              x = h,
              q = b.properties;
            if (!b._foundBox) {
              for (; r--;) t(d[r]) && (p ? (m = Math.max(m, d[r]), w = Math.min(w, d[r])) : (B = Math.max(B, d[r]), x = Math.min(x, d[r])), p = !p);
              b._midX = w + (m - w) * (b.middleX || q && q["hc-middle-x"] || .5);
              b._midY = x + (B - x) * (b.middleY || q && q["hc-middle-y"] ||
                .5);
              b._maxX = m;
              b._minX = w;
              b._maxY = B;
              b._minY = x;
              b.labelrank = c(b.labelrank, (m - w) * (B - x));
              b._foundBox = !0
            }
            f = Math.max(f, b._maxX);
            e = Math.min(e, b._minX);
            l = Math.max(l, b._maxY);
            g = Math.min(g, b._minY);
            k = Math.min(b._maxX - b._minX, b._maxY - b._minY, k);
            n = !0
          }
        });
        n && (this.minY = Math.min(g, c(this.minY, h)), this.maxY = Math.max(l, c(this.maxY, -h)), this.minX = Math.min(e, c(this.minX, h)), this.maxX = Math.max(f, c(this.maxX, -h)), r && void 0 === r.options.minRange && (r.minRange = Math.min(5 * k, (this.maxX - this.minX) / 5, r.minRange || h)), m && void 0 ===
          m.options.minRange && (m.minRange = Math.min(5 * k, (this.maxY - this.minY) / 5, m.minRange || h)))
      },
      getExtremes: function() {
        r.prototype.getExtremes.call(this, this.valueData);
        this.chart.hasRendered && this.isDirtyData && this.getBox(this.options.data);
        this.valueMin = this.dataMin;
        this.valueMax = this.dataMax;
        this.dataMin = this.minY;
        this.dataMax = this.maxY
      },
      translatePath: function(a) {
        var b = !1,
          h = this.xAxis,
          c = this.yAxis,
          d = h.min,
          f = h.transA,
          h = h.minPixelPadding,
          e = c.min,
          l = c.transA,
          c = c.minPixelPadding,
          k, g = [];
        if (a)
          for (k = a.length; k--;) t(a[k]) ?
            (g[k] = b ? (a[k] - d) * f + h : (a[k] - e) * l + c, b = !b) : g[k] = a[k];
        return g
      },
      setData: function(h, c, f, e) {
        var l = this.options,
          k = this.chart.options.chart,
          g = k && k.map,
          m = l.mapData,
          p = l.joinBy,
          w = null === p,
          x = l.keys || this.pointArrayMap,
          n = [],
          q = {},
          y, z = this.chart.mapTransforms;
        !m && g && (m = "string" === typeof g ? a.maps[g] : g);
        w && (p = "_i");
        p = this.joinBy = A(p);
        p[1] || (p[1] = p[0]);
        h && d(h, function(a, c) {
          var d = 0;
          if (t(a)) h[c] = {
            value: a
          };
          else if (b(a)) {
            h[c] = {};
            !l.keys && a.length > x.length && "string" === typeof a[0] && (h[c]["hc-key"] = a[0], ++d);
            for (var f = 0; f <
              x.length; ++f, ++d) x[f] && (h[c][x[f]] = a[d])
          }
          w && (h[c]._i = c)
        });
        this.getBox(h);
        if (this.chart.mapTransforms = z = k && k.mapTransforms || m && m["hc-transform"] || z)
          for (y in z) z.hasOwnProperty(y) && y.rotation && (y.cosAngle = Math.cos(y.rotation), y.sinAngle = Math.sin(y.rotation));
        if (m) {
          "FeatureCollection" === m.type && (this.mapTitle = m.title, m = a.geojson(m, this.type, this));
          this.mapData = m;
          this.mapMap = {};
          for (y = 0; y < m.length; y++) k = m[y], g = k.properties, k._i = y, p[0] && g && g[p[0]] && (k[p[0]] = g[p[0]]), q[k[p[0]]] = k;
          this.mapMap = q;
          h && p[1] &&
            d(h, function(a) {
              q[a[p[1]]] && n.push(q[a[p[1]]])
            });
          l.allAreas ? (this.getBox(m), h = h || [], p[1] && d(h, function(a) {
            n.push(a[p[1]])
          }), n = "|" + v(n, function(a) {
            return a && a[p[0]]
          }).join("|") + "|", d(m, function(a) {
            p[0] && -1 !== n.indexOf("|" + a[p[0]] + "|") || (h.push(u(a, {
              value: null
            })), e = !1)
          })) : this.getBox(n)
        }
        r.prototype.setData.call(this, h, c, f, e)
      },
      drawGraph: q,
      drawDataLabels: q,
      doFullTranslate: function() {
        return this.isDirtyData || this.chart.isResizing || this.chart.renderer.isVML || !this.baseTrans
      },
      translate: function() {
        var a =
          this,
          b = a.xAxis,
          c = a.yAxis,
          f = a.doFullTranslate();
        a.generatePoints();
        d(a.data, function(h) {
          h.plotX = b.toPixels(h._midX, !0);
          h.plotY = c.toPixels(h._midY, !0);
          f && (h.shapeType = "path", h.shapeArgs = {
            d: a.translatePath(h.path)
          })
        });
        a.translateColors()
      },
      pointAttribs: function(a, b) {
        b = e.column.prototype.pointAttribs.call(this, a, b);
        a.isFading && delete b.fill;
        x ? b["vector-effect"] = "non-scaling-stroke" : b["stroke-width"] = "inherit";
        return b
      },
      drawPoints: function() {
        var a = this,
          b = a.xAxis,
          c = a.yAxis,
          f = a.group,
          l = a.chart,
          k = l.renderer,
          g, m = this.baseTrans;
        a.transformGroup || (a.transformGroup = k.g().attr({
          scaleX: 1,
          scaleY: 1
        }).add(f), a.transformGroup.survive = !0);
        a.doFullTranslate() ? (l.hasRendered && d(a.points, function(b) {
          b.shapeArgs && (b.shapeArgs.fill = a.pointAttribs(b, b.state).fill)
        }), a.group = a.transformGroup, e.column.prototype.drawPoints.apply(a), a.group = f, d(a.points, function(a) {
          a.graphic && (a.name && a.graphic.addClass("highcharts-name-" + a.name.replace(/ /g, "-").toLowerCase()), a.properties && a.properties["hc-key"] && a.graphic.addClass("highcharts-key-" +
            a.properties["hc-key"].toLowerCase()))
        }), this.baseTrans = {
          originX: b.min - b.minPixelPadding / b.transA,
          originY: c.min - c.minPixelPadding / c.transA + (c.reversed ? 0 : c.len / c.transA),
          transAX: b.transA,
          transAY: c.transA
        }, this.transformGroup.animate({
          translateX: 0,
          translateY: 0,
          scaleX: 1,
          scaleY: 1
        })) : (g = b.transA / m.transAX, f = c.transA / m.transAY, b = b.toPixels(m.originX, !0), c = c.toPixels(m.originY, !0), .99 < g && 1.01 > g && .99 < f && 1.01 > f && (f = g = 1, b = Math.round(b), c = Math.round(c)), this.transformGroup.animate({
          translateX: b,
          translateY: c,
          scaleX: g,
          scaleY: f
        }));
        x || a.group.element.setAttribute("stroke-width", a.options[a.pointAttrToOptions && a.pointAttrToOptions["stroke-width"] || "borderWidth"] / (g || 1));
        this.drawMapDataLabels()
      },
      drawMapDataLabels: function() {
        r.prototype.drawDataLabels.call(this);
        this.dataLabelsGroup && this.dataLabelsGroup.clip(this.chart.clipRect)
      },
      render: function() {
        var a = this,
          b = r.prototype.render;
        a.chart.renderer.isVML && 3E3 < a.data.length ? setTimeout(function() {
          b.call(a)
        }) : b.call(a)
      },
      animate: function(a) {
        var b = this.options.animation,
          c = this.group,
          h = this.xAxis,
          f = this.yAxis,
          d = h.pos,
          e = f.pos;
        this.chart.renderer.isSVG && (!0 === b && (b = {
          duration: 1E3
        }), a ? c.attr({
          translateX: d + h.len / 2,
          translateY: e + f.len / 2,
          scaleX: .001,
          scaleY: .001
        }) : (c.animate({
          translateX: d,
          translateY: e,
          scaleX: 1,
          scaleY: 1
        }, b), this.animate = null))
      },
      animateDrilldown: function(a) {
        var b = this.chart.plotBox,
          c = this.chart.drilldownLevels[this.chart.drilldownLevels.length - 1],
          f = c.bBox,
          h = this.chart.options.drilldown.animation;
        a || (a = Math.min(f.width / b.width, f.height / b.height), c.shapeArgs = {
          scaleX: a,
          scaleY: a,
          translateX: f.x,
          translateY: f.y
        }, d(this.points, function(a) {
          a.graphic && a.graphic.attr(c.shapeArgs).animate({
            scaleX: 1,
            scaleY: 1,
            translateX: 0,
            translateY: 0
          }, h)
        }), this.animate = null)
      },
      drawLegendSymbol: a.LegendSymbolMixin.drawRectangle,
      animateDrillupFrom: function(a) {
        e.column.prototype.animateDrillupFrom.call(this, a)
      },
      animateDrillupTo: function(a) {
        e.column.prototype.animateDrillupTo.call(this, a)
      }
    }), g({
      applyOptions: function(a, b) {
        a = f.prototype.applyOptions.call(this, a, b);
        b = this.series;
        var c =
          b.joinBy;
        b.mapData && ((c = void 0 !== a[c[1]] && b.mapMap[a[c[1]]]) ? (b.xyFromShape && (a.x = c._midX, a.y = c._midY), g(a, c)) : a.value = a.value || null);
        return a
      },
      onMouseOver: function(a) {
        clearTimeout(this.colorInterval);
        if (null !== this.value) f.prototype.onMouseOver.call(this, a);
        else this.series.onMouseOut(a)
      },
      onMouseOut: function() {
        var a = this,
          b = +new Date,
          c = m(this.series.pointAttribs(a).fill),
          d = m(this.series.pointAttribs(a, "hover").fill),
          e = a.series.options.states.normal.animation,
          l = e && (e.duration || 500);
        l && 4 === c.rgba.length &&
          4 === d.rgba.length && "select" !== a.state && (clearTimeout(a.colorInterval), a.colorInterval = setInterval(function() {
            var f = (new Date - b) / l,
              e = a.graphic;
            1 < f && (f = 1);
            e && e.attr("fill", n.prototype.tweenColors.call(0, d, c, f));
            1 <= f && clearTimeout(a.colorInterval)
          }, 13));
        a.isFading = !0;
        f.prototype.onMouseOut.call(a);
        a.isFading = null
      },
      zoomTo: function() {
        var a = this.series;
        a.xAxis.setExtremes(this._minX, this._maxX, !1);
        a.yAxis.setExtremes(this._minY, this._maxY, !1);
        a.chart.redraw()
      }
    }, k))
  })(v);
  (function(a) {
    var m = a.seriesType,
      n = a.seriesTypes;
    m("mapline", "map", {
      lineWidth: 1,
      fillColor: "none"
    }, {
      type: "mapline",
      colorProp: "stroke",
      pointAttrToOptions: {
        stroke: "color",
        "stroke-width": "lineWidth"
      },
      pointAttribs: function(a, d) {
        a = n.map.prototype.pointAttribs.call(this, a, d);
        a.fill = this.options.fillColor;
        return a
      },
      drawLegendSymbol: n.line.prototype.drawLegendSymbol
    })
  })(v);
  (function(a) {
    var m = a.merge,
      n = a.Point;
    a = a.seriesType;
    a("mappoint", "scatter", {
      dataLabels: {
        enabled: !0,
        formatter: function() {
          return this.point.name
        },
        crop: !1,
        defer: !1,
        overflow: !1,
        style: {
          color: "#000000"
        }
      }
    }, {
      type: "mappoint",
      forceDL: !0
    }, {
      applyOptions: function(a, d) {
        a = void 0 !== a.lat && void 0 !== a.lon ? m(a, this.series.chart.fromLatLonToPoint(a)) : a;
        return n.prototype.applyOptions.call(this, a, d)
      }
    })
  })(v);
  (function(a) {
    var m = a.merge,
      n = a.Point,
      k = a.seriesType,
      d = a.seriesTypes;
    d.bubble && k("mapbubble", "bubble", {
      animationLimit: 500,
      tooltip: {
        pointFormat: "{point.name}: {point.z}"
      }
    }, {
      xyFromShape: !0,
      type: "mapbubble",
      pointArrayMap: ["z"],
      getMapData: d.map.prototype.getMapData,
      getBox: d.map.prototype.getBox,
      setData: d.map.prototype.setData
    }, {
      applyOptions: function(a, k) {
        return a && void 0 !== a.lat && void 0 !== a.lon ? n.prototype.applyOptions.call(this, m(a, this.series.chart.fromLatLonToPoint(a)), k) : d.map.prototype.pointClass.prototype.applyOptions.call(this, a, k)
      },
      ttBelow: !1
    })
  })(v);
  (function(a) {
    var m = a.colorPointMixin,
      n = a.each,
      k = a.merge,
      d = a.noop,
      g = a.pick,
      t = a.Series,
      v = a.seriesType,
      u = a.seriesTypes;
    v("heatmap", "scatter", {
      animation: !1,
      borderWidth: 0,
      nullColor: "#f7f7f7",
      dataLabels: {
        formatter: function() {
          return this.point.value
        },
        inside: !0,
        verticalAlign: "middle",
        crop: !1,
        overflow: !1,
        padding: 0
      },
      marker: null,
      pointRange: null,
      tooltip: {
        pointFormat: "{point.x}, {point.y}: {point.value}\x3cbr/\x3e"
      },
      states: {
        normal: {
          animation: !0
        },
        hover: {
          halo: !1,
          brightness: .2
        }
      }
    }, k(a.colorSeriesMixin, {
      pointArrayMap: ["y", "value"],
      hasPointSpecificOptions: !0,
      supportsDrilldown: !0,
      getExtremesFromAll: !0,
      directTouch: !0,
      init: function() {
        var a;
        u.scatter.prototype.init.apply(this, arguments);
        a = this.options;
        a.pointRange = g(a.pointRange, a.colsize || 1);
        this.yAxis.axisPointRange =
          a.rowsize || 1
      },
      translate: function() {
        var a = this.options,
          c = this.xAxis,
          b = this.yAxis,
          f = function(a, b, c) {
            return Math.min(Math.max(b, a), c)
          };
        this.generatePoints();
        n(this.points, function(d) {
          var l = (a.colsize || 1) / 2,
            e = (a.rowsize || 1) / 2,
            g = f(Math.round(c.len - c.translate(d.x - l, 0, 1, 0, 1)), -c.len, 2 * c.len),
            l = f(Math.round(c.len - c.translate(d.x + l, 0, 1, 0, 1)), -c.len, 2 * c.len),
            k = f(Math.round(b.translate(d.y - e, 0, 1, 0, 1)), -b.len, 2 * b.len),
            e = f(Math.round(b.translate(d.y + e, 0, 1, 0, 1)), -b.len, 2 * b.len);
          d.plotX = d.clientX = (g + l) / 2;
          d.plotY =
            (k + e) / 2;
          d.shapeType = "rect";
          d.shapeArgs = {
            x: Math.min(g, l),
            y: Math.min(k, e),
            width: Math.abs(l - g),
            height: Math.abs(e - k)
          }
        });
        this.translateColors()
      },
      drawPoints: function() {
        u.column.prototype.drawPoints.call(this);
        n(this.points, function(a) {
          a.graphic.attr(this.colorAttribs(a, a.state))
        }, this)
      },
      animate: d,
      getBox: d,
      drawLegendSymbol: a.LegendSymbolMixin.drawRectangle,
      alignDataLabel: u.column.prototype.alignDataLabel,
      getExtremes: function() {
        t.prototype.getExtremes.call(this, this.valueData);
        this.valueMin = this.dataMin;
        this.valueMax = this.dataMax;
        t.prototype.getExtremes.call(this)
      }
    }), m)
  })(v);
  (function(a) {
    function m(a, b) {
      var c, d, l, e = !1,
        g = a.x,
        k = a.y;
      a = 0;
      for (c = b.length - 1; a < b.length; c = a++) d = b[a][1] > k, l = b[c][1] > k, d !== l && g < (b[c][0] - b[a][0]) * (k - b[a][1]) / (b[c][1] - b[a][1]) + b[a][0] && (e = !e);
      return e
    }
    var n = a.Chart,
      k = a.each,
      d = a.extend,
      g = a.error,
      t = a.format,
      v = a.merge,
      u = a.win,
      q = a.wrap;
    n.prototype.transformFromLatLon = function(a, b) {
      if (void 0 === u.proj4) return g(21), {
        x: 0,
        y: null
      };
      a = u.proj4(b.crs, [a.lon, a.lat]);
      var c = b.cosAngle || b.rotation &&
        Math.cos(b.rotation),
        d = b.sinAngle || b.rotation && Math.sin(b.rotation);
      a = b.rotation ? [a[0] * c + a[1] * d, -a[0] * d + a[1] * c] : a;
      return {
        x: ((a[0] - (b.xoffset || 0)) * (b.scale || 1) + (b.xpan || 0)) * (b.jsonres || 1) + (b.jsonmarginX || 0),
        y: (((b.yoffset || 0) - a[1]) * (b.scale || 1) + (b.ypan || 0)) * (b.jsonres || 1) - (b.jsonmarginY || 0)
      }
    };
    n.prototype.transformToLatLon = function(a, b) {
      if (void 0 === u.proj4) g(21);
      else {
        a = {
          x: ((a.x - (b.jsonmarginX || 0)) / (b.jsonres || 1) - (b.xpan || 0)) / (b.scale || 1) + (b.xoffset || 0),
          y: ((-a.y - (b.jsonmarginY || 0)) / (b.jsonres || 1) + (b.ypan ||
            0)) / (b.scale || 1) + (b.yoffset || 0)
        };
        var c = b.cosAngle || b.rotation && Math.cos(b.rotation),
          d = b.sinAngle || b.rotation && Math.sin(b.rotation);
        b = u.proj4(b.crs, "WGS84", b.rotation ? {
          x: a.x * c + a.y * -d,
          y: a.x * d + a.y * c
        } : a);
        return {
          lat: b.y,
          lon: b.x
        }
      }
    };
    n.prototype.fromPointToLatLon = function(a) {
      var b = this.mapTransforms,
        c;
      if (b) {
        for (c in b)
          if (b.hasOwnProperty(c) && b[c].hitZone && m({
              x: a.x,
              y: -a.y
            }, b[c].hitZone.coordinates[0])) return this.transformToLatLon(a, b[c]);
        return this.transformToLatLon(a, b["default"])
      }
      g(22)
    };
    n.prototype.fromLatLonToPoint =
      function(a) {
        var b = this.mapTransforms,
          c, d;
        if (!b) return g(22), {
          x: 0,
          y: null
        };
        for (c in b)
          if (b.hasOwnProperty(c) && b[c].hitZone && (d = this.transformFromLatLon(a, b[c]), m({
              x: d.x,
              y: -d.y
            }, b[c].hitZone.coordinates[0]))) return d;
        return this.transformFromLatLon(a, b["default"])
      };
    a.geojson = function(a, b, f) {
      var c = [],
        l = [],
        e = function(a) {
          var b, c = a.length;
          l.push("M");
          for (b = 0; b < c; b++) 1 === b && l.push("L"), l.push(a[b][0], -a[b][1])
        };
      b = b || "map";
      k(a.features, function(a) {
        var f = a.geometry,
          h = f.type,
          f = f.coordinates;
        a = a.properties;
        var g;
        l = [];
        "map" === b || "mapbubble" === b ? ("Polygon" === h ? (k(f, e), l.push("Z")) : "MultiPolygon" === h && (k(f, function(a) {
          k(a, e)
        }), l.push("Z")), l.length && (g = {
          path: l
        })) : "mapline" === b ? ("LineString" === h ? e(f) : "MultiLineString" === h && k(f, e), l.length && (g = {
          path: l
        })) : "mappoint" === b && "Point" === h && (g = {
          x: f[0],
          y: -f[1]
        });
        g && c.push(d(g, {
          name: a.name || a.NAME,
          properties: a
        }))
      });
      f && a.copyrightShort && (f.chart.mapCredits = t(f.chart.options.credits.mapText, {
        geojson: a
      }), f.chart.mapCreditsFull = t(f.chart.options.credits.mapTextFull, {
        geojson: a
      }));
      return c
    };
    q(n.prototype, "addCredits", function(a, b) {
      b = v(!0, this.options.credits, b);
      this.mapCredits && (b.href = null);
      a.call(this, b);
      this.credits && this.mapCreditsFull && this.credits.attr({
        title: this.mapCreditsFull
      })
    })
  })(v);
  (function(a) {
    function m(a, c, d, l, e, g, k, h) {
      return ["M", a + e, c, "L", a + d - g, c, "C", a + d - g / 2, c, a + d, c + g / 2, a + d, c + g, "L", a + d, c + l - k, "C", a + d, c + l - k / 2, a + d - k / 2, c + l, a + d - k, c + l, "L", a + h, c + l, "C", a + h / 2, c + l, a, c + l - h / 2, a, c + l - h, "L", a, c + e, "C", a, c + e / 2, a + e / 2, c, a + e, c, "Z"]
    }
    var n = a.Chart,
      k = a.defaultOptions,
      d = a.each,
      g = a.extend,
      t = a.merge,
      v = a.pick,
      u = a.Renderer,
      q = a.SVGRenderer,
      c = a.VMLRenderer;
    g(k.lang, {
      zoomIn: "Zoom in",
      zoomOut: "Zoom out"
    });
    k.mapNavigation = {
      buttonOptions: {
        alignTo: "plotBox",
        align: "left",
        verticalAlign: "top",
        x: 0,
        width: 18,
        height: 18,
        padding: 5,
        style: {
          fontSize: "15px",
          fontWeight: "bold"
        },
        theme: {
          "stroke-width": 1,
          "text-align": "center"
        }
      },
      buttons: {
        zoomIn: {
          onclick: function() {
            this.mapZoom(.5)
          },
          text: "+",
          y: 0
        },
        zoomOut: {
          onclick: function() {
            this.mapZoom(2)
          },
          text: "-",
          y: 28
        }
      },
      mouseWheelSensitivity: 1.1
    };
    a.splitPath = function(a) {
      var b;
      a = a.replace(/([A-Za-z])/g, " $1 ");
      a = a.replace(/^\s*/, "").replace(/\s*$/, "");
      a = a.split(/[ ,]+/);
      for (b = 0; b < a.length; b++) /[a-zA-Z]/.test(a[b]) || (a[b] = parseFloat(a[b]));
      return a
    };
    a.maps = {};
    q.prototype.symbols.topbutton = function(a, c, d, l, e) {
      return m(a - 1, c - 1, d, l, e.r, e.r, 0, 0)
    };
    q.prototype.symbols.bottombutton = function(a, c, d, l, e) {
      return m(a - 1, c - 1, d, l, 0, 0, e.r, e.r)
    };
    u === c && d(["topbutton", "bottombutton"], function(a) {
      c.prototype.symbols[a] = q.prototype.symbols[a]
    });
    a.Map = a.mapChart = function(b, c, d) {
      var f = "string" ===
        typeof b || b.nodeName,
        e = arguments[f ? 1 : 0],
        g = {
          endOnTick: !1,
          visible: !1,
          minPadding: 0,
          maxPadding: 0,
          startOnTick: !1
        },
        k, h = a.getOptions().credits;
      k = e.series;
      e.series = null;
      e = t({
        chart: {
          panning: "xy",
          type: "map"
        },
        credits: {
          mapText: v(h.mapText, ' \u00a9 \x3ca href\x3d"{geojson.copyrightUrl}"\x3e{geojson.copyrightShort}\x3c/a\x3e'),
          mapTextFull: v(h.mapTextFull, "{geojson.copyright}")
        },
        tooltip: {
          followTouchMove: !1
        },
        xAxis: g,
        yAxis: t(g, {
          reversed: !0
        })
      }, e, {
        chart: {
          inverted: !1,
          alignTicks: !1
        }
      });
      e.series = k;
      return f ? new n(b, e, d) :
        new n(e, c)
    }
  })(v)
});;
/*! RESOURCE: /scripts/highcharts/modules/treemap.js */
(function(q) {
  "object" === typeof module && module.exports ? module.exports = q : q(Highcharts)
})(function(q) {
    (function(g) {
        var q = g.seriesType,
          l = g.seriesTypes,
          E = g.map,
          v = g.merge,
          y = g.extend,
          z = g.noop,
          n = g.each,
          x = g.grep,
          F = g.isNumber,
          A = g.isString,
          k = g.pick,
          r = g.Series,
          G = g.stableSort,
          B = g.Color,
          H = function(a, b, c) {
            var e;
            c = c || this;
            for (e in a) a.hasOwnProperty(e) && b.call(c, a[e], e, a)
          },
          C = function(a, b, c, e) {
            e = e || this;
            a = a || [];
            n(a, function(d, f) {
              c = b.call(e, c, d, f, a)
            });
            return c
          },
          w = function(a, b, c) {
            c = c || this;
            a = b.call(c, a);
            !1 !== a && w(a,
              b, c)
          };
        q("treemap", "scatter", {
              showInLegend: !1,
              marker: !1,
              dataLabels: {
                enabled: !0,
                defer: !1,
                verticalAlign: "middle",
                formatter: function() {
                  return this.point.name || this.point.id
                },
                inside: !0
              },
              tooltip: {
                headerFormat: "",
                pointFormat: "\x3cb\x3e{point.name}\x3c/b\x3e: {point.value}\x3c/b\x3e\x3cbr/\x3e"
              },
              layoutAlgorithm: "sliceAndDice",
              layoutStartingDirection: "vertical",
              alternateStartingDirection: !1,
              levelIsConstant: !0,
              drillUpButton: {
                position: {
                  align: "right",
                  x: -10,
                  y: 10
                }
              },
              borderColor: "#e6e6e6",
              borderWidth: 1,
              opacity: .15,
              states: {
                hover: {
                  borderColor: "#999999",
                  brightness: l.heatmap ? 0 : .1,
                  opacity: .75,
                  shadow: !1
                }
              }
            }, {
              pointArrayMap: ["value"],
              axisTypes: l.heatmap ? ["xAxis", "yAxis", "colorAxis"] : ["xAxis", "yAxis"],
              optionalAxis: "colorAxis",
              getSymbol: z,
              parallelArrays: ["x", "y", "value", "colorValue"],
              colorKey: "colorValue",
              translateColors: l.heatmap && l.heatmap.prototype.translateColors,
              trackerGroups: ["group", "dataLabelsGroup"],
              getListOfParents: function(a, b) {
                a = C(a, function(a, b, d) {
                  b = k(b.parent, "");
                  void 0 === a[b] && (a[b] = []);
                  a[b].push(d);
                  return a
                }, {});
                H(a, function(a, e, d) {
                  "" !== e && -1 === g.inArray(e, b) && (n(a, function(a) {
                    d[""].push(a)
                  }), delete d[e])
                });
                return a
              },
              getTree: function() {
                var a = E(this.data, function(a) {
                    return a.id
                  }),
                  a = this.getListOfParents(this.data, a);
                this.nodeMap = [];
                return this.buildNode("", -1, 0, a, null)
              },
              init: function(a, b) {
                r.prototype.init.call(this, a, b);
                this.options.allowDrillToNode && g.addEvent(this, "click", this.onClickDrillToNode)
              },
              buildNode: function(a, b, c, e, d) {
                var f = this,
                  h = [],
                  D = f.points[b],
                  p;
                n(e[a] || [], function(b) {
                  p = f.buildNode(f.points[b].id,
                    b, c + 1, e, a);
                  h.push(p)
                });
                b = {
                  id: a,
                  i: b,
                  children: h,
                  level: c,
                  parent: d,
                  visible: !1
                };
                f.nodeMap[b.id] = b;
                D && (D.node = b);
                return b
              },
              setTreeValues: function(a) {
                var b = this,
                  c = b.options,
                  e = 0,
                  d = [],
                  f, h = b.points[a.i];
                w(b.nodeMap[b.rootNode], function(a) {
                  var c = !1,
                    d = a.parent;
                  a.visible = !0;
                  if (d || "" === d) c = b.nodeMap[d];
                  return c
                });
                w(b.nodeMap[b.rootNode].children, function(a) {
                  var b = !1;
                  n(a, function(a) {
                    a.visible = !0;
                    a.children.length && (b = (b || []).concat(a.children))
                  });
                  return b
                });
                n(a.children, function(a) {
                  a = b.setTreeValues(a);
                  d.push(a);
                  a.ignore ? w(a.children, function(a) {
                    var b = !1;
                    n(a, function(a) {
                      y(a, {
                        ignore: !0,
                        isLeaf: !1,
                        visible: !1
                      });
                      a.children.length && (b = (b || []).concat(a.children))
                    });
                    return b
                  }) : e += a.val
                });
                G(d, function(a, b) {
                  return a.sortIndex - b.sortIndex
                });
                f = k(h && h.options.value, e);
                h && (h.value = f);
                y(a, {
                  children: d,
                  childrenTotal: e,
                  ignore: !(k(h && h.visible, !0) && 0 < f),
                  isLeaf: a.visible && !e,
                  levelDynamic: c.levelIsConstant ? a.level : a.level - b.nodeMap[b.rootNode].level,
                  name: k(h && h.name, ""),
                  sortIndex: k(h && h.sortIndex, -f),
                  val: f
                });
                return a
              },
              calculateChildrenAreas: function(a,
                b) {
                var c = this,
                  e = c.options,
                  d = this.levelMap[a.levelDynamic + 1],
                  f = k(c[d && d.layoutAlgorithm] && d.layoutAlgorithm, e.layoutAlgorithm),
                  h = e.alternateStartingDirection,
                  g = [];
                a = x(a.children, function(a) {
                  return !a.ignore
                });
                d && d.layoutStartingDirection && (b.direction = "vertical" === d.layoutStartingDirection ? 0 : 1);
                g = c[f](b, a);
                n(a, function(a, d) {
                  d = g[d];
                  a.values = v(d, {
                    val: a.childrenTotal,
                    direction: h ? 1 - b.direction : b.direction
                  });
                  a.pointValues = v(d, {
                    x: d.x / c.axisRatio,
                    width: d.width / c.axisRatio
                  });
                  a.children.length && c.calculateChildrenAreas(a,
                    a.values)
                })
              },
              setPointValues: function() {
                var a = this,
                  b = a.xAxis,
                  c = a.yAxis;
                n(a.points, function(e) {
                  var d = e.node,
                    f = d.pointValues,
                    h, g, p = (a.pointAttribs(e)["stroke-width"] || 0) % 2 / 2;
                  f && d.visible ? (d = Math.round(b.translate(f.x, 0, 0, 0, 1)) - p, h = Math.round(b.translate(f.x + f.width, 0, 0, 0, 1)) - p, g = Math.round(c.translate(f.y, 0, 0, 0, 1)) - p, f = Math.round(c.translate(f.y + f.height, 0, 0, 0, 1)) - p, e.shapeType = "rect", e.shapeArgs = {
                      x: Math.min(d, h),
                      y: Math.min(g, f),
                      width: Math.abs(h - d),
                      height: Math.abs(f - g)
                    }, e.plotX = e.shapeArgs.x + e.shapeArgs.width /
                    2, e.plotY = e.shapeArgs.y + e.shapeArgs.height / 2) : (delete e.plotX, delete e.plotY)
                })
              },
              setColorRecursive: function(a, b, c) {
                var e = this,
                  d, f;
                a && (d = e.points[a.i], f = e.levelMap[a.levelDynamic], b = k(d && d.options.color, f && f.color, b), c = k(d && d.options.colorIndex, f && f.colorIndex, c), d && (d.color = b, d.colorIndex = c), a.children.length && n(a.children, function(a) {
                  e.setColorRecursive(a, b, c)
                }))
              },
              algorithmGroup: function(a, b, c, e) {
                this.height = a;
                this.width = b;
                this.plot = e;
                this.startDirection = this.direction = c;
                this.lH = this.nH = this.lW =
                  this.nW = this.total = 0;
                this.elArr = [];
                this.lP = {
                  total: 0,
                  lH: 0,
                  nH: 0,
                  lW: 0,
                  nW: 0,
                  nR: 0,
                  lR: 0,
                  aspectRatio: function(a, b) {
                    return Math.max(a / b, b / a)
                  }
                };
                this.addElement = function(a) {
                  this.lP.total = this.elArr[this.elArr.length - 1];
                  this.total += a;
                  0 === this.direction ? (this.lW = this.nW, this.lP.lH = this.lP.total / this.lW, this.lP.lR = this.lP.aspectRatio(this.lW, this.lP.lH), this.nW = this.total / this.height, this.lP.nH = this.lP.total / this.nW, this.lP.nR = this.lP.aspectRatio(this.nW, this.lP.nH)) : (this.lH = this.nH, this.lP.lW = this.lP.total /
                    this.lH, this.lP.lR = this.lP.aspectRatio(this.lP.lW, this.lH), this.nH = this.total / this.width, this.lP.nW = this.lP.total / this.nH, this.lP.nR = this.lP.aspectRatio(this.lP.nW, this.nH));
                  this.elArr.push(a)
                };
                this.reset = function() {
                  this.lW = this.nW = 0;
                  this.elArr = [];
                  this.total = 0
                }
              },
              algorithmCalcPoints: function(a, b, c, e) {
                var d, f, h, g, p = c.lW,
                  k = c.lH,
                  m = c.plot,
                  l, t = 0,
                  u = c.elArr.length - 1;
                b ? (p = c.nW, k = c.nH) : l = c.elArr[c.elArr.length - 1];
                n(c.elArr, function(a) {
                  if (b || t < u) 0 === c.direction ? (d = m.x, f = m.y, h = p, g = a / h) : (d = m.x, f = m.y, g = k, h = a / g),
                    e.push({
                      x: d,
                      y: f,
                      width: h,
                      height: g
                    }), 0 === c.direction ? m.y += g : m.x += h;
                  t += 1
                });
                c.reset();
                0 === c.direction ? c.width -= p : c.height -= k;
                m.y = m.parent.y + (m.parent.height - c.height);
                m.x = m.parent.x + (m.parent.width - c.width);
                a && (c.direction = 1 - c.direction);
                b || c.addElement(l)
              },
              algorithmLowAspectRatio: function(a, b, c) {
                var e = [],
                  d = this,
                  f, g = {
                    x: b.x,
                    y: b.y,
                    parent: b
                  },
                  k = 0,
                  p = c.length - 1,
                  l = new this.algorithmGroup(b.height, b.width, b.direction, g);
                n(c, function(c) {
                  f = c.val / b.val * b.height * b.width;
                  l.addElement(f);
                  l.lP.nR > l.lP.lR && d.algorithmCalcPoints(a, !1, l, e, g);
                  k === p && d.algorithmCalcPoints(a, !0, l, e, g);
                  k += 1
                });
                return e
              },
              algorithmFill: function(a, b, c) {
                var e = [],
                  d, f = b.direction,
                  g = b.x,
                  k = b.y,
                  l = b.width,
                  q = b.height,
                  m, r, t, u;
                n(c, function(c) {
                  d = c.val / b.val * b.height * b.width;
                  m = g;
                  r = k;
                  0 === f ? (u = q, t = d / u, l -= t, g += t) : (t = l, u = d / t, q -= u, k += u);
                  e.push({
                    x: m,
                    y: r,
                    width: t,
                    height: u
                  });
                  a && (f = 1 - f)
                });
                return e
              },
              strip: function(a, b) {
                return this.algorithmLowAspectRatio(!1, a, b)
              },
              squarified: function(a, b) {
                return this.algorithmLowAspectRatio(!0, a, b)
              },
              sliceAndDice: function(a, b) {
                return this.algorithmFill(!0,
                  a, b)
              },
              stripes: function(a, b) {
                return this.algorithmFill(!1, a, b)
              },
              translate: function() {
                var a = this.rootNode = k(this.rootNode, this.options.rootId, ""),
                  b, c;
                r.prototype.translate.call(this);
                this.levelMap = C(this.options.levels, function(a, b) {
                  a[b.level] = b;
                  return a
                }, {});
                c = this.tree = this.getTree();
                b = this.nodeMap[a];
                "" === a || b && b.children.length || (this.drillToNode("", !1), a = this.rootNode, b = this.nodeMap[a]);
                this.setTreeValues(c);
                this.axisRatio = this.xAxis.len / this.yAxis.len;
                this.nodeMap[""].pointValues = a = {
                  x: 0,
                  y: 0,
                  width: 100,
                  height: 100
                };
                this.nodeMap[""].values = a = v(a, {
                  width: a.width * this.axisRatio,
                  direction: "vertical" === this.options.layoutStartingDirection ? 0 : 1,
                  val: c.val
                });
                this.calculateChildrenAreas(c, a);
                this.colorAxis ? this.translateColors() : this.options.colorByPoint || this.setColorRecursive(this.tree);
                this.options.allowDrillToNode && (b = b.pointValues, this.xAxis.setExtremes(b.x, b.x + b.width, !1), this.yAxis.setExtremes(b.y, b.y + b.height, !1), this.xAxis.setScale(), this.yAxis.setScale());
                this.setPointValues()
              },
              drawDataLabels: function() {
                  var a =
                    this,
                    b = x(a.points, function(a) {
                      return a.node.visible
                    }),
                    c, e;
                  n(b, function(b) {
                        e = a.levelMap[b.node.levelDynamic];
                        c = {
                          style: {}
                        };
                        b.node.isLeaf || (c.ena