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

  function hasValue(field, value) {
    if (typeof value === 'undefined') {
      value = useDisplayValueForValue(field) ? field.displayValue : field.value;
    }
    switch (field.type) {
      case 'boolean_confirm':
        return value === 'true';
      case 'boolean':
        return true;
      case 'currency':
        var currencyValues = value.split(';');
        return currencyValues[1] && currencyValues[1].length;
    }
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
      isInitialized: false,
      fieldIterator: function(f) {
        _fields.forEach(f);
      },
      getMappedField: null,
      getMappedFieldName: null,
      uiMessageHandler: null,
      encodedRecord: null,
      relatedLists: null,
      sections: null,
      viewName: '',
      document: null
    };

    function GlideForm() {
      this.hasField = function(fieldName) {
        var field = _getField(fieldName);
        return field !== null;
      };
      this.getFieldNames = function() {
        var fieldNames = [];
        _options.fieldIterator(function(field) {
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
      this.getViewName = function() {
        return _options.viewName;
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
        var added = _addToOptionStack(field, 'add', choiceValue, choiceLabel, choiceIndex);
        if (added) {
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_FIELD,
            field.name,
            'optionStack'
          );
        }
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
          for (var j = msgs.length - 1; j >= 0; j--) {
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
          if (_options.isInitialized) {
            throw 'Cannot override options';
          }
          Object.keys(options).forEach(function(optionName) {
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

    function _setValueGlideList(field, oldValue, g_form, displayValue) {
      if (Array.isArray(displayValue)) {
        field.display_value_list = displayValue;
        _setValue(g_form, field, field.value, displayValue.join(', '), true, true);
        return;
      } else if (displayValue && field.value.split(',').length == displayValue.split(',').length) {
        field.display_value_list = displayValue.split(',');
        _setValue(g_form, field, field.value, displayValue, true, true);
        return;
      }
      field.displayValue = '';
      field.display_value_list = [];
      var table = _getReferenceTable(field);
      var requestUri = '/api/now/ui/glide/list/element/display/' + table + '/' + field.value;
      glideRequest.get(requestUri).then(function(response) {
        var result = response && response.data ? response.data.result : null;
        var values = [];
        var displayValues = [];
        if (result) {
          for (var i in result) {
            values.push(result[i].sys_id);
            displayValues.push(result[i].display);
          }
        }
        field.value = oldValue;
        field.display_value_list = displayValues;
        _setValue(g_form, field, values.join(','), displayValues.join(','), true, true);
      });
    }

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
      } else if (field.type == 'glide_list') {
        if (!glideFormFieldFactory.hasValue(field))
          field.display_value_list = [];
        else if (!skipDisplayValueUpdate) {
          if (!displayValue)
            _setValueGlideList(field, oldValue, g_form);
          else {
            if (!Array.isArray(displayValue))
              _logWarn('g_form.setValue(field, value, displayValue)', 'When using setValue with a glide_list element: displayValue should be an array of display values.');
            _setValueGlideList(field, oldValue, g_form, displayValue);
          }
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
      if (list.related_field) {
        return list.value;
      }
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
      if ((_valueCalls == 0) && _onChangedHandlers.length > 0) {
        _onChangedHandlers.forEach(function(fn) {
          fn.call(fn);
        });
      }
    }

    function _updateDerivedFields(g_form, originatingField) {
      var derivedFields = _getDerivedFields(originatingField.name);
      if (!glideFormFieldFactory.hasValue(originatingField)) {
        derivedFields.forEach(function(field) {
          _setValue(g_form, field, '', null, true);
        });
        return;
      }
      var relativeFieldNames = [];
      var fieldsByRelativeFieldName = {};
      derivedFields.forEach(function(field) {
        var relativeField = _relativeDerivedFieldName(field.name, originatingField.name);
        fieldsByRelativeFieldName[relativeField] = field;
        relativeFieldNames.push(relativeField);
      });
      if (relativeFieldNames.length == 0) {
        return;
      }
      var glideRequest = glideFormFactory.glideRequest;
      var referenceTable = _getReferenceTable(originatingField);
      var referenceKey = originatingField.reference_key ? originatingField.reference_key : 'sys_id';
      var requestUri = '/api/now/v1/table/' + referenceTable;
      var requestParams = {
        sysparm_display_value: 'all',
        sysparm_fields: relativeFieldNames.join(','),
        sysparm_query: referenceKey + '=' + originatingField.value,
        sysparm_limit: 1
      };
      glideRequest.get(requestUri, {
        params: requestParams
      }).then(function(response) {
        var result = response && response.data ? response.data.result : null;
        if (result.length > 0) {
          result = result[0];
          var keys = Object.keys(result);
          keys.forEach(function(fieldName) {
            var field = fieldsByRelativeFieldName[fieldName];
            var newFieldValues = result[fieldName];
            _setValue(g_form, field, newFieldValues.value, newFieldValues.display_value, true);
          });
        }
      });
    }

    function _getField(fieldName) {
      for (var i = 0, iM = _fields.length; i < iM; i++) {
        var field = _fields[i];
        if (field.variable_name === fieldName || field.name === fieldName) {
          return field;
        }
      }
      if (_options.getMappedField) {
        var mapped = _options.getMappedField(fieldName);
        if (mapped) {
          return mapped;
        }
      }
      return null;
    }

    function _getDependentFields(fieldName) {
      var fields = [];
      for (var i = 0, iM = _fields.length; i < iM; i++) {
        var field = _fields[i];
        if (field.dependentField === fieldName) {
          fields.push(field);
        }
      }
      return fields;
    }

    function _getDerivedFields(fieldName) {
      var fields = [];
      var derivedFieldPrefix = fieldName + '.';
      for (var i = 0, iM = _fields.length; i < iM; i++) {
        var field = _fields[i];
        if (field.name.startsWith(derivedFieldPrefix)) {
          fields.push(field);
        }
      }
      return fields;
    }

    function _relativeDerivedFieldName(derivedFieldName, rootFieldName) {
      var prefix = rootFieldName + '.';
      return derivedFieldName.replace(prefix, '');
    }

    function _addToOptionStack(field, operation, value, label, index) {
      if (!field.optionStack) {
        field.optionStack = [];
      }
      if (operation === 'add') {
        var foundOperations = [];
        for (var i = 0, iM = field.optionStack.length; i < iM; i++) {
          if (field.optionStack[i].value === value) {
            foundOperations.push(field.optionStack[i]);
          }
        }
        if (foundOperations.length > 0) {
          var isInChoiceList = false;
          for (var i = 0, iM = foundOperations.length; i < iM; i++) {
            switch (foundOperations[i].operation) {
              case 'add':
                isInChoiceList = true;
                break;
              case 'clear':
              case 'remove':
                isInChoiceList = false;
                break;
            }
          }
          if (isInChoiceList) {
            return false;
          }
        }
      }
      var optionOper = {
        operation: operation,
        label: label,
        value: value,
        index: index
      };
      if (operation === 'clear') {
        field.optionStack.splice(0, field.optionStack.length, optionOper);
      } else {
        field.optionStack.push(optionOper);
      }
      return true;
    }

    function _hasMandatoryFields(g_form) {
      var emptyMandatoryFields = [];
      _options.fieldIterator(function(f) {
        if (!glideFormFieldFactory.isMandatory(f)) {
          return;
        }
        if (!glideFormFieldFactory.hasValue(f)) {
          emptyMandatoryFields.push(f.label);
        }
      });
      if (emptyMandatoryFields.length === 0) {
        return true;
      }
      var mandatoryFieldMsg = "The following fields are incomplete:";
      if (typeof g_mandatory_field_msg !== "undefined")
        mandatoryFieldMsg = g_mandatory_field_msg;
      var message = mandatoryFieldMsg + "\n\n" + emptyMandatoryFields.join("\n");
      _fireUiMessage(g_form, 'mandatoryMessage', message);
      return false;
    }

    function _runSubmitScripts() {
      if (_onSubmitHandlers.length > 0) {
        var result;
        for (var i = 0, iM = _onSubmitHandlers.length; i < iM; i++) {
          result = _onSubmitHandlers[i].call(null);
          if (result === false) {
            return false;
          }
        }
      }
      if (_onSubmittedHandlers.length > 0) {
        _onSubmittedHandlers.forEach(function(fn) {
          fn.call(fn, _submitActionName);
        });
      }
      return true;
    }

    function _getUIAction(name) {
      if (!uiActions) {
        return false;
      }
      return uiActions.getActionByName(name);
    }

    function _getDirtyQueryFields(fields) {
      var dirtyFields = {};
      if (fields) {
        fields.forEach(function(field) {
          if (typeof field.dirtyQueryField !== 'undefined' && field.dirtyQueryField === true) {
            dirtyFields[field.name] = true;
          }
        });
      }
      return dirtyFields;
    }

    function _getReferenceTable(field) {
      var referenceTable = field.ed ? field.ed.reference : undefined;
      if (typeof referenceTable === 'undefined') {
        referenceTable = field.refTable;
      }
      if (typeof referenceTable === 'undefined') {
        referenceTable = field.ref_table;
      }
      return referenceTable;
    }

    function _fireUiMessage(g_form, type, message) {
      var handledMessage = false;
      if (_options.uiMessageHandler) {
        var response = _options.uiMessageHandler(g_form, type, message);
        handledMessage = response !== false;
      }
      if (!handledMessage && typeof message !== 'undefined') {
        alert(message);
      }
      g_form.$private.events.propertyChange(
        PROPERTY_CHANGE_FORM,
        null,
        type
      );
    }
    var instance = new GlideForm();
    if (options) {
      instance.$private.options(options);
    }
    _deprecate(instance, [
      'disableAttachments',
      'enableAttachments',
      'flash',
      'getControl',
      'getElement',
      'getFormElement',
      'getSections'
    ]);
    return instance;
  }

  function _getBoolean(value) {
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }
    return value ? true : false;
  }

  function _notImplemented(instance, methods) {
    methods.forEach(function(method) {
      if (!instance[method]) {
        instance[method] = function() {
          _logWarn('UNSUPPORTED', 'Method ' + method + ' is not supported on mobile');
        };
      }
    });
  }

  function _deprecate(instance, methods) {
    methods.forEach(function(method) {
      if (!instance[method]) {
        instance[method] = function() {
          _logWarn('DEPRECATED', 'Method ' + method + ' is deprecated and unsupported on mobile');
        };
      }
    });
  }

  function _logWarn(code, msg) {
    if (console && console.warn) {
      console.warn('(g_form) [' + code + '] ' + msg);
    }
  }

  function _isArray(o) {
    if (!Array.isArray) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }
    return Array.isArray(o);
  }

  function _copy(source) {
    var dest = {};
    for (var prop in source) {
      if (Object.prototype.hasOwnProperty.call(source, prop)) {
        switch (typeof source[prop]) {
          case 'function':
            break;
          default:
            dest[prop] = source[prop];
        }
      }
    }
    return dest;
  }
})(window, window.document || {}, window.glideFormFieldFactory);;
/*! RESOURCE: /scripts/sn/common/clientScript/uiPolicyTypes.js */
(function(exports, undefined) {
  'use strict';
  var UI_POLICY_TYPES = {
    dateTypes: {
      glide_date_time: "datetime",
      glide_date: "date",
      date: "date",
      datetime: "datetime",
      due_date: "datetime"
    },
    numberTypes: {
      decimal: "decimal",
      numeric: "numeric",
      integer: "integer",
      float: "float"
    },
    currencyTypes: {
      currency: "currency",
      price: "price"
    }
  };
  exports.UI_POLICY_TYPES = UI_POLICY_TYPES;
})(window);;
/*! RESOURCE: /scripts/sn/common/clientScript/uiPolicyFactory.js */
(function(exports, undefined) {
  'use strict';
  exports.uiPolicyFactory = {
    create: createUiPolicy
  };
  var uiPolicyTypes = exports.UI_POLICY_TYPES;

  function createUiPolicy(g_form, uiPolicyMap, scripts) {
    var _tableName = uiPolicyMap.table;
    var _description = uiPolicyMap.short_description;
    var _onLoad = uiPolicyMap.onload;
    var _fields = uiPolicyMap.condition_fields;
    var _conditions = uiPolicyMap.conditions;
    var _watchFields = {};
    var _lastResult = null;
    var _isDebug = false;
    initializePolicy();

    function initializePolicy() {
      _fields.forEach(function(field, i) {
        var condition = _conditions[i];
        _watchFields[field] = true;
        if (_isField2FieldComparisonlOper(condition.oper)) {
          var field2 = condition.value.split('@')[0];
          _watchFields[field2] = true;
        }
      });
      g_form.$private.events.on('change', onChangeForm);
      if (_onLoad) {
        runPolicy();
      }
    }

    function onChangeForm(fieldName, oldValue, newValue) {
      if (_watchFields[fieldName]) {
        runPolicy();
      }
    }

    function runPolicy() {
      _debug("Running policy on table: " + _tableName + " " + _description);
      runActions(!!evaluateCondition());
    }

    function evaluateCondition() {
      _debug("--->>> Evaluating condition:");
      var result = "?";
      var conditionResult = true;
      var terms = _conditions;
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i];
        if (t.newquery) {
          if (result == "t") {
            _debug("---<<< condition exited with: TRUE");
            return true;
          } else {
            _debug(" OR (next condition)");
            conditionResult = true;
          }
        }
        if (!conditionResult)
          continue;
        if (t.or) {
          if (result != "t")
            result = _evaluateTermTF(t);
        } else {
          if ((result == "f") && (!t.newquery)) {
            conditionResult = false;
          } else {
            result = _evaluateTermTF(t);
          }
        }
      }
      var response = result != "f";
      _debug("---<<< End evaluating condition with result: " + response);
      return response;
    }

    function _evaluateTermTF(term) {
      var result = evaluateTerm(term);
      _debugTerm(term, result);
      if (result)
        return "t";
      else
        return "f";
    }

    function evaluateTerm(term) {
      var type = term.type;
      if (uiPolicyTypes.dateTypes[type])
        return evaluateTermDate(term);
      if (uiPolicyTypes.numberTypes[type] || uiPolicyTypes.currencyTypes[type])
        return evaluateTermNumber(term);
      var field = term.field;
      if (!field)
        return false;
      var oper = term.oper;
      var value = term.value;
      var userValue = g_form.getValue(field) + '';
      switch (oper) {
        case '=':
          return userValue === value;
        case '!=':
          return userValue != value;
        case '<':
          return userValue < value;
        case '<=':
          return userValue <= value;
        case '>':
          return userValue > value;
        case '>=':
          return userValue >= value;
        case 'IN':
          var values = value.split(',');
          return userValue && (_inArray(userValue, values) !== -1);
        case 'NOT IN':
          var values2 = value.split(',');
          return _inArray(userValue, values2) === -1;
        case 'STARTSWITH':
          if (type == 'reference')
            userValue = g_form.getDisplayValue(field);
          return userValue.indexOf(value) === 0;
        case 'ENDSWITH':
          if (type == 'reference')
            userValue = g_form.getDisplayValue(field);
          return userValue.lastIndexOf(value) == userValue.length - value.length;
        case 'LIKE':
          if (type == 'reference')
            userValue = g_form.getDisplayValue(field);
          return userValue.indexOf(value) != -1;
        case 'NOT LIKE':
          if (type == 'reference')
            userValue = g_form.getDisplayValue(field);
          return userValue.indexOf(value) == -1;
        case 'ISEMPTY':
          return userValue === '';
        case 'ISNOTEMPTY':
          return userValue !== '';
        case 'BETWEEN':
          var values3 = value.split('@');
          return userValue && userValue >= values3[0] && userValue <= values3[1];
        case 'SAMEAS':
          userValue = (type == 'reference') ? g_form.getDisplayValue(term.field) : g_form.getValue(term.field);
          value = (type == 'reference') ? g_form.getDisplayValue(term.value) : g_form.getValue(term.value);
          return userValue == value;
        case 'NSAMEAS':
          userValue = (type == 'reference') ? g_form.getDisplayValue(term.field) : g_form.getValue(term.field);
          value = (type == 'reference') ? g_form.getDisplayValue(term.value) : g_form.getValue(term.value);
          return userValue != value;
        default:
          return false;
      }
    }

    function evaluateTermNumber(term) {
      var field = term.field;
      if (!field)
        return false;
      var oper = term.oper;
      var value = term.value;
      if (value !== '' && value.indexOf(',') === -1)
        value = parseFloat(value);
      var userValue = getUserValue(term);
      switch (oper) {
        case '=':
          return userValue === value;
        case '!=':
          return userValue != value;
        case '<':
          return userValue < value;
        case '<=':
          return userValue <= value;
        case '>':
          return userValue > value;
        case '>=':
          return userValue >= value;
        case 'IN':
          var values = (value + "").split(',');
          return userValue.toString() && (_inArray(userValue.toString(), values) !== -1);
        case 'NOT IN':
          var values2 = (value + "").split(',');
          return _inArray(userValue.toString(), values2) === -1;
        case 'ISEMPTY':
          return userValue.toString() === '';
        case 'ISNOTEMPTY':
          return userValue.toString() !== '';
        case "GT_FIELD":
          userValue = parseInt(g_form.getValue(term.field));
          value = parseInt(g_form.getValue(term.value));
          return userValue > value;
        case "LT_FIELD":
          userValue = parseInt(g_form.getValue(term.field));
          value = parseInt(g_form.getValue(term.value));
          return userValue < value;
        case "GT_OR_EQUALS_FIELD":
          userValue = parseInt(g_form.getValue(term.field));
          value = parseInt(g_form.getValue(term.value));
          return userValue >= value;
        case "LT_OR_EQUALS_FIELD":
          userValue = parseInt(g_form.getValue(term.field));
          value = parseInt(g_form.getValue(term.value));
          return userValue <= value;
        default:
          return false;
      }
    }

    function evaluateTermDate(term) {
      var value = term.value;
      var userValue = g_form.getValue(term.field) + '';
      var values = value.split('@');
      var isDateTime = uiPolicyTypes.dateTypes[term.type] == "datetime";
      if (!isDateTime)
        userValue += " 00:00:00";
      if (term.oper == 'ISEMPTY')
        return userValue === '';
      var userDate = _getDate(userValue);
      if (isNaN(userDate)) {
        _debug("evaluateTermDate - invalid date, returning false");
        return false;
      }
      if (term.oper == "RELATIVE")
        return _evaluateTermDateRelative(userDate, value, isDateTime);
      if (term.oper == "DATEPART")
        return _evaluateTermDateTrend(userDate, value);
      var valueDate, valueDate1, valueDate2;
      switch (term.oper) {
        case '=':
          return g_form.getValue(term.field) === value;
        case '!=':
          return g_form.getValue(term.field) != value;
        case 'ISNOTEMPTY':
          return userValue !== '';
        case '<=':
        case '<':
          valueDate = _getDate(value);
          return (valueDate !== 0) && (userDate < valueDate);
        case '>=':
        case '>':
          valueDate = _getDate(value);
          return (valueDate !== 0) && (userDate > valueDate);
        case 'ON':
          valueDate1 = _getDate(values[1]);
          valueDate2 = _getDate(values[2]);
          return (valueDate1 !== 0) && (valueDate2 !== 0) && (userDate >= valueDate1) && (userDate <= valueDate2);
        case 'NOTON':
          valueDate1 = _getDate(values[1]);
          valueDate2 = _getDate(values[2]);
          return (valueDate1 !== 0) && (valueDate2 !== 0) && ((userDate < valueDate1) || (userDate > valueDate2));
        case 'BETWEEN':
          valueDate1 = _getDate(values[0]);
          valueDate2 = _getDate(values[1]);
          return (valueDate1 !== 0) && (valueDate2 !== 0) && (userDate >= valueDate1) && (userDate <= valueDate2);
        case 'LESSTHAN':
          return _dateComparisonHelper(term.field, term.value, 'LT');
        case 'MORETHAN':
          return _dateComparisonHelper(term.field, term.value, 'GT');
        default:
          _debug("evaluateTermDate - unsupported operator '" + term.oper + "'. Returning FALSE.");
          return false;
      }
    }

    function _dateComparisonHelper(left, right, comparison) {
      var parsed = _parseField2FieldValue(right);
      var userValue = g_form.getValue(left);
      var value = g_form.getValue(parsed.fieldName);
      if (_isNullField(value) || _isNullField(userValue)) {
        _debug("ui policy could not find a valid field to compare against. Returning FALSE.");
        return false;
      }
      var userDate = _getDate(userValue);
      var theDate = _getDate(value);
      if (parsed.interval == 'quarter') {
        userDate = _roundDateToQuarter(userDate);
        theDate = _roundDateToQuarter(theDate);
      }
      var diff = userDate - theDate;
      if (parsed.beforeAfter == 'before' && diff > 0)
        return false;
      if (parsed.beforeAfter == 'after' && diff < 0)
        return false;
      var xDiff;
      if (parsed.interval == 'quarter') {
        var Qdiff = Math.abs(_getAbsQuarter(theDate) - _getAbsQuarter(userDate));
        xDiff = Qdiff - parsed.intervalValue;
      } else {
        var timeSpan = _getIntervalInMilliSeconds(parsed.interval, parsed.intervalValue);
        xDiff = Math.abs(diff) - Math.abs(timeSpan);
      }
      if (comparison === 'GT')
        return xDiff > 0;
      if (comparison === 'LT')
        return xDiff < 0;
    }

    function _getAbsQuarter(theDate) {
      var quarters = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4];
      var Q = quarters[theDate.getMonth()];
      var Y = theDate.getFullYear() * 4;
      return Y + Q;
    }

    function _roundDateToQuarter(theDate) {
      var quarters = [0, 0, 0, 3, 3, 3, 6, 6, 6, 9, 9, 9];
      var Q = quarters[theDate.getMonth()];
      var d = new Date();
      d.setFullYear(theDate.getFullYear(), Q, 0);
      d.setHours(0, 0, 0);
      return d;
    }

    function _isNullField(fieldValue) {
      return typeof fieldValue == 'undefined' || fieldValue == null || fieldValue == '';
    }

    function _parseField2FieldValue(daString) {
      var daArray = daString.split('@');
      return {
        fieldName: daArray[0],
        interval: daArray[1],
        intervalValue: parseInt(daArray[3], 10),
        beforeAfter: daArray[2]
      };
    }

    function _getIntervalInMilliSeconds(interval, value) {
      var ms = {};
      ms.hour = 1000 * 60 * 60;
      ms.day = ms.hour * 24;
      ms.week = ms.day * 7;
      ms.month = ms.day * 30;
      ms.year = ms.day * 365;
      return ms[interval] * value;
    }

    function _getDate(dateValue) {
      if (dateValue)
        dateValue = dateValue.replace(/\s/, 'T');
      return new Date(dateValue);
    }

    function _evaluateTermDateTrend(userDateMilliseconds, trendValueString) {
      var userDate = new Date(userDateMilliseconds);
      var trendParams = trendValueString.split("@");
      if (trendParams.length != 2 || !trendParams[1])
        return;
      var trendParamParts = trendParams[1].split(",");
      if (trendParamParts.length != 3)
        return;
      var trendType = trendParamParts[0];
      var trendValue = trendParamParts[1];
      var trendOper = trendParamParts[2];
      var checkVals;
      switch (trendType) {
        case 'dayofweek':
          checkVals = _trendDayOfWeek(userDate, trendValue, trendOper);
          break;
        case 'month':
          checkVals = _trendMonth(userDate, trendValue, trendOper);
          break;
        case 'year':
          checkVals = _trendYear(userDate, trendValue, trendOper);
          break;
        case 'week':
          checkVals = _trendWeek(userDate, trendValue, trendOper);
          break;
        case 'hour':
          checkVals = _trendHour(userDate, trendValue, trendOper);
          break;
        case 'quarter':
          checkVals = _trendQuarter(userDate, trendValue, trendOper);
          break;
        default:
          _debug("_evaluateTermDateTrend - unsupported trend type '" + trendType + "'. Returning FALSE.");
          return false;
      }
      return _evaluateDateValues(checkVals, trendOper);
    }

    function _evaluateTermDateRelative(userDateMilliseconds, relativeValueString, isDateTime) {
      var relativeValues = relativeValueString.split('@');
      if (!relativeValues || relativeValues.length != 4 || isNaN(relativeValues[3]))
        return false;
      var oper = relativeValues[0];
      var termType = relativeValues[1];
      var termWhen = relativeValues[2];
      var termValue = parseInt(relativeValues[3], 10);
      var modifier = 1;
      if (termWhen == "ahead")
        modifier = -1;
      var relativeValueMilliseconds;
      switch (termType) {
        case 'hour':
          relativeValueMilliseconds = hoursAgoInMilliseconds(modifier * termValue);
          break;
        case 'minute':
          relativeValueMilliseconds = minutesAgoInMilliseconds(modifier * termValue);
          break;
        case 'dayofweek':
          relativeValueMilliseconds = daysAgoInMilliseconds(modifier * termValue);
          break;
        case 'month':
          relativeValueMilliseconds = monthsAgoInMilliseconds(modifier * termValue);
          break;
        case 'quarter':
          relativeValueMilliseconds = quartersAgoInMilliseconds(modifier * termValue);
          break;
        case 'year':
          relativeValueMilliseconds = yearsAgoInMilliseconds(modifier * termValue);
          break;
        default:
          _debug("_evaluateTermDateRelative - unsupported type '" + termType + "'. Returning FALSE.");
          return false;
      }
      var checkVals;
      if (isDateTime) {
        checkVals = {
          checkValue: relativeValueMilliseconds,
          userValue: userDateMilliseconds
        };
      } else {
        checkVals = {
          checkValue: _removeTime(relativeValueMilliseconds),
          userValue: _removeTime(userDateMilliseconds)
        };
      }
      return _evaluateDateValues(checkVals, oper);
    }

    function _evaluateDateValues(checkVals, oper) {
      if (!checkVals)
        return;
      switch (oper) {
        case 'EE':
          return checkVals.userValue === checkVals.checkValue;
        case 'LT':
          return checkVals.userValue < checkVals.checkValue;
        case 'LE':
          return checkVals.userValue <= checkVals.checkValue;
        case 'GT':
          return checkVals.userValue > checkVals.checkValue;
        case 'GE':
          return checkVals.userValue >= checkVals.checkValue;
        default:
          _debug("_evaluateDateValues - unsupported operator '" + oper + "'. Returning FALSE.");
          return false;
      }
    }

    function _removeTime(dateInMilliseconds) {
      var newDate = new Date(dateInMilliseconds);
      newDate.setHours(0);
      newDate.setMinutes(0);
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);
      return newDate.getTime();
    }

    function _trendDayOfWeek(userDate, trendValue) {
      var trendDays = ['monday', 'tuesday', 'wednesday', 'thurday', 'friday', 'saturday', 'sunday'];
      var foundIn = -1;
      for (var i = 0; i < 7; i++)
        if (trendDays[i] == trendValue) {
          foundIn = i;
          break;
        }
      if (foundIn < 0)
        return;
      var userDOW = userDate.getDay();
      userDOW = userDOW - 1;
      if (userDOW < 0)
        userDOW = 6;
      return {
        checkValue: foundIn,
        userValue: userDOW
      };
    }

    function _trendMonth(userDate, trendValue) {
      var trendMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'june', 'july', 'aug', 'sep', 'oct', 'nov', 'dec'];
      var foundIn = -1;
      for (var i = 0; i < 12; i++)
        if (trendMonths[i] == trendValue) {
          foundIn = i;
          break;
        }
      if (foundIn < 0)
        return;
      return {
        checkValue: foundIn,
        userValue: userDate.getMonth()
      };
    }

    function _trendYear(userDate, trendValue) {
      return {
        checkValue: trendValue,
        userValue: userDate.getFullYear()
      };
    }

    function _trendHour(userDate, trendValue) {
      return {
        checkValue: trendValue,
        userValue: userDate.getHour()
      };
    }

    function _trendQuarter(userDate, trendValue) {
      var quarters = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4];
      return {
        checkValue: trendValue,
        userValue: quarters[userDate.getMonth()]
      };
    }

    function _trendWeek(userDate, trendValue) {
      var checkDate = new Date(userDate.getFullYear(), 0, 1);
      var userWeek = (Math.ceil((((userDate.getTime() - checkDate) / 86400000) + checkDate.getDay() + 1) / 7)) - 1;
      return {
        checkValue: trendValue,
        userValue: userWeek
      };
    }

    function quartersAgoInMilliseconds(quarters) {
      var now = new Date();
      var quartersModifier = [0, 1, 1, 1, 4, 4, 4, 7, 7, 7, 10, 10, 10];
      var month = now.getMonth() + 1;
      var quarterBegin = quartersModifier[month];
      var monthsBack = month - quarterBegin + (quarters * 3);
      return monthsAgoInMilliseconds(monthsBack);
    }

    function yearsAgoInMilliseconds(years) {
      var now = new Date();
      var yearsAgo = now.getFullYear() - years;
      now.setFullYear(yearsAgo);
      return now.getTime(now);
    }

    function monthsAgoInMilliseconds(months) {
      var now = new Date();
      var monthsAgo = now.getMonth() - months;
      now.setMonth(monthsAgo);
      return now.getTime(now);
    }

    function daysAgoInMilliseconds(days) {
      return hoursAgoInMilliseconds(days * 24);
    }

    function hoursAgoInMilliseconds(hours) {
      return minutesAgoInMilliseconds(hours * 60);
    }

    function minutesAgoInMilliseconds(minutes) {
      return secondsAgoInMilliseconds(minutes * 60);
    }

    function secondsAgoInMilliseconds(seconds) {
      return new Date().getTime() - (seconds * 1000);
    }

    function getUserValue(term) {
      if (typeof g_form == "undefined")
        return '';
      var userValue = g_form.getValue(term.field + ".storage") + '';
      if (userValue)
        return g_form.getDecimalValue(term.field + ".storage");
      var uv = g_form.getValue(term.field);
      if (!uv || uv.length === 0)
        return '';
      return g_form.getDecimalValue(term.field);
    }

    function runActions(result) {
      if (result === _lastResult) {
        _debug("No change - not running any actions");
        return;
      }
      _lastResult = result;
      if (result) {
        for (var i = 0; i < uiPolicyMap.actions.length; i++) {
          var action = uiPolicyMap.actions[i];
          _runAction(action, result);
        }
        _runScript(uiPolicyMap.script_true.name);
      } else if (uiPolicyMap.reverse) {
        for (var j = 0; j < uiPolicyMap.actions.length; j++) {
          var action2 = uiPolicyMap.actions[j];
          _runAction(action2, result);
        }
        _runScript(uiPolicyMap.script_false.name);
      }
    }

    function _runScript(name) {
      if (typeof name !== "string" || !name.length)
        return;
      try {
        scripts[name].execute();
      } catch (e) {
        console.log("UI policy script error: " + e);
      }
    }

    function _runAction(action, result) {
      if (typeof g_form == "undefined")
        return;
      var field = action.name,
        mandatory = action.mandatory,
        visible = action.visible,
        disabled = action.disabled;
      if (mandatory == 'true') {
        g_form.setMandatory(field, result);
        _debugAction(field, "mandatory", result);
      } else if (mandatory == 'false') {
        g_form.setMandatory(field, !result);
        _debugAction(field, "mandatory", !result);
      }
      if (visible == 'true') {
        g_form.setDisplay(field, result);
        _debugAction(field, "visible", result);
      } else if (visible == 'false') {
        g_form.setDisplay(field, !result);
        _debugAction(field, "visible", !result);
      }
      if (disabled == 'true') {
        g_form.setReadOnly(field, result);
        _debugAction(field, "disabled", result);
      } else if (disabled == 'false') {
        g_form.setReadOnly(field, !result);
        _debugAction(field, "disabled", !result);
      }
      if (mandatory == 'true') {
        g_form.setMandatory(field, result);
        _debugAction(field, "mandatory", result);
      }
    }

    function _isField2FieldComparisonlOper(oper) {
      var special = [
        "MORETHAN",
        "LESSTHAN",
        "GT_FIELD",
        "LT_FIELD",
        "GT_OR_EQUALS_FIELD",
        "LT_OR_EQUALS_FIELD",
        "SAMEAS",
        "NSAMEAS"
      ];
      return special.indexOf(oper) > -1;
    }

    function _inArray(val, array) {
      if (Array.prototype.indexOf) {
        return Array.prototype.indexOf.call(array, val);
      }
      for (var i = 0, iM = array.length; i < iM; i++) {
        if (array[i] === val) {
          return i;
        }
      }
      return -1;
    }

    function _debugAction(field, action, flag) {
      if (!_isDebug) {
        return;
      }
      _debug('Setting ' + action + ' on field:' + field + ' to ' + flag);
    }

    function _debug(msg) {
      if (!_isDebug) {
        return;
      }
      console.log('(uiPolicyFactory)', msg);
    }

    function _debugTerm(term, result) {
      if (!_isDebug) {
        return;
      }
      var or = "";
      if (term.or)
        or = "  or ";
      var userValue;
      if (term.field)
        userValue = g_form.getValue(term.field) + '';
      else
        userValue = "(null)";
      if (!userValue)
        userValue = "<blank>";
      var dspValue = "";
      if (dspValue)
        dspValue = " [" + dspValue + "] ";
      if (result)
        result = "true";
      else
        result = "false";
      _debug(or + term.field + " " + "(" + userValue + dspValue + ") " + term.oper + " " + term.value + " -> " + result);
    }
  }
})(window);;
/*! RESOURCE: /scripts/sn/common/clientScript/glideFormEnvironmentFactory.js */
(function(exports, $log, undefined) {
  'use strict';
  var factory = exports.glideFormEnvironmentFactory = {
    create: createGlideFormEnvironment,
    defaultExtensionPoints: {
      'window': null,
      'document': null,
      '$': null,
      'jQuery': null,
      '$$': null,
      '$j': null,
      'angular': null,
      'snmCabrillo': null,
      'cabrillo': null
    }
  };

  function createGlideFormEnvironment(g_form, g_scratchpad, g_user, g_modal) {
    if (typeof g_user === 'undefined' || !g_user) {
      throw 'g_user is required!';
    }
    if (typeof g_scratchpad === 'undefined' || !g_scratchpad) {
      g_scratchpad = {};
    }
    var _extensionPoints = {
      g_scratchpad: extend(g_scratchpad, {}, true),
      g_user: typeof g_user.clone === 'function' ? g_user.clone() : g_user
    };
    if (typeof g_modal !== 'undefined') {
      _extensionPoints['g_modal'] = g_modal;
    }
    var defaults = factory.defaultExtensionPoints;
    Object.keys(defaults).forEach(function(name) {
      registerExtensionPoint(name, defaults[name]);
    });
    var _isFormLoading = true;
    var _isTemplateLoading = false;
    var _onChangeScripts = {};
    var _onSubmitScripts = [];
    return {
      initScripts: initScripts,
      initUIPolicyScripts: initUIPolicyScripts,
      getExtensionPoints: getExtensionPoints,
      registerExtensionPoint: registerExtensionPoint
    };

    function initScripts(scriptMap) {
      var cs, script;
      var onLoadScripts = [];
      if (scriptMap.onLoad) {
        for (var i = 0; i < scriptMap.onLoad.length; i++) {
          try {
            cs = scriptMap.onLoad[i];
            script = _wrapScript(cs.script, null, 'onLoad');
            onLoadScripts.push(_wrapExecuteClientScript(script, g_form, cs.name));
          } catch (e) {
            _logError('CS:ONLOAD', 'Could not load onLoad Client Script "' + cs.name + '": ' + e);
          }
        }
      }
      if (scriptMap.onChange) {
        for (var j = 0; j < scriptMap.onChange.length; j++) {
          try {
            cs = scriptMap.onChange[j];
            script = _wrapScript(cs.script, ['control', 'oldValue', 'newValue', 'isLoading', 'isTemplate'], 'onChange');
            if (!_onChangeScripts[cs.fieldName]) {
              _onChangeScripts[cs.fieldName] = [];
            }
            _onChangeScripts[cs.fieldName].push(
              _wrapExecuteClientScript(script, g_form, cs.name)
            );
          } catch (e) {
            _logError('CS:ONCHANGE', 'Could not load onChange Client Script "' + cs.name + '": ' + e);
          }
        }
      }
      if (scriptMap.onSubmit) {
        for (var k = 0; k < scriptMap.onSubmit.length; k++) {
          try {
            cs = scriptMap.onSubmit[k];
            script = _wrapScript(cs.script, null, 'onSubmit');
            _onSubmitScripts.push(
              _wrapExecuteClientScript(script, g_form, cs.name)
            );
          } catch (e) {
            _logError('CS:ONSUBMIT', 'Could not load onSubmit Client Script "' + cs.name + '": ' + e);
          }
        }
      }
      _onLoadForm(onLoadScripts);
    }

    function initUIPolicyScripts(uiPolicies) {
      uiPolicies.forEach(function(uiPolicyMap) {
        var scripts = _initUIPolicyMap(uiPolicyMap);
        var uiPolicy = uiPolicyFactory.create(g_form, uiPolicyMap, scripts);
      });
    }

    function getExtensionPoints() {
      return extend(_extensionPoints, {}, true);
    }

    function registerExtensionPoint(name, value) {
      if (_extensionPoints.hasOwnProperty(name)) {
        $log.warn('Overwriting extension point: ' + name);
      }
      _extensionPoints[name] = value;
    }

    function _initUIPolicyMap(uiPolicyMap) {
      var resultScriptMap = {};
      ['script_true', 'script_false'].forEach(function(type) {
        var policyScript = uiPolicyMap[type];
        if (!policyScript) {
          return;
        }
        try {
          var wrappedScript = _wrapScript(policyScript.script);
          resultScriptMap[policyScript.name] = {
            execute: _wrapExecuteClientScript(wrappedScript, g_form, uiPolicyMap.short_description)
          };
        } catch (e) {
          var errType = type.toUpperCase();
          _logError('UI:' + errType, 'Could not load UIPolicy script for policy "' + uiPolicyMap.short_description + '"');
        }
      });
      return resultScriptMap;
    }

    function _onLoadForm(onLoadScripts) {
      g_form.$private.options({
        isInitialized: true
      });
      for (var i = 0, iM = onLoadScripts.length; i < iM; i++) {
        onLoadScripts[i].call(null);
      }
      g_form.$private.events.on('change', _onChangeForm);
      g_form.$private.events.on('submit', _onSubmitForm);
      var value;
      Object.keys(_onChangeScripts).forEach(function(fieldName) {
        value = g_form.getValue(fieldName);
        _onChangeForm(fieldName, value, value);
      });
      _isFormLoading = false;
    }

    function _onChangeForm(fieldName, oldValue, newValue) {
      var scripts = _onChangeScripts[fieldName];
      if (scripts) {
        var scriptVariables = {
          control: null,
          oldValue: oldValue,
          newValue: newValue,
          isLoading: !!_isFormLoading,
          isTemplate: !!_isTemplateLoading
        };
        scripts.forEach(function(script) {
          script.call(null, scriptVariables);
        });
      }
    }

    function _onSubmitForm() {
      var result;
      for (var i = 0, iM = _onSubmitScripts.length; i < iM; i++) {
        result = _onSubmitScripts[i].call(null);
        if (result === false) {
          return result;
        }
      }
    }

    function _wrapScript(script, parameters, mainFuncName) {
      var scriptParams = parameters || [];
      var allParams = scriptParams.slice(0);
      allParams = allParams.concat('g_form', Object.keys(getExtensionPoints()));
      var fn;
      try {
        fn = new Function(allParams, 'return (' + script + ')(' + scriptParams.join(',') + ')');
      } catch (e) {
        if (mainFuncName) {
          script = new Function([], script + ' return ' + mainFuncName + '.apply(this, arguments);');
          fn = new Function(allParams, 'return (' + script + ')(' + scriptParams.join(',') + ')');
        } else
          throw e;
      }
      fn.$inject = allParams;
      return fn;
    }

    function _wrapExecuteClientScript(script, g_form, name) {
      return function(apiParams) {
        return _executeClientScript(script, g_form, name, apiParams);
      };
    }

    function _executeClientScript(script, g_form, name, apiParams) {
      var injectedParams = apiParams || {};
      if (typeof injectedParams === 'string') {
        _logError('SCRIPT:EXEC', 'Invalid params passed into Client Script "' + name + '"');
        return;
      }
      var baseParams = {
        g_form: g_form
      };
      extend(injectedParams, baseParams);
      extend(injectedParams, getExtensionPoints());
      try {
        var result = _invoke(script, this, injectedParams);
        return result;
      } catch (e) {
        _logError('SCRIPT:EXEC', 'Error while running Client Script "' + name + '": ' + e);
      }
    }

    function _invoke(fn, self, locals) {
      var $inject = fn.$inject;
      if (typeof $inject === 'undefined') {
        throw 'Missing $inject. Did you try calling externally?';
      }
      var key;
      var args = [];
      for (var i = 0, iM = $inject.length; i < iM; i++) {
        key = $inject[i];
        if (typeof key !== 'string') {
          throw 'Invalid injection key provided: ' + key;
        }
        var arg = locals[key];
        if (typeof arg === 'undefined') {
          throw 'Injection argument not found (' + key + ')';
        }
        args.push(arg);
      }
      return fn.apply(self, args);
    }

    function extend(defaults, options, newObject) {
      var extended = newObject === true ? {} : defaults;
      var prop;
      for (prop in defaults) {
        if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
          extended[prop] = defaults[prop];
        }
      }
      for (prop in options) {
        if (Object.prototype.hasOwnProperty.call(options, prop)) {
          extended[prop] = options[prop];
        }
      }
      return extended;
    }

    function _logError(code, msg) {
      if ($log && $log.error) {
        $log.error('(g_env) [' + code + '] ' + msg);
      }
    }
  }
})(window, console);;
/*! RESOURCE: /scripts/sn/common/clientScript/glideRequest.js */
(function(exports, undefined) {
  'use strict';
  var glideRequest = {
    getAngularURL: function(path, parameters) {
      return 'angular.do?sysparm_type=' + path + (parameters ? encodeURIParameters(parameters) : '');
    },
    get: function(url, options) {
      if (!url) {
        throw 'Must specify a URL';
      }
      var fetchOptions = _applyOptions('get', url, options);
      return exports.fetch(fetchOptions.url, fetchOptions);
    },
    post: function(url, options) {
      if (!url) {
        throw 'Must specify a URL';
      }
      var fetchOptions = _applyOptions('post', url, options);
      return exports.fetch(fetchOptions.url, fetchOptions);
    }
  };

  function _applyOptions(method, url, options) {
    var fetchOptions = {
      method: method,
      url: url
    };
    switch (method) {
      case 'get':
        var url = fetchOptions.url;
        if (options.data) {
          var params = encodeURIParameters(options.data);
          if (url.indexOf('?') !== -1) {
            url += '&' + params;
          } else {
            url += '?' + params;
          }
        }
        fetchOptions.url = url;
        break;
      case 'post':
        fetchOptions.url = options.url;
        fetchOptions.body = JSON.stringify(options.data || {});
        break;
    }
    switch (options.dataType) {
      default:
        case 'json':
        fetchOptions.headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-UserToken': window.g_ck
      };
      break;
      case 'xml':
          fetchOptions.headers = {
          'Accept': 'application/xml',
          'Content-Type': 'application/xml',
          'X-UserToken': window.g_ck
        };
        break;
    }
    return fetchOptions;
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
  exports.glideRequest = glideRequest;
})(window);;
/*! RESOURCE: /scripts/sn/common/clientScript/glideAjax.js */
(function(exports, undefined) {
  'use strict';
  var url = '/xmlhttp.do';
  var logError = function() {
    if (console && console.error)
      console.error.apply(console, arguments);
  };

  function GlideAjax() {
    this.initialize.apply(this, arguments);
  }
  GlideAjax.glideRequest = exports.glideRequest;
  GlideAjax.logError = logError;
  GlideAjax.prototype = {
    initialize: function(targetProcessor, targetURL) {
      this.processor = null;
      this.params = {};
      this.callbackFn = function() {};
      this.errorCallbackFn = function(e) {
        GlideAjax.logError('Unhandled exception in GlideAjax.', e.responseText);
      };
      this.wantAnswer = false;
      this.requestObject = null;
      this.setProcessor(targetProcessor);
      url = targetURL || url;
    },
    addParam: function(name, value) {
      this.params[name] = value;
    },
    getXML: function(callback) {
      this.wantAnswer = false;
      this.callbackFn = callback;
      this.execute();
    },
    getXMLWait: function() {
      GlideAjax.logError('GlideAjax.getXMLWait is no longer supported');
    },
    getXMLAnswer: function(callback) {
      this.wantAnswer = true;
      this.callbackFn = callback;
      this.execute();
    },
    getAnswer: function() {
      return this.responseXML ? this.responseXML.documentElement.getAttribute('answer') : null;
    },
    setErrorCallback: function(errorCallback) {
      this.errorCallbackFn = errorCallback;
    },
    getURL: function() {
      return url;
    },
    getParams: function() {
      return this.params;
    },
    setProcessor: function(p) {
      this.addParam('sysparm_processor', p);
      if (!p) {
        GlideAjax.logError('GlideAjax.initalize: must specify a processor');
      }
      this.processor = p;
    },
    execute: function() {
      var that = this;
      GlideAjax.glideRequest.post(url, {
          data: this.params,
          dataType: 'xml'
        })
        .then(function(response) {
          that.responseXML = response.responseXML;
          that.responseText = response.responseText;
          var ajaxResponse = {
            type: response.type,
            responseText: response.responseText,
            responseXML: response.responseXML
          };
          var args = [
            that.wantAnswer ? that.getAnswer() : ajaxResponse
          ];
          try {
            that.callbackFn.apply(null, args);
          } catch (e) {
            if (that.errorCallbackFn) {
              that.errorCallbackFn({
                type: 'unhandled exception',
                responseText: e.message
              });
            } else
              GlideAjax.logError('Unhandled exception in GlideAjax callback.', e);
          }
        })
        .catch(function(error) {
          var errorResponse = {
            type: error.type,
            status: error.status,
            responseText: error.responseText,
            responseXML: error.responseXML
          };
          if (that.errorCallbackFn) {
            that.errorCallbackFn(errorResponse);
          }
        });
    },
    setScope: function(scope) {
      if (scope) {
        this.addParam('sysparm_scope', scope);
      }
      return this;
    }
  };
  exports.GlideAjax = GlideAjax;
})(window);;
/*! RESOURCE: /scripts/sn/common/clientScript/glideRecord.js */
(function(exports, undefined) {
  'use strict';

  function GlideRecord(table) {
    if (!(this instanceof GlideRecord)) {
      return new GlideRecord(table);
    }
    this.initialize.apply(this, arguments);
  }
  GlideRecord.glideRequest = exports.glideRequest;
  GlideRecord.prototype = {
    initialize: function(table) {
      this.tableName = table;
      this.encodedQuery = '';
      this.conditions = [];
      this.orderByFields = [];
      this.limit = 0;
      this._callback = null;
      this.currentRow = -1;
      this.recordSet = [];
    },
    addQuery: function() {
      var args = [];
      Array.prototype.push.apply(args, arguments);
      var name = args.shift(),
        oper, value;
      oper = args.length == 1 ? "=" : args.shift();
      value = args.shift();
      this.conditions.push({
        'name': name,
        'oper': oper,
        'value': value
      });
    },
    setEncodedQuery: function(queryString) {
      this.encodedQuery = queryString;
    },
    getEncodedQuery: function() {
      var qc = [];
      var ec = this.encodedQuery;
      if (ec) {
        qc.push(ec);
      }
      for (var i = 0; i < this.conditions.length; i++) {
        var q = this.conditions[i];
        qc.push(q['name'] + q['oper'] + q['value']);
      }
      return '^' + qc.join('^');
    },
    addOrderBy: function(field) {
      this.orderByFields.push(field);
    },
    setLimit: function(maxRows) {
      this.limit = maxRows;
    },
    getLimit: function() {
      return this.limit;
    },
    get: function() {
      this.initialize(this.tableName);
      this.setLimit(1);
      var callback;
      if (arguments.length == 2) {
        this.addQuery('sys_id', arguments[0]);
        callback = arguments[1];
      } else if (arguments.length == 3) {
        this.addQuery(arguments[0], arguments[1]);
        callback = arguments[2];
      }
      if (!callback) {
        _logWarn('GET:NOCB', 'Get must be called with a callback function');
        return;
      }
      this.query(this._getResponse.bind(this, callback));
    },
    _getResponse: function(callback) {
      this.next();
      callback(this);
    },
    query: function(callback) {
      if (typeof callback !== 'function') {
        _logWarn('Q:NOCB', 'Query must be called with a callback function');
        return;
      }
      var glideRequest = GlideRecord.glideRequest;
      var src = glideRequest.getAngularURL('gliderecord', {
        operation: 'query'
      });
      glideRequest.post(src, {
        dataType: 'json',
        data: {
          table: this.tableName,
          query: this.getEncodedQuery(),
          orderBy: this.orderByFields.join(','),
          limit: this.getLimit()
        }
      }).then(this._queryResponse.bind(this, callback));
    },
    _queryResponse: function(callback, response) {
      this._loadRecordSet(response.data.records);
      callback(this);
    },
    deleteRecord: function() {
      _logError('UNSUPPORTED', 'deleteRecord is not supported on mobile');
    },
    update: function() {
      _logError('UNSUPPORTED', 'update is not supported on mobile');
    },
    hasNext: function() {
      return this.currentRow + 1 < this.recordSet.length;
    },
    next: function() {
      return this._next();
    },
    _next: function() {
      if (!this.hasNext())
        return false;
      this.loadRow(this.currentRow + 1);
      return true;
    },
    loadRow: function(index) {
      var row = this.recordSet[index];
      this.currentRow = index;
      var currentRow = this.getCurrentRow();
      for (var i in currentRow) {
        if (!currentRow.hasOwnProperty(i)) {
          continue;
        }
        this[i] = currentRow[i].value;
      }
    },
    _loadRecordSet: function(records) {
      this.recordSet = records || [];
    },
    getValue: function(fieldName) {
      var current = this.getCurrentRow();
      return current ? current[fieldName].value : '';
    },
    getDisplayValue: function(fieldName) {
      var current = this.getCurrentRow();
      if (!fieldName) {
        return current ? current['$$displayValue'] : '';
      }
      return current ? current[fieldName].displayvalue : '';
    },
    getCurrentRow: function() {
      return this.recordSet[this.currentRow];
    },
    getRowCount: function() {
      return this.recordSet.length;
    },
    getTableName: function() {
      return this.tableName;
    },
    toString: function() {
      return 'GlideRecord';
    }
  };

  function _logError(code, msg) {
    if (console && console.error) {
      console.error('(GlideRecord) [' + code + '] ' + msg);
    }
  }

  function _logWarn(code, msg) {
    if (console && console.warn) {
      console.warn('(GlideRecord) [' + code + '] ' + msg);
    }
  }
  exports.GlideRecord = GlideRecord;
})(window);;
/*! RESOURCE: /scripts/sn/common/clientScript/glideUser.js */
(function(exports, undefined) {
  'use strict';
  var ROLE_MAINT = 'maint';
  var ROLE_ADMIN = 'admin';

  function GlideUser(fields) {
    if (!(this instanceof GlideUser)) {
      return new GlideUser(fields);
    }
    var _firstName = fields.firstName || null;
    var _lastName = fields.lastName || null;
    var _userName = fields.userName || null;
    var _userId = fields.userID || null;
    var _roles = fields.roles || null;
    var _allRoles = fields.allRoles || null;
    var _email = fields.email || null;
    var _title = fields.title || null;
    var _avatar = fields.avatar || null;
    var _clientData = fields.clientData || {};
    Object.defineProperties(this, {
      firstName: {
        get: function() {
          return _firstName;
        }
      },
      lastName: {
        get: function() {
          return _lastName;
        }
      },
      userName: {
        get: function() {
          return _userName;
        }
      },
      userID: {
        get: function() {
          return _userId;
        }
      },
      title: {
        get: function() {
          return _title;
        }
      },
      email: {
        get: function() {
          return _email;
        }
      },
      avatar: {
        get: function() {
          return _avatar;
        }
      }
    });
    this.getFullName = function() {
      return _firstName + ' ' + _lastName;
    };
    this.getClientData = function(key) {
      return _clientData[key];
    };
    this.hasRoles = function(includeDefaults) {
      if (includeDefaults)
        return _allRoles && (_allRoles.length > 0);
      else
        return _roles && (_roles.length > 0);
    };
    this.hasRoleExactly = function(role, includeDefaults) {
      if (!this.hasRoles(includeDefaults) || !role || (typeof role !== 'string')) {
        return false;
      }
      var normalizedRole = role.toLowerCase();
      var rolesToCheck = _roles;
      if (includeDefaults)
        rolesToCheck = _allRoles;
      for (var i = 0, iM = rolesToCheck.length; i < iM; i++) {
        if (normalizedRole === rolesToCheck[i].toLowerCase()) {
          return true;
        }
      }
      return false;
    };
    this.hasRole = function(role, includeDefaults) {
      if (!this.hasRoles(includeDefaults)) {
        return false;
      }
      if (this.hasRoleExactly(ROLE_MAINT, includeDefaults)) {
        return true;
      } else if (role === ROLE_MAINT) {
        return false;
      }
      if (this.hasRoleExactly(role, includeDefaults)) {
        return true;
      }
      if (this.hasRoleExactly(ROLE_ADMIN, includeDefaults)) {
        return true;
      }
      return false;
    };
    this.hasRoleFromList = function(roles, includeDefaults) {
      if (!this.hasRoles(includeDefaults)) {
        return false;
      }
      var checkRoles = roles;
      if (typeof roles === 'string') {
        checkRoles = roles.split(/\s*,\s*/);
      }
      if (checkRoles.length === 0) {
        return true;
      }
      for (var i = 0, iM = checkRoles.length; i < iM; i++) {
        var role = checkRoles[i];
        if (role && this.hasRole(role, includeDefaults)) {
          return true;
        }
      }
      return false;
    };
    this.clone = function() {
      return new GlideUser(fields);
    };
  }
  exports.GlideUser = GlideUser;
})(window);;;