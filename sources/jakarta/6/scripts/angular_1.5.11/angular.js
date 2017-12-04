/*! RESOURCE: /scripts/angular_1.5.11/angular.js */
(function(window) {
    'use strict';

    function minErr(module, ErrorConstructor) {
      ErrorConstructor = ErrorConstructor || Error;
      return function() {
        var SKIP_INDEXES = 2;
        var templateArgs = arguments,
          code = templateArgs[0],
          message = '[' + (module ? module + ':' : '') + code + '] ',
          template = templateArgs[1],
          paramPrefix, i;
        message += template.replace(/\{\d+\}/g, function(match) {
          var index = +match.slice(1, -1),
            shiftedIndex = index + SKIP_INDEXES;
          if (shiftedIndex < templateArgs.length) {
            return toDebugString(templateArgs[shiftedIndex]);
          }
          return match;
        });
        message += '\nhttp://errors.angularjs.org/1.5.11/' +
          (module ? module + '/' : '') + code;
        for (i = SKIP_INDEXES, paramPrefix = '?'; i < templateArgs.length; i++, paramPrefix = '&') {
          message += paramPrefix + 'p' + (i - SKIP_INDEXES) + '=' +
            encodeURIComponent(toDebugString(templateArgs[i]));
        }
        return new ErrorConstructor(message);
      };
    }
    var REGEX_STRING_REGEXP = /^\/(.+)\/([a-z]*)$/;
    var VALIDITY_STATE_PROPERTY = 'validity';
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var lowercase = function(string) {
      return isString(string) ? string.toLowerCase() : string;
    };
    var uppercase = function(string) {
      return isString(string) ? string.toUpperCase() : string;
    };
    var manualLowercase = function(s) {
      return isString(s) ?
        s.replace(/[A-Z]/g, function(ch) {
          return String.fromCharCode(ch.charCodeAt(0) | 32);
        }) :
        s;
    };
    var manualUppercase = function(s) {
      return isString(s) ?
        s.replace(/[a-z]/g, function(ch) {
          return String.fromCharCode(ch.charCodeAt(0) & ~32);
        }) :
        s;
    };
    if ('i' !== 'I'.toLowerCase()) {
      lowercase = manualLowercase;
      uppercase = manualUppercase;
    }
    var
      msie,
      jqLite,
      jQuery,
      slice = [].slice,
      splice = [].splice,
      push = [].push,
      toString = Object.prototype.toString,
      getPrototypeOf = Object.getPrototypeOf,
      ngMinErr = minErr('ng'),
      angular = window.angular || (window.angular = {}),
      angularModule,
      uid = 0;
    msie = window.document.documentMode;

    function isArrayLike(obj) {
      if (obj == null || isWindow(obj)) return false;
      if (isArray(obj) || isString(obj) || (jqLite && obj instanceof jqLite)) return true;
      var length = 'length' in Object(obj) && obj.length;
      return isNumber(length) &&
        (length >= 0 && ((length - 1) in obj || obj instanceof Array) || typeof obj.item === 'function');
    }

    function forEach(obj, iterator, context) {
      var key, length;
      if (obj) {
        if (isFunction(obj)) {
          for (key in obj) {
            if (key !== 'prototype' && key !== 'length' && key !== 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
              iterator.call(context, obj[key], key, obj);
            }
          }
        } else if (isArray(obj) || isArrayLike(obj)) {
          var isPrimitive = typeof obj !== 'object';
          for (key = 0, length = obj.length; key < length; key++) {
            if (isPrimitive || key in obj) {
              iterator.call(context, obj[key], key, obj);
            }
          }
        } else if (obj.forEach && obj.forEach !== forEach) {
          obj.forEach(iterator, context, obj);
        } else if (isBlankObject(obj)) {
          for (key in obj) {
            iterator.call(context, obj[key], key, obj);
          }
        } else if (typeof obj.hasOwnProperty === 'function') {
          for (key in obj) {
            if (obj.hasOwnProperty(key)) {
              iterator.call(context, obj[key], key, obj);
            }
          }
        } else {
          for (key in obj) {
            if (hasOwnProperty.call(obj, key)) {
              iterator.call(context, obj[key], key, obj);
            }
          }
        }
      }
      return obj;
    }

    function forEachSorted(obj, iterator, context) {
      var keys = Object.keys(obj).sort();
      for (var i = 0; i < keys.length; i++) {
        iterator.call(context, obj[keys[i]], keys[i]);
      }
      return keys;
    }

    function reverseParams(iteratorFn) {
      return function(value, key) {
        iteratorFn(key, value);
      };
    }

    function nextUid() {
      return ++uid;
    }

    function setHashKey(obj, h) {
      if (h) {
        obj.$$hashKey = h;
      } else {
        delete obj.$$hashKey;
      }
    }

    function baseExtend(dst, objs, deep) {
      var h = dst.$$hashKey;
      for (var i = 0, ii = objs.length; i < ii; ++i) {
        var obj = objs[i];
        if (!isObject(obj) && !isFunction(obj)) continue;
        var keys = Object.keys(obj);
        for (var j = 0, jj = keys.length; j < jj; j++) {
          var key = keys[j];
          var src = obj[key];
          if (deep && isObject(src)) {
            if (isDate(src)) {
              dst[key] = new Date(src.valueOf());
            } else if (isRegExp(src)) {
              dst[key] = new RegExp(src);
            } else if (src.nodeName) {
              dst[key] = src.cloneNode(true);
            } else if (isElement(src)) {
              dst[key] = src.clone();
            } else {
              if (!isObject(dst[key])) dst[key] = isArray(src) ? [] : {};
              baseExtend(dst[key], [src], true);
            }
          } else {
            dst[key] = src;
          }
        }
      }
      setHashKey(dst, h);
      return dst;
    }

    function extend(dst) {
      return baseExtend(dst, slice.call(arguments, 1), false);
    }

    function merge(dst) {
      return baseExtend(dst, slice.call(arguments, 1), true);
    }

    function toInt(str) {
      return parseInt(str, 10);
    }
    var isNumberNaN = Number.isNaN || function isNumberNaN(num) {
      return num !== num;
    };

    function inherit(parent, extra) {
      return extend(Object.create(parent), extra);
    }

    function noop() {}
    noop.$inject = [];

    function identity($) {
      return $;
    }
    identity.$inject = [];

    function valueFn(value) {
      return function valueRef() {
        return value;
      };
    }

    function hasCustomToString(obj) {
      return isFunction(obj.toString) && obj.toString !== toString;
    }

    function isUndefined(value) {
      return typeof value === 'undefined';
    }

    function isDefined(value) {
      return typeof value !== 'undefined';
    }

    function isObject(value) {
      return value !== null && typeof value === 'object';
    }

    function isBlankObject(value) {
      return value !== null && typeof value === 'object' && !getPrototypeOf(value);
    }

    function isString(value) {
      return typeof value === 'string';
    }

    function isNumber(value) {
      return typeof value === 'number';
    }

    function isDate(value) {
      return toString.call(value) === '[object Date]';
    }
    var isArray = Array.isArray;

    function isFunction(value) {
      return typeof value === 'function';
    }

    function isRegExp(value) {
      return toString.call(value) === '[object RegExp]';
    }

    function isWindow(obj) {
      return obj && obj.window === obj;
    }

    function isScope(obj) {
      return obj && obj.$evalAsync && obj.$watch;
    }

    function isFile(obj) {
      return toString.call(obj) === '[object File]';
    }

    function isFormData(obj) {
      return toString.call(obj) === '[object FormData]';
    }

    function isBlob(obj) {
      return toString.call(obj) === '[object Blob]';
    }

    function isBoolean(value) {
      return typeof value === 'boolean';
    }

    function isPromiseLike(obj) {
      return obj && isFunction(obj.then);
    }
    var TYPED_ARRAY_REGEXP = /^\[object (?:Uint8|Uint8Clamped|Uint16|Uint32|Int8|Int16|Int32|Float32|Float64)Array]$/;

    function isTypedArray(value) {
      return value && isNumber(value.length) && TYPED_ARRAY_REGEXP.test(toString.call(value));
    }

    function isArrayBuffer(obj) {
      return toString.call(obj) === '[object ArrayBuffer]';
    }
    var trim = function(value) {
      return isString(value) ? value.trim() : value;
    };
    var escapeForRegexp = function(s) {
      return s
        .replace(/([-()[\]{}+?*.$^|,:#<!\\])/g, '\\$1')
        .replace(/\x08/g, '\\x08');
    };

    function isElement(node) {
      return !!(node &&
        (node.nodeName ||
          (node.prop && node.attr && node.find)));
    }

    function makeMap(str) {
      var obj = {},
        items = str.split(','),
        i;
      for (i = 0; i < items.length; i++) {
        obj[items[i]] = true;
      }
      return obj;
    }

    function nodeName_(element) {
      return lowercase(element.nodeName || (element[0] && element[0].nodeName));
    }

    function includes(array, obj) {
      return Array.prototype.indexOf.call(array, obj) !== -1;
    }

    function arrayRemove(array, value) {
      var index = array.indexOf(value);
      if (index >= 0) {
        array.splice(index, 1);
      }
      return index;
    }

    function copy(source, destination) {
      var stackSource = [];
      var stackDest = [];
      if (destination) {
        if (isTypedArray(destination) || isArrayBuffer(destination)) {
          throw ngMinErr('cpta', 'Can\'t copy! TypedArray destination cannot be mutated.');
        }
        if (source === destination) {
          throw ngMinErr('cpi', 'Can\'t copy! Source and destination are identical.');
        }
        if (isArray(destination)) {
          destination.length = 0;
        } else {
          forEach(destination, function(value, key) {
            if (key !== '$$hashKey') {
              delete destination[key];
            }
          });
        }
        stackSource.push(source);
        stackDest.push(destination);
        return copyRecurse(source, destination);
      }
      return copyElement(source);

      function copyRecurse(source, destination) {
        var h = destination.$$hashKey;
        var key;
        if (isArray(source)) {
          for (var i = 0, ii = source.length; i < ii; i++) {
            destination.push(copyElement(source[i]));
          }
        } else if (isBlankObject(source)) {
          for (key in source) {
            destination[key] = copyElement(source[key]);
          }
        } else if (source && typeof source.hasOwnProperty === 'function') {
          for (key in source) {
            if (source.hasOwnProperty(key)) {
              destination[key] = copyElement(source[key]);
            }
          }
        } else {
          for (key in source) {
            if (hasOwnProperty.call(source, key)) {
              destination[key] = copyElement(source[key]);
            }
          }
        }
        setHashKey(destination, h);
        return destination;
      }

      function copyElement(source) {
        if (!isObject(source)) {
          return source;
        }
        var index = stackSource.indexOf(source);
        if (index !== -1) {
          return stackDest[index];
        }
        if (isWindow(source) || isScope(source)) {
          throw ngMinErr('cpws',
            'Can\'t copy! Making copies of Window or Scope instances is not supported.');
        }
        var needsRecurse = false;
        var destination = copyType(source);
        if (destination === undefined) {
          destination = isArray(source) ? [] : Object.create(getPrototypeOf(source));
          needsRecurse = true;
        }
        stackSource.push(source);
        stackDest.push(destination);
        return needsRecurse ?
          copyRecurse(source, destination) :
          destination;
      }

      function copyType(source) {
        switch (toString.call(source)) {
          case '[object Int8Array]':
          case '[object Int16Array]':
          case '[object Int32Array]':
          case '[object Float32Array]':
          case '[object Float64Array]':
          case '[object Uint8Array]':
          case '[object Uint8ClampedArray]':
          case '[object Uint16Array]':
          case '[object Uint32Array]':
            return new source.constructor(copyElement(source.buffer), source.byteOffset, source.length);
          case '[object ArrayBuffer]':
            if (!source.slice) {
              var copied = new ArrayBuffer(source.byteLength);
              new Uint8Array(copied).set(new Uint8Array(source));
              return copied;
            }
            return source.slice(0);
          case '[object Boolean]':
          case '[object Number]':
          case '[object String]':
          case '[object Date]':
            return new source.constructor(source.valueOf());
          case '[object RegExp]':
            var re = new RegExp(source.source, source.toString().match(/[^/]*$/)[0]);
            re.lastIndex = source.lastIndex;
            return re;
          case '[object Blob]':
            return new source.constructor([source], {
              type: source.type
            });
        }
        if (isFunction(source.cloneNode)) {
          return source.cloneNode(true);
        }
      }
    }

    function equals(o1, o2) {
      if (o1 === o2) return true;
      if (o1 === null || o2 === null) return false;
      if (o1 !== o1 && o2 !== o2) return true;
      var t1 = typeof o1,
        t2 = typeof o2,
        length, key, keySet;
      if (t1 === t2 && t1 === 'object') {
        if (isArray(o1)) {
          if (!isArray(o2)) return false;
          if ((length = o1.length) === o2.length) {
            for (key = 0; key < length; key++) {
              if (!equals(o1[key], o2[key])) return false;
            }
            return true;
          }
        } else if (isDate(o1)) {
          if (!isDate(o2)) return false;
          return equals(o1.getTime(), o2.getTime());
        } else if (isRegExp(o1)) {
          if (!isRegExp(o2)) return false;
          return o1.toString() === o2.toString();
        } else {
          if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) ||
            isArray(o2) || isDate(o2) || isRegExp(o2)) return false;
          keySet = createMap();
          for (key in o1) {
            if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
            if (!equals(o1[key], o2[key])) return false;
            keySet[key] = true;
          }
          for (key in o2) {
            if (!(key in keySet) &&
              key.charAt(0) !== '$' &&
              isDefined(o2[key]) &&
              !isFunction(o2[key])) return false;
          }
          return true;
        }
      }
      return false;
    }
    var csp = function() {
      if (!isDefined(csp.rules)) {
        var ngCspElement = (window.document.querySelector('[ng-csp]') ||
          window.document.querySelector('[data-ng-csp]'));
        if (ngCspElement) {
          var ngCspAttribute = ngCspElement.getAttribute('ng-csp') ||
            ngCspElement.getAttribute('data-ng-csp');
          csp.rules = {
            noUnsafeEval: !ngCspAttribute || (ngCspAttribute.indexOf('no-unsafe-eval') !== -1),
            noInlineStyle: !ngCspAttribute || (ngCspAttribute.indexOf('no-inline-style') !== -1)
          };
        } else {
          csp.rules = {
            noUnsafeEval: noUnsafeEval(),
            noInlineStyle: false
          };
        }
      }
      return csp.rules;

      function noUnsafeEval() {
        try {
          new Function('');
          return false;
        } catch (e) {
          return true;
        }
      }
    };
    var jq = function() {
      if (isDefined(jq.name_)) return jq.name_;
      var el;
      var i, ii = ngAttrPrefixes.length,
        prefix, name;
      for (i = 0; i < ii; ++i) {
        prefix = ngAttrPrefixes[i];
        el = window.document.querySelector('[' + prefix.replace(':', '\\:') + 'jq]');
        if (el) {
          name = el.getAttribute(prefix + 'jq');
          break;
        }
      }
      return (jq.name_ = name);
    };

    function concat(array1, array2, index) {
      return array1.concat(slice.call(array2, index));
    }

    function sliceArgs(args, startIndex) {
      return slice.call(args, startIndex || 0);
    }

    function bind(self, fn) {
      var curryArgs = arguments.length > 2 ? sliceArgs(arguments, 2) : [];
      if (isFunction(fn) && !(fn instanceof RegExp)) {
        return curryArgs.length ?
          function() {
            return arguments.length ?
              fn.apply(self, concat(curryArgs, arguments, 0)) :
              fn.apply(self, curryArgs);
          } :
          function() {
            return arguments.length ?
              fn.apply(self, arguments) :
              fn.call(self);
          };
      } else {
        return fn;
      }
    }

    function toJsonReplacer(key, value) {
      var val = value;
      if (typeof key === 'string' && key.charAt(0) === '$' && key.charAt(1) === '$') {
        val = undefined;
      } else if (isWindow(value)) {
        val = '$WINDOW';
      } else if (value && window.document === value) {
        val = '$DOCUMENT';
      } else if (isScope(value)) {
        val = '$SCOPE';
      }
      return val;
    }

    function toJson(obj, pretty) {
      if (isUndefined(obj)) return undefined;
      if (!isNumber(pretty)) {
        pretty = pretty ? 2 : null;
      }
      return JSON.stringify(obj, toJsonReplacer, pretty);
    }

    function fromJson(json) {
      return isString(json) ?
        JSON.parse(json) :
        json;
    }
    var ALL_COLONS = /:/g;

    function timezoneToOffset(timezone, fallback) {
      timezone = timezone.replace(ALL_COLONS, '');
      var requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;
      return isNumberNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
    }

    function addDateMinutes(date, minutes) {
      date = new Date(date.getTime());
      date.setMinutes(date.getMinutes() + minutes);
      return date;
    }

    function convertTimezoneToLocal(date, timezone, reverse) {
      reverse = reverse ? -1 : 1;
      var dateTimezoneOffset = date.getTimezoneOffset();
      var timezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
      return addDateMinutes(date, reverse * (timezoneOffset - dateTimezoneOffset));
    }

    function startingTag(element) {
      element = jqLite(element).clone();
      try {
        element.empty();
      } catch (e) {}
      var elemHtml = jqLite('<div>').append(element).html();
      try {
        return element[0].nodeType === NODE_TYPE_TEXT ? lowercase(elemHtml) :
          elemHtml.
        match(/^(<[^>]+>)/)[1].
        replace(/^<([\w-]+)/, function(match, nodeName) {
          return '<' + lowercase(nodeName);
        });
      } catch (e) {
        return lowercase(elemHtml);
      }
    }

    function tryDecodeURIComponent(value) {
      try {
        return decodeURIComponent(value);
      } catch (e) {}
    }

    function parseKeyValue(keyValue) {
      var obj = {};
      forEach((keyValue || '').split('&'), function(keyValue) {
        var splitPoint, key, val;
        if (keyValue) {
          key = keyValue = keyValue.replace(/\+/g, '%20');
          splitPoint = keyValue.indexOf('=');
          if (splitPoint !== -1) {
            key = keyValue.substring(0, splitPoint);
            val = keyValue.substring(splitPoint + 1);
          }
          key = tryDecodeURIComponent(key);
          if (isDefined(key)) {
            val = isDefined(val) ? tryDecodeURIComponent(val) : true;
            if (!hasOwnProperty.call(obj, key)) {
              obj[key] = val;
            } else if (isArray(obj[key])) {
              obj[key].push(val);
            } else {
              obj[key] = [obj[key], val];
            }
          }
        }
      });
      return obj;
    }

    function toKeyValue(obj) {
      var parts = [];
      forEach(obj, function(value, key) {
        if (isArray(value)) {
          forEach(value, function(arrayValue) {
            parts.push(encodeUriQuery(key, true) +
              (arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
          });
        } else {
          parts.push(encodeUriQuery(key, true) +
            (value === true ? '' : '=' + encodeUriQuery(value, true)));
        }
      });
      return parts.length ? parts.join('&') : '';
    }

    function encodeUriSegment(val) {
      return encodeUriQuery(val, true).
      replace(/%26/gi, '&').
      replace(/%3D/gi, '=').
      replace(/%2B/gi, '+');
    }

    function encodeUriQuery(val, pctEncodeSpaces) {
      return encodeURIComponent(val).
      replace(/%40/gi, '@').
      replace(/%3A/gi, ':').
      replace(/%24/g, '$').
      replace(/%2C/gi, ',').
      replace(/%3B/gi, ';').
      replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
    }
    var ngAttrPrefixes = ['ng-', 'data-ng-', 'ng:', 'x-ng-'];

    function getNgAttribute(element, ngAttr) {
      var attr, i, ii = ngAttrPrefixes.length;
      for (i = 0; i < ii; ++i) {
        attr = ngAttrPrefixes[i] + ngAttr;
        if (isString(attr = element.getAttribute(attr))) {
          return attr;
        }
      }
      return null;
    }

    function allowAutoBootstrap(document) {
      var script = document.currentScript;
      var src = script && script.getAttribute('src');
      if (!src) {
        return true;
      }
      var link = document.createElement('a');
      link.href = src;
      if (document.location.origin === link.origin) {
        return true;
      }
      switch (link.protocol) {
        case 'http:':
        case 'https:':
        case 'ftp:':
        case 'blob:':
        case 'file:':
        case 'data:':
          return true;
        default:
          return false;
      }
    }
    var isAutoBootstrapAllowed = allowAutoBootstrap(window.document);

    function angularInit(element, bootstrap) {
      var appElement,
        module,
        config = {};
      forEach(ngAttrPrefixes, function(prefix) {
        var name = prefix + 'app';
        if (!appElement && element.hasAttribute && element.hasAttribute(name)) {
          appElement = element;
          module = element.getAttribute(name);
        }
      });
      forEach(ngAttrPrefixes, function(prefix) {
        var name = prefix + 'app';
        var candidate;
        if (!appElement && (candidate = element.querySelector('[' + name.replace(':', '\\:') + ']'))) {
          appElement = candidate;
          module = candidate.getAttribute(name);
        }
      });
      if (appElement) {
        if (!isAutoBootstrapAllowed) {
          window.console.error('Angular: disabling automatic bootstrap. <script> protocol indicates ' +
            'an extension, document.location.href does not match.');
          return;
        }
        config.strictDi = getNgAttribute(appElement, 'strict-di') !== null;
        bootstrap(appElement, module ? [module] : [], config);
      }
    }

    function bootstrap(element, modules, config) {
      if (!isObject(config)) config = {};
      var defaultConfig = {
        strictDi: false
      };
      config = extend(defaultConfig, config);
      var doBootstrap = function() {
        element = jqLite(element);
        if (element.injector()) {
          var tag = (element[0] === window.document) ? 'document' : startingTag(element);
          throw ngMinErr(
            'btstrpd',
            'App already bootstrapped with this element \'{0}\'',
            tag.replace(/</, '&lt;').replace(/>/, '&gt;'));
        }
        modules = modules || [];
        modules.unshift(['$provide', function($provide) {
          $provide.value('$rootElement', element);
        }]);
        if (config.debugInfoEnabled) {
          modules.push(['$compileProvider', function($compileProvider) {
            $compileProvider.debugInfoEnabled(true);
          }]);
        }
        modules.unshift('ng');
        var injector = createInjector(modules, config.strictDi);
        injector.invoke(['$rootScope', '$rootElement', '$compile', '$injector',
          function bootstrapApply(scope, element, compile, injector) {
            scope.$apply(function() {
              element.data('$injector', injector);
              compile(element)(scope);
            });
          }
        ]);
        return injector;
      };
      var NG_ENABLE_DEBUG_INFO = /^NG_ENABLE_DEBUG_INFO!/;
      var NG_DEFER_BOOTSTRAP = /^NG_DEFER_BOOTSTRAP!/;
      if (window && NG_ENABLE_DEBUG_INFO.test(window.name)) {
        config.debugInfoEnabled = true;
        window.name = window.name.replace(NG_ENABLE_DEBUG_INFO, '');
      }
      if (window && !NG_DEFER_BOOTSTRAP.test(window.name)) {
        return doBootstrap();
      }
      window.name = window.name.replace(NG_DEFER_BOOTSTRAP, '');
      angular.resumeBootstrap = function(extraModules) {
        forEach(extraModules, function(module) {
          modules.push(module);
        });
        return doBootstrap();
      };
      if (isFunction(angular.resumeDeferredBootstrap)) {
        angular.resumeDeferredBootstrap();
      }
    }

    function reloadWithDebugInfo() {
      window.name = 'NG_ENABLE_DEBUG_INFO!' + window.name;
      window.location.reload();
    }

    function getTestability(rootElement) {
      var injector = angular.element(rootElement).injector();
      if (!injector) {
        throw ngMinErr('test',
          'no injector found for element argument to getTestability');
      }
      return injector.get('$$testability');
    }
    var SNAKE_CASE_REGEXP = /[A-Z]/g;

    function snake_case(name, separator) {
      separator = separator || '_';
      return name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
        return (pos ? separator : '') + letter.toLowerCase();
      });
    }
    var bindJQueryFired = false;

    function bindJQuery() {
      var originalCleanData;
      if (bindJQueryFired) {
        return;
      }
      var jqName = jq();
      jQuery = isUndefined(jqName) ? window.jQuery :
        !jqName ? undefined :
        window[jqName];
      if (jQuery && jQuery.fn.on) {
        jqLite = jQuery;
        extend(jQuery.fn, {
          scope: JQLitePrototype.scope,
          isolateScope: JQLitePrototype.isolateScope,
          controller: JQLitePrototype.controller,
          injector: JQLitePrototype.injector,
          inheritedData: JQLitePrototype.inheritedData
        });
        originalCleanData = jQuery.cleanData;
        jQuery.cleanData = function(elems) {
          var events;
          for (var i = 0, elem;
            (elem = elems[i]) != null; i++) {
            events = jQuery._data(elem, 'events');
            if (events && events.$destroy) {
              jQuery(elem).triggerHandler('$destroy');
            }
          }
          originalCleanData(elems);
        };
      } else {
        jqLite = JQLite;
      }
      angular.element = jqLite;
      bindJQueryFired = true;
    }

    function assertArg(arg, name, reason) {
      if (!arg) {
        throw ngMinErr('areq', 'Argument \'{0}\' is {1}', (name || '?'), (reason || 'required'));
      }
      return arg;
    }

    function assertArgFn(arg, name, acceptArrayAnnotation) {
      if (acceptArrayAnnotation && isArray(arg)) {
        arg = arg[arg.length - 1];
      }
      assertArg(isFunction(arg), name, 'not a function, got ' +
        (arg && typeof arg === 'object' ? arg.constructor.name || 'Object' : typeof arg));
      return arg;
    }

    function assertNotHasOwnProperty(name, context) {
      if (name === 'hasOwnProperty') {
        throw ngMinErr('badname', 'hasOwnProperty is not a valid {0} name', context);
      }
    }

    function getter(obj, path, bindFnToScope) {
      if (!path) return obj;
      var keys = path.split('.');
      var key;
      var lastInstance = obj;
      var len = keys.length;
      for (var i = 0; i < len; i++) {
        key = keys[i];
        if (obj) {
          obj = (lastInstance = obj)[key];
        }
      }
      if (!bindFnToScope && isFunction(obj)) {
        return bind(lastInstance, obj);
      }
      return obj;
    }

    function getBlockNodes(nodes) {
      var node = nodes[0];
      var endNode = nodes[nodes.length - 1];
      var blockNodes;
      for (var i = 1; node !== endNode && (node = node.nextSibling); i++) {
        if (blockNodes || nodes[i] !== node) {
          if (!blockNodes) {
            blockNodes = jqLite(slice.call(nodes, 0, i));
          }
          blockNodes.push(node);
        }
      }
      return blockNodes || nodes;
    }

    function createMap() {
      return Object.create(null);
    }
    var NODE_TYPE_ELEMENT = 1;
    var NODE_TYPE_ATTRIBUTE = 2;
    var NODE_TYPE_TEXT = 3;
    var NODE_TYPE_COMMENT = 8;
    var NODE_TYPE_DOCUMENT = 9;
    var NODE_TYPE_DOCUMENT_FRAGMENT = 11;

    function setupModuleLoader(window) {
      var $injectorMinErr = minErr('$injector');
      var ngMinErr = minErr('ng');

      function ensure(obj, name, factory) {
        return obj[name] || (obj[name] = factory());
      }
      var angular = ensure(window, 'angular', Object);
      angular.$$minErr = angular.$$minErr || minErr;
      return ensure(angular, 'module', function() {
        var modules = {};
        return function module(name, requires, configFn) {
          var assertNotHasOwnProperty = function(name, context) {
            if (name === 'hasOwnProperty') {
              throw ngMinErr('badname', 'hasOwnProperty is not a valid {0} name', context);
            }
          };
          assertNotHasOwnProperty(name, 'module');
          if (requires && modules.hasOwnProperty(name)) {
            modules[name] = null;
          }
          return ensure(modules, name, function() {
            if (!requires) {
              throw $injectorMinErr('nomod', 'Module \'{0}\' is not available! You either misspelled ' +
                'the module name or forgot to load it. If registering a module ensure that you ' +
                'specify the dependencies as the second argument.', name);
            }
            var invokeQueue = [];
            var configBlocks = [];
            var runBlocks = [];
            var config = invokeLater('$injector', 'invoke', 'push', configBlocks);
            var moduleInstance = {
              _invokeQueue: invokeQueue,
              _configBlocks: configBlocks,
              _runBlocks: runBlocks,
              requires: requires,
              name: name,
              provider: invokeLaterAndSetModuleName('$provide', 'provider'),
              factory: invokeLaterAndSetModuleName('$provide', 'factory'),
              service: invokeLaterAndSetModuleName('$provide', 'service'),
              value: invokeLater('$provide', 'value'),
              constant: invokeLater('$provide', 'constant', 'unshift'),
              decorator: invokeLaterAndSetModuleName('$provide', 'decorator'),
              animation: invokeLaterAndSetModuleName('$animateProvider', 'register'),
              filter: invokeLaterAndSetModuleName('$filterProvider', 'register'),
              controller: invokeLaterAndSetModuleName('$controllerProvider', 'register'),
              directive: invokeLaterAndSetModuleName('$compileProvider', 'directive'),
              component: invokeLaterAndSetModuleName('$compileProvider', 'component'),
              config: config,
              run: function(block) {
                runBlocks.push(block);
                return this;
              }
            };
            if (configFn) {
              config(configFn);
            }
            return moduleInstance;

            function invokeLater(provider, method, insertMethod, queue) {
              if (!queue) queue = invokeQueue;
              return function() {
                queue[insertMethod || 'push']([provider, method, arguments]);
                return moduleInstance;
              };
            }

            function invokeLaterAndSetModuleName(provider, method) {
              return function(recipeName, factoryFunction) {
                if (factoryFunction && isFunction(factoryFunction)) factoryFunction.$$moduleName = name;
                invokeQueue.push([provider, method, arguments]);
                return moduleInstance;
              };
            }
          });
        };
      });
    }

    function shallowCopy(src, dst) {
      if (isArray(src)) {
        dst = dst || [];
        for (var i = 0, ii = src.length; i < ii; i++) {
          dst[i] = src[i];
        }
      } else if (isObject(src)) {
        dst = dst || {};
        for (var key in src) {
          if (!(key.charAt(0) === '$' && key.charAt(1) === '$')) {
            dst[key] = src[key];
          }
        }
      }
      return dst || src;
    }

    function serializeObject(obj) {
      var seen = [];
      return JSON.stringify(obj, function(key, val) {
        val = toJsonReplacer(key, val);
        if (isObject(val)) {
          if (seen.indexOf(val) >= 0) return '...';
          seen.push(val);
        }
        return val;
      });
    }

    function toDebugString(obj) {
      if (typeof obj === 'function') {
        return obj.toString().replace(/ \{[\s\S]*$/, '');
      } else if (isUndefined(obj)) {
        return 'undefined';
      } else if (typeof obj !== 'string') {
        return serializeObject(obj);
      }
      return obj;
    }
    var version = {
      full: '1.5.11',
      major: 1,
      minor: 5,
      dot: 11,
      codeName: 'princely-quest'
    };

    function publishExternalAPI(angular) {
      extend(angular, {
        'bootstrap': bootstrap,
        'copy': copy,
        'extend': extend,
        'merge': merge,
        'equals': equals,
        'element': jqLite,
        'forEach': forEach,
        'injector': createInjector,
        'noop': noop,
        'bind': bind,
        'toJson': toJson,
        'fromJson': fromJson,
        'identity': identity,
        'isUndefined': isUndefined,
        'isDefined': isDefined,
        'isString': isString,
        'isFunction': isFunction,
        'isObject': isObject,
        'isNumber': isNumber,
        'isElement': isElement,
        'isArray': isArray,
        'version': version,
        'isDate': isDate,
        'lowercase': lowercase,
        'uppercase': uppercase,
        'callbacks': {
          $$counter: 0
        },
        'getTestability': getTestability,
        '$$minErr': minErr,
        '$$csp': csp,
        'reloadWithDebugInfo': reloadWithDebugInfo
      });
      angularModule = setupModuleLoader(window);
      angularModule('ng', ['ngLocale'], ['$provide',
        function ngModule($provide) {
          $provide.provider({
            $$sanitizeUri: $$SanitizeUriProvider
          });
          $provide.provider('$compile', $CompileProvider).
          directive({
            a: htmlAnchorDirective,
            input: inputDirective,
            textarea: inputDirective,
            form: formDirective,
            script: scriptDirective,
            select: selectDirective,
            option: optionDirective,
            ngBind: ngBindDirective,
            ngBindHtml: ngBindHtmlDirective,
            ngBindTemplate: ngBindTemplateDirective,
            ngClass: ngClassDirective,
            ngClassEven: ngClassEvenDirective,
            ngClassOdd: ngClassOddDirective,
            ngCloak: ngCloakDirective,
            ngController: ngControllerDirective,
            ngForm: ngFormDirective,
            ngHide: ngHideDirective,
            ngIf: ngIfDirective,
            ngInclude: ngIncludeDirective,
            ngInit: ngInitDirective,
            ngNonBindable: ngNonBindableDirective,
            ngPluralize: ngPluralizeDirective,
            ngRepeat: ngRepeatDirective,
            ngShow: ngShowDirective,
            ngStyle: ngStyleDirective,
            ngSwitch: ngSwitchDirective,
            ngSwitchWhen: ngSwitchWhenDirective,
            ngSwitchDefault: ngSwitchDefaultDirective,
            ngOptions: ngOptionsDirective,
            ngTransclude: ngTranscludeDirective,
            ngModel: ngModelDirective,
            ngList: ngListDirective,
            ngChange: ngChangeDirective,
            pattern: patternDirective,
            ngPattern: patternDirective,
            required: requiredDirective,
            ngRequired: requiredDirective,
            minlength: minlengthDirective,
            ngMinlength: minlengthDirective,
            maxlength: maxlengthDirective,
            ngMaxlength: maxlengthDirective,
            ngValue: ngValueDirective,
            ngModelOptions: ngModelOptionsDirective
          }).
          directive({
            ngInclude: ngIncludeFillContentDirective
          }).
          directive(ngAttributeAliasDirectives).
          directive(ngEventDirectives);
          $provide.provider({
            $anchorScroll: $AnchorScrollProvider,
            $animate: $AnimateProvider,
            $animateCss: $CoreAnimateCssProvider,
            $$animateJs: $$CoreAnimateJsProvider,
            $$animateQueue: $$CoreAnimateQueueProvider,
            $$AnimateRunner: $$AnimateRunnerFactoryProvider,
            $$animateAsyncRun: $$AnimateAsyncRunFactoryProvider,
            $browser: $BrowserProvider,
            $cacheFactory: $CacheFactoryProvider,
            $controller: $ControllerProvider,
            $document: $DocumentProvider,
            $exceptionHandler: $ExceptionHandlerProvider,
            $filter: $FilterProvider,
            $$forceReflow: $$ForceReflowProvider,
            $interpolate: $InterpolateProvider,
            $interval: $IntervalProvider,
            $http: $HttpProvider,
            $httpParamSerializer: $HttpParamSerializerProvider,
            $httpParamSerializerJQLike: $HttpParamSerializerJQLikeProvider,
            $httpBackend: $HttpBackendProvider,
            $xhrFactory: $xhrFactoryProvider,
            $jsonpCallbacks: $jsonpCallbacksProvider,
            $location: $LocationProvider,
            $log: $LogProvider,
            $parse: $ParseProvider,
            $rootScope: $RootScopeProvider,
            $q: $QProvider,
            $$q: $$QProvider,
            $sce: $SceProvider,
            $sceDelegate: $SceDelegateProvider,
            $sniffer: $SnifferProvider,
            $templateCache: $TemplateCacheProvider,
            $templateRequest: $TemplateRequestProvider,
            $$testability: $$TestabilityProvider,
            $timeout: $TimeoutProvider,
            $window: $WindowProvider,
            $$rAF: $$RAFProvider,
            $$jqLite: $$jqLiteProvider,
            $$HashMap: $$HashMapProvider,
            $$cookieReader: $$CookieReaderProvider
          });
        }
      ]);
    }
    JQLite.expando = 'ng339';
    var jqCache = JQLite.cache = {},
      jqId = 1,
      addEventListenerFn = function(element, type, fn) {
        element.addEventListener(type, fn, false);
      },
      removeEventListenerFn = function(element, type, fn) {
        element.removeEventListener(type, fn, false);
      };
    JQLite._data = function(node) {
      return this.cache[node[this.expando]] || {};
    };

    function jqNextId() {
      return ++jqId;
    }
    var SPECIAL_CHARS_REGEXP = /([:\-_]+(.))/g;
    var MOZ_HACK_REGEXP = /^moz([A-Z])/;
    var MOUSE_EVENT_MAP = {
      mouseleave: 'mouseout',
      mouseenter: 'mouseover'
    };
    var jqLiteMinErr = minErr('jqLite');

    function camelCase(name) {
      return name.
      replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
        return offset ? letter.toUpperCase() : letter;
      }).
      replace(MOZ_HACK_REGEXP, 'Moz$1');
    }
    var SINGLE_TAG_REGEXP = /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/;
    var HTML_REGEXP = /<|&#?\w+;/;
    var TAG_NAME_REGEXP = /<([\w:-]+)/;
    var XHTML_TAG_REGEXP = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi;
    var wrapMap = {
      'option': [1, '<select multiple="multiple">', '</select>'],
      'thead': [1, '<table>', '</table>'],
      'col': [2, '<table><colgroup>', '</colgroup></table>'],
      'tr': [2, '<table><tbody>', '</tbody></table>'],
      'td': [3, '<table><tbody><tr>', '</tr></tbody></table>'],
      '_default': [0, '', '']
    };
    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;

    function jqLiteIsTextNode(html) {
      return !HTML_REGEXP.test(html);
    }

    function jqLiteAcceptsData(node) {
      var nodeType = node.nodeType;
      return nodeType === NODE_TYPE_ELEMENT || !nodeType || nodeType === NODE_TYPE_DOCUMENT;
    }

    function jqLiteHasData(node) {
      for (var key in jqCache[node.ng339]) {
        return true;
      }
      return false;
    }

    function jqLiteCleanData(nodes) {
      for (var i = 0, ii = nodes.length; i < ii; i++) {
        jqLiteRemoveData(nodes[i]);
      }
    }

    function jqLiteBuildFragment(html, context) {
      var tmp, tag, wrap,
        fragment = context.createDocumentFragment(),
        nodes = [],
        i;
      if (jqLiteIsTextNode(html)) {
        nodes.push(context.createTextNode(html));
      } else {
        tmp = fragment.appendChild(context.createElement('div'));
        tag = (TAG_NAME_REGEXP.exec(html) || ['', ''])[1].toLowerCase();
        wrap = wrapMap[tag] || wrapMap._default;
        tmp.innerHTML = wrap[1] + html.replace(XHTML_TAG_REGEXP, '<$1></$2>') + wrap[2];
        i = wrap[0];
        while (i--) {
          tmp = tmp.lastChild;
        }
        nodes = concat(nodes, tmp.childNodes);
        tmp = fragment.firstChild;
        tmp.textContent = '';
      }
      fragment.textContent = '';
      fragment.innerHTML = '';
      forEach(nodes, function(node) {
        fragment.appendChild(node);
      });
      return fragment;
    }

    function jqLiteParseHTML(html, context) {
      context = context || window.document;
      var parsed;
      if ((parsed = SINGLE_TAG_REGEXP.exec(html))) {
        return [context.createElement(parsed[1])];
      }
      if ((parsed = jqLiteBuildFragment(html, context))) {
        return parsed.childNodes;
      }
      return [];
    }

    function jqLiteWrapNode(node, wrapper) {
      var parent = node.parentNode;
      if (parent) {
        parent.replaceChild(wrapper, node);
      }
      wrapper.appendChild(node);
    }
    var jqLiteContains = window.Node.prototype.contains || function(arg) {
      return !!(this.compareDocumentPosition(arg) & 16);
    };

    function JQLite(element) {
      if (element instanceof JQLite) {
        return element;
      }
      var argIsString;
      if (isString(element)) {
        element = trim(element);
        argIsString = true;
      }
      if (!(this instanceof JQLite)) {
        if (argIsString && element.charAt(0) !== '<') {
          throw jqLiteMinErr('nosel', 'Looking up elements via selectors is not supported by jqLite! See: http://docs.angularjs.org/api/angular.element');
        }
        return new JQLite(element);
      }
      if (argIsString) {
        jqLiteAddNodes(this, jqLiteParseHTML(element));
      } else {
        jqLiteAddNodes(this, element);
      }
    }

    function jqLiteClone(element) {
      return element.cloneNode(true);
    }

    function jqLiteDealoc(element, onlyDescendants) {
      if (!onlyDescendants) jqLiteRemoveData(element);
      if (element.querySelectorAll) {
        var descendants = element.querySelectorAll('*');
        for (var i = 0, l = descendants.length; i < l; i++) {
          jqLiteRemoveData(descendants[i]);
        }
      }
    }

    function jqLiteOff(element, type, fn, unsupported) {
      if (isDefined(unsupported)) throw jqLiteMinErr('offargs', 'jqLite#off() does not support the `selector` argument');
      var expandoStore = jqLiteExpandoStore(element);
      var events = expandoStore && expandoStore.events;
      var handle = expandoStore && expandoStore.handle;
      if (!handle) return;
      if (!type) {
        for (type in events) {
          if (type !== '$destroy') {
            removeEventListenerFn(element, type, handle);
          }
          delete events[type];
        }
      } else {
        var removeHandler = function(type) {
          var listenerFns = events[type];
          if (isDefined(fn)) {
            arrayRemove(listenerFns || [], fn);
          }
          if (!(isDefined(fn) && listenerFns && listenerFns.length > 0)) {
            removeEventListenerFn(element, type, handle);
            delete events[type];
          }
        };
        forEach(type.split(' '), function(type) {
          removeHandler(type);
          if (MOUSE_EVENT_MAP[type]) {
            removeHandler(MOUSE_EVENT_MAP[type]);
          }
        });
      }
    }

    function jqLiteRemoveData(element, name) {
      var expandoId = element.ng339;
      var expandoStore = expandoId && jqCache[expandoId];
      if (expandoStore) {
        if (name) {
          delete expandoStore.data[name];
          return;
        }
        if (expandoStore.handle) {
          if (expandoStore.events.$destroy) {
            expandoStore.handle({}, '$destroy');
          }
          jqLiteOff(element);
        }
        delete jqCache[expandoId];
        element.ng339 = undefined;
      }
    }

    function jqLiteExpandoStore(element, createIfNecessary) {
      var expandoId = element.ng339,
        expandoStore = expandoId && jqCache[expandoId];
      if (createIfNecessary && !expandoStore) {
        element.ng339 = expandoId = jqNextId();
        expandoStore = jqCache[expandoId] = {
          events: {},
          data: {},
          handle: undefined
        };
      }
      return expandoStore;
    }

    function jqLiteData(element, key, value) {
      if (jqLiteAcceptsData(element)) {
        var isSimpleSetter = isDefined(value);
        var isSimpleGetter = !isSimpleSetter && key && !isObject(key);
        var massGetter = !key;
        var expandoStore = jqLiteExpandoStore(element, !isSimpleGetter);
        var data = expandoStore && expandoStore.data;
        if (isSimpleSetter) {
          data[key] = value;
        } else {
          if (massGetter) {
            return data;
          } else {
            if (isSimpleGetter) {
              return data && data[key];
            } else {
              extend(data, key);
            }
          }
        }
      }
    }

    function jqLiteHasClass(element, selector) {
      if (!element.getAttribute) return false;
      return ((' ' + (element.getAttribute('class') || '') + ' ').replace(/[\n\t]/g, ' ').indexOf(' ' + selector + ' ') > -1);
    }

    function jqLiteRemoveClass(element, cssClasses) {
      if (cssClasses && element.setAttribute) {
        forEach(cssClasses.split(' '), function(cssClass) {
          element.setAttribute('class', trim(
            (' ' + (element.getAttribute('class') || '') + ' ')
            .replace(/[\n\t]/g, ' ')
            .replace(' ' + trim(cssClass) + ' ', ' ')));
        });
      }
    }

    function jqLiteAddClass(element, cssClasses) {
      if (cssClasses && element.setAttribute) {
        var existingClasses = (' ' + (element.getAttribute('class') || '') + ' ')
          .replace(/[\n\t]/g, ' ');
        forEach(cssClasses.split(' '), function(cssClass) {
          cssClass = trim(cssClass);
          if (existingClasses.indexOf(' ' + cssClass + ' ') === -1) {
            existingClasses += cssClass + ' ';
          }
        });
        element.setAttribute('class', trim(existingClasses));
      }
    }

    function jqLiteAddNodes(root, elements) {
      if (elements) {
        if (elements.nodeType) {
          root[root.length++] = elements;
        } else {
          var length = elements.length;
          if (typeof length === 'number' && elements.window !== elements) {
            if (length) {
              for (var i = 0; i < length; i++) {
                root[root.length++] = elements[i];
              }
            }
          } else {
            root[root.length++] = elements;
          }
        }
      }
    }

    function jqLiteController(element, name) {
      return jqLiteInheritedData(element, '$' + (name || 'ngController') + 'Controller');
    }

    function jqLiteInheritedData(element, name, value) {
      if (element.nodeType === NODE_TYPE_DOCUMENT) {
        element = element.documentElement;
      }
      var names = isArray(name) ? name : [name];
      while (element) {
        for (var i = 0, ii = names.length; i < ii; i++) {
          if (isDefined(value = jqLite.data(element, names[i]))) return value;
        }
        element = element.parentNode || (element.nodeType === NODE_TYPE_DOCUMENT_FRAGMENT && element.host);
      }
    }

    function jqLiteEmpty(element) {
      jqLiteDealoc(element, true);
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }

    function jqLiteRemove(element, keepData) {
      if (!keepData) jqLiteDealoc(element);
      var parent = element.parentNode;
      if (parent) parent.removeChild(element);
    }

    function jqLiteDocumentLoaded(action, win) {
      win = win || window;
      if (win.document.readyState === 'complete') {
        win.setTimeout(action);
      } else {
        jqLite(win).on('load', action);
      }
    }
    var JQLitePrototype = JQLite.prototype = {
      ready: function(fn) {
        var fired = false;

        function trigger() {
          if (fired) return;
          fired = true;
          fn();
        }
        if (window.document.readyState === 'complete') {
          window.setTimeout(trigger);
        } else {
          this.on('DOMContentLoaded', trigger);
          JQLite(window).on('load', trigger);
        }
      },
      toString: function() {
        var value = [];
        forEach(this, function(e) {
          value.push('' + e);
        });
        return '[' + value.join(', ') + ']';
      },
      eq: function(index) {
        return (index >= 0) ? jqLite(this[index]) : jqLite(this[this.length + index]);
      },
      length: 0,
      push: push,
      sort: [].sort,
      splice: [].splice
    };
    var BOOLEAN_ATTR = {};
    forEach('multiple,selected,checked,disabled,readOnly,required,open'.split(','), function(value) {
      BOOLEAN_ATTR[lowercase(value)] = value;
    });
    var BOOLEAN_ELEMENTS = {};
    forEach('input,select,option,textarea,button,form,details'.split(','), function(value) {
      BOOLEAN_ELEMENTS[value] = true;
    });
    var ALIASED_ATTR = {
      'ngMinlength': 'minlength',
      'ngMaxlength': 'maxlength',
      'ngMin': 'min',
      'ngMax': 'max',
      'ngPattern': 'pattern'
    };

    function getBooleanAttrName(element, name) {
      var booleanAttr = BOOLEAN_ATTR[name.toLowerCase()];
      return booleanAttr && BOOLEAN_ELEMENTS[nodeName_(element)] && booleanAttr;
    }

    function getAliasedAttrName(name) {
      return ALIASED_ATTR[name];
    }
    forEach({
      data: jqLiteData,
      removeData: jqLiteRemoveData,
      hasData: jqLiteHasData,
      cleanData: jqLiteCleanData
    }, function(fn, name) {
      JQLite[name] = fn;
    });
    forEach({
      data: jqLiteData,
      inheritedData: jqLiteInheritedData,
      scope: function(element) {
        return jqLite.data(element, '$scope') || jqLiteInheritedData(element.parentNode || element, ['$isolateScope', '$scope']);
      },
      isolateScope: function(element) {
        return jqLite.data(element, '$isolateScope') || jqLite.data(element, '$isolateScopeNoTemplate');
      },
      controller: jqLiteController,
      injector: function(element) {
        return jqLiteInheritedData(element, '$injector');
      },
      removeAttr: function(element, name) {
        element.removeAttribute(name);
      },
      hasClass: jqLiteHasClass,
      css: function(element, name, value) {
        name = camelCase(name);
        if (isDefined(value)) {
          element.style[name] = value;
        } else {
          return element.style[name];
        }
      },
      attr: function(element, name, value) {
        var nodeType = element.nodeType;
        if (nodeType === NODE_TYPE_TEXT || nodeType === NODE_TYPE_ATTRIBUTE || nodeType === NODE_TYPE_COMMENT) {
          return;
        }
        var lowercasedName = lowercase(name);
        if (BOOLEAN_ATTR[lowercasedName]) {
          if (isDefined(value)) {
            if (value) {
              element[name] = true;
              element.setAttribute(name, lowercasedName);
            } else {
              element[name] = false;
              element.removeAttribute(lowercasedName);
            }
          } else {
            return (element[name] ||
                (element.attributes.getNamedItem(name) || noop).specified) ?
              lowercasedName :
              undefined;
          }
        } else if (isDefined(value)) {
          element.setAttribute(name, value);
        } else if (element.getAttribute) {
          var ret = element.getAttribute(name, 2);
          return ret === null ? undefined : ret;
        }
      },
      prop: function(element, name, value) {
        if (isDefined(value)) {
          element[name] = value;
        } else {
          return element[name];
        }
      },
      text: (function() {
        getText.$dv = '';
        return getText;

        function getText(element, value) {
          if (isUndefined(value)) {
            var nodeType = element.nodeType;
            return (nodeType === NODE_TYPE_ELEMENT || nodeType === NODE_TYPE_TEXT) ? element.textContent : '';
          }
          element.textContent = value;
        }
      })(),
      val: function(element, value) {
        if (isUndefined(value)) {
          if (element.multiple && nodeName_(element) === 'select') {
            var result = [];
            forEach(element.options, function(option) {
              if (option.selected) {
                result.push(option.value || option.text);
              }
            });
            return result.length === 0 ? null : result;
          }
          return element.value;
        }
        element.value = value;
      },
      html: function(element, value) {
        if (isUndefined(value)) {
          return element.innerHTML;
        }
        jqLiteDealoc(element, true);
        element.innerHTML = value;
      },
      empty: jqLiteEmpty
    }, function(fn, name) {
      JQLite.prototype[name] = function(arg1, arg2) {
        var i, key;
        var nodeCount = this.length;
        if (fn !== jqLiteEmpty &&
          (isUndefined((fn.length === 2 && (fn !== jqLiteHasClass && fn !== jqLiteController)) ? arg1 : arg2))) {
          if (isObject(arg1)) {
            for (i = 0; i < nodeCount; i++) {
              if (fn === jqLiteData) {
                fn(this[i], arg1);
              } else {
                for (key in arg1) {
                  fn(this[i], key, arg1[key]);
                }
              }
            }
            return this;
          } else {
            var value = fn.$dv;
            var jj = (isUndefined(value)) ? Math.min(nodeCount, 1) : nodeCount;
            for (var j = 0; j < jj; j++) {
              var nodeValue = fn(this[j], arg1, arg2);
              value = value ? value + nodeValue : nodeValue;
            }
            return value;
          }
        } else {
          for (i = 0; i < nodeCount; i++) {
            fn(this[i], arg1, arg2);
          }
          return this;
        }
      };
    });

    function createEventHandler(element, events) {
      var eventHandler = function(event, type) {
        event.isDefaultPrevented = function() {
          return event.defaultPrevented;
        };
        var eventFns = events[type || event.type];
        var eventFnsLength = eventFns ? eventFns.length : 0;
        if (!eventFnsLength) return;
        if (isUndefined(event.immediatePropagationStopped)) {
          var originalStopImmediatePropagation = event.stopImmediatePropagation;
          event.stopImmediatePropagation = function() {
            event.immediatePropagationStopped = true;
            if (event.stopPropagation) {
              event.stopPropagation();
            }
            if (originalStopImmediatePropagation) {
              originalStopImmediatePropagation.call(event);
            }
          };
        }
        event.isImmediatePropagationStopped = function() {
          return event.immediatePropagationStopped === true;
        };
        var handlerWrapper = eventFns.specialHandlerWrapper || defaultHandlerWrapper;
        if ((eventFnsLength > 1)) {
          eventFns = shallowCopy(eventFns);
        }
        for (var i = 0; i < eventFnsLength; i++) {
          if (!event.isImmediatePropagationStopped()) {
            handlerWrapper(element, event, eventFns[i]);
          }
        }
      };
      eventHandler.elem = element;
      return eventHandler;
    }

    function defaultHandlerWrapper(element, event, handler) {
      handler.call(element, event);
    }

    function specialMouseHandlerWrapper(target, event, handler) {
      var related = event.relatedTarget;
      if (!related || (related !== target && !jqLiteContains.call(target, related))) {
        handler.call(target, event);
      }
    }
    forEach({
      removeData: jqLiteRemoveData,
      on: function jqLiteOn(element, type, fn, unsupported) {
        if (isDefined(unsupported)) throw jqLiteMinErr('onargs', 'jqLite#on() does not support the `selector` or `eventData` parameters');
        if (!jqLiteAcceptsData(element)) {
          return;
        }
        var expandoStore = jqLiteExpandoStore(element, true);
        var events = expandoStore.events;
        var handle = expandoStore.handle;
        if (!handle) {
          handle = expandoStore.handle = createEventHandler(element, events);
        }
        var types = type.indexOf(' ') >= 0 ? type.split(' ') : [type];
        var i = types.length;
        var addHandler = function(type, specialHandlerWrapper, noEventListener) {
          var eventFns = events[type];
          if (!eventFns) {
            eventFns = events[type] = [];
            eventFns.specialHandlerWrapper = specialHandlerWrapper;
            if (type !== '$destroy' && !noEventListener) {
              addEventListenerFn(element, type, handle);
            }
          }
          eventFns.push(fn);
        };
        while (i--) {
          type = types[i];
          if (MOUSE_EVENT_MAP[type]) {
            addHandler(MOUSE_EVENT_MAP[type], specialMouseHandlerWrapper);
            addHandler(type, undefined, true);
          } else {
            addHandler(type);
          }
        }
      },
      off: jqLiteOff,
      one: function(element, type, fn) {
        element = jqLite(element);
        element.on(type, function onFn() {
          element.off(type, fn);
          element.off(type, onFn);
        });
        element.on(type, fn);
      },
      replaceWith: function(element, replaceNode) {
        var index, parent = element.parentNode;
        jqLiteDealoc(element);
        forEach(new JQLite(replaceNode), function(node) {
          if (index) {
            parent.insertBefore(node, index.nextSibling);
          } else {
            parent.replaceChild(node, element);
          }
          index = node;
        });
      },
      children: function(element) {
        var children = [];
        forEach(element.childNodes, function(element) {
          if (element.nodeType === NODE_TYPE_ELEMENT) {
            children.push(element);
          }
        });
        return children;
      },
      contents: function(element) {
        return element.contentDocument || element.childNodes || [];
      },
      append: function(element, node) {
        var nodeType = element.nodeType;
        if (nodeType !== NODE_TYPE_ELEMENT && nodeType !== NODE_TYPE_DOCUMENT_FRAGMENT) return;
        node = new JQLite(node);
        for (var i = 0, ii = node.length; i < ii; i++) {
          var child = node[i];
          element.appendChild(child);
        }
      },
      prepend: function(element, node) {
        if (element.nodeType === NODE_TYPE_ELEMENT) {
          var index = element.firstChild;
          forEach(new JQLite(node), function(child) {
            element.insertBefore(child, index);
          });
        }
      },
      wrap: function(element, wrapNode) {
        jqLiteWrapNode(element, jqLite(wrapNode).eq(0).clone()[0]);
      },
      remove: jqLiteRemove,
      detach: function(element) {
        jqLiteRemove(element, true);
      },
      after: function(element, newElement) {
        var index = element,
          parent = element.parentNode;
        if (parent) {
          newElement = new JQLite(newElement);
          for (var i = 0, ii = newElement.length; i < ii; i++) {
            var node = newElement[i];
            parent.insertBefore(node, index.nextSibling);
            index = node;
          }
        }
      },
      addClass: jqLiteAddClass,
      removeClass: jqLiteRemoveClass,
      toggleClass: function(element, selector, condition) {
        if (selector) {
          forEach(selector.split(' '), function(className) {
            var classCondition = condition;
            if (isUndefined(classCondition)) {
              classCondition = !jqLiteHasClass(element, className);
            }
            (classCondition ? jqLiteAddClass : jqLiteRemoveClass)(element, className);
          });
        }
      },
      parent: function(element) {
        var parent = element.parentNode;
        return parent && parent.nodeType !== NODE_TYPE_DOCUMENT_FRAGMENT ? parent : null;
      },
      next: function(element) {
        return element.nextElementSibling;
      },
      find: function(element, selector) {
        if (element.getElementsByTagName) {
          return element.getElementsByTagName(selector);
        } else {
          return [];
        }
      },
      clone: jqLiteClone,
      triggerHandler: function(element, event, extraParameters) {
        var dummyEvent, eventFnsCopy, handlerArgs;
        var eventName = event.type || event;
        var expandoStore = jqLiteExpandoStore(element);
        var events = expandoStore && expandoStore.events;
        var eventFns = events && events[eventName];
        if (eventFns) {
          dummyEvent = {
            preventDefault: function() {
              this.defaultPrevented = true;
            },
            isDefaultPrevented: function() {
              return this.defaultPrevented === true;
            },
            stopImmediatePropagation: function() {
              this.immediatePropagationStopped = true;
            },
            isImmediatePropagationStopped: function() {
              return this.immediatePropagationStopped === true;
            },
            stopPropagation: noop,
            type: eventName,
            target: element
          };
          if (event.type) {
            dummyEvent = extend(dummyEvent, event);
          }
          eventFnsCopy = shallowCopy(eventFns);
          handlerArgs = extraParameters ? [dummyEvent].concat(extraParameters) : [dummyEvent];
          forEach(eventFnsCopy, function(fn) {
            if (!dummyEvent.isImmediatePropagationStopped()) {
              fn.apply(element, handlerArgs);
            }
          });
        }
      }
    }, function(fn, name) {
      JQLite.prototype[name] = function(arg1, arg2, arg3) {
        var value;
        for (var i = 0, ii = this.length; i < ii; i++) {
          if (isUndefined(value)) {
            value = fn(this[i], arg1, arg2, arg3);
            if (isDefined(value)) {
              value = jqLite(value);
            }
          } else {
            jqLiteAddNodes(value, fn(this[i], arg1, arg2, arg3));
          }
        }
        return isDefined(value) ? value : this;
      };
    });
    JQLite.prototype.bind = JQLite.prototype.on;
    JQLite.prototype.unbind = JQLite.prototype.off;

    function $$jqLiteProvider() {
      this.$get = function $$jqLite() {
        return extend(JQLite, {
          hasClass: function(node, classes) {
            if (node.attr) node = node[0];
            return jqLiteHasClass(node, classes);
          },
          addClass: function(node, classes) {
            if (node.attr) node = node[0];
            return jqLiteAddClass(node, classes);
          },
          removeClass: function(node, classes) {
            if (node.attr) node = node[0];
            return jqLiteRemoveClass(node, classes);
          }
        });
      };
    }

    function hashKey(obj, nextUidFn) {
      var key = obj && obj.$$hashKey;
      if (key) {
        if (typeof key === 'function') {
          key = obj.$$hashKey();
        }
        return key;
      }
      var objType = typeof obj;
      if (objType === 'function' || (objType === 'object' && obj !== null)) {
        key = obj.$$hashKey = objType + ':' + (nextUidFn || nextUid)();
      } else {
        key = objType + ':' + obj;
      }
      return key;
    }

    function HashMap(array, isolatedUid) {
      if (isolatedUid) {
        var uid = 0;
        this.nextUid = function() {
          return ++uid;
        };
      }
      forEach(array, this.put, this);
    }
    HashMap.prototype = {
      put: function(key, value) {
        this[hashKey(key, this.nextUid)] = value;
      },
      get: function(key) {
        return this[hashKey(key, this.nextUid)];
      },
      remove: function(key) {
        var value = this[key = hashKey(key, this.nextUid)];
        delete this[key];
        return value;
      }
    };
    var $$HashMapProvider = [function() {
      this.$get = [function() {
        return HashMap;
      }];
    }];
    var ARROW_ARG = /^([^(]+?)=>/;
    var FN_ARGS = /^[^(]*\(\s*([^)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var $injectorMinErr = minErr('$injector');

    function stringifyFn(fn) {
      return Function.prototype.toString.call(fn) + ' ';
    }

    function extractArgs(fn) {
      var fnText = stringifyFn(fn).replace(STRIP_COMMENTS, ''),
        args = fnText.match(ARROW_ARG) || fnText.match(FN_ARGS);
      return args;
    }

    function anonFn(fn) {
      var args = extractArgs(fn);
      if (args) {
        return 'function(' + (args[1] || '').replace(/[\s\r\n]+/, ' ') + ')';
      }
      return 'fn';
    }

    function annotate(fn, strictDi, name) {
      var $inject,
        argDecl,
        last;
      if (typeof fn === 'function') {
        if (!($inject = fn.$inject)) {
          $inject = [];
          if (fn.length) {
            if (strictDi) {
              if (!isString(name) || !name) {
                name = fn.name || anonFn(fn);
              }
              throw $injectorMinErr('strictdi',
                '{0} is not using explicit annotation and cannot be invoked in strict mode', name);
            }
            argDecl = extractArgs(fn);
            forEach(argDecl[1].split(FN_ARG_SPLIT), function(arg) {
              arg.replace(FN_ARG, function(all, underscore, name) {
                $inject.push(name);
              });
            });
          }
          fn.$inject = $inject;
        }
      } else if (isArray(fn)) {
        last = fn.length - 1;
        assertArgFn(fn[last], 'fn');
        $inject = fn.slice(0, last);
      } else {
        assertArgFn(fn, 'fn', true);
      }
      return $inject;
    }

    function createInjector(modulesToLoad, strictDi) {
      strictDi = (strictDi === true);
      var INSTANTIATING = {},
        providerSuffix = 'Provider',
        path = [],
        loadedModules = new HashMap([], true),
        providerCache = {
          $provide: {
            provider: supportObject(provider),
            factory: supportObject(factory),
            service: supportObject(service),
            value: supportObject(value),
            constant: supportObject(constant),
            decorator: decorator
          }
        },
        providerInjector = (providerCache.$injector =
          createInternalInjector(providerCache, function(serviceName, caller) {
            if (angular.isString(caller)) {
              path.push(caller);
            }
            throw $injectorMinErr('unpr', 'Unknown provider: {0}', path.join(' <- '));
          })),
        instanceCache = {},
        protoInstanceInjector =
        createInternalInjector(instanceCache, function(serviceName, caller) {
          var provider = providerInjector.get(serviceName + providerSuffix, caller);
          return instanceInjector.invoke(
            provider.$get, provider, undefined, serviceName);
        }),
        instanceInjector = protoInstanceInjector;
      providerCache['$injector' + providerSuffix] = {
        $get: valueFn(protoInstanceInjector)
      };
      var runBlocks = loadModules(modulesToLoad);
      instanceInjector = protoInstanceInjector.get('$injector');
      instanceInjector.strictDi = strictDi;
      forEach(runBlocks, function(fn) {
        if (fn) instanceInjector.invoke(fn);
      });
      return instanceInjector;

      function supportObject(delegate) {
        return function(key, value) {
          if (isObject(key)) {
            forEach(key, reverseParams(delegate));
          } else {
            return delegate(key, value);
          }
        };
      }

      function provider(name, provider_) {
        assertNotHasOwnProperty(name, 'service');
        if (isFunction(provider_) || isArray(provider_)) {
          provider_ = providerInjector.instantiate(provider_);
        }
        if (!provider_.$get) {
          throw $injectorMinErr('pget', 'Provider \'{0}\' must define $get factory method.', name);
        }
        return (providerCache[name + providerSuffix] = provider_);
      }

      function enforceReturnValue(name, factory) {
        return function enforcedReturnValue() {
          var result = instanceInjector.invoke(factory, this);
          if (isUndefined(result)) {
            throw $injectorMinErr('undef', 'Provider \'{0}\' must return a value from $get factory method.', name);
          }
          return result;
        };
      }

      function factory(name, factoryFn, enforce) {
        return provider(name, {
          $get: enforce !== false ? enforceReturnValue(name, factoryFn) : factoryFn
        });
      }

      function service(name, constructor) {
        return factory(name, ['$injector', function($injector) {
          return $injector.instantiate(constructor);
        }]);
      }

      function value(name, val) {
        return factory(name, valueFn(val), false);
      }

      function constant(name, value) {
        assertNotHasOwnProperty(name, 'constant');
        providerCache[name] = value;
        instanceCache[name] = value;
      }

      function decorator(serviceName, decorFn) {
        var origProvider = providerInjector.get(serviceName + providerSuffix),
          orig$get = origProvider.$get;
        origProvider.$get = function() {
          var origInstance = instanceInjector.invoke(orig$get, origProvider);
          return instanceInjector.invoke(decorFn, null, {
            $delegate: origInstance
          });
        };
      }

      function loadModules(modulesToLoad) {
        assertArg(isUndefined(modulesToLoad) || isArray(modulesToLoad), 'modulesToLoad', 'not an array');
        var runBlocks = [],
          moduleFn;
        forEach(modulesToLoad, function(module) {
          if (loadedModules.get(module)) return;
          loadedModules.put(module, true);

          function runInvokeQueue(queue) {
            var i, ii;
            for (i = 0, ii = queue.length; i < ii; i++) {
              var invokeArgs = queue[i],
                provider = providerInjector.get(invokeArgs[0]);
              provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
            }
          }
          try {
            if (isString(module)) {
              moduleFn = angularModule(module);
              runBlocks = runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks);
              runInvokeQueue(moduleFn._invokeQueue);
              runInvokeQueue(moduleFn._configBlocks);
            } else if (isFunction(module)) {
              runBlocks.push(providerInjector.invoke(module));
            } else if (isArray(module)) {
              runBlocks.push(providerInjector.invoke(module));
            } else {
              assertArgFn(module, 'module');
            }
          } catch (e) {
            if (isArray(module)) {
              module = module[module.length - 1];
            }
            if (e.message && e.stack && e.stack.indexOf(e.message) === -1) {
              e = e.message + '\n' + e.stack;
            }
            throw $injectorMinErr('modulerr', 'Failed to instantiate module {0} due to:\n{1}',
              module, e.stack || e.message || e);
          }
        });
        return runBlocks;
      }

      function createInternalInjector(cache, factory) {
        function getService(serviceName, caller) {
          if (cache.hasOwnProperty(serviceName)) {
            if (cache[serviceName] === INSTANTIATING) {
              throw $injectorMinErr('cdep', 'Circular dependency found: {0}',
                serviceName + ' <- ' + path.join(' <- '));
            }
            return cache[serviceName];
          } else {
            try {
              path.unshift(serviceName);
              cache[serviceName] = INSTANTIATING;
              cache[serviceName] = factory(serviceName, caller);
              return cache[serviceName];
            } catch (err) {
              if (cache[serviceName] === INSTANTIATING) {
                delete cache[serviceName];
              }
              throw err;
            } finally {
              path.shift();
            }
          }
        }

        function injectionArgs(fn, locals, serviceName) {
          var args = [],
            $inject = createInjector.$$annotate(fn, strictDi, serviceName);
          for (var i = 0, length = $inject.length; i < length; i++) {
            var key = $inject[i];
            if (typeof key !== 'string') {
              throw $injectorMinErr('itkn',
                'Incorrect injection token! Expected service name as string, got {0}', key);
            }
            args.push(locals && locals.hasOwnProperty(key) ? locals[key] :
              getService(key, serviceName));
          }
          return args;
        }

        function isClass(func) {
          if (msie <= 11) {
            return false;
          }
          return typeof func === 'function' &&
            /^(?:class\b|constructor\()/.test(stringifyFn(func));
        }

        function invoke(fn, self, locals, serviceName) {
          if (typeof locals === 'string') {
            serviceName = locals;
            locals = null;
          }
          var args = injectionArgs(fn, locals, serviceName);
          if (isArray(fn)) {
            fn = fn[fn.length - 1];
          }
          if (!isClass(fn)) {
            return fn.apply(self, args);
          } else {
            args.unshift(null);
            return new(Function.prototype.bind.apply(fn, args))();
          }
        }

        function instantiate(Type, locals, serviceName) {
          var ctor = (isArray(Type) ? Type[Type.length - 1] : Type);
          var args = injectionArgs(Type, locals, serviceName);
          args.unshift(null);
          return new(Function.prototype.bind.apply(ctor, args))();
        }
        return {
          invoke: invoke,
          instantiate: instantiate,
          get: getService,
          annotate: createInjector.$$annotate,
          has: function(name) {
            return providerCache.hasOwnProperty(name + providerSuffix) || cache.hasOwnProperty(name);
          }
        };
      }
    }
    createInjector.$$annotate = annotate;

    function $AnchorScrollProvider() {
      var autoScrollingEnabled = true;
      this.disableAutoScrolling = function() {
        autoScrollingEnabled = false;
      };
      this.$get = ['$window', '$location', '$rootScope', function($window, $location, $rootScope) {
        var document = $window.document;

        function getFirstAnchor(list) {
          var result = null;
          Array.prototype.some.call(list, function(element) {
            if (nodeName_(element) === 'a') {
              result = element;
              return true;
            }
          });
          return result;
        }

        function getYOffset() {
          var offset = scroll.yOffset;
          if (isFunction(offset)) {
            offset = offset();
          } else if (isElement(offset)) {
            var elem = offset[0];
            var style = $window.getComputedStyle(elem);
            if (style.position !== 'fixed') {
              offset = 0;
            } else {
              offset = elem.getBoundingClientRect().bottom;
            }
          } else if (!isNumber(offset)) {
            offset = 0;
          }
          return offset;
        }

        function scrollTo(elem) {
          if (elem) {
            elem.scrollIntoView();
            var offset = getYOffset();
            if (offset) {
              var elemTop = elem.getBoundingClientRect().top;
              $window.scrollBy(0, elemTop - offset);
            }
          } else {
            $window.scrollTo(0, 0);
          }
        }

        function scroll(hash) {
          hash = isString(hash) ? hash : isNumber(hash) ? hash.toString() : $location.hash();
          var elm;
          if (!hash) scrollTo(null);
          else if ((elm = document.getElementById(hash))) scrollTo(elm);
          else if ((elm = getFirstAnchor(document.getElementsByName(hash)))) scrollTo(elm);
          else if (hash === 'top') scrollTo(null);
        }
        if (autoScrollingEnabled) {
          $rootScope.$watch(function autoScrollWatch() {
              return $location.hash();
            },
            function autoScrollWatchAction(newVal, oldVal) {
              if (newVal === oldVal && newVal === '') return;
              jqLiteDocumentLoaded(function() {
                $rootScope.$evalAsync(scroll);
              });
            });
        }
        return scroll;
      }];
    }
    var $animateMinErr = minErr('$animate');
    var ELEMENT_NODE = 1;
    var NG_ANIMATE_CLASSNAME = 'ng-animate';

    function mergeClasses(a, b) {
      if (!a && !b) return '';
      if (!a) return b;
      if (!b) return a;
      if (isArray(a)) a = a.join(' ');
      if (isArray(b)) b = b.join(' ');
      return a + ' ' + b;
    }

    function extractElementNode(element) {
      for (var i = 0; i < element.length; i++) {
        var elm = element[i];
        if (elm.nodeType === ELEMENT_NODE) {
          return elm;
        }
      }
    }

    function splitClasses(classes) {
      if (isString(classes)) {
        classes = classes.split(' ');
      }
      var obj = createMap();
      forEach(classes, function(klass) {
        if (klass.length) {
          obj[klass] = true;
        }
      });
      return obj;
    }

    function prepareAnimateOptions(options) {
      return isObject(options) ?
        options :
        {};
    }
    var $$CoreAnimateJsProvider = function() {
      this.$get = noop;
    };
    var $$CoreAnimateQueueProvider = function() {
      var postDigestQueue = new HashMap();
      var postDigestElements = [];
      this.$get = ['$$AnimateRunner', '$rootScope',
        function($$AnimateRunner, $rootScope) {
          return {
            enabled: noop,
            on: noop,
            off: noop,
            pin: noop,
            push: function(element, event, options, domOperation) {
              if (domOperation) {
                domOperation();
              }
              options = options || {};
              if (options.from) {
                element.css(options.from);
              }
              if (options.to) {
                element.css(options.to);
              }
              if (options.addClass || options.removeClass) {
                addRemoveClassesPostDigest(element, options.addClass, options.removeClass);
              }
              var runner = new $$AnimateRunner();
              runner.complete();
              return runner;
            }
          };

          function updateData(data, classes, value) {
            var changed = false;
            if (classes) {
              classes = isString(classes) ? classes.split(' ') :
                isArray(classes) ? classes : [];
              forEach(classes, function(className) {
                if (className) {
                  changed = true;
                  data[className] = value;
                }
              });
            }
            return changed;
          }

          function handleCSSClassChanges() {
            forEach(postDigestElements, function(element) {
              var data = postDigestQueue.get(element);
              if (data) {
                var existing = splitClasses(element.attr('class'));
                var toAdd = '';
                var toRemove = '';
                forEach(data, function(status, className) {
                  var hasClass = !!existing[className];
                  if (status !== hasClass) {
                    if (status) {
                      toAdd += (toAdd.length ? ' ' : '') + className;
                    } else {
                      toRemove += (toRemove.length ? ' ' : '') + className;
                    }
                  }
                });
                forEach(element, function(elm) {
                  if (toAdd) {
                    jqLiteAddClass(elm, toAdd);
                  }
                  if (toRemove) {
                    jqLiteRemoveClass(elm, toRemove);
                  }
                });
                postDigestQueue.remove(element);
              }
            });
            postDigestElements.length = 0;
          }

          function addRemoveClassesPostDigest(element, add, remove) {
            var data = postDigestQueue.get(element) || {};
            var classesAdded = updateData(data, add, true);
            var classesRemoved = updateData(data, remove, false);
            if (classesAdded || classesRemoved) {
              postDigestQueue.put(element, data);
              postDigestElements.push(element);
              if (postDigestElements.length === 1) {
                $rootScope.$$postDigest(handleCSSClassChanges);
              }
            }
          }
        }
      ];
    };
    var $AnimateProvider = ['$provide', function($provide) {
          var provider = this;
          this.$$registeredAnimations = Object.create(null);
          this.register = function(name, factory) {
            if (name && name.charAt(0) !== '.') {
              throw $animateMinErr('notcsel', 'Expecting class selector starting with \'.\' got \'{0}\'.', name);
            }
            var key = name + '-animation';
            provider.$$registeredAnimations[name.substr(1)] = key;
            $provide.factory(key, factory);
          };
          this.classNameFilter = function(expression) {
            if (arguments.length === 1) {
              this.$$classNameFilter = (expression instanceof RegExp) ? expression : null;
              if (this.$$classNameFilter) {
                var reservedRegex = new RegExp('(\\s+|\\/)' + NG_ANIMATE_CLASSNAME + '(\\s+|\\/)');
                if (reservedRegex.test(this.$$classNameFilter.toString())) {
                  throw $animateMinErr('nongcls', '$animateProvider.classNameFilter(regex) prohibits accepting a regex value which matches/contains the "{0}" CSS class.', NG_ANIMATE_CLASSNAME);
                }
              }
            }
            return this.$$classNameFilter;
          };
          this.$get = ['$$animateQueue', function($$animateQueue) {
                function domInsert(element, parentElement, afterElement) {
                  if (afterElement) {
                    var afterNode = extractElementNode(afterElement);
                    if (afterNode && !afterNode.parentNode && !afterNode.previousElementSibling) {
                      afterElement = null;
                    }
                  }
                  if (afterElement) {
                    afterElement.after(element);
                  } else {
                    parentElement.prepend(element);
                  }
                }
                return {
                  on: $$animateQueue.on,
                  off: $$animateQueue.off,
                  pin: $$animateQueue.pin,
                  enabled: $$animateQueue.enabled,
                  cancel: function(runner) {
                    if (runner.end) {
                      runner.end();
                    }
                  },
                  enter: function(element, parent, after, options) {
                    parent = parent && jqLite(parent);
                    after = after && jqLite(after);
                    parent = parent || after.parent();
                    domInsert(element, parent, after);
                    return $$animateQueue.push(element, 'enter', prepareAnimateOptions(options));
                  },
                  move: function(element, parent, after, options) {
                    parent = parent && jqLite(parent);
                    after = after && jqLite(after);
                    parent = parent || after.parent();
                    domInsert(element, parent, after);
                    return $$animateQueue.push(element, 'move', prepareAnimateOptions(options));
                  },
                  leave: function(element, options) {
                    return $$animateQueue.push(element, 'leave', prepareAnimateOptions(options), function() {
                      element.remove();
                    });
                  },
                  addClass: function(element, className, options) {
                    options = prepareAnimateOptions(options);
                    options.addClass = mergeClasses(options.addclass, className);
                    return $$animateQueue.push(element, 'addClass', options);
                  },
                  removeClass: function(element, className, options) {
                    options = prepareAnimateOptions(options);
                    options.removeClass = mergeClasses(options.removeClass, className);
                    return $$animateQueue.push(element, 'removeClass', options);
                  },
                  setClass: function(element, add, remove, options) {
                      options = prepareAnimateOptions(options);
                      options.addClass = mergeClasses(options.addClass, add);
                      options.removeClass = mergeClasses(options.removeClass, r