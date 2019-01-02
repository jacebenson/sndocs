/*! RESOURCE: /scripts/angular_includes_no_min.1.5.11.js */
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
            options.removeClass = mergeClasses(options.removeClass, remove);
            return $$animateQueue.push(element, 'setClass', options);
          },
          animate: function(element, from, to, className, options) {
            options = prepareAnimateOptions(options);
            options.from = options.from ? extend(options.from, from) : from;
            options.to = options.to ? extend(options.to, to) : to;
            className = className || 'ng-inline-animate';
            options.tempClasses = mergeClasses(options.tempClasses, className);
            return $$animateQueue.push(element, 'animate', options);
          }
        };
      }];
    }];
    var $$AnimateAsyncRunFactoryProvider = function() {
      this.$get = ['$$rAF', function($$rAF) {
        var waitQueue = [];

        function waitForTick(fn) {
          waitQueue.push(fn);
          if (waitQueue.length > 1) return;
          $$rAF(function() {
            for (var i = 0; i < waitQueue.length; i++) {
              waitQueue[i]();
            }
            waitQueue = [];
          });
        }
        return function() {
          var passed = false;
          waitForTick(function() {
            passed = true;
          });
          return function(callback) {
            if (passed) {
              callback();
            } else {
              waitForTick(callback);
            }
          };
        };
      }];
    };
    var $$AnimateRunnerFactoryProvider = function() {
      this.$get = ['$q', '$sniffer', '$$animateAsyncRun', '$document', '$timeout',
        function($q, $sniffer, $$animateAsyncRun, $document, $timeout) {
          var INITIAL_STATE = 0;
          var DONE_PENDING_STATE = 1;
          var DONE_COMPLETE_STATE = 2;
          AnimateRunner.chain = function(chain, callback) {
            var index = 0;
            next();

            function next() {
              if (index === chain.length) {
                callback(true);
                return;
              }
              chain[index](function(response) {
                if (response === false) {
                  callback(false);
                  return;
                }
                index++;
                next();
              });
            }
          };
          AnimateRunner.all = function(runners, callback) {
            var count = 0;
            var status = true;
            forEach(runners, function(runner) {
              runner.done(onProgress);
            });

            function onProgress(response) {
              status = status && response;
              if (++count === runners.length) {
                callback(status);
              }
            }
          };

          function AnimateRunner(host) {
            this.setHost(host);
            var rafTick = $$animateAsyncRun();
            var timeoutTick = function(fn) {
              $timeout(fn, 0, false);
            };
            this._doneCallbacks = [];
            this._tick = function(fn) {
              var doc = $document[0];
              if (doc && doc.hidden) {
                timeoutTick(fn);
              } else {
                rafTick(fn);
              }
            };
            this._state = 0;
          }
          AnimateRunner.prototype = {
            setHost: function(host) {
              this.host = host || {};
            },
            done: function(fn) {
              if (this._state === DONE_COMPLETE_STATE) {
                fn();
              } else {
                this._doneCallbacks.push(fn);
              }
            },
            progress: noop,
            getPromise: function() {
              if (!this.promise) {
                var self = this;
                this.promise = $q(function(resolve, reject) {
                  self.done(function(status) {
                    if (status === false) {
                      reject();
                    } else {
                      resolve();
                    }
                  });
                });
              }
              return this.promise;
            },
            then: function(resolveHandler, rejectHandler) {
              return this.getPromise().then(resolveHandler, rejectHandler);
            },
            'catch': function(handler) {
              return this.getPromise()['catch'](handler);
            },
            'finally': function(handler) {
              return this.getPromise()['finally'](handler);
            },
            pause: function() {
              if (this.host.pause) {
                this.host.pause();
              }
            },
            resume: function() {
              if (this.host.resume) {
                this.host.resume();
              }
            },
            end: function() {
              if (this.host.end) {
                this.host.end();
              }
              this._resolve(true);
            },
            cancel: function() {
              if (this.host.cancel) {
                this.host.cancel();
              }
              this._resolve(false);
            },
            complete: function(response) {
              var self = this;
              if (self._state === INITIAL_STATE) {
                self._state = DONE_PENDING_STATE;
                self._tick(function() {
                  self._resolve(response);
                });
              }
            },
            _resolve: function(response) {
              if (this._state !== DONE_COMPLETE_STATE) {
                forEach(this._doneCallbacks, function(fn) {
                  fn(response);
                });
                this._doneCallbacks.length = 0;
                this._state = DONE_COMPLETE_STATE;
              }
            }
          };
          return AnimateRunner;
        }
      ];
    };
    var $CoreAnimateCssProvider = function() {
      this.$get = ['$$rAF', '$q', '$$AnimateRunner', function($$rAF, $q, $$AnimateRunner) {
        return function(element, initialOptions) {
          var options = initialOptions || {};
          if (!options.$$prepared) {
            options = copy(options);
          }
          if (options.cleanupStyles) {
            options.from = options.to = null;
          }
          if (options.from) {
            element.css(options.from);
            options.from = null;
          }
          var closed, runner = new $$AnimateRunner();
          return {
            start: run,
            end: run
          };

          function run() {
            $$rAF(function() {
              applyAnimationContents();
              if (!closed) {
                runner.complete();
              }
              closed = true;
            });
            return runner;
          }

          function applyAnimationContents() {
            if (options.addClass) {
              element.addClass(options.addClass);
              options.addClass = null;
            }
            if (options.removeClass) {
              element.removeClass(options.removeClass);
              options.removeClass = null;
            }
            if (options.to) {
              element.css(options.to);
              options.to = null;
            }
          }
        };
      }];
    };

    function Browser(window, document, $log, $sniffer) {
      var self = this,
        location = window.location,
        history = window.history,
        setTimeout = window.setTimeout,
        clearTimeout = window.clearTimeout,
        pendingDeferIds = {};
      self.isMock = false;
      var outstandingRequestCount = 0;
      var outstandingRequestCallbacks = [];
      self.$$completeOutstandingRequest = completeOutstandingRequest;
      self.$$incOutstandingRequestCount = function() {
        outstandingRequestCount++;
      };

      function completeOutstandingRequest(fn) {
        try {
          fn.apply(null, sliceArgs(arguments, 1));
        } finally {
          outstandingRequestCount--;
          if (outstandingRequestCount === 0) {
            while (outstandingRequestCallbacks.length) {
              try {
                outstandingRequestCallbacks.pop()();
              } catch (e) {
                $log.error(e);
              }
            }
          }
        }
      }

      function getHash(url) {
        var index = url.indexOf('#');
        return index === -1 ? '' : url.substr(index);
      }
      self.notifyWhenNoOutstandingRequests = function(callback) {
        if (outstandingRequestCount === 0) {
          callback();
        } else {
          outstandingRequestCallbacks.push(callback);
        }
      };
      var cachedState, lastHistoryState,
        lastBrowserUrl = location.href,
        baseElement = document.find('base'),
        pendingLocation = null,
        getCurrentState = !$sniffer.history ? noop : function getCurrentState() {
          try {
            return history.state;
          } catch (e) {}
        };
      cacheState();
      lastHistoryState = cachedState;
      self.url = function(url, replace, state) {
        if (isUndefined(state)) {
          state = null;
        }
        if (location !== window.location) location = window.location;
        if (history !== window.history) history = window.history;
        if (url) {
          var sameState = lastHistoryState === state;
          if (lastBrowserUrl === url && (!$sniffer.history || sameState)) {
            return self;
          }
          var sameBase = lastBrowserUrl && stripHash(lastBrowserUrl) === stripHash(url);
          lastBrowserUrl = url;
          lastHistoryState = state;
          if ($sniffer.history && (!sameBase || !sameState)) {
            history[replace ? 'replaceState' : 'pushState'](state, '', url);
            cacheState();
            lastHistoryState = cachedState;
          } else {
            if (!sameBase) {
              pendingLocation = url;
            }
            if (replace) {
              location.replace(url);
            } else if (!sameBase) {
              location.href = url;
            } else {
              location.hash = getHash(url);
            }
            if (location.href !== url) {
              pendingLocation = url;
            }
          }
          if (pendingLocation) {
            pendingLocation = url;
          }
          return self;
        } else {
          return pendingLocation || location.href.replace(/%27/g, '\'');
        }
      };
      self.state = function() {
        return cachedState;
      };
      var urlChangeListeners = [],
        urlChangeInit = false;

      function cacheStateAndFireUrlChange() {
        pendingLocation = null;
        cacheState();
        fireUrlChange();
      }
      var lastCachedState = null;

      function cacheState() {
        cachedState = getCurrentState();
        cachedState = isUndefined(cachedState) ? null : cachedState;
        if (equals(cachedState, lastCachedState)) {
          cachedState = lastCachedState;
        }
        lastCachedState = cachedState;
      }

      function fireUrlChange() {
        if (lastBrowserUrl === self.url() && lastHistoryState === cachedState) {
          return;
        }
        lastBrowserUrl = self.url();
        lastHistoryState = cachedState;
        forEach(urlChangeListeners, function(listener) {
          listener(self.url(), cachedState);
        });
      }
      self.onUrlChange = function(callback) {
        if (!urlChangeInit) {
          if ($sniffer.history) jqLite(window).on('popstate', cacheStateAndFireUrlChange);
          jqLite(window).on('hashchange', cacheStateAndFireUrlChange);
          urlChangeInit = true;
        }
        urlChangeListeners.push(callback);
        return callback;
      };
      self.$$applicationDestroyed = function() {
        jqLite(window).off('hashchange popstate', cacheStateAndFireUrlChange);
      };
      self.$$checkUrlChange = fireUrlChange;
      self.baseHref = function() {
        var href = baseElement.attr('href');
        return href ? href.replace(/^(https?:)?\/\/[^/]*/, '') : '';
      };
      self.defer = function(fn, delay) {
        var timeoutId;
        outstandingRequestCount++;
        timeoutId = setTimeout(function() {
          delete pendingDeferIds[timeoutId];
          completeOutstandingRequest(fn);
        }, delay || 0);
        pendingDeferIds[timeoutId] = true;
        return timeoutId;
      };
      self.defer.cancel = function(deferId) {
        if (pendingDeferIds[deferId]) {
          delete pendingDeferIds[deferId];
          clearTimeout(deferId);
          completeOutstandingRequest(noop);
          return true;
        }
        return false;
      };
    }

    function $BrowserProvider() {
      this.$get = ['$window', '$log', '$sniffer', '$document',
        function($window, $log, $sniffer, $document) {
          return new Browser($window, $document, $log, $sniffer);
        }
      ];
    }

    function $CacheFactoryProvider() {
      this.$get = function() {
        var caches = {};

        function cacheFactory(cacheId, options) {
          if (cacheId in caches) {
            throw minErr('$cacheFactory')('iid', 'CacheId \'{0}\' is already taken!', cacheId);
          }
          var size = 0,
            stats = extend({}, options, {
              id: cacheId
            }),
            data = createMap(),
            capacity = (options && options.capacity) || Number.MAX_VALUE,
            lruHash = createMap(),
            freshEnd = null,
            staleEnd = null;
          return (caches[cacheId] = {
            put: function(key, value) {
              if (isUndefined(value)) return;
              if (capacity < Number.MAX_VALUE) {
                var lruEntry = lruHash[key] || (lruHash[key] = {
                  key: key
                });
                refresh(lruEntry);
              }
              if (!(key in data)) size++;
              data[key] = value;
              if (size > capacity) {
                this.remove(staleEnd.key);
              }
              return value;
            },
            get: function(key) {
              if (capacity < Number.MAX_VALUE) {
                var lruEntry = lruHash[key];
                if (!lruEntry) return;
                refresh(lruEntry);
              }
              return data[key];
            },
            remove: function(key) {
              if (capacity < Number.MAX_VALUE) {
                var lruEntry = lruHash[key];
                if (!lruEntry) return;
                if (lruEntry === freshEnd) freshEnd = lruEntry.p;
                if (lruEntry === staleEnd) staleEnd = lruEntry.n;
                link(lruEntry.n, lruEntry.p);
                delete lruHash[key];
              }
              if (!(key in data)) return;
              delete data[key];
              size--;
            },
            removeAll: function() {
              data = createMap();
              size = 0;
              lruHash = createMap();
              freshEnd = staleEnd = null;
            },
            destroy: function() {
              data = null;
              stats = null;
              lruHash = null;
              delete caches[cacheId];
            },
            info: function() {
              return extend({}, stats, {
                size: size
              });
            }
          });

          function refresh(entry) {
            if (entry !== freshEnd) {
              if (!staleEnd) {
                staleEnd = entry;
              } else if (staleEnd === entry) {
                staleEnd = entry.n;
              }
              link(entry.n, entry.p);
              link(entry, freshEnd);
              freshEnd = entry;
              freshEnd.n = null;
            }
          }

          function link(nextEntry, prevEntry) {
            if (nextEntry !== prevEntry) {
              if (nextEntry) nextEntry.p = prevEntry;
              if (prevEntry) prevEntry.n = nextEntry;
            }
          }
        }
        cacheFactory.info = function() {
          var info = {};
          forEach(caches, function(cache, cacheId) {
            info[cacheId] = cache.info();
          });
          return info;
        };
        cacheFactory.get = function(cacheId) {
          return caches[cacheId];
        };
        return cacheFactory;
      };
    }

    function $TemplateCacheProvider() {
      this.$get = ['$cacheFactory', function($cacheFactory) {
        return $cacheFactory('templates');
      }];
    }
    var $compileMinErr = minErr('$compile');

    function UNINITIALIZED_VALUE() {}
    var _UNINITIALIZED_VALUE = new UNINITIALIZED_VALUE();
    $CompileProvider.$inject = ['$provide', '$$sanitizeUriProvider'];

    function $CompileProvider($provide, $$sanitizeUriProvider) {
      var hasDirectives = {},
        Suffix = 'Directive',
        COMMENT_DIRECTIVE_REGEXP = /^\s*directive:\s*([\w-]+)\s+(.*)$/,
        CLASS_DIRECTIVE_REGEXP = /(([\w-]+)(?::([^;]+))?;?)/,
        ALL_OR_NOTHING_ATTRS = makeMap('ngSrc,ngSrcset,src,srcset'),
        REQUIRE_PREFIX_REGEXP = /^(?:(\^\^?)?(\?)?(\^\^?)?)?/;
      var EVENT_HANDLER_ATTR_REGEXP = /^(on[a-z]+|formaction)$/;
      var bindingCache = createMap();

      function parseIsolateBindings(scope, directiveName, isController) {
        var LOCAL_REGEXP = /^\s*([@&<]|=(\*?))(\??)\s*([\w$]*)\s*$/;
        var bindings = createMap();
        forEach(scope, function(definition, scopeName) {
          if (definition in bindingCache) {
            bindings[scopeName] = bindingCache[definition];
            return;
          }
          var match = definition.match(LOCAL_REGEXP);
          if (!match) {
            throw $compileMinErr('iscp',
              'Invalid {3} for directive \'{0}\'.' +
              ' Definition: {... {1}: \'{2}\' ...}',
              directiveName, scopeName, definition,
              (isController ? 'controller bindings definition' :
                'isolate scope definition'));
          }
          bindings[scopeName] = {
            mode: match[1][0],
            collection: match[2] === '*',
            optional: match[3] === '?',
            attrName: match[4] || scopeName
          };
          if (match[4]) {
            bindingCache[definition] = bindings[scopeName];
          }
        });
        return bindings;
      }

      function parseDirectiveBindings(directive, directiveName) {
        var bindings = {
          isolateScope: null,
          bindToController: null
        };
        if (isObject(directive.scope)) {
          if (directive.bindToController === true) {
            bindings.bindToController = parseIsolateBindings(directive.scope,
              directiveName, true);
            bindings.isolateScope = {};
          } else {
            bindings.isolateScope = parseIsolateBindings(directive.scope,
              directiveName, false);
          }
        }
        if (isObject(directive.bindToController)) {
          bindings.bindToController =
            parseIsolateBindings(directive.bindToController, directiveName, true);
        }
        if (bindings.bindToController && !directive.controller) {
          throw $compileMinErr('noctrl',
            'Cannot bind to controller without directive \'{0}\'s controller.',
            directiveName);
        }
        return bindings;
      }

      function assertValidDirectiveName(name) {
        var letter = name.charAt(0);
        if (!letter || letter !== lowercase(letter)) {
          throw $compileMinErr('baddir', 'Directive/Component name \'{0}\' is invalid. The first character must be a lowercase letter', name);
        }
        if (name !== name.trim()) {
          throw $compileMinErr('baddir',
            'Directive/Component name \'{0}\' is invalid. The name should not contain leading or trailing whitespaces',
            name);
        }
      }

      function getDirectiveRequire(directive) {
        var require = directive.require || (directive.controller && directive.name);
        if (!isArray(require) && isObject(require)) {
          forEach(require, function(value, key) {
            var match = value.match(REQUIRE_PREFIX_REGEXP);
            var name = value.substring(match[0].length);
            if (!name) require[key] = match[0] + key;
          });
        }
        return require;
      }

      function getDirectiveRestrict(restrict, name) {
        if (restrict && !(isString(restrict) && /[EACM]/.test(restrict))) {
          throw $compileMinErr('badrestrict',
            'Restrict property \'{0}\' of directive \'{1}\' is invalid',
            restrict,
            name);
        }
        return restrict || 'EA';
      }
      this.directive = function registerDirective(name, directiveFactory) {
        assertArg(name, 'name');
        assertNotHasOwnProperty(name, 'directive');
        if (isString(name)) {
          assertValidDirectiveName(name);
          assertArg(directiveFactory, 'directiveFactory');
          if (!hasDirectives.hasOwnProperty(name)) {
            hasDirectives[name] = [];
            $provide.factory(name + Suffix, ['$injector', '$exceptionHandler',
              function($injector, $exceptionHandler) {
                var directives = [];
                forEach(hasDirectives[name], function(directiveFactory, index) {
                  try {
                    var directive = $injector.invoke(directiveFactory);
                    if (isFunction(directive)) {
                      directive = {
                        compile: valueFn(directive)
                      };
                    } else if (!directive.compile && directive.link) {
                      directive.compile = valueFn(directive.link);
                    }
                    directive.priority = directive.priority || 0;
                    directive.index = index;
                    directive.name = directive.name || name;
                    directive.require = getDirectiveRequire(directive);
                    directive.restrict = getDirectiveRestrict(directive.restrict, name);
                    directive.$$moduleName = directiveFactory.$$moduleName;
                    directives.push(directive);
                  } catch (e) {
                    $exceptionHandler(e);
                  }
                });
                return directives;
              }
            ]);
          }
          hasDirectives[name].push(directiveFactory);
        } else {
          forEach(name, reverseParams(registerDirective));
        }
        return this;
      };
      this.component = function registerComponent(name, options) {
        var controller = options.controller || function() {};

        function factory($injector) {
          function makeInjectable(fn) {
            if (isFunction(fn) || isArray(fn)) {
              return function(tElement, tAttrs) {
                return $injector.invoke(fn, this, {
                  $element: tElement,
                  $attrs: tAttrs
                });
              };
            } else {
              return fn;
            }
          }
          var template = (!options.template && !options.templateUrl ? '' : options.template);
          var ddo = {
            controller: controller,
            controllerAs: identifierForController(options.controller) || options.controllerAs || '$ctrl',
            template: makeInjectable(template),
            templateUrl: makeInjectable(options.templateUrl),
            transclude: options.transclude,
            scope: {},
            bindToController: options.bindings || {},
            restrict: 'E',
            require: options.require
          };
          forEach(options, function(val, key) {
            if (key.charAt(0) === '$') ddo[key] = val;
          });
          return ddo;
        }
        forEach(options, function(val, key) {
          if (key.charAt(0) === '$') {
            factory[key] = val;
            if (isFunction(controller)) controller[key] = val;
          }
        });
        factory.$inject = ['$injector'];
        return this.directive(name, factory);
      };
      this.aHrefSanitizationWhitelist = function(regexp) {
        if (isDefined(regexp)) {
          $$sanitizeUriProvider.aHrefSanitizationWhitelist(regexp);
          return this;
        } else {
          return $$sanitizeUriProvider.aHrefSanitizationWhitelist();
        }
      };
      this.imgSrcSanitizationWhitelist = function(regexp) {
        if (isDefined(regexp)) {
          $$sanitizeUriProvider.imgSrcSanitizationWhitelist(regexp);
          return this;
        } else {
          return $$sanitizeUriProvider.imgSrcSanitizationWhitelist();
        }
      };
      var debugInfoEnabled = true;
      this.debugInfoEnabled = function(enabled) {
        if (isDefined(enabled)) {
          debugInfoEnabled = enabled;
          return this;
        }
        return debugInfoEnabled;
      };
      var preAssignBindingsEnabled = true;
      this.preAssignBindingsEnabled = function(enabled) {
        if (isDefined(enabled)) {
          preAssignBindingsEnabled = enabled;
          return this;
        }
        return preAssignBindingsEnabled;
      };
      var TTL = 10;
      this.onChangesTtl = function(value) {
        if (arguments.length) {
          TTL = value;
          return this;
        }
        return TTL;
      };
      var commentDirectivesEnabledConfig = true;
      this.commentDirectivesEnabled = function(value) {
        if (arguments.length) {
          commentDirectivesEnabledConfig = value;
          return this;
        }
        return commentDirectivesEnabledConfig;
      };
      var cssClassDirectivesEnabledConfig = true;
      this.cssClassDirectivesEnabled = function(value) {
        if (arguments.length) {
          cssClassDirectivesEnabledConfig = value;
          return this;
        }
        return cssClassDirectivesEnabledConfig;
      };
      this.$get = [
        '$injector', '$interpolate', '$exceptionHandler', '$templateRequest', '$parse',
        '$controller', '$rootScope', '$sce', '$animate', '$$sanitizeUri',
        function($injector, $interpolate, $exceptionHandler, $templateRequest, $parse,
          $controller, $rootScope, $sce, $animate, $$sanitizeUri) {
          var SIMPLE_ATTR_NAME = /^\w/;
          var specialAttrHolder = window.document.createElement('div');
          var commentDirectivesEnabled = commentDirectivesEnabledConfig;
          var cssClassDirectivesEnabled = cssClassDirectivesEnabledConfig;
          var onChangesTtl = TTL;
          var onChangesQueue;

          function flushOnChangesQueue() {
            try {
              if (!(--onChangesTtl)) {
                onChangesQueue = undefined;
                throw $compileMinErr('infchng', '{0} $onChanges() iterations reached. Aborting!\n', TTL);
              }
              $rootScope.$apply(function() {
                var errors = [];
                for (var i = 0, ii = onChangesQueue.length; i < ii; ++i) {
                  try {
                    onChangesQueue[i]();
                  } catch (e) {
                    errors.push(e);
                  }
                }
                onChangesQueue = undefined;
                if (errors.length) {
                  throw errors;
                }
              });
            } finally {
              onChangesTtl++;
            }
          }

          function Attributes(element, attributesToCopy) {
            if (attributesToCopy) {
              var keys = Object.keys(attributesToCopy);
              var i, l, key;
              for (i = 0, l = keys.length; i < l; i++) {
                key = keys[i];
                this[key] = attributesToCopy[key];
              }
            } else {
              this.$attr = {};
            }
            this.$$element = element;
          }
          Attributes.prototype = {
            $normalize: directiveNormalize,
            $addClass: function(classVal) {
              if (classVal && classVal.length > 0) {
                $animate.addClass(this.$$element, classVal);
              }
            },
            $removeClass: function(classVal) {
              if (classVal && classVal.length > 0) {
                $animate.removeClass(this.$$element, classVal);
              }
            },
            $updateClass: function(newClasses, oldClasses) {
              var toAdd = tokenDifference(newClasses, oldClasses);
              if (toAdd && toAdd.length) {
                $animate.addClass(this.$$element, toAdd);
              }
              var toRemove = tokenDifference(oldClasses, newClasses);
              if (toRemove && toRemove.length) {
                $animate.removeClass(this.$$element, toRemove);
              }
            },
            $set: function(key, value, writeAttr, attrName) {
              var node = this.$$element[0],
                booleanKey = getBooleanAttrName(node, key),
                aliasedKey = getAliasedAttrName(key),
                observer = key,
                nodeName;
              if (booleanKey) {
                this.$$element.prop(key, value);
                attrName = booleanKey;
              } else if (aliasedKey) {
                this[aliasedKey] = value;
                observer = aliasedKey;
              }
              this[key] = value;
              if (attrName) {
                this.$attr[key] = attrName;
              } else {
                attrName = this.$attr[key];
                if (!attrName) {
                  this.$attr[key] = attrName = snake_case(key, '-');
                }
              }
              nodeName = nodeName_(this.$$element);
              if ((nodeName === 'a' && (key === 'href' || key === 'xlinkHref')) ||
                (nodeName === 'img' && key === 'src')) {
                this[key] = value = $$sanitizeUri(value, key === 'src');
              } else if (nodeName === 'img' && key === 'srcset' && isDefined(value)) {
                var result = '';
                var trimmedSrcset = trim(value);
                var srcPattern = /(\s+\d+x\s*,|\s+\d+w\s*,|\s+,|,\s+)/;
                var pattern = /\s/.test(trimmedSrcset) ? srcPattern : /(,)/;
                var rawUris = trimmedSrcset.split(pattern);
                var nbrUrisWith2parts = Math.floor(rawUris.length / 2);
                for (var i = 0; i < nbrUrisWith2parts; i++) {
                  var innerIdx = i * 2;
                  result += $$sanitizeUri(trim(rawUris[innerIdx]), true);
                  result += (' ' + trim(rawUris[innerIdx + 1]));
                }
                var lastTuple = trim(rawUris[i * 2]).split(/\s/);
                result += $$sanitizeUri(trim(lastTuple[0]), true);
                if (lastTuple.length === 2) {
                  result += (' ' + trim(lastTuple[1]));
                }
                this[key] = value = result;
              }
              if (writeAttr !== false) {
                if (value === null || isUndefined(value)) {
                  this.$$element.removeAttr(attrName);
                } else {
                  if (SIMPLE_ATTR_NAME.test(attrName)) {
                    this.$$element.attr(attrName, value);
                  } else {
                    setSpecialAttr(this.$$element[0], attrName, value);
                  }
                }
              }
              var $$observers = this.$$observers;
              if ($$observers) {
                forEach($$observers[observer], function(fn) {
                  try {
                    fn(value);
                  } catch (e) {
                    $exceptionHandler(e);
                  }
                });
              }
            },
            $observe: function(key, fn) {
              var attrs = this,
                $$observers = (attrs.$$observers || (attrs.$$observers = createMap())),
                listeners = ($$observers[key] || ($$observers[key] = []));
              listeners.push(fn);
              $rootScope.$evalAsync(function() {
                if (!listeners.$$inter && attrs.hasOwnProperty(key) && !isUndefined(attrs[key])) {
                  fn(attrs[key]);
                }
              });
              return function() {
                arrayRemove(listeners, fn);
              };
            }
          };

          function setSpecialAttr(element, attrName, value) {
            specialAttrHolder.innerHTML = '<span ' + attrName + '>';
            var attributes = specialAttrHolder.firstChild.attributes;
            var attribute = attributes[0];
            attributes.removeNamedItem(attribute.name);
            attribute.value = value;
            element.attributes.setNamedItem(attribute);
          }

          function safeAddClass($element, className) {
            try {
              $element.addClass(className);
            } catch (e) {}
          }
          var startSymbol = $interpolate.startSymbol(),
            endSymbol = $interpolate.endSymbol(),
            denormalizeTemplate = (startSymbol === '{{' && endSymbol === '}}') ?
            identity :
            function denormalizeTemplate(template) {
              return template.replace(/\{\{/g, startSymbol).replace(/}}/g, endSymbol);
            },
            NG_ATTR_BINDING = /^ngAttr[A-Z]/;
          var MULTI_ELEMENT_DIR_RE = /^(.+)Start$/;
          compile.$$addBindingInfo = debugInfoEnabled ? function $$addBindingInfo($element, binding) {
            var bindings = $element.data('$binding') || [];
            if (isArray(binding)) {
              bindings = bindings.concat(binding);
            } else {
              bindings.push(binding);
            }
            $element.data('$binding', bindings);
          } : noop;
          compile.$$addBindingClass = debugInfoEnabled ? function $$addBindingClass($element) {
            safeAddClass($element, 'ng-binding');
          } : noop;
          compile.$$addScopeInfo = debugInfoEnabled ? function $$addScopeInfo($element, scope, isolated, noTemplate) {
            var dataName = isolated ? (noTemplate ? '$isolateScopeNoTemplate' : '$isolateScope') : '$scope';
            $element.data(dataName, scope);
          } : noop;
          compile.$$addScopeClass = debugInfoEnabled ? function $$addScopeClass($element, isolated) {
            safeAddClass($element, isolated ? 'ng-isolate-scope' : 'ng-scope');
          } : noop;
          compile.$$createComment = function(directiveName, comment) {
            var content = '';
            if (debugInfoEnabled) {
              content = ' ' + (directiveName || '') + ': ';
              if (comment) content += comment + ' ';
            }
            return window.document.createComment(content);
          };
          return compile;

          function compile($compileNodes, transcludeFn, maxPriority, ignoreDirective,
            previousCompileContext) {
            if (!($compileNodes instanceof jqLite)) {
              $compileNodes = jqLite($compileNodes);
            }
            var NOT_EMPTY = /\S+/;
            for (var i = 0, len = $compileNodes.length; i < len; i++) {
              var domNode = $compileNodes[i];
              if (domNode.nodeType === NODE_TYPE_TEXT && domNode.nodeValue.match(NOT_EMPTY)) {
                jqLiteWrapNode(domNode, $compileNodes[i] = window.document.createElement('span'));
              }
            }
            var compositeLinkFn =
              compileNodes($compileNodes, transcludeFn, $compileNodes,
                maxPriority, ignoreDirective, previousCompileContext);
            compile.$$addScopeClass($compileNodes);
            var namespace = null;
            return function publicLinkFn(scope, cloneConnectFn, options) {
              assertArg(scope, 'scope');
              if (previousCompileContext && previousCompileContext.needsNewScope) {
                scope = scope.$parent.$new();
              }
              options = options || {};
              var parentBoundTranscludeFn = options.parentBoundTranscludeFn,
                transcludeControllers = options.transcludeControllers,
                futureParentElement = options.futureParentElement;
              if (parentBoundTranscludeFn && parentBoundTranscludeFn.$$boundTransclude) {
                parentBoundTranscludeFn = parentBoundTranscludeFn.$$boundTransclude;
              }
              if (!namespace) {
                namespace = detectNamespaceForChildElements(futureParentElement);
              }
              var $linkNode;
              if (namespace !== 'html') {
                $linkNode = jqLite(
                  wrapTemplate(namespace, jqLite('<div>').append($compileNodes).html())
                );
              } else if (cloneConnectFn) {
                $linkNode = JQLitePrototype.clone.call($compileNodes);
              } else {
                $linkNode = $compileNodes;
              }
              if (transcludeControllers) {
                for (var controllerName in transcludeControllers) {
                  $linkNode.data('$' + controllerName + 'Controller', transcludeControllers[controllerName].instance);
                }
              }
              compile.$$addScopeInfo($linkNode, scope);
              if (cloneConnectFn) cloneConnectFn($linkNode, scope);
              if (compositeLinkFn) compositeLinkFn(scope, $linkNode, $linkNode, parentBoundTranscludeFn);
              return $linkNode;
            };
          }

          function detectNamespaceForChildElements(parentElement) {
            var node = parentElement && parentElement[0];
            if (!node) {
              return 'html';
            } else {
              return nodeName_(node) !== 'foreignobject' && toString.call(node).match(/SVG/) ? 'svg' : 'html';
            }
          }

          function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective,
            previousCompileContext) {
            var linkFns = [],
              attrs, directives, nodeLinkFn, childNodes, childLinkFn, linkFnFound, nodeLinkFnFound;
            for (var i = 0; i < nodeList.length; i++) {
              attrs = new Attributes();
              directives = collectDirectives(nodeList[i], [], attrs, i === 0 ? maxPriority : undefined,
                ignoreDirective);
              nodeLinkFn = (directives.length) ?
                applyDirectivesToNode(directives, nodeList[i], attrs, transcludeFn, $rootElement,
                  null, [], [], previousCompileContext) :
                null;
              if (nodeLinkFn && nodeLinkFn.scope) {
                compile.$$addScopeClass(attrs.$$element);
              }
              childLinkFn = (nodeLinkFn && nodeLinkFn.terminal ||
                  !(childNodes = nodeList[i].childNodes) ||
                  !childNodes.length) ?
                null :
                compileNodes(childNodes,
                  nodeLinkFn ? (
                    (nodeLinkFn.transcludeOnThisElement || !nodeLinkFn.templateOnThisElement) &&
                    nodeLinkFn.transclude) : transcludeFn);
              if (nodeLinkFn || childLinkFn) {
                linkFns.push(i, nodeLinkFn, childLinkFn);
                linkFnFound = true;
                nodeLinkFnFound = nodeLinkFnFound || nodeLinkFn;
              }
              previousCompileContext = null;
            }
            return linkFnFound ? compositeLinkFn : null;

            function compositeLinkFn(scope, nodeList, $rootElement, parentBoundTranscludeFn) {
              var nodeLinkFn, childLinkFn, node, childScope, i, ii, idx, childBoundTranscludeFn;
              var stableNodeList;
              if (nodeLinkFnFound) {
                var nodeListLength = nodeList.length;
                stableNodeList = new Array(nodeListLength);
                for (i = 0; i < linkFns.length; i += 3) {
                  idx = linkFns[i];
                  stableNodeList[idx] = nodeList[idx];
                }
              } else {
                stableNodeList = nodeList;
              }
              for (i = 0, ii = linkFns.length; i < ii;) {
                node = stableNodeList[linkFns[i++]];
                nodeLinkFn = linkFns[i++];
                childLinkFn = linkFns[i++];
                if (nodeLinkFn) {
                  if (nodeLinkFn.scope) {
                    childScope = scope.$new();
                    compile.$$addScopeInfo(jqLite(node), childScope);
                  } else {
                    childScope = scope;
                  }
                  if (nodeLinkFn.transcludeOnThisElement) {
                    childBoundTranscludeFn = createBoundTranscludeFn(
                      scope, nodeLinkFn.transclude, parentBoundTranscludeFn);
                  } else if (!nodeLinkFn.templateOnThisElement && parentBoundTranscludeFn) {
                    childBoundTranscludeFn = parentBoundTranscludeFn;
                  } else if (!parentBoundTranscludeFn && transcludeFn) {
                    childBoundTranscludeFn = createBoundTranscludeFn(scope, transcludeFn);
                  } else {
                    childBoundTranscludeFn = null;
                  }
                  nodeLinkFn(childLinkFn, childScope, node, $rootElement, childBoundTranscludeFn);
                } else if (childLinkFn) {
                  childLinkFn(scope, node.childNodes, undefined, parentBoundTranscludeFn);
                }
              }
            }
          }

          function createBoundTranscludeFn(scope, transcludeFn, previousBoundTranscludeFn) {
            function boundTranscludeFn(transcludedScope, cloneFn, controllers, futureParentElement, containingScope) {
              if (!transcludedScope) {
                transcludedScope = scope.$new(false, containingScope);
                transcludedScope.$$transcluded = true;
              }
              return transcludeFn(transcludedScope, cloneFn, {
                parentBoundTranscludeFn: previousBoundTranscludeFn,
                transcludeControllers: controllers,
                futureParentElement: futureParentElement
              });
            }
            var boundSlots = boundTranscludeFn.$$slots = createMap();
            for (var slotName in transcludeFn.$$slots) {
              if (transcludeFn.$$slots[slotName]) {
                boundSlots[slotName] = createBoundTranscludeFn(scope, transcludeFn.$$slots[slotName], previousBoundTranscludeFn);
              } else {
                boundSlots[slotName] = null;
              }
            }
            return boundTranscludeFn;
          }

          function collectDirectives(node, directives, attrs, maxPriority, ignoreDirective) {
            var nodeType = node.nodeType,
              attrsMap = attrs.$attr,
              match,
              nodeName,
              className;
            switch (nodeType) {
              case NODE_TYPE_ELEMENT:
                nodeName = nodeName_(node);
                addDirective(directives,
                  directiveNormalize(nodeName), 'E', maxPriority, ignoreDirective);
                for (var attr, name, nName, ngAttrName, value, isNgAttr, nAttrs = node.attributes,
                    j = 0, jj = nAttrs && nAttrs.length; j < jj; j++) {
                  var attrStartName = false;
                  var attrEndName = false;
                  attr = nAttrs[j];
                  name = attr.name;
                  value = trim(attr.value);
                  ngAttrName = directiveNormalize(name);
                  isNgAttr = NG_ATTR_BINDING.test(ngAttrName);
                  if (isNgAttr) {
                    name = name.replace(PREFIX_REGEXP, '')
                      .substr(8).replace(/_(.)/g, function(match, letter) {
                        return letter.toUpperCase();
                      });
                  }
                  var multiElementMatch = ngAttrName.match(MULTI_ELEMENT_DIR_RE);
                  if (multiElementMatch && directiveIsMultiElement(multiElementMatch[1])) {
                    attrStartName = name;
                    attrEndName = name.substr(0, name.length - 5) + 'end';
                    name = name.substr(0, name.length - 6);
                  }
                  nName = directiveNormalize(name.toLowerCase());
                  attrsMap[nName] = name;
                  if (isNgAttr || !attrs.hasOwnProperty(nName)) {
                    attrs[nName] = value;
                    if (getBooleanAttrName(node, nName)) {
                      attrs[nName] = true;
                    }
                  }
                  addAttrInterpolateDirective(node, directives, value, nName, isNgAttr);
                  addDirective(directives, nName, 'A', maxPriority, ignoreDirective, attrStartName,
                    attrEndName);
                }
                if (nodeName === 'input' && node.getAttribute('type') === 'hidden') {
                  node.setAttribute('autocomplete', 'off');
                }
                if (!cssClassDirectivesEnabled) break;
                className = node.className;
                if (isObject(className)) {
                  className = className.animVal;
                }
                if (isString(className) && className !== '') {
                  while ((match = CLASS_DIRECTIVE_REGEXP.exec(className))) {
                    nName = directiveNormalize(match[2]);
                    if (addDirective(directives, nName, 'C', maxPriority, ignoreDirective)) {
                      attrs[nName] = trim(match[3]);
                    }
                    className = className.substr(match.index + match[0].length);
                  }
                }
                break;
              case NODE_TYPE_TEXT:
                if (msie === 11) {
                  while (node.parentNode && node.nextSibling && node.nextSibling.nodeType === NODE_TYPE_TEXT) {
                    node.nodeValue = node.nodeValue + node.nextSibling.nodeValue;
                    node.parentNode.removeChild(node.nextSibling);
                  }
                }
                addTextInterpolateDirective(directives, node.nodeValue);
                break;
              case NODE_TYPE_COMMENT:
                if (!commentDirectivesEnabled) break;
                collectCommentDirectives(node, directives, attrs, maxPriority, ignoreDirective);
                break;
            }
            directives.sort(byPriority);
            return directives;
          }

          function collectCommentDirectives(node, directives, attrs, maxPriority, ignoreDirective) {
            try {
              var match = COMMENT_DIRECTIVE_REGEXP.exec(node.nodeValue);
              if (match) {
                var nName = directiveNormalize(match[1]);
                if (addDirective(directives, nName, 'M', maxPriority, ignoreDirective)) {
                  attrs[nName] = trim(match[2]);
                }
              }
            } catch (e) {}
          }

          function groupScan(node, attrStart, attrEnd) {
            var nodes = [];
            var depth = 0;
            if (attrStart && node.hasAttribute && node.hasAttribute(attrStart)) {
              do {
                if (!node) {
                  throw $compileMinErr('uterdir',
                    'Unterminated attribute, found \'{0}\' but no matching \'{1}\' found.',
                    attrStart, attrEnd);
                }
                if (node.nodeType === NODE_TYPE_ELEMENT) {
                  if (node.hasAttribute(attrStart)) depth++;
                  if (node.hasAttribute(attrEnd)) depth--;
                }
                nodes.push(node);
                node = node.nextSibling;
              } while (depth > 0);
            } else {
              nodes.push(node);
            }
            return jqLite(nodes);
          }

          function groupElementsLinkFnWrapper(linkFn, attrStart, attrEnd) {
            return function groupedElementsLink(scope, element, attrs, controllers, transcludeFn) {
              element = groupScan(element[0], attrStart, attrEnd);
              return linkFn(scope, element, attrs, controllers, transcludeFn);
            };
          }

          function compilationGenerator(eager, $compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext) {
            var compiled;
            if (eager) {
              return compile($compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext);
            }
            return function lazyCompilation() {
              if (!compiled) {
                compiled = compile($compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext);
                $compileNodes = transcludeFn = previousCompileContext = null;
              }
              return compiled.apply(this, arguments);
            };
          }

          function applyDirectivesToNode(directives, compileNode, templateAttrs, transcludeFn,
            jqCollection, originalReplaceDirective, preLinkFns, postLinkFns,
            previousCompileContext) {
            previousCompileContext = previousCompileContext || {};
            var terminalPriority = -Number.MAX_VALUE,
              newScopeDirective = previousCompileContext.newScopeDirective,
              controllerDirectives = previousCompileContext.controllerDirectives,
              newIsolateScopeDirective = previousCompileContext.newIsolateScopeDirective,
              templateDirective = previousCompileContext.templateDirective,
              nonTlbTranscludeDirective = previousCompileContext.nonTlbTranscludeDirective,
              hasTranscludeDirective = false,
              hasTemplate = false,
              hasElementTranscludeDirective = previousCompileContext.hasElementTranscludeDirective,
              $compileNode = templateAttrs.$$element = jqLite(compileNode),
              directive,
              directiveName,
              $template,
              replaceDirective = originalReplaceDirective,
              childTranscludeFn = transcludeFn,
              linkFn,
              didScanForMultipleTransclusion = false,
              mightHaveMultipleTransclusionError = false,
              directiveValue;
            for (var i = 0, ii = directives.length; i < ii; i++) {
              directive = directives[i];
              var attrStart = directive.$$start;
              var attrEnd = directive.$$end;
              if (attrStart) {
                $compileNode = groupScan(compileNode, attrStart, attrEnd);
              }
              $template = undefined;
              if (terminalPriority > directive.priority) {
                break;
              }
              directiveValue = directive.scope;
              if (directiveValue) {
                if (!directive.templateUrl) {
                  if (isObject(directiveValue)) {
                    assertNoDuplicate('new/isolated scope', newIsolateScopeDirective || newScopeDirective,
                      directive, $compileNode);
                    newIsolateScopeDirective = directive;
                  } else {
                    assertNoDuplicate('new/isolated scope', newIsolateScopeDirective, directive,
                      $compileNode);
                  }
                }
                newScopeDirective = newScopeDirective || directive;
              }
              directiveName = directive.name;
              if (!didScanForMultipleTransclusion && ((directive.replace && (directive.templateUrl || directive.template)) ||
                  (directive.transclude && !directive.$$tlb))) {
                var candidateDirective;
                for (var scanningIndex = i + 1;
                  (candidateDirective = directives[scanningIndex++]);) {
                  if ((candidateDirective.transclude && !candidateDirective.$$tlb) ||
                    (candidateDirective.replace && (candidateDirective.templateUrl || candidateDirective.template))) {
                    mightHaveMultipleTransclusionError = true;
                    break;
                  }
                }
                didScanForMultipleTransclusion = true;
              }
              if (!directive.templateUrl && directive.controller) {
                controllerDirectives = controllerDirectives || createMap();
                assertNoDuplicate('\'' + directiveName + '\' controller',
                  controllerDirectives[directiveName], directive, $compileNode);
                controllerDirectives[directiveName] = directive;
              }
              directiveValue = directive.transclude;
              if (directiveValue) {
                hasTranscludeDirective = true;
                if (!directive.$$tlb) {
                  assertNoDuplicate('transclusion', nonTlbTranscludeDirective, directive, $compileNode);
                  nonTlbTranscludeDirective = directive;
                }
                if (directiveValue === 'element') {
                  hasElementTranscludeDirective = true;
                  terminalPriority = directive.priority;
                  $template = $compileNode;
                  $compileNode = templateAttrs.$$element =
                    jqLite(compile.$$createComment(directiveName, templateAttrs[directiveName]));
                  compileNode = $compileNode[0];
                  replaceWith(jqCollection, sliceArgs($template), compileNode);
                  $template[0].$$parentNode = $template[0].parentNode;
                  childTranscludeFn = compilationGenerator(mightHaveMultipleTransclusionError, $template, transcludeFn, terminalPriority,
                    replaceDirective && replaceDirective.name, {
                      nonTlbTranscludeDirective: nonTlbTranscludeDirective
                    });
                } else {
                  var slots = createMap();
                  $template = jqLite(jqLiteClone(compileNode)).contents();
                  if (isObject(directiveValue)) {
                    $template = [];
                    var slotMap = createMap();
                    var filledSlots = createMap();
                    forEach(directiveValue, function(elementSelector, slotName) {
                      var optional = (elementSelector.charAt(0) === '?');
                      elementSelector = optional ? elementSelector.substring(1) : elementSelector;
                      slotMap[elementSelector] = slotName;
                      slots[slotName] = null;
                      filledSlots[slotName] = optional;
                    });
                    forEach($compileNode.contents(), function(node) {
                      var slotName = slotMap[directiveNormalize(nodeName_(node))];
                      if (slotName) {
                        filledSlots[slotName] = true;
                        slots[slotName] = slots[slotName] || [];
                        slots[slotName].push(node);
                      } else {
                        $template.push(node);
                      }
                    });
                    forEach(filledSlots, function(filled, slotName) {
                      if (!filled) {
                        throw $compileMinErr('reqslot', 'Required transclusion slot `{0}` was not filled.', slotName);
                      }
                    });
                    for (var slotName in slots) {
                      if (slots[slotName]) {
                        slots[slotName] = compilationGenerator(mightHaveMultipleTransclusionError, slots[slotName], transcludeFn);
                      }
                    }
                  }
                  $compileNode.empty();
                  childTranscludeFn = compilationGenerator(mightHaveMultipleTransclusionError, $template, transcludeFn, undefined,
                    undefined, {
                      needsNewScope: directive.$$isolateScope || directive.$$newScope
                    });
                  childTranscludeFn.$$slots = slots;
                }
              }
              if (directive.template) {
                hasTemplate = true;
                assertNoDuplicate('template', templateDirective, directive, $compileNode);
                templateDirective = directive;
                directiveValue = (isFunction(directive.template)) ?
                  directive.template($compileNode, templateAttrs) :
                  directive.template;
                directiveValue = denormalizeTemplate(directiveValue);
                if (directive.replace) {
                  replaceDirective = directive;
                  if (jqLiteIsTextNode(directiveValue)) {
                    $template = [];
                  } else {
                    $template = removeComments(wrapTemplate(directive.templateNamespace, trim(directiveValue)));
                  }
                  compileNode = $template[0];
                  if ($template.length !== 1 || compileNode.nodeType !== NODE_TYPE_ELEMENT) {
                    throw $compileMinErr('tplrt',
                      'Template for directive \'{0}\' must have exactly one root element. {1}',
                      directiveName, '');
                  }
                  replaceWith(jqCollection, $compileNode, compileNode);
                  var newTemplateAttrs = {
                    $attr: {}
                  };
                  var templateDirectives = collectDirectives(compileNode, [], newTemplateAttrs);
                  var unprocessedDirectives = directives.splice(i + 1, directives.length - (i + 1));
                  if (newIsolateScopeDirective || newScopeDirective) {
                    markDirectiveScope(templateDirectives, newIsolateScopeDirective, newScopeDirective);
                  }
                  directives = directives.concat(templateDirectives).concat(unprocessedDirectives);
                  mergeTemplateAttributes(templateAttrs, newTemplateAttrs);
                  ii = directives.length;
                } else {
                  $compileNode.html(directiveValue);
                }
              }
              if (directive.templateUrl) {
                hasTemplate = true;
                assertNoDuplicate('template', templateDirective, directive, $compileNode);
                templateDirective = directive;
                if (directive.replace) {
                  replaceDirective = directive;
                }
                nodeLinkFn = compileTemplateUrl(directives.splice(i, directives.length - i), $compileNode,
                  templateAttrs, jqCollection, hasTranscludeDirective && childTranscludeFn, preLinkFns, postLinkFns, {
                    controllerDirectives: controllerDirectives,
                    newScopeDirective: (newScopeDirective !== directive) && newScopeDirective,
                    newIsolateScopeDirective: newIsolateScopeDirective,
                    templateDirective: templateDirective,
                    nonTlbTranscludeDirective: nonTlbTranscludeDirective
                  });
                ii = directives.length;
              } else if (directive.compile) {
                try {
                  linkFn = directive.compile($compileNode, templateAttrs, childTranscludeFn);
                  var context = directive.$$originalDirective || directive;
                  if (isFunction(linkFn)) {
                    addLinkFns(null, bind(context, linkFn), attrStart, attrEnd);
                  } else if (linkFn) {
                    addLinkFns(bind(context, linkFn.pre), bind(context, linkFn.post), attrStart, attrEnd);
                  }
                } catch (e) {
                  $exceptionHandler(e, startingTag($compileNode));
                }
              }
              if (directive.terminal) {
                nodeLinkFn.terminal = true;
                terminalPriority = Math.max(terminalPriority, directive.priority);
              }
            }
            nodeLinkFn.scope = newScopeDirective && newScopeDirective.scope === true;
            nodeLinkFn.transcludeOnThisElement = hasTranscludeDirective;
            nodeLinkFn.templateOnThisElement = hasTemplate;
            nodeLinkFn.transclude = childTranscludeFn;
            previousCompileContext.hasElementTranscludeDirective = hasElementTranscludeDirective;
            return nodeLinkFn;

            function addLinkFns(pre, post, attrStart, attrEnd) {
              if (pre) {
                if (attrStart) pre = groupElementsLinkFnWrapper(pre, attrStart, attrEnd);
                pre.require = directive.require;
                pre.directiveName = directiveName;
                if (newIsolateScopeDirective === directive || directive.$$isolateScope) {
                  pre = cloneAndAnnotateFn(pre, {
                    isolateScope: true
                  });
                }
                preLinkFns.push(pre);
              }
              if (post) {
                if (attrStart) post = groupElementsLinkFnWrapper(post, attrStart, attrEnd);
                post.require = directive.require;
                post.directiveName = directiveName;
                if (newIsolateScopeDirective === directive || directive.$$isolateScope) {
                  post = cloneAndAnnotateFn(post, {
                    isolateScope: true
                  });
                }
                postLinkFns.push(post);
              }
            }

            function nodeLinkFn(childLinkFn, scope, linkNode, $rootElement, boundTranscludeFn) {
              var i, ii, linkFn, isolateScope, controllerScope, elementControllers, transcludeFn, $element,
                attrs, scopeBindingInfo;
              if (compileNode === linkNode) {
                attrs = templateAttrs;
                $element = templateAttrs.$$element;
              } else {
                $element = jqLite(linkNode);
                attrs = new Attributes($element, templateAttrs);
              }
              controllerScope = scope;
              if (newIsolateScopeDirective) {
                isolateScope = scope.$new(true);
              } else if (newScopeDirective) {
                controllerScope = scope.$parent;
              }
              if (boundTranscludeFn) {
                transcludeFn = controllersBoundTransclude;
                transcludeFn.$$boundTransclude = boundTranscludeFn;
                transcludeFn.isSlotFilled = function(slotName) {
                  return !!boundTranscludeFn.$$slots[slotName];
                };
              }
              if (controllerDirectives) {
                elementControllers = setupControllers($element, attrs, transcludeFn, controllerDirectives, isolateScope, scope, newIsolateScopeDirective);
              }
              if (newIsolateScopeDirective) {
                compile.$$addScopeInfo($element, isolateScope, true, !(templateDirective && (templateDirective === newIsolateScopeDirective ||
                  templateDirective === newIsolateScopeDirective.$$originalDirective)));
                compile.$$addScopeClass($element, true);
                isolateScope.$$isolateBindings =
                  newIsolateScopeDirective.$$isolateBindings;
                scopeBindingInfo = initializeDirectiveBindings(scope, attrs, isolateScope,
                  isolateScope.$$isolateBindings,
                  newIsolateScopeDirective);
                if (scopeBindingInfo.removeWatches) {
                  isolateScope.$on('$destroy', scopeBindingInfo.removeWatches);
                }
              }
              for (var name in elementControllers) {
                var controllerDirective = controllerDirectives[name];
                var controller = elementControllers[name];
                var bindings = controllerDirective.$$bindings.bindToController;
                if (preAssignBindingsEnabled) {
                  if (bindings) {
                    controller.bindingInfo =
                      initializeDirectiveBindings(controllerScope, attrs, controller.instance, bindings, controllerDirective);
                  } else {
                    controller.bindingInfo = {};
                  }
                  var controllerResult = controller();
                  if (controllerResult !== controller.instance) {
                    controller.instance = controllerResult;
                    $element.data('$' + controllerDirective.name + 'Controller', controllerResult);
                    if (controller.bindingInfo.removeWatches) {
                      controller.bindingInfo.removeWatches();
                    }
                    controller.bindingInfo =
                      initializeDirectiveBindings(controllerScope, attrs, controller.instance, bindings, controllerDirective);
                  }
                } else {
                  controller.instance = controller();
                  $element.data('$' + controllerDirective.name + 'Controller', controller.instance);
                  controller.bindingInfo =
                    initializeDirectiveBindings(controllerScope, attrs, controller.instance, bindings, controllerDirective);
                }
              }
              forEach(controllerDirectives, function(controllerDirective, name) {
                var require = controllerDirective.require;
                if (controllerDirective.bindToController && !isArray(require) && isObject(require)) {
                  extend(elementControllers[name].instance, getControllers(name, require, $element, elementControllers));
                }
              });
              forEach(elementControllers, function(controller) {
                var controllerInstance = controller.instance;
                if (isFunction(controllerInstance.$onChanges)) {
                  try {
                    controllerInstance.$onChanges(controller.bindingInfo.initialChanges);
                  } catch (e) {
                    $exceptionHandler(e);
                  }
                }
                if (isFunction(controllerInstance.$onInit)) {
                  try {
                    controllerInstance.$onInit();
                  } catch (e) {
                    $exceptionHandler(e);
                  }
                }
                if (isFunction(controllerInstance.$doCheck)) {
                  controllerScope.$watch(function() {
                    controllerInstance.$doCheck();
                  });
                  controllerInstance.$doCheck();
                }
                if (isFunction(controllerInstance.$onDestroy)) {
                  controllerScope.$on('$destroy', function callOnDestroyHook() {
                    controllerInstance.$onDestroy();
                  });
                }
              });
              for (i = 0, ii = preLinkFns.length; i < ii; i++) {
                linkFn = preLinkFns[i];
                invokeLinkFn(linkFn,
                  linkFn.isolateScope ? isolateScope : scope,
                  $element,
                  attrs,
                  linkFn.require && getControllers(linkFn.directiveName, linkFn.require, $element, elementControllers),
                  transcludeFn
                );
              }
              var scopeToChild = scope;
              if (newIsolateScopeDirective && (newIsolateScopeDirective.template || newIsolateScopeDirective.templateUrl === null)) {
                scopeToChild = isolateScope;
              }
              if (childLinkFn) {
                childLinkFn(scopeToChild, linkNode.childNodes, undefined, boundTranscludeFn);
              }
              for (i = postLinkFns.length - 1; i >= 0; i--) {
                linkFn = postLinkFns[i];
                invokeLinkFn(linkFn,
                  linkFn.isolateScope ? isolateScope : scope,
                  $element,
                  attrs,
                  linkFn.require && getControllers(linkFn.directiveName, linkFn.require, $element, elementControllers),
                  transcludeFn
                );
              }
              forEach(elementControllers, function(controller) {
                var controllerInstance = controller.instance;
                if (isFunction(controllerInstance.$postLink)) {
                  controllerInstance.$postLink();
                }
              });

              function controllersBoundTransclude(scope, cloneAttachFn, futureParentElement, slotName) {
                var transcludeControllers;
                if (!isScope(scope)) {
                  slotName = futureParentElement;
                  futureParentElement = cloneAttachFn;
                  cloneAttachFn = scope;
                  scope = undefined;
                }
                if (hasElementTranscludeDirective) {
                  transcludeControllers = elementControllers;
                }
                if (!futureParentElement) {
                  futureParentElement = hasElementTranscludeDirective ? $element.parent() : $element;
                }
                if (slotName) {
                  var slotTranscludeFn = boundTranscludeFn.$$slots[slotName];
                  if (slotTranscludeFn) {
                    return slotTranscludeFn(scope, cloneAttachFn, transcludeControllers, futureParentElement, scopeToChild);
                  } else if (isUndefined(slotTranscludeFn)) {
                    throw $compileMinErr('noslot',
                      'No parent directive that requires a transclusion with slot name "{0}". ' +
                      'Element: {1}',
                      slotName, startingTag($element));
                  }
                } else {
                  return boundTranscludeFn(scope, cloneAttachFn, transcludeControllers, futureParentElement, scopeToChild);
                }
              }
            }
          }

          function getControllers(directiveName, require, $element, elementControllers) {
            var value;
            if (isString(require)) {
              var match = require.match(REQUIRE_PREFIX_REGEXP);
              var name = require.substring(match[0].length);
              var inheritType = match[1] || match[3];
              var optional = match[2] === '?';
              if (inheritType === '^^') {
                $element = $element.parent();
              } else {
                value = elementControllers && elementControllers[name];
                value = value && value.instance;
              }
              if (!value) {
                var dataName = '$' + name + 'Controller';
                value = inheritType ? $element.inheritedData(dataName) : $element.data(dataName);
              }
              if (!value && !optional) {
                throw $compileMinErr('ctreq',
                  'Controller \'{0}\', required by directive \'{1}\', can\'t be found!',
                  name, directiveName);
              }
            } else if (isArray(require)) {
              value = [];
              for (var i = 0, ii = require.length; i < ii; i++) {
                value[i] = getControllers(directiveName, require[i], $element, elementControllers);
              }
            } else if (isObject(require)) {
              value = {};
              forEach(require, function(controller, property) {
                value[property] = getControllers(directiveName, controller, $element, elementControllers);
              });
            }
            return value || null;
          }

          function setupControllers($element, attrs, transcludeFn, controllerDirectives, isolateScope, scope, newIsolateScopeDirective) {
            var elementControllers = createMap();
            for (var controllerKey in controllerDirectives) {
              var directive = controllerDirectives[controllerKey];
              var locals = {
                $scope: directive === newIsolateScopeDirective || directive.$$isolateScope ? isolateScope : scope,
                $element: $element,
                $attrs: attrs,
                $transclude: transcludeFn
              };
              var controller = directive.controller;
              if (controller === '@') {
                controller = attrs[directive.name];
              }
              var controllerInstance = $controller(controller, locals, true, directive.controllerAs);
              elementControllers[directive.name] = controllerInstance;
              $element.data('$' + directive.name + 'Controller', controllerInstance.instance);
            }
            return elementControllers;
          }

          function markDirectiveScope(directives, isolateScope, newScope) {
            for (var j = 0, jj = directives.length; j < jj; j++) {
              directives[j] = inherit(directives[j], {
                $$isolateScope: isolateScope,
                $$newScope: newScope
              });
            }
          }

          function addDirective(tDirectives, name, location, maxPriority, ignoreDirective, startAttrName,
            endAttrName) {
            if (name === ignoreDirective) return null;
            var match = null;
            if (hasDirectives.hasOwnProperty(name)) {
              for (var directive, directives = $injector.get(name + Suffix),
                  i = 0, ii = directives.length; i < ii; i++) {
                directive = directives[i];
                if ((isUndefined(maxPriority) || maxPriority > directive.priority) &&
                  directive.restrict.indexOf(location) !== -1) {
                  if (startAttrName) {
                    directive = inherit(directive, {
                      $$start: startAttrName,
                      $$end: endAttrName
                    });
                  }
                  if (!directive.$$bindings) {
                    var bindings = directive.$$bindings =
                      parseDirectiveBindings(directive, directive.name);
                    if (isObject(bindings.isolateScope)) {
                      directive.$$isolateBindings = bindings.isolateScope;
                    }
                  }
                  tDirectives.push(directive);
                  match = directive;
                }
              }
            }
            return match;
          }

          function directiveIsMultiElement(name) {
            if (hasDirectives.hasOwnProperty(name)) {
              for (var directive, directives = $injector.get(name + Suffix),
                  i = 0, ii = directives.length; i < ii; i++) {
                directive = directives[i];
                if (directive.multiElement) {
                  return true;
                }
              }
            }
            return false;
          }

          function mergeTemplateAttributes(dst, src) {
            var srcAttr = src.$attr,
              dstAttr = dst.$attr;
            forEach(dst, function(value, key) {
              if (key.charAt(0) !== '$') {
                if (src[key] && src[key] !== value) {
                  value += (key === 'style' ? ';' : ' ') + src[key];
                }
                dst.$set(key, value, true, srcAttr[key]);
              }
            });
            forEach(src, function(value, key) {
              if (!dst.hasOwnProperty(key) && key.charAt(0) !== '$') {
                dst[key] = value;
                if (key !== 'class' && key !== 'style') {
                  dstAttr[key] = srcAttr[key];
                }
              }
            });
          }

          function compileTemplateUrl(directives, $compileNode, tAttrs,
            $rootElement, childTranscludeFn, preLinkFns, postLinkFns, previousCompileContext) {
            var linkQueue = [],
              afterTemplateNodeLinkFn,
              afterTemplateChildLinkFn,
              beforeTemplateCompileNode = $compileNode[0],
              origAsyncDirective = directives.shift(),
              derivedSyncDirective = inherit(origAsyncDirective, {
                templateUrl: null,
                transclude: null,
                replace: null,
                $$originalDirective: origAsyncDirective
              }),
              templateUrl = (isFunction(origAsyncDirective.templateUrl)) ?
              origAsyncDirective.templateUrl($compileNode, tAttrs) :
              origAsyncDirective.templateUrl,
              templateNamespace = origAsyncDirective.templateNamespace;
            $compileNode.empty();
            $templateRequest(templateUrl)
              .then(function(content) {
                var compileNode, tempTemplateAttrs, $template, childBoundTranscludeFn;
                content = denormalizeTemplate(content);
                if (origAsyncDirective.replace) {
                  if (jqLiteIsTextNode(content)) {
                    $template = [];
                  } else {
                    $template = removeComments(wrapTemplate(templateNamespace, trim(content)));
                  }
                  compileNode = $template[0];
                  if ($template.length !== 1 || compileNode.nodeType !== NODE_TYPE_ELEMENT) {
                    throw $compileMinErr('tplrt',
                      'Template for directive \'{0}\' must have exactly one root element. {1}',
                      origAsyncDirective.name, templateUrl);
                  }
                  tempTemplateAttrs = {
                    $attr: {}
                  };
                  replaceWith($rootElement, $compileNode, compileNode);
                  var templateDirectives = collectDirectives(compileNode, [], tempTemplateAttrs);
                  if (isObject(origAsyncDirective.scope)) {
                    markDirectiveScope(templateDirectives, true);
                  }
                  directives = templateDirectives.concat(directives);
                  mergeTemplateAttributes(tAttrs, tempTemplateAttrs);
                } else {
                  compileNode = beforeTemplateCompileNode;
                  $compileNode.html(content);
                }
                directives.unshift(derivedSyncDirective);
                afterTemplateNodeLinkFn = applyDirectivesToNode(directives, compileNode, tAttrs,
                  childTranscludeFn, $compileNode, origAsyncDirective, preLinkFns, postLinkFns,
                  previousCompileContext);
                forEach($rootElement, function(node, i) {
                  if (node === compileNode) {
                    $rootElement[i] = $compileNode[0];
                  }
                });
                afterTemplateChildLinkFn = compileNodes($compileNode[0].childNodes, childTranscludeFn);
                while (linkQueue.length) {
                  var scope = linkQueue.shift(),
                    beforeTemplateLinkNode = linkQueue.shift(),
                    linkRootElement = linkQueue.shift(),
                    boundTranscludeFn = linkQueue.shift(),
                    linkNode = $compileNode[0];
                  if (scope.$$destroyed) continue;
                  if (beforeTemplateLinkNode !== beforeTemplateCompileNode) {
                    var oldClasses = beforeTemplateLinkNode.className;
                    if (!(previousCompileContext.hasElementTranscludeDirective &&
                        origAsyncDirective.replace)) {
                      linkNode = jqLiteClone(compileNode);
                    }
                    replaceWith(linkRootElement, jqLite(beforeTemplateLinkNode), linkNode);
                    safeAddClass(jqLite(linkNode), oldClasses);
                  }
                  if (afterTemplateNodeLinkFn.transcludeOnThisElement) {
                    childBoundTranscludeFn = createBoundTranscludeFn(scope, afterTemplateNodeLinkFn.transclude, boundTranscludeFn);
                  } else {
                    childBoundTranscludeFn = boundTranscludeFn;
                  }
                  afterTemplateNodeLinkFn(afterTemplateChildLinkFn, scope, linkNode, $rootElement,
                    childBoundTranscludeFn);
                }
                linkQueue = null;
              });
            return function delayedNodeLinkFn(ignoreChildLinkFn, scope, node, rootElement, boundTranscludeFn) {
              var childBoundTranscludeFn = boundTranscludeFn;
              if (scope.$$destroyed) return;
              if (linkQueue) {
                linkQueue.push(scope,
                  node,
                  rootElement,
                  childBoundTranscludeFn);
              } else {
                if (afterTemplateNodeLinkFn.transcludeOnThisElement) {
                  childBoundTranscludeFn = createBoundTranscludeFn(scope, afterTemplateNodeLinkFn.transclude, boundTranscludeFn);
                }
                afterTemplateNodeLinkFn(afterTemplateChildLinkFn, scope, node, rootElement, childBoundTranscludeFn);
              }
            };
          }

          function byPriority(a, b) {
            var diff = b.priority - a.priority;
            if (diff !== 0) return diff;
            if (a.name !== b.name) return (a.name < b.name) ? -1 : 1;
            return a.index - b.index;
          }

          function assertNoDuplicate(what, previousDirective, directive, element) {
            function wrapModuleNameIfDefined(moduleName) {
              return moduleName ?
                (' (module: ' + moduleName + ')') :
                '';
            }
            if (previousDirective) {
              throw $compileMinErr('multidir', 'Multiple directives [{0}{1}, {2}{3}] asking for {4} on: {5}',
                previousDirective.name, wrapModuleNameIfDefined(previousDirective.$$moduleName),
                directive.name, wrapModuleNameIfDefined(directive.$$moduleName), what, startingTag(element));
            }
          }

          function addTextInterpolateDirective(directives, text) {
            var interpolateFn = $interpolate(text, true);
            if (interpolateFn) {
              directives.push({
                priority: 0,
                compile: function textInterpolateCompileFn(templateNode) {
                  var templateNodeParent = templateNode.parent(),
                    hasCompileParent = !!templateNodeParent.length;
                  if (hasCompileParent) compile.$$addBindingClass(templateNodeParent);
                  return function textInterpolateLinkFn(scope, node) {
                    var parent = node.parent();
                    if (!hasCompileParent) compile.$$addBindingClass(parent);
                    compile.$$addBindingInfo(parent, interpolateFn.expressions);
                    scope.$watch(interpolateFn, function interpolateFnWatchAction(value) {
                      node[0].nodeValue = value;
                    });
                  };
                }
              });
            }
          }

          function wrapTemplate(type, template) {
            type = lowercase(type || 'html');
            switch (type) {
              case 'svg':
              case 'math':
                var wrapper = window.document.createElement('div');
                wrapper.innerHTML = '<' + type + '>' + template + '</' + type + '>';
                return wrapper.childNodes[0].childNodes;
              default:
                return template;
            }
          }

          function getTrustedContext(node, attrNormalizedName) {
            if (attrNormalizedName === 'srcdoc') {
              return $sce.HTML;
            }
            var tag = nodeName_(node);
            if (attrNormalizedName === 'src' || attrNormalizedName === 'ngSrc') {
              if (['img', 'video', 'audio', 'source', 'track'].indexOf(tag) === -1) {
                return $sce.RESOURCE_URL;
              }
            } else if (attrNormalizedName === 'xlinkHref' ||
              (tag === 'form' && attrNormalizedName === 'action')
            ) {
              return $sce.RESOURCE_URL;
            }
          }

          function addAttrInterpolateDirective(node, directives, value, name, isNgAttr) {
            var trustedContext = getTrustedContext(node, name);
            var mustHaveExpression = !isNgAttr;
            var allOrNothing = ALL_OR_NOTHING_ATTRS[name] || isNgAttr;
            var interpolateFn = $interpolate(value, mustHaveExpression, trustedContext, allOrNothing);
            if (!interpolateFn) return;
            if (name === 'multiple' && nodeName_(node) === 'select') {
              throw $compileMinErr('selmulti',
                'Binding to the \'multiple\' attribute is not supported. Element: {0}',
                startingTag(node));
            }
            directives.push({
              priority: 100,
              compile: function() {
                return {
                  pre: function attrInterpolatePreLinkFn(scope, element, attr) {
                    var $$observers = (attr.$$observers || (attr.$$observers = createMap()));
                    if (EVENT_HANDLER_ATTR_REGEXP.test(name)) {
                      throw $compileMinErr('nodomevents',
                        'Interpolations for HTML DOM event attributes are disallowed.  Please use the ' +
                        'ng- versions (such as ng-click instead of onclick) instead.');
                    }
                    var newValue = attr[name];
                    if (newValue !== value) {
                      interpolateFn = newValue && $interpolate(newValue, true, trustedContext, allOrNothing);
                      value = newValue;
                    }
                    if (!interpolateFn) return;
                    attr[name] = interpolateFn(scope);
                    ($$observers[name] || ($$observers[name] = [])).$$inter = true;
                    (attr.$$observers && attr.$$observers[name].$$scope || scope).
                    $watch(interpolateFn, function interpolateFnWatchAction(newValue, oldValue) {
                      if (name === 'class' && newValue !== oldValue) {
                        attr.$updateClass(newValue, oldValue);
                      } else {
                        attr.$set(name, newValue);
                      }
                    });
                  }
                };
              }
            });
          }

          function replaceWith($rootElement, elementsToRemove, newNode) {
            var firstElementToRemove = elementsToRemove[0],
              removeCount = elementsToRemove.length,
              parent = firstElementToRemove.parentNode,
              i, ii;
            if ($rootElement) {
              for (i = 0, ii = $rootElement.length; i < ii; i++) {
                if ($rootElement[i] === firstElementToRemove) {
                  $rootElement[i++] = newNode;
                  for (var j = i, j2 = j + removeCount - 1,
                      jj = $rootElement.length; j < jj; j++, j2++) {
                    if (j2 < jj) {
                      $rootElement[j] = $rootElement[j2];
                    } else {
                      delete $rootElement[j];
                    }
                  }
                  $rootElement.length -= removeCount - 1;
                  if ($rootElement.context === firstElementToRemove) {
                    $rootElement.context = newNode;
                  }
                  break;
                }
              }
            }
            if (parent) {
              parent.replaceChild(newNode, firstElementToRemove);
            }
            var fragment = window.document.createDocumentFragment();
            for (i = 0; i < removeCount; i++) {
              fragment.appendChild(elementsToRemove[i]);
            }
            if (jqLite.hasData(firstElementToRemove)) {
              jqLite.data(newNode, jqLite.data(firstElementToRemove));
              jqLite(firstElementToRemove).off('$destroy');
            }
            jqLite.cleanData(fragment.querySelectorAll('*'));
            for (i = 1; i < removeCount; i++) {
              delete elementsToRemove[i];
            }
            elementsToRemove[0] = newNode;
            elementsToRemove.length = 1;
          }

          function cloneAndAnnotateFn(fn, annotation) {
            return extend(function() {
              return fn.apply(null, arguments);
            }, fn, annotation);
          }

          function invokeLinkFn(linkFn, scope, $element, attrs, controllers, transcludeFn) {
            try {
              linkFn(scope, $element, attrs, controllers, transcludeFn);
            } catch (e) {
              $exceptionHandler(e, startingTag($element));
            }
          }

          function initializeDirectiveBindings(scope, attrs, destination, bindings, directive) {
            var removeWatchCollection = [];
            var initialChanges = {};
            var changes;
            forEach(bindings, function initializeBinding(definition, scopeName) {
              var attrName = definition.attrName,
                optional = definition.optional,
                mode = definition.mode,
                lastValue,
                parentGet, parentSet, compare, removeWatch;
              switch (mode) {
                case '@':
                  if (!optional && !hasOwnProperty.call(attrs, attrName)) {
                    destination[scopeName] = attrs[attrName] = undefined;
                  }
                  removeWatch = attrs.$observe(attrName, function(value) {
                    if (isString(value) || isBoolean(value)) {
                      var oldValue = destination[scopeName];
                      recordChanges(scopeName, value, oldValue);
                      destination[scopeName] = value;
                    }
                  });
                  attrs.$$observers[attrName].$$scope = scope;
                  lastValue = attrs[attrName];
                  if (isString(lastValue)) {
                    destination[scopeName] = $interpolate(lastValue)(scope);
                  } else if (isBoolean(lastValue)) {
                    destination[scopeName] = lastValue;
                  }
                  initialChanges[scopeName] = new SimpleChange(_UNINITIALIZED_VALUE, destination[scopeName]);
                  removeWatchCollection.push(removeWatch);
                  break;
                case '=':
                  if (!hasOwnProperty.call(attrs, attrName)) {
                    if (optional) break;
                    attrs[attrName] = undefined;
                  }
                  if (optional && !attrs[attrName]) break;
                  parentGet = $parse(attrs[attrName]);
                  if (parentGet.literal) {
                    compare = equals;
                  } else {
                    compare = function simpleCompare(a, b) {
                      return a === b || (a !== a && b !== b);
                    };
                  }
                  parentSet = parentGet.assign || function() {
                    lastValue = destination[scopeName] = parentGet(scope);
                    throw $compileMinErr('nonassign',
                      'Expression \'{0}\' in attribute \'{1}\' used with directive \'{2}\' is non-assignable!',
                      attrs[attrName], attrName, directive.name);
                  };
                  lastValue = destination[scopeName] = parentGet(scope);
                  var parentValueWatch = function parentValueWatch(parentValue) {
                    if (!compare(parentValue, destination[scopeName])) {
                      if (!compare(parentValue, lastValue)) {
                        destination[scopeName] = parentValue;
                      } else {
                        parentSet(scope, parentValue = destination[scopeName]);
                      }
                    }
                    lastValue = parentValue;
                    return lastValue;
                  };
                  parentValueWatch.$stateful = true;
                  if (definition.collection) {
                    removeWatch = scope.$watchCollection(attrs[attrName], parentValueWatch);
                  } else {
                    removeWatch = scope.$watch($parse(attrs[attrName], parentValueWatch), null, parentGet.literal);
                  }
                  removeWatchCollection.push(removeWatch);
                  break;
                case '<':
                  if (!hasOwnProperty.call(attrs, attrName)) {
                    if (optional) break;
                    attrs[attrName] = undefined;
                  }
                  if (optional && !attrs[attrName]) break;
                  parentGet = $parse(attrs[attrName]);
                  var deepWatch = parentGet.literal;
                  var initialValue = destination[scopeName] = parentGet(scope);
                  initialChanges[scopeName] = new SimpleChange(_UNINITIALIZED_VALUE, destination[scopeName]);
                  removeWatch = scope.$watch(parentGet, function parentValueWatchAction(newValue, oldValue) {
                    if (oldValue === newValue) {
                      if (oldValue === initialValue || (deepWatch && equals(oldValue, initialValue))) {
                        return;
                      }
                      oldValue = initialValue;
                    }
                    recordChanges(scopeName, newValue, oldValue);
                    destination[scopeName] = newValue;
                  }, deepWatch);
                  removeWatchCollection.push(removeWatch);
                  break;
                case '&':
                  parentGet = attrs.hasOwnProperty(attrName) ? $parse(attrs[attrName]) : noop;
                  if (parentGet === noop && optional) break;
                  destination[scopeName] = function(locals) {
                    return parentGet(scope, locals);
                  };
                  break;
              }
            });

            function recordChanges(key, currentValue, previousValue) {
              if (isFunction(destination.$onChanges) && currentValue !== previousValue &&
                (currentValue === currentValue || previousValue === previousValue)) {
                if (!onChangesQueue) {
                  scope.$$postDigest(flushOnChangesQueue);
                  onChangesQueue = [];
                }
                if (!changes) {
                  changes = {};
                  onChangesQueue.push(triggerOnChangesHook);
                }
                if (changes[key]) {
                  previousValue = changes[key].previousValue;
                }
                changes[key] = new SimpleChange(previousValue, currentValue);
              }
            }

            function triggerOnChangesHook() {
              destination.$onChanges(changes);
              changes = undefined;
            }
            return {
              initialChanges: initialChanges,
              removeWatches: removeWatchCollection.length && function removeWatches() {
                for (var i = 0, ii = removeWatchCollection.length; i < ii; ++i) {
                  removeWatchCollection[i]();
                }
              }
            };
          }
        }
      ];
    }

    function SimpleChange(previous, current) {
      this.previousValue = previous;
      this.currentValue = current;
    }
    SimpleChange.prototype.isFirstChange = function() {
      return this.previousValue === _UNINITIALIZED_VALUE;
    };
    var PREFIX_REGEXP = /^((?:x|data)[:\-_])/i;

    function directiveNormalize(name) {
      return camelCase(name.replace(PREFIX_REGEXP, ''));
    }

    function nodesetLinkingFn(
      scope,
      nodeList,
      rootElement,
      boundTranscludeFn
    ) {}

    function directiveLinkingFn(
      nodesetLinkingFn,
      scope,
      node,
      rootElement,
      boundTranscludeFn
    ) {}

    function tokenDifference(str1, str2) {
      var values = '',
        tokens1 = str1.split(/\s+/),
        tokens2 = str2.split(/\s+/);
      outer:
        for (var i = 0; i < tokens1.length; i++) {
          var token = tokens1[i];
          for (var j = 0; j < tokens2.length; j++) {
            if (token === tokens2[j]) continue outer;
          }
          values += (values.length > 0 ? ' ' : '') + token;
        }
      return values;
    }

    function removeComments(jqNodes) {
      jqNodes = jqLite(jqNodes);
      var i = jqNodes.length;
      if (i <= 1) {
        return jqNodes;
      }
      while (i--) {
        var node = jqNodes[i];
        if (node.nodeType === NODE_TYPE_COMMENT ||
          (node.nodeType === NODE_TYPE_TEXT && node.nodeValue.trim() === '')) {
          splice.call(jqNodes, i, 1);
        }
      }
      return jqNodes;
    }
    var $controllerMinErr = minErr('$controller');
    var CNTRL_REG = /^(\S+)(\s+as\s+([\w$]+))?$/;

    function identifierForController(controller, ident) {
      if (ident && isString(ident)) return ident;
      if (isString(controller)) {
        var match = CNTRL_REG.exec(controller);
        if (match) return match[3];
      }
    }

    function $ControllerProvider() {
      var controllers = {},
        globals = false;
      this.has = function(name) {
        return controllers.hasOwnProperty(name);
      };
      this.register = function(name, constructor) {
        assertNotHasOwnProperty(name, 'controller');
        if (isObject(name)) {
          extend(controllers, name);
        } else {
          controllers[name] = constructor;
        }
      };
      this.allowGlobals = function() {
        globals = true;
      };
      this.$get = ['$injector', '$window', function($injector, $window) {
        return function $controller(expression, locals, later, ident) {
          var instance, match, constructor, identifier;
          later = later === true;
          if (ident && isString(ident)) {
            identifier = ident;
          }
          if (isString(expression)) {
            match = expression.match(CNTRL_REG);
            if (!match) {
              throw $controllerMinErr('ctrlfmt',
                'Badly formed controller string \'{0}\'. ' +
                'Must match `__name__ as __id__` or `__name__`.', expression);
            }
            constructor = match[1];
            identifier = identifier || match[3];
            expression = controllers.hasOwnProperty(constructor) ?
              controllers[constructor] :
              getter(locals.$scope, constructor, true) ||
              (globals ? getter($window, constructor, true) : undefined);
            if (!expression) {
              throw $controllerMinErr('ctrlreg',
                'The controller with the name \'{0}\' is not registered.', constructor);
            }
            assertArgFn(expression, constructor, true);
          }
          if (later) {
            var controllerPrototype = (isArray(expression) ?
              expression[expression.length - 1] : expression).prototype;
            instance = Object.create(controllerPrototype || null);
            if (identifier) {
              addIdentifier(locals, identifier, instance, constructor || expression.name);
            }
            return extend(function $controllerInit() {
              var result = $injector.invoke(expression, instance, locals, constructor);
              if (result !== instance && (isObject(result) || isFunction(result))) {
                instance = result;
                if (identifier) {
                  addIdentifier(locals, identifier, instance, constructor || expression.name);
                }
              }
              return instance;
            }, {
              instance: instance,
              identifier: identifier
            });
          }
          instance = $injector.instantiate(expression, locals, constructor);
          if (identifier) {
            addIdentifier(locals, identifier, instance, constructor || expression.name);
          }
          return instance;
        };

        function addIdentifier(locals, identifier, instance, name) {
          if (!(locals && isObject(locals.$scope))) {
            throw minErr('$controller')('noscp',
              'Cannot export controller \'{0}\' as \'{1}\'! No $scope object provided via `locals`.',
              name, identifier);
          }
          locals.$scope[identifier] = instance;
        }
      }];
    }

    function $DocumentProvider() {
      this.$get = ['$window', function(window) {
        return jqLite(window.document);
      }];
    }

    function $ExceptionHandlerProvider() {
      this.$get = ['$log', function($log) {
        return function(exception, cause) {
          $log.error.apply($log, arguments);
        };
      }];
    }
    var $$ForceReflowProvider = function() {
      this.$get = ['$document', function($document) {
        return function(domNode) {
          if (domNode) {
            if (!domNode.nodeType && domNode instanceof jqLite) {
              domNode = domNode[0];
            }
          } else {
            domNode = $document[0].body;
          }
          return domNode.offsetWidth + 1;
        };
      }];
    };
    var APPLICATION_JSON = 'application/json';
    var CONTENT_TYPE_APPLICATION_JSON = {
      'Content-Type': APPLICATION_JSON + ';charset=utf-8'
    };
    var JSON_START = /^\[|^\{(?!\{)/;
    var JSON_ENDS = {
      '[': /]$/,
      '{': /}$/
    };
    var JSON_PROTECTION_PREFIX = /^\)]\}',?\n/;
    var $httpMinErr = minErr('$http');
    var $httpMinErrLegacyFn = function(method) {
      return function() {
        throw $httpMinErr('legacy', 'The method `{0}` on the promise returned from `$http` has been disabled.', method);
      };
    };

    function serializeValue(v) {
      if (isObject(v)) {
        return isDate(v) ? v.toISOString() : toJson(v);
      }
      return v;
    }

    function $HttpParamSerializerProvider() {
      this.$get = function() {
        return function ngParamSerializer(params) {
          if (!params) return '';
          var parts = [];
          forEachSorted(params, function(value, key) {
            if (value === null || isUndefined(value)) return;
            if (isArray(value)) {
              forEach(value, function(v) {
                parts.push(encodeUriQuery(key) + '=' + encodeUriQuery(serializeValue(v)));
              });
            } else {
              parts.push(encodeUriQuery(key) + '=' + encodeUriQuery(serializeValue(value)));
            }
          });
          return parts.join('&');
        };
      };
    }

    function $HttpParamSerializerJQLikeProvider() {
      this.$get = function() {
        return function jQueryLikeParamSerializer(params) {
          if (!params) return '';
          var parts = [];
          serialize(params, '', true);
          return parts.join('&');

          function serialize(toSerialize, prefix, topLevel) {
            if (toSerialize === null || isUndefined(toSerialize)) return;
            if (isArray(toSerialize)) {
              forEach(toSerialize, function(value, index) {
                serialize(value, prefix + '[' + (isObject(value) ? index : '') + ']');
              });
            } else if (isObject(toSerialize) && !isDate(toSerialize)) {
              forEachSorted(toSerialize, function(value, key) {
                serialize(value, prefix +
                  (topLevel ? '' : '[') +
                  key +
                  (topLevel ? '' : ']'));
              });
            } else {
              parts.push(encodeUriQuery(prefix) + '=' + encodeUriQuery(serializeValue(toSerialize)));
            }
          }
        };
      };
    }

    function defaultHttpResponseTransform(data, headers) {
      if (isString(data)) {
        var tempData = data.replace(JSON_PROTECTION_PREFIX, '').trim();
        if (tempData) {
          var contentType = headers('Content-Type');
          if ((contentType && (contentType.indexOf(APPLICATION_JSON) === 0)) || isJsonLike(tempData)) {
            data = fromJson(tempData);
          }
        }
      }
      return data;
    }

    function isJsonLike(str) {
      var jsonStart = str.match(JSON_START);
      return jsonStart && JSON_ENDS[jsonStart[0]].test(str);
    }

    function parseHeaders(headers) {
      var parsed = createMap(),
        i;

      function fillInParsed(key, val) {
        if (key) {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      }
      if (isString(headers)) {
        forEach(headers.split('\n'), function(line) {
          i = line.indexOf(':');
          fillInParsed(lowercase(trim(line.substr(0, i))), trim(line.substr(i + 1)));
        });
      } else if (isObject(headers)) {
        forEach(headers, function(headerVal, headerKey) {
          fillInParsed(lowercase(headerKey), trim(headerVal));
        });
      }
      return parsed;
    }

    function headersGetter(headers) {
      var headersObj;
      return function(name) {
        if (!headersObj) headersObj = parseHeaders(headers);
        if (name) {
          var value = headersObj[lowercase(name)];
          if (value === undefined) {
            value = null;
          }
          return value;
        }
        return headersObj;
      };
    }

    function transformData(data, headers, status, fns) {
      if (isFunction(fns)) {
        return fns(data, headers, status);
      }
      forEach(fns, function(fn) {
        data = fn(data, headers, status);
      });
      return data;
    }

    function isSuccess(status) {
      return 200 <= status && status < 300;
    }

    function $HttpProvider() {
      var defaults = this.defaults = {
        transformResponse: [defaultHttpResponseTransform],
        transformRequest: [function(d) {
          return isObject(d) && !isFile(d) && !isBlob(d) && !isFormData(d) ? toJson(d) : d;
        }],
        headers: {
          common: {
            'Accept': 'application/json, text/plain, */*'
          },
          post: shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
          put: shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
          patch: shallowCopy(CONTENT_TYPE_APPLICATION_JSON)
        },
        xsrfCookieName: 'XSRF-TOKEN',
        xsrfHeaderName: 'X-XSRF-TOKEN',
        paramSerializer: '$httpParamSerializer'
      };
      var useApplyAsync = false;
      this.useApplyAsync = function(value) {
        if (isDefined(value)) {
          useApplyAsync = !!value;
          return this;
        }
        return useApplyAsync;
      };
      var useLegacyPromise = true;
      this.useLegacyPromiseExtensions = function(value) {
        if (isDefined(value)) {
          useLegacyPromise = !!value;
          return this;
        }
        return useLegacyPromise;
      };
      var interceptorFactories = this.interceptors = [];
      this.$get = ['$httpBackend', '$$cookieReader', '$cacheFactory', '$rootScope', '$q', '$injector',
          function($httpBackend, $$cookieReader, $cacheFactory, $rootScope, $q, $injector) {
            var defaultCache = $cacheFactory('$http');
            defaults.paramSerializer = isString(defaults.paramSerializer) ?
              $injector.get(defaults.paramSerializer) : defaults.paramSerializer;
            var reversedInterceptors = [];
            forEach(interceptorFactories, function(interceptorFactory) {
              reversedInterceptors.unshift(isString(interceptorFactory) ?
                $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory));
            });

            function $http(requestConfig) {
              if (!isObject(requestConfig)) {
                throw minErr('$http')('badreq', 'Http request configuration must be an object.  Received: {0}', requestConfig);
              }
              if (!isString(requestConfig.url)) {
                throw minErr('$http')('badreq', 'Http request configuration url must be a string.  Received: {0}', requestConfig.url);
              }
              var config = extend({
                method: 'get',
                transformRequest: defaults.transformRequest,
                transformResponse: defaults.transformResponse,
                paramSerializer: defaults.paramSerializer
              }, requestConfig);
              config.headers = mergeHeaders(requestConfig);
              config.method = uppercase(config.method);
              config.paramSerializer = isString(config.paramSerializer) ?
                $injector.get(config.paramSerializer) : config.paramSerializer;
              var requestInterceptors = [];
              var responseInterceptors = [];
              var promise = $q.when(config);
              forEach(reversedInterceptors, function(interceptor) {
                if (interceptor.request || interceptor.requestError) {
                  requestInterceptors.unshift(interceptor.request, interceptor.requestError);
                }
                if (interceptor.response || interceptor.responseError) {
                  responseInterceptors.push(interceptor.response, interceptor.responseError);
                }
              });
              promise = chainInterceptors(promise, requestInterceptors);
              promise = promise.then(serverRequest);
              promise = chainInterceptors(promise, responseInterceptors);
              if (useLegacyPromise) {
                promise.success = function(fn) {
                  assertArgFn(fn, 'fn');
                  promise.then(function(response) {
                    fn(response.data, response.status, response.headers, config);
                  });
                  return promise;
                };
                promise.error = function(fn) {
                  assertArgFn(fn, 'fn');
                  promise.then(null, function(response) {
                    fn(response.data, response.status, response.headers, config);
                  });
                  return promise;
                };
              } else {
                promise.success = $httpMinErrLegacyFn('success');
                promise.error = $httpMinErrLegacyFn('error');
              }
              return promise;

              function chainInterceptors(promise, interceptors) {
                for (var i = 0, ii = interceptors.length; i < ii;) {
                  var thenFn = interceptors[i++];
                  var rejectFn = interceptors[i++];
                  promise = promise.then(thenFn, rejectFn);
                }
                interceptors.length = 0;
                return promise;
              }

              function executeHeaderFns(headers, config) {
                var headerContent, processedHeaders = {};
                forEach(headers, function(headerFn, header) {
                  if (isFunction(headerFn)) {
                    headerContent = headerFn(config);
                    if (headerContent != null) {
                      processedHeaders[header] = headerContent;
                    }
                  } else {
                    processedHeaders[header] = headerFn;
                  }
                });
                return processedHeaders;
              }

              function mergeHeaders(config) {
                var defHeaders = defaults.headers,
                  reqHeaders = extend({}, config.headers),
                  defHeaderName, lowercaseDefHeaderName, reqHeaderName;
                defHeaders = extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);
                defaultHeadersIteration:
                  for (defHeaderName in defHeaders) {
                    lowercaseDefHeaderName = lowercase(defHeaderName);
                    for (reqHeaderName in reqHeaders) {
                      if (lowercase(reqHeaderName) === lowercaseDefHeaderName) {
                        continue defaultHeadersIteration;
                      }
                    }
                    reqHeaders[defHeaderName] = defHeaders[defHeaderName];
                  }
                return executeHeaderFns(reqHeaders, shallowCopy(config));
              }

              function serverRequest(config) {
                var headers = config.headers;
                var reqData = transformData(config.data, headersGetter(headers), undefined, config.transformRequest);
                if (isUndefined(reqData)) {
                  forEach(headers, function(value, header) {
                    if (lowercase(header) === 'content-type') {
                      delete headers[header];
                    }
                  });
                }
                if (isUndefined(config.withCredentials) && !isUndefined(defaults.withCredentials)) {
                  config.withCredentials = defaults.withCredentials;
                }
                return sendReq(config, reqData).then(transformResponse, transformResponse);
              }

              function transformResponse(response) {
                var resp = extend({}, response);
                resp.data = transformData(response.data, response.headers, response.status,
                  config.transformResponse);
                return (isSuccess(response.status)) ?
                  resp :
                  $q.reject(resp);
              }
            }
            $http.pendingRequests = [];
            createShortMethods('get', 'delete', 'head', 'jsonp');
            createShortMethodsWithData('post', 'put', 'patch');
            $http.defaults = defaults;
            return $http;

            function createShortMethods(names) {
              forEach(arguments, function(name) {
                $http[name] = function(url, config) {
                  return $http(extend({}, config || {}, {
                    method: name,
                    url: url
                  }));
                };
              });
            }

            function createShortMethodsWithData(n