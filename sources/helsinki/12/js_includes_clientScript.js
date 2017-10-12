/*! RESOURCE: /scripts/sn/common/clientScript/js_includes_clientScript.js */
/*! RESOURCE: /scripts/sn/common/clientScript/dist/clientScript_components.js */
! function(b, a) {
  "function" == typeof define && define.amd ? define([], a) : b.amdWeb = a()
}(this, function() {
  "function" != typeof Array.prototype.indexOf && (Array.prototype.indexOf = function(d, a) {
    var b, c = this.length;
    if (!c) return -1;
    if (a = Number(a), ("number" != typeof a || isNaN(a)) && (a = 0), a >= c) return -1;
    for (0 > a && (a = c - Math.abs(a)), b = a; c > b; b++)
      if (this[b] === d) return b;
    return -1
  }), "function" != typeof Function.prototype.bind && (Function.prototype.bind = function(a) {
    var b, d, c, e;
    if ("function" != typeof this) throw new TypeError("Target is not callable, and unable to be bound");
    return b = Array.prototype.slice, d = b.call(arguments, 1), c = this, "undefined" == typeof a && (a = c), e = function() {
      var e = b.call(arguments, 0);
      return c.apply(a, d.concat(e))
    }
  })
});
(function() {
  "use strict";

  function $$utils$$objectOrFunction(x) {
    return typeof x === 'function' || (typeof x === 'object' && x !== null);
  }

  function $$utils$$isFunction(x) {
    return typeof x === 'function';
  }

  function $$utils$$isMaybeThenable(x) {
    return typeof x === 'object' && x !== null;
  }
  var $$utils$$_isArray;
  if (!Array.isArray) {
    $$utils$$_isArray = function(x) {
      return Object.prototype.toString.call(x) === '[object Array]';
    };
  } else {
    $$utils$$_isArray = Array.isArray;
  }
  var $$utils$$isArray = $$utils$$_isArray;
  var $$utils$$now = Date.now || function() {
    return new Date().getTime();
  };

  function $$utils$$F() {}
  var $$utils$$o_create = (Object.create || function(o) {
    if (arguments.length > 1) {
      throw new Error('Second argument not supported');
    }
    if (typeof o !== 'object') {
      throw new TypeError('Argument must be an object');
    }
    $$utils$$F.prototype = o;
    return new $$utils$$F();
  });
  var $$asap$$len = 0;
  var $$asap$$default = function asap(callback, arg) {
    $$asap$$queue[$$asap$$len] = callback;
    $$asap$$queue[$$asap$$len + 1] = arg;
    $$asap$$len += 2;
    if ($$asap$$len === 2) {
      $$asap$$scheduleFlush();
    }
  };
  var $$asap$$browserGlobal = (typeof window !== 'undefined') ? window : {};
  var $$asap$$BrowserMutationObserver = $$asap$$browserGlobal.MutationObserver || $$asap$$browserGlobal.WebKitMutationObserver;
  var $$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
    typeof importScripts !== 'undefined' &&
    typeof MessageChannel !== 'undefined';

  function $$asap$$useNextTick() {
    return function() {
      process.nextTick($$asap$$flush);
    };
  }

  function $$asap$$useMutationObserver() {
    var iterations = 0;
    var observer = new $$asap$$BrowserMutationObserver($$asap$$flush);
    var node = document.createTextNode('');
    observer.observe(node, {
      characterData: true
    });
    return function() {
      node.data = (iterations = ++iterations % 2);
    };
  }

  function $$asap$$useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = $$asap$$flush;
    return function() {
      channel.port2.postMessage(0);
    };
  }

  function $$asap$$useSetTimeout() {
    return function() {
      setTimeout($$asap$$flush, 1);
    };
  }
  var $$asap$$queue = new Array(1000);

  function $$asap$$flush() {
    for (var i = 0; i < $$asap$$len; i += 2) {
      var callback = $$asap$$queue[i];
      var arg = $$asap$$queue[i + 1];
      callback(arg);
      $$asap$$queue[i] = undefined;
      $$asap$$queue[i + 1] = undefined;
    }
    $$asap$$len = 0;
  }
  var $$asap$$scheduleFlush;
  if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
    $$asap$$scheduleFlush = $$asap$$useNextTick();
  } else if ($$asap$$BrowserMutationObserver) {
    $$asap$$scheduleFlush = $$asap$$useMutationObserver();
  } else if ($$asap$$isWorker) {
    $$asap$$scheduleFlush = $$asap$$useMessageChannel();
  } else {
    $$asap$$scheduleFlush = $$asap$$useSetTimeout();
  }

  function $$$internal$$noop() {}
  var $$$internal$$PENDING = void 0;
  var $$$internal$$FULFILLED = 1;
  var $$$internal$$REJECTED = 2;
  var $$$internal$$GET_THEN_ERROR = new $$$internal$$ErrorObject();

  function $$$internal$$selfFullfillment() {
    return new TypeError("You cannot resolve a promise with itself");
  }

  function $$$internal$$cannotReturnOwn() {
    return new TypeError('A promises callback cannot return that same promise.')
  }

  function $$$internal$$getThen(promise) {
    try {
      return promise.then;
    } catch (error) {
      $$$internal$$GET_THEN_ERROR.error = error;
      return $$$internal$$GET_THEN_ERROR;
    }
  }

  function $$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
    try {
      then.call(value, fulfillmentHandler, rejectionHandler);
    } catch (e) {
      return e;
    }
  }

  function $$$internal$$handleForeignThenable(promise, thenable, then) {
    $$asap$$default(function(promise) {
      var sealed = false;
      var error = $$$internal$$tryThen(then, thenable, function(value) {
        if (sealed) {
          return;
        }
        sealed = true;
        if (thenable !== value) {
          $$$internal$$resolve(promise, value);
        } else {
          $$$internal$$fulfill(promise, value);
        }
      }, function(reason) {
        if (sealed) {
          return;
        }
        sealed = true;
        $$$internal$$reject(promise, reason);
      }, 'Settle: ' + (promise._label || ' unknown promise'));
      if (!sealed && error) {
        sealed = true;
        $$$internal$$reject(promise, error);
      }
    }, promise);
  }

  function $$$internal$$handleOwnThenable(promise, thenable) {
    if (thenable._state === $$$internal$$FULFILLED) {
      $$$internal$$fulfill(promise, thenable._result);
    } else if (promise._state === $$$internal$$REJECTED) {
      $$$internal$$reject(promise, thenable._result);
    } else {
      $$$internal$$subscribe(thenable, undefined, function(value) {
        $$$internal$$resolve(promise, value);
      }, function(reason) {
        $$$internal$$reject(promise, reason);
      });
    }
  }

  function $$$internal$$handleMaybeThenable(promise, maybeThenable) {
    if (maybeThenable.constructor === promise.constructor) {
      $$$internal$$handleOwnThenable(promise, maybeThenable);
    } else {
      var then = $$$internal$$getThen(maybeThenable);
      if (then === $$$internal$$GET_THEN_ERROR) {
        $$$internal$$reject(promise, $$$internal$$GET_THEN_ERROR.error);
      } else if (then === undefined) {
        $$$internal$$fulfill(promise, maybeThenable);
      } else if ($$utils$$isFunction(then)) {
        $$$internal$$handleForeignThenable(promise, maybeThenable, then);
      } else {
        $$$internal$$fulfill(promise, maybeThenable);
      }
    }
  }

  function $$$internal$$resolve(promise, value) {
    if (promise === value) {
      $$$internal$$reject(promise, $$$internal$$selfFullfillment());
    } else if ($$utils$$objectOrFunction(value)) {
      $$$internal$$handleMaybeThenable(promise, value);
    } else {
      $$$internal$$fulfill(promise, value);
    }
  }

  function $$$internal$$publishRejection(promise) {
    if (promise._onerror) {
      promise._onerror(promise._result);
    }
    $$$internal$$publish(promise);
  }

  function $$$internal$$fulfill(promise, value) {
    if (promise._state !== $$$internal$$PENDING) {
      return;
    }
    promise._result = value;
    promise._state = $$$internal$$FULFILLED;
    if (promise._subscribers.length === 0) {} else {
      $$asap$$default($$$internal$$publish, promise);
    }
  }

  function $$$internal$$reject(promise, reason) {
    if (promise._state !== $$$internal$$PENDING) {
      return;
    }
    promise._state = $$$internal$$REJECTED;
    promise._result = reason;
    $$asap$$default($$$internal$$publishRejection, promise);
  }

  function $$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
    var subscribers = parent._subscribers;
    var length = subscribers.length;
    parent._onerror = null;
    subscribers[length] = child;
    subscribers[length + $$$internal$$FULFILLED] = onFulfillment;
    subscribers[length + $$$internal$$REJECTED] = onRejection;
    if (length === 0 && parent._state) {
      $$asap$$default($$$internal$$publish, parent);
    }
  }

  function $$$internal$$publish(promise) {
    var subscribers = promise._subscribers;
    var settled = promise._state;
    if (subscribers.length === 0) {
      return;
    }
    var child, callback, detail = promise._result;
    for (var i = 0; i < subscribers.length; i += 3) {
      child = subscribers[i];
      callback = subscribers[i + settled];
      if (child) {
        $$$internal$$invokeCallback(settled, child, callback, detail);
      } else {
        callback(detail);
      }
    }
    promise._subscribers.length = 0;
  }

  function $$$internal$$ErrorObject() {
    this.error = null;
  }
  var $$$internal$$TRY_CATCH_ERROR = new $$$internal$$ErrorObject();

  function $$$internal$$tryCatch(callback, detail) {
    try {
      return callback(detail);
    } catch (e) {
      $$$internal$$TRY_CATCH_ERROR.error = e;
      return $$$internal$$TRY_CATCH_ERROR;
    }
  }

  function $$$internal$$invokeCallback(settled, promise, callback, detail) {
    var hasCallback = $$utils$$isFunction(callback),
      value, error, succeeded, failed;
    if (hasCallback) {
      value = $$$internal$$tryCatch(callback, detail);
      if (value === $$$internal$$TRY_CATCH_ERROR) {
        failed = true;
        error = value.error;
        value = null;
      } else {
        succeeded = true;
      }
      if (promise === value) {
        $$$internal$$reject(promise, $$$internal$$cannotReturnOwn());
        return;
      }
    } else {
      value = detail;
      succeeded = true;
    }
    if (promise._state !== $$$internal$$PENDING) {} else if (hasCallback && succeeded) {
      $$$internal$$resolve(promise, value);
    } else if (failed) {
      $$$internal$$reject(promise, error);
    } else if (settled === $$$internal$$FULFILLED) {
      $$$internal$$fulfill(promise, value);
    } else if (settled === $$$internal$$REJECTED) {
      $$$internal$$reject(promise, value);
    }
  }

  function $$$internal$$initializePromise(promise, resolver) {
    try {
      resolver(function resolvePromise(value) {
        $$$internal$$resolve(promise, value);
      }, function rejectPromise(reason) {
        $$$internal$$reject(promise, reason);
      });
    } catch (e) {
      $$$internal$$reject(promise, e);
    }
  }

  function $$$enumerator$$makeSettledResult(state, position, value) {
    if (state === $$$internal$$FULFILLED) {
      return {
        state: 'fulfilled',
        value: value
      };
    } else {
      return {
        state: 'rejected',
        reason: value
      };
    }
  }

  function $$$enumerator$$Enumerator(Constructor, input, abortOnReject, label) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor($$$internal$$noop, label);
    this._abortOnReject = abortOnReject;
    if (this._validateInput(input)) {
      this._input = input;
      this.length = input.length;
      this._remaining = input.length;
      this._init();
      if (this.length === 0) {
        $$$internal$$fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate();
        if (this._remaining === 0) {
          $$$internal$$fulfill(this.promise, this._result);
        }
      }
    } else {
      $$$internal$$reject(this.promise, this._validationError());
    }
  }
  $$$enumerator$$Enumerator.prototype._validateInput = function(input) {
    return $$utils$$isArray(input);
  };
  $$$enumerator$$Enumerator.prototype._validationError = function() {
    return new Error('Array Methods must be provided an Array');
  };
  $$$enumerator$$Enumerator.prototype._init = function() {
    this._result = new Array(this.length);
  };
  var $$$enumerator$$default = $$$enumerator$$Enumerator;
  $$$enumerator$$Enumerator.prototype._enumerate = function() {
    var length = this.length;
    var promise = this.promise;
    var input = this._input;
    for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
      this._eachEntry(input[i], i);
    }
  };
  $$$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
    var c = this._instanceConstructor;
    if ($$utils$$isMaybeThenable(entry)) {
      if (entry.constructor === c && entry._state !== $$$internal$$PENDING) {
        entry._onerror = null;
        this._settledAt(entry._state, i, entry._result);
      } else {
        this._willSettleAt(c.resolve(entry), i);
      }
    } else {
      this._remaining--;
      this._result[i] = this._makeResult($$$internal$$FULFILLED, i, entry);
    }
  };
  $$$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
    var promise = this.promise;
    if (promise._state === $$$internal$$PENDING) {
      this._remaining--;
      if (this._abortOnReject && state === $$$internal$$REJECTED) {
        $$$internal$$reject(promise, value);
      } else {
        this._result[i] = this._makeResult(state, i, value);
      }
    }
    if (this._remaining === 0) {
      $$$internal$$fulfill(promise, this._result);
    }
  };
  $$$enumerator$$Enumerator.prototype._makeResult = function(state, i, value) {
    return value;
  };
  $$$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
    var enumerator = this;
    $$$internal$$subscribe(promise, undefined, function(value) {
      enumerator._settledAt($$$internal$$FULFILLED, i, value);
    }, function(reason) {
      enumerator._settledAt($$$internal$$REJECTED, i, reason);
    });
  };
  var $$promise$all$$default = function all(entries, label) {
    return new $$$enumerator$$default(this, entries, true, label).promise;
  };
  var $$promise$race$$default = function race(entries, label) {
    var Constructor = this;
    var promise = new Constructor($$$internal$$noop, label);
    if (!$$utils$$isArray(entries)) {
      $$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
      return promise;
    }
    var length = entries.length;

    function onFulfillment(value) {
      $$$internal$$resolve(promise, value);
    }

    function onRejection(reason) {
      $$$internal$$reject(promise, reason);
    }
    for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
      $$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
    }
    return promise;
  };
  var $$promise$resolve$$default = function resolve(object, label) {
    var Constructor = this;
    if (object && typeof object === 'object' && object.constructor === Constructor) {
      return object;
    }
    var promise = new Constructor($$$internal$$noop, label);
    $$$internal$$resolve(promise, object);
    return promise;
  };
  var $$promise$reject$$default = function reject(reason, label) {
    var Constructor = this;
    var promise = new Constructor($$$internal$$noop, label);
    $$$internal$$reject(promise, reason);
    return promise;
  };
  var $$es6$promise$promise$$counter = 0;

  function $$es6$promise$promise$$needsResolver() {
    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
  }

  function $$es6$promise$promise$$needsNew() {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
  }
  var $$es6$promise$promise$$default = $$es6$promise$promise$$Promise;

  function $$es6$promise$promise$$Promise(resolver) {
    this._id = $$es6$promise$promise$$counter++;
    this._state = undefined;
    this._result = undefined;
    this._subscribers = [];
    if ($$$internal$$noop !== resolver) {
      if (!$$utils$$isFunction(resolver)) {
        $$es6$promise$promise$$needsResolver();
      }
      if (!(this instanceof $$es6$promise$promise$$Promise)) {
        $$es6$promise$promise$$needsNew();
      }
      $$$internal$$initializePromise(this, resolver);
    }
  }
  $$es6$promise$promise$$Promise.all = $$promise$all$$default;
  $$es6$promise$promise$$Promise.race = $$promise$race$$default;
  $$es6$promise$promise$$Promise.resolve = $$promise$resolve$$default;
  $$es6$promise$promise$$Promise.reject = $$promise$reject$$default;
  $$es6$promise$promise$$Promise.prototype = {
    constructor: $$es6$promise$promise$$Promise,
    then: function(onFulfillment, onRejection) {
      var parent = this;
      var state = parent._state;
      if (state === $$$internal$$FULFILLED && !onFulfillment || state === $$$internal$$REJECTED && !onRejection) {
        return this;
      }
      var child = new this.constructor($$$internal$$noop);
      var result = parent._result;
      if (state) {
        var callback = arguments[state - 1];
        $$asap$$default(function() {
          $$$internal$$invokeCallback(state, child, callback, result);
        });
      } else {
        $$$internal$$subscribe(parent, child, onFulfillment, onRejection);
      }
      return child;
    },
    'catch': function(onRejection) {
      return this.then(null, onRejection);
    }
  };
  var $$es6$promise$polyfill$$default = function polyfill() {
    var local;
    if (typeof global !== 'undefined') {
      local = global;
    } else if (typeof window !== 'undefined' && window.document) {
      local = window;
    } else {
      local = self;
    }
    var es6PromiseSupport =
      "Promise" in local &&
      "resolve" in local.Promise &&
      "reject" in local.Promise &&
      "all" in local.Promise &&
      "race" in local.Promise &&
      (function() {
        var resolve;
        new local.Promise(function(r) {
          resolve = r;
        });
        return $$utils$$isFunction(resolve);
      }());
    if (!es6PromiseSupport) {
      local.Promise = $$es6$promise$promise$$default;
    }
  };
  var es6$promise$umd$$ES6Promise = {
    'Promise': $$es6$promise$promise$$default,
    'polyfill': $$es6$promise$polyfill$$default
  };
  if (typeof define === 'function' && define['amd']) {
    define(function() {
      return es6$promise$umd$$ES6Promise;
    });
  } else if (typeof module !== 'undefined' && module['exports']) {
    module['exports'] = es6$promise$umd$$ES6Promise;
  } else if (typeof this !== 'undefined') {
    this['ES6Promise'] = es6$promise$umd$$ES6Promise;
  }
}).call(this);
(function() {
  'use strict';
  if (self.fetch) {
    return
  }

  function Headers(headers) {
    this.map = {}
    var self = this
    if (headers instanceof Headers) {
      headers.forEach(function(name, values) {
        values.forEach(function(value) {
          self.append(name, value)
        })
      })
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        self.append(name, headers[name])
      })
    }
  }
  Headers.prototype.append = function(name, value) {
    name = name.toLowerCase()
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }
  Headers.prototype['delete'] = function(name) {
    delete this.map[name.toLowerCase()]
  }
  Headers.prototype.get = function(name) {
    var values = this.map[name.toLowerCase()]
    return values ? values[0] : null
  }
  Headers.prototype.getAll = function(name) {
    return this.map[name.toLowerCase()] || []
  }
  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(name.toLowerCase())
  }
  Headers.prototype.set = function(name, value) {
    this.map[name.toLowerCase()] = [value]
  }
  Headers.prototype.forEach = function(callback) {
    var self = this
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      callback(name, self.map[name])
    })
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }
  var support = {
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch (e) {
        return false
      }
    })(),
    formData: 'FormData' in self
  }

  function Body() {
    this.bodyUsed = false
    if (support.blob) {
      this._initBody = function(body) {
        this._bodyInit = body
        if (typeof body === 'string') {
          this._bodyText = body
        } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
          this._bodyBlob = body
        } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
          this._bodyFormData = body
        } else if (!body) {
          this._bodyText = ''
        } else {
          throw new Error('unsupported BodyInit type')
        }
      }
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }
        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }
      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }
      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }
        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this._initBody = function(body) {
        this._bodyInit = body
        if (typeof body === 'string') {
          this._bodyText = body
        } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
          this._bodyFormData = body
        } else if (!body) {
          this._bodyText = ''
        } else {
          throw new Error('unsupported BodyInit type')
        }
      }
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }
    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }
    this.json = function() {
      return this.text().then(JSON.parse)
    }
    return this
  }
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(url, options) {
    options = options || {}
    this.url = url
    this.credentials = options.credentials || 'omit'
    this.headers = new Headers(options.headers)
    this.method = normalizeMethod(options.method || 'GET')
    this.mode = options.mode || null
    this.referrer = null
    if ((this.method === 'GET' || this.method === 'HEAD') && options.body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(options.body)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }
  Request.prototype.fetch = function() {
    var self = this
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest()
      if (self.credentials === 'cors') {
        xhr.withCredentials = true;
      }

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }
        return;
      }
      xhr.onload = function() {
        var status = (xhr.status === 1223) ? 204 : xhr.status
        if (status < 100 || status > 599) {
          reject(new TypeError('Network request failed'))
          return
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options))
      }
      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }
      xhr.open(self.method, self.url, true)
      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }
      self.headers.forEach(function(name, values) {
        values.forEach(function(value) {
          xhr.setRequestHeader(name, value)
        })
      })
      xhr.send(typeof self._bodyInit === 'undefined' ? null : self._bodyInit)
    })
  }
  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }
    this._initBody(bodyInit)
    this.type = 'default'
    this.url = null
    this.status = options.status
    this.statusText = options.statusText
    this.headers = options.headers
    this.url = options.url || ''
  }
  Body.call(Response.prototype)
  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;
  self.fetch = function(url, options) {
    return new Request(url, options).fetch()
  }
  self.fetch.polyfill = true
})();;
/*! RESOURCE: /scripts/sn/common/clientScript/glideFormFieldFactory.js */
(function(exports, undefined) {
  'use strict';
  var IS_INITIALIZED = 'isInitialized';
  exports.glideFormFieldFactory = {
    create: create,
    hasInputHelpers: hasInputHelpers,
    useDisplayValueForValue: useDisplayValueForValue,
    isMandatory: isMandatory,
    hasValue: hasValue,
    isInitialized: isInitialized,
    setInitialized: setInitialized
  };

  function create(field) {
    var attributes = field.attributes || {};
    return {
      isVisible: function() {
        if (typeof field.fields !== 'undefined') {
          var childVisibility = false;
          field.fields.forEach(function(child) {
            childVisibility |= !!child.visible;
          });
          if (!childVisibility) {
            return false;
          }
        }
        return field.visible === true;
      },
      isReadonly: function() {
        return field.readonly === true || field.sys_readonly === true;
      },
      isMandatory: function() {
        return isMandatory(field);
      },
      hasBarcodeHelper: function() {
        return hasInputHelpers(field) && attributes.barcode === 'true';
      },
      hasCurrentLocationHelper: function() {
        return hasInputHelpers(field) && attributes.current_location === 'true';
      },
      hasMessages: function() {
        return field.messages && (field.messages.length > 0);
      }
    };
  }

  function isInitialized(field) {
    return field[IS_INITIALIZED] === true;
  }

  function setInitialized(field) {
    field[IS_INITIALIZED] = true;
  }

  function hasInputHelpers(field) {
    switch (field.type) {
      case 'boolean':
      case 'reference':
        return false;
      default:
        return true;
    }
  }

  function isMandatory(field) {
    switch (field.type) {
      case 'widget':
        return false;
      default:
        return !field.readonly && (field.mandatory === true || field.sys_mandatory === true);
    }
  }

  function hasValue(field) {
    if (field.type === "boolean")
      return true;
    var value = useDisplayValueForValue(field) ? field.displayValue : field.value;
    if (value == null) {
      return false;
    }
    if (typeof value === 'undefined') {
      return false;
    }
    var trimmed = String(value).trim();
    return trimmed.length > 0;
  }

  function useDisplayValueForValue(field) {
    switch (field.type) {
      case 'user_image':
      case 'glide_encrypted':
      case 'translated_text':
        return true;
      default:
        return false;
    }
  }
})(window);;
/*! RESOURCE: /scripts/sn/common/clientScript/glideFormFactory.js */
(function(exports, document, glideFormFieldFactory, undefined) {
    'use strict';
    exports.glideFormFactory = {
      create: createGlideForm,
      glideRequest: exports.glideRequest
    };
    var DEFAULT_ACTION_NAME = 'none';
    var SUBMIT_ACTION_NAME = 'submit';
    var SAVE_ACTION_NAME = 'save';
    var EVENT_ON_CHANGE = 'onChange';
    var EVENT_CHANGE = 'change';
    var EVENT_ON_SUBMIT = 'onSubmit';
    var EVENT_SUBMIT = 'submit';
    var EVENT_ON_SUBMITTED = 'onSubmitted';
    var EVENT_SUBMITTED = 'submitted';
    var EVENT_ON_CHANGED = 'onChanged';
    var EVENT_CHANGED = 'changed';
    var EVENT_PROPERTY_CHANGE = 'propertyChange';
    var EVENT_ON_PROPERTY_CHANGE = 'onPropertyChange';
    var PROPERTY_CHANGE_FORM = 'FORM';
    var PROPERTY_CHANGE_FIELD = 'FIELD';
    var PROPERTY_CHANGE_SECTION = 'SECTION';
    var PROPERTY_CHANGE_RELATED_LIST = 'RELATED_LIST';

    function createGlideForm(tableName, sysId, fields, uiActions, options) {
      if (!fields) {
        fields = [];
      }
      var _sysId = sysId ? sysId : '-1';
      var _fields = fields;
      var _dirtyFields = _getDirtyQueryFields(fields);
      var _submitActionName = DEFAULT_ACTION_NAME;
      var _onSubmitHandlers = [];
      var _onSubmittedHandlers = [];
      var _onChangeHandlers = [];
      var _onChangedHandlers = [];
      var _onPropertyChangeHandlers = [];
      var _options = {
        getMappedField: null,
        getMappedFieldName: null,
        uiMessageHandler: null,
        encodedRecord: null,
        relatedLists: null,
        sections: null,
        document: null
      };

      function GlideForm() {
        this.hasField = function(fieldName) {
          var field = _getField(fieldName);
          return field !== null;
        };
        this.getFieldNames = function() {
          var fieldNames = [];
          _fields.forEach(function(field) {
            fieldNames.push(field.name);
          });
          return fieldNames;
        };
        this.setLabel = function(fieldName, label) {
          var field = _getField(fieldName);
          if (!field) {
            return;
          }
          field.label = label;
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_FIELD,
            fieldName,
            'label'
          );
        };
        this.setLabelOf = this.setLabel;
        this.getLabel = function(fieldName) {
          var field = _getField(fieldName);
          if (!field) {
            return;
          }
          return field.label;
        };
        this.getLabelOf = this.getLabel;
        this.addDecoration = function(fieldName, icon, text) {
          var field = _getField(fieldName);
          if (!field) {
            return;
          }
          if (!field.decorations || !_isArray(field.decorations)) {
            field.decorations = [];
          }
          var deco = {
            icon: icon,
            text: text
          };
          for (var i = 0; i < field.decorations.length; i++) {
            var dec = field.decorations[i];
            if ((dec.icon === icon) && (dec.text === text)) {
              return;
            }
          }
          field.decorations.push(deco);
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_FIELD,
            field.name,
            'decorations'
          );
        };
        this.removeDecoration = function(fieldName, icon, text) {
          var field = _getField(fieldName);
          if (!field)
            return;
          if (!field.decorations || !_isArray(field.decorations)) {
            return;
          }
          for (var i = 0; i < field.decorations.length; i++) {
            var dec = field.decorations[i];
            if ((dec.icon === icon) && (dec.text === text)) {
              field.decorations.splice(i, 1);
              return;
            }
          }
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_FIELD,
            field.name,
            'decorations'
          );
        };
        this.setFieldPlaceholder = function(fieldName, value) {
          var field = _getField(fieldName);
          if (!field) {
            return;
          }
          field.placeholder = value;
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_FIELD,
            field.name,
            'placeholder'
          );
        };
        this.getEncodedRecord = function() {
          return _options.encodedRecord || '';
        };
        this.isMandatory = function(fieldName) {
          var field = _getField(fieldName);
          return field ? !!field.mandatory : false;
        };
        this.setMandatory = function(fieldName, isMandatory) {
          var field = _getField(fieldName);
          if (!field)
            return;
          if (field.sys_mandatory) {
            return;
          }
          isMandatory = _getBoolean(isMandatory);
          field.mandatory = isMandatory;
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_FIELD,
            field.name,
            'mandatory'
          );
        };
        this.isReadOnly = function(fieldName) {
          var field = _getField(fieldName);
          return field ? !!field.readonly : false;
        };
        this.setReadOnly = function(fieldName, readonly) {
          var field = _getField(fieldName);
          if (!field) {
            return;
          }
          if (field.sys_readonly) {
            return;
          }
          field.readonly = _getBoolean(readonly);
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_FIELD,
            field.name,
            'readonly'
          );
        };
        this.setReadonly = this.setReadOnly;
        this.setDisabled = this.setReadOnly;
        this.isVisible = function(fieldName) {
          var field = _getField(fieldName);
          return field ? !!field.visible : false;
        };
        this.setVisible = function(fieldName, isVisible) {
          var field = _getField(fieldName);
          if (!field) {
            return;
          }
          field.visible = _getBoolean(isVisible);
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_FIELD,
            field.name,
            'visible'
          );
        };
        this.setDisplay = this.setVisible;
        this.getValue = function(fieldName) {
          var field = _getField(fieldName);
          if (!field) {
            return '';
          }
          return (typeof field.value !== 'undefined' && field.value !== null) ? field.value.toString() : '';
        };
        this.getDisplayValue = function(fieldName) {
          var field = _getField(fieldName);
          if (!field) {
            return '';
          }
          return field.displayValue;
        };
        this.clearValue = function(fieldName) {
          this.setValue(fieldName, '');
        };
        this.setValue = function(fieldName, value, displayValue) {
          var field = _getField(fieldName);
          _setValue(this, field, value, displayValue);
        };
        this.getTableName = function() {
          return tableName;
        };
        this.isNewRecord = function() {
          return _sysId === "-1";
        };
        this.getSysId = function() {
          return _sysId;
        };
        this.getUniqueValue = this.getSysId;
        this.getBooleanValue = function(fieldName) {
          var val = this.getValue(fieldName);
          val = val ? val + '' : val;
          if (!val || val.length === 0 || val == "false") {
            return false;
          }
          return true;
        };
        this.getDecimalValue = function(fieldName) {
          var value = this.getValue(fieldName);
          if (!value || (value.length === 0)) {
            return 0;
          }
          return parseFloat(value);
        };
        this.getIntValue = function(fieldName) {
          var value = this.getValue(fieldName);
          if (typeof value === 'string') {
            value = value.trim();
          }
          if (!value || (value.length === 0)) {
            return 0;
          }
          return parseInt(value, 10);
        };
        this.addOption = function(fieldName, choiceValue, choiceLabel, choiceIndex) {
          var field = _getField(fieldName);
          if (!field) {
            return;
          }
          _addToOptionStack(field, 'add', choiceValue, choiceLabel, choiceIndex);
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_FIELD,
            field.name,
            'optionStack'
          );
        };
        this.clearOptions = function(fieldName) {
          var field = _getField(fieldName);
          if (!field) {
            return;
          }
          _addToOptionStack(field, 'clear');
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_FIELD,
            field.name,
            'optionStack'
          );
        };
        this.removeOption = function(fieldName, choiceValue) {
          var field = _getField(fieldName);
          if (!field) {
            return;
          }
          _addToOptionStack(field, 'remove', choiceValue);
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_FIELD,
            field.name,
            'optionStack'
          );
        };
        this.hideRelatedList = function(listTableName) {
          var list = _getRelatedList(listTableName);
          if (!list) {
            return;
          }
          list.visible = false;
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_RELATED_LIST,
            listTableName,
            'visible'
          );
        };
        this.hideRelatedLists = function() {
          if (!_options.relatedLists) {
            return;
          }
          _options.relatedLists.forEach(function(list) {
            this.hideRelatedList(_getRelatedListName(list));
          }, this);
        };
        this.showRelatedList = function(listTableName) {
          var list = _getRelatedList(listTableName);
          if (!list) {
            return;
          }
          list.visible = true;
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_RELATED_LIST,
            listTableName,
            'visible'
          );
        };
        this.showRelatedLists = function() {
          if (!_options.relatedLists) {
            return;
          }
          _options.relatedLists.forEach(function(list) {
            this.showRelatedList(_getRelatedListName(list));
          }, this);
        };
        this.getRelatedListNames = function() {
          var listNames = [];
          if (_options.relatedLists) {
            _options.relatedLists.forEach(function(list) {
              listNames.push(_getRelatedListName(list));
            });
          }
          return listNames;
        };
        this.getSectionNames = function() {
          var sectionNames = [];
          if (_options.sections) {
            _options.sections.forEach(function(section) {
              var sectionName = _getSectionName(section);
              if (sectionName !== null) {
                sectionNames.push(sectionName);
              }
            });
          }
          return sectionNames;
        };
        this.setSectionDisplay = function(sectionName, display) {
          var section = _getSection(sectionName);
          if (!section) {
            return;
          }
          section.visible = !!display;
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_SECTION,
            sectionName,
            'visible'
          );
        };
        this.getReference = function(fieldName, callback) {
          if (!callback) {
            _logWarn('GETREF:NOCB', 'Mobile scripts must specify a callback function');
            return;
          }
          var field = _getField(fieldName);
          if (!field) {
            _logWarn('GETREF:FNF', 'Field not found: ' + fieldName);
            return;
          }
          var table = _getReferenceTable(field);
          var referenceKey = field.reference_key ? field.reference_key : 'sys_id';
          var gr = new exports.GlideRecord(table);
          gr.get(referenceKey, field.value, callback);
        };
        this.addErrorMessage = function(message) {
          _fireUiMessage(this, 'errorMessage', message);
        };
        this.addInfoMessage = function(message) {
          _fireUiMessage(this, 'infoMessage', message);
        };
        this.clearMessages = function() {
          _fireUiMessage(this, 'clearMessages');
        };
        this.showFieldMsg = function(fieldName, message, type, scrollForm) {
          var field = _getField(fieldName);
          if (!field) {
            return;
          }
          if (!field.messages) {
            field.messages = [];
          }
          switch (type) {
            default: return;
            case 'info':
                case 'error':
                break;
          }
          field.messages.push({
            message: message,
            type: type
          });
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_FIELD,
            fieldName,
            'messages'
          );
        };
        this.hideFieldMsg = function(fieldName, clearAll) {
          var field = _getField(fieldName);
          if (!field) {
            return;
          }
          if (!field.messages || !_isArray(field.messages)) {
            return;
          }
          if (clearAll) {
            field.messages = [];
          } else {
            field.messages.shift();
          }
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_FIELD,
            fieldName,
            'messages'
          );
        };
        this.hideAllFieldMsgs = function(type) {
          switch (type) {
            default: return;
            case 'info':
                case 'error':
                break;
          }
          for (var i = 0; i < _fields.length; i++) {
            var msgs = _fields[i].messages;
            if (!msgs || !_isArray(msgs)) {
              continue;
            }
            for (var j = 0; j < msgs.length; j++) {
              if (msgs[j].type === type) {
                msgs.splice(j, 1);
              }
            }
          }
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_FORM,
            null,
            'messages'
          );
        };
        this.showErrorBox = function(fieldName, message, scrollForm) {
          this.showFieldMsg(fieldName, message, 'error', scrollForm);
        };
        this.hideErrorBox = function(fieldName) {
          this.hideFieldMsg(fieldName, false);
        };
        this.getActionName = function() {
          return _submitActionName;
        };
        this.save = function() {
          return this.submit(SAVE_ACTION_NAME);
        };
        this.submit = function(submitActionName) {
          var formDocument = _options.document ? _options.document : document;
          var activeElement = formDocument.activeElement;
          if (activeElement) {
            activeElement.blur();
          }
          _submitActionName = submitActionName || SUBMIT_ACTION_NAME;
          if (!_hasMandatoryFields(this) || !_runSubmitScripts()) {
            _submitActionName = DEFAULT_ACTION_NAME;
            return false;
          }
          var uiAction = _getUIAction(submitActionName);
          if (!uiAction)
            return true;
          return uiAction.execute(this);
        };
        this.serialize = function(onlyDirtyFields) {
          var serializeField = function(field, fields) {
            var fieldCopy = _copy(field);
            if (fieldCopy.value == null || typeof fieldCopy.value === 'undefined') {
              fieldCopy.value = '';
            }
            fields.push(fieldCopy);
          };
          var serializedFields = [];
          if (onlyDirtyFields === true) {
            Object.keys(_dirtyFields).forEach(function(fieldName) {
              serializeField(_getField(fieldName), serializedFields);
            });
          } else {
            _fields.forEach(function(field) {
              serializeField(field, serializedFields);
            });
          }
          return serializedFields;
        };
        this.$private = {
          options: function(options) {
            if (!options) {
              return;
            }
            if (typeof options === 'string') {
              return _options[options];
            }
            Object.keys(options).forEach(function(optionName) {
              if (_options[optionName]) {
                throw 'Cannot override option: ' + optionName;
              }
              _options[optionName] = options[optionName];
            });
          },
          events: {
            on: function(eventName, fn) {
              switch (eventName) {
                case EVENT_CHANGE:
                case EVENT_ON_CHANGE:
                  _onChangeHandlers.push(fn);
                  break;
                case EVENT_SUBMIT:
                case EVENT_ON_SUBMIT:
                  _onSubmitHandlers.push(fn);
                  break;
                case EVENT_SUBMITTED:
                case EVENT_ON_SUBMITTED:
                  _onSubmittedHandlers.push(fn);
                  break;
                case EVENT_CHANGED:
                case EVENT_ON_CHANGED:
                  _onChangedHandlers.push(fn);
                  break;
                case EVENT_PROPERTY_CHANGE:
                case EVENT_ON_PROPERTY_CHANGE:
                  _onPropertyChangeHandlers.push(fn);
                  break;
                default:
                  throw 'Unsupported GlideForm event: ' + eventName;
              }
            },
            propertyChange: function(type, name, propertyName) {
              if (_onPropertyChangeHandlers.length == 0) {
                return;
              }
              switch (type) {
                default: type = PROPERTY_CHANGE_FIELD;
                case PROPERTY_CHANGE_FIELD:
                    case PROPERTY_CHANGE_SECTION:
                    case PROPERTY_CHANGE_RELATED_LIST:
                    break;
              }
              _onPropertyChangeHandlers.forEach(function(fn) {
                fn.call(
                  fn,
                  type,
                  name,
                  propertyName
                );
              });
            },
            off: function(eventName) {
              switch (eventName) {
                case EVENT_CHANGE:
                case EVENT_ON_CHANGE:
                  _onChangeHandlers = [];
                  break;
                case EVENT_SUBMIT:
                case EVENT_ON_SUBMIT:
                  _onSubmitHandlers = [];
                  break;
                case EVENT_SUBMITTED:
                case EVENT_ON_SUBMITTED:
                  _onSubmittedHandlers = [];
                  break;
                case EVENT_CHANGED:
                case EVENT_ON_CHANGED:
                  _onChangedHandlers = [];
                  break;
                case EVENT_PROPERTY_CHANGE:
                case EVENT_ON_PROPERTY_CHANGE:
                  _onPropertyChangeHandlers = [];
                  break;
                default:
                  throw 'Unsupported GlideForm event: ' + eventName;
              }
            },
            cleanup: function() {
              _onChangeHandlers = [];
              _onSubmitHandlers = [];
              _onSubmittedHandlers = [];
              _onChangedHandlers = [];
              _onPropertyChangeHandlers = [];
            }
          }
        };
      }
      var _valueCalls = 0;

      function _setValue(g_form, field, value, displayValue, skipDerivedFieldUpdate, skipDisplayValueUpdate) {
        if (!field) {
          return;
        }
        var oldValue = field.value;
        if (oldValue !== value) {
          _dirtyFields[field.name] = true;
        }
        field.value = value;
        if (field.type === 'reference') {
          if (!skipDerivedFieldUpdate) {
            _updateDerivedFields(g_form, field);
          }
          if (!skipDisplayValueUpdate && glideFormFieldFactory.hasValue(field) && !displayValue) {
            field.displayValue = '';
            g_form.getReference(field.name, function(gr) {
              var displayValue = gr.getDisplayValue();
              field.value = oldValue;
              _setValue(g_form, field, value, displayValue, true, true);
            });
            return;
          }
        }
        field.displayValue = typeof displayValue !== 'undefined' && displayValue != null ? displayValue : value;
        var fields = _getDependentFields(field.name);
        fields.forEach(function(field) {
          if (field.dependentValue !== value) {
            field.dependentValue = value;
          }
          if (field.ed && field.ed.dependent_value !== value)
            field.ed.dependent_value = value;
        });
        _fireValueChange(field, oldValue, value);
      }

      function _getRelatedList(listTableName) {
        if (!_options.relatedLists) {
          return null;
        }
        var foundList = null;
        _options.relatedLists.forEach(function(list) {
          if (foundList) {
            return;
          }
          if (listTableName === _getRelatedListName(list)) {
            foundList = list;
            return;
          }
          if (listTableName === list.table || listTableName === list.field) {
            foundList = list;
            return;
          }
        });
        return foundList;
      }

      function _getRelatedListName(list) {
        return list.table + '.' + list.field;
      }

      function _getSection(sectionName) {
        if (!_options.sections) {
          return null;
        }
        var foundSection = null;
        _options.sections.forEach(function(section) {
          if (foundSection) {
            return;
          }
          var name = _getSectionName(section);
          if (name === sectionName) {
            foundSection = section;
            return;
          }
        });
        return foundSection;
      }

      function _getSectionName(section) {
        var sectionName = section.caption;
        if (!sectionName) {
          return null;
        }
        return sectionName.toLowerCase().replace(" ", "_").replace(/[^0-9a-z_]/gi, "");
      }

      function _fireValueChange(field, oldValue, value) {
        if (_onChangeHandlers.length > 0) {
          _valueCalls++;
          _onChangeHandlers.forEach(function(fn) {
            fn.call(fn, field.name, oldValue, value);
          });
          _valueCalls--;
        }
        if (_options.getMappedFieldName) {
          var mappedName = _options.getMappedFieldName(field.name);
          _valueCalls++;
          _onChangeHandlers.forEach(function(fn) {
            fn.call(fn, mappedName, oldValue, value);
          });
          _valueCalls--;
        }
        if ((_valueCalls == 0) && _onChangedHandlers.length > 0