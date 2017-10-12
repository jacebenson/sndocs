/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/js_includes_attachments.js */
/*! RESOURCE: /scripts/angularjs-1.4/thirdparty/angular-file-upload/angular-file-upload-all.js */
(function() {
  function patchXHR(fnName, newFn) {
    window.XMLHttpRequest.prototype[fnName] = newFn(window.XMLHttpRequest.prototype[fnName]);
  }
  if (window.XMLHttpRequest && !window.XMLHttpRequest.__isFileAPIShim) {
    patchXHR('setRequestHeader', function(orig) {
      return function(header, value) {
        if (header === '__setXHR_') {
          var val = value(this);
          if (val instanceof Function) {
            val(this);
          }
        } else {
          orig.apply(this, arguments);
        }
      }
    });
  }
  var angularFileUpload = angular.module('angularFileUpload', []);
  angularFileUpload.version = '3.1.2';
  angularFileUpload.service('$upload', ['$http', '$q', '$timeout', function($http, $q, $timeout) {
    function sendHttp(config) {
      config.method = config.method || 'POST';
      config.headers = config.headers || {};
      config.transformRequest = config.transformRequest || function(data, headersGetter) {
        if (window.ArrayBuffer && data instanceof window.ArrayBuffer) {
          return data;
        }
        return $http.defaults.transformRequest[0](data, headersGetter);
      };
      var deferred = $q.defer();
      var promise = deferred.promise;
      config.headers['__setXHR_'] = function() {
        return function(xhr) {
          if (!xhr) return;
          config.__XHR = xhr;
          config.xhrFn && config.xhrFn(xhr);
          xhr.upload.addEventListener('progress', function(e) {
            e.config = config;
            deferred.notify ? deferred.notify(e) : promise.progress_fn && $timeout(function() {
              promise.progress_fn(e)
            });
          }, false);
          xhr.upload.addEventListener('load', function(e) {
            if (e.lengthComputable) {
              e.config = config;
              deferred.notify ? deferred.notify(e) : promise.progress_fn && $timeout(function() {
                promise.progress_fn(e)
              });
            }
          }, false);
        };
      };
      $http(config).then(function(r) {
        deferred.resolve(r)
      }, function(e) {
        deferred.reject(e)
      }, function(n) {
        deferred.notify(n)
      });
      promise.success = function(fn) {
        promise.then(function(response) {
          fn(response.data, response.status, response.headers, config);
        });
        return promise;
      };
      promise.error = function(fn) {
        promise.then(null, function(response) {
          fn(response.data, response.status, response.headers, config);
        });
        return promise;
      };
      promise.progress = function(fn) {
        promise.progress_fn = fn;
        promise.then(null, null, function(update) {
          fn(update);
        });
        return promise;
      };
      promise.abort = function() {
        if (config.__XHR) {
          $timeout(function() {
            config.__XHR.abort();
          });
        }
        return promise;
      };
      promise.xhr = function(fn) {
        config.xhrFn = (function(origXhrFn) {
          return function() {
            origXhrFn && origXhrFn.apply(promise, arguments);
            fn.apply(promise, arguments);
          }
        })(config.xhrFn);
        return promise;
      };
      return promise;
    }
    this.upload = function(config) {
      config.headers = config.headers || {};
      config.headers['Content-Type'] = undefined;
      var origTransformRequest = config.transformRequest;
      config.transformRequest = config.transformRequest ?
        (Object.prototype.toString.call(config.transformRequest) === '[object Array]' ?
          config.transformRequest : [config.transformRequest]) : [];
      config.transformRequest.push(function(data, headerGetter) {
        var formData = new FormData();
        var allFields = {};
        for (var key in config.fields) allFields[key] = config.fields[key];
        if (data) allFields['data'] = data;
        if (config.formDataAppender) {
          for (var key in allFields) {
            config.formDataAppender(formData, key, allFields[key]);
          }
        } else {
          for (var key in allFields) {
            var val = allFields[key];
            if (val !== undefined) {
              if (Object.prototype.toString.call(val) === '[object String]') {
                formData.append(key, val);
              } else {
                if (config.sendObjectsAsJsonBlob && typeof val === 'object') {
                  formData.append(key, new Blob([val], {
                    type: 'application/json'
                  }));
                } else {
                  formData.append(key, JSON.stringify(val));
                }
              }
            }
          }
        }
        if (config.file != null) {
          var fileFormName = config.fileFormDataName || 'file';
          if (Object.prototype.toString.call(config.file) === '[object Array]') {
            var isFileFormNameString = Object.prototype.toString.call(fileFormName) === '[object String]';
            for (var i = 0; i < config.file.length; i++) {
              formData.append(isFileFormNameString ? fileFormName : fileFormName[i], config.file[i],
                (config.fileName && config.fileName[i]) || config.file[i].name);
            }
          } else {
            formData.append(fileFormName, config.file, config.fileName || config.file.name);
          }
        }
        return formData;
      });
      return sendHttp(config);
    };
    this.http = function(config) {
      return sendHttp(config);
    };
  }]);
  angularFileUpload.directive('ngFileSelect', ['$parse', '$timeout', '$compile',
    function($parse, $timeout, $compile) {
      return {
        restrict: 'AEC',
        require: '?ngModel',
        link: function(scope, elem, attr, ngModel) {
          handleFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile);
        }
      }
    }
  ]);

  function handleFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile) {
    function isInputTypeFile() {
      return elem[0].tagName.toLowerCase() === 'input' && elem.attr('type') && elem.attr('type').toLowerCase() === 'file';
    }
    var watchers = [];

    function watchForRecompile(attrVal) {
      $timeout(function() {
        if (elem.parent().length) {
          watchers.push(scope.$watch(attrVal, function(val, oldVal) {
            if (val != oldVal) {
              recompileElem();
            }
          }));
        }
      });
    }

    function recompileElem() {
      var clone = elem.clone();
      if (elem.attr('__afu_gen__')) {
        angular.element(document.getElementById(elem.attr('id').substring(1))).remove();
      }
      if (elem.parent().length) {
        for (var i = 0; i < watchers.length; i++) {
          watchers[i]();
        }
        elem.replaceWith(clone);
        $compile(clone)(scope);
      }
      return clone;
    }

    function bindAttr(bindAttr, attrName) {
      if (bindAttr) {
        watchForRecompile(bindAttr);
        var val = $parse(bindAttr)(scope);
        if (val) {
          elem.attr(attrName, val);
          attr[attrName] = val;
        } else {
          elem.attr(attrName, null);
          delete attr[attrName];
        }
      }
    }
    bindAttr(attr.ngMultiple, 'multiple');
    bindAttr(attr.ngAccept, 'ng-accept');
    bindAttr(attr.ngCapture, 'capture');
    if (attr['ngFileSelect'] != '') {
      attr.ngFileChange = attr.ngFileSelect;
    }

    function onChangeFn(evt) {
      var files = [],
        fileList, i;
      fileList = evt.__files_ || (evt.target && evt.target.files);
      updateModel(fileList, attr, ngModel, scope, evt);
    };
    var fileElem = elem;
    if (!isInputTypeFile()) {
      fileElem = angular.element('<input type="file">')
      if (elem.attr('multiple')) fileElem.attr('multiple', elem.attr('multiple'));
      if (elem.attr('accept')) fileElem.attr('accept', elem.attr('accept'));
      if (elem.attr('capture')) fileElem.attr('capture', elem.attr('capture'));
      for (var key in attr) {
        if (key.indexOf('inputFile') == 0) {
          var name = key.substring('inputFile'.length);
          name = name[0].toLowerCase() + name.substring(1);
          fileElem.attr(name, attr[key]);
        }
      }
      fileElem.css('width', '0px').css('height', '0px').css('position', 'absolute').css('padding', 0).css('margin', 0)
        .css('overflow', 'hidden').attr('tabindex', '-1').css('opacity', 0).attr('__afu_gen__', true);
      elem.attr('__refElem__', true);
      fileElem[0].__refElem__ = elem[0];
      elem.parent()[0].insertBefore(fileElem[0], elem[0])
      elem.css('overflow', 'hidden');
      elem.bind('click', function(e) {
        if (!resetAndClick(e)) {
          fileElem[0].click();
        }
      });
    } else {
      elem.bind('click', resetAndClick);
    }

    function resetAndClick(evt) {
      if (fileElem[0].value != null && fileElem[0].value != '') {
        fileElem[0].value = null;
        if (navigator.userAgent.indexOf("Trident/7") === -1) {
          onChangeFn({
            target: {
              files: []
            }
          });
        }
      }
      if (!elem.attr('__afu_clone__')) {
        if (navigator.appVersion.indexOf("MSIE 10") !== -1 || navigator.userAgent.indexOf("Trident/7") !== -1) {
          var clone = recompileElem();
          clone.attr('__afu_clone__', true);
          clone[0].click();
          evt.preventDefault();
          evt.stopPropagation();
          return true;
        }
      } else {
        elem.attr('__afu_clone__', null);
      }
    }
    fileElem.bind('change', onChangeFn);
    elem.on('$destroy', function() {
      for (var i = 0; i < watchers.length; i++) {
        watchers[i]();
      }
      if (elem[0] != fileElem[0]) fileElem.remove();
    });
    watchers.push(scope.$watch(attr.ngModel, function(val, oldVal) {
      if (val != oldVal && (val == null || !val.length)) {
        if (navigator.appVersion.indexOf("MSIE 10") !== -1) {
          recompileElem();
        } else {
          fileElem[0].value = null;
        }
      }
    }));

    function updateModel(fileList, attr, ngModel, scope, evt) {
      var files = [],
        rejFiles = [];
      var accept = $parse(attr.ngAccept)(scope);
      var regexp = angular.isString(accept) && accept ? new RegExp(globStringToRegex(accept), 'gi') : null;
      var acceptFn = regexp ? null : attr.ngAccept;
      for (var i = 0; i < fileList.length; i++) {
        var file = fileList.item(i);
        if ((!regexp || file.type.match(regexp) || (file.name != null && file.name.match(regexp))) &&
          (!acceptFn || $parse(acceptFn)(scope, {
            $file: file,
            $event: evt
          }))) {
          files.push(file);
        } else {
          rejFiles.push(file);
        }
      }
      $timeout(function() {
        if (ngModel) {
          $parse(attr.ngModel).assign(scope, files);
          ngModel && ngModel.$setViewValue(files != null && files.length == 0 ? '' : files);
          if (attr.ngModelRejected) {
            $parse(attr.ngModelRejected).assign(scope, rejFiles);
          }
        }
        if (attr.ngFileChange && attr.ngFileChange != "") {
          $parse(attr.ngFileChange)(scope, {
            $files: files,
            $rejectedFiles: rejFiles,
            $event: evt
          });
        }
      });
    }
  }
  angularFileUpload.directive('ngFileDrop', ['$parse', '$timeout', '$location', function($parse, $timeout, $location) {
    return {
      restrict: 'AEC',
      require: '?ngModel',
      link: function(scope, elem, attr, ngModel) {
        handleDrop(scope, elem, attr, ngModel, $parse, $timeout, $location);
      }
    }
  }]);
  angularFileUpload.directive('ngNoFileDrop', function() {
    return function(scope, elem, attr) {
      if (dropAvailable()) elem.css('display', 'none')
    }
  });
  angularFileUpload.directive('ngFileDropAvailable', ['$parse', '$timeout', function($parse, $timeout) {
    return function(scope, elem, attr) {
      if (dropAvailable()) {
        var fn = $parse(attr['ngFileDropAvailable']);
        $timeout(function() {
          fn(scope);
        });
      }
    }
  }]);

  function handleDrop(scope, elem, attr, ngModel, $parse, $timeout, $location) {
    var available = dropAvailable();
    if (attr['dropAvailable']) {
      $timeout(function() {
        scope.dropAvailable ? scope.dropAvailable.value = available : scope.dropAvailable = available;
      });
    }
    if (!available) {
      if ($parse(attr.hideOnDropNotAvailable)(scope) != false) {
        elem.css('display', 'none');
      }
      return;
    }
    var leaveTimeout = null;
    var stopPropagation = $parse(attr.stopPropagation)(scope);
    var dragOverDelay = 1;
    var accept = $parse(attr.ngAccept)(scope) || attr.accept;
    var regexp = angular.isString(accept) && accept ? new RegExp(globStringToRegex(accept), 'gi') : null;
    var acceptFn = regexp ? null : attr.ngAccept;
    var actualDragOverClass;
    elem[0].addEventListener('dragover', function(evt) {
      evt.preventDefault();
      if (stopPropagation) evt.stopPropagation();
      if (navigator.userAgent.indexOf("Chrome") > -1) {
        var b = evt.dataTransfer.effectAllowed;
        evt.dataTransfer.dropEffect = ('move' === b || 'linkMove' === b) ? 'move' : 'copy';
      }
      $timeout.cancel(leaveTimeout);
      if (!scope.actualDragOverClass) {
        actualDragOverClass = calculateDragOverClass(scope, attr, evt);
      }
      elem.addClass(actualDragOverClass);
    }, false);
    elem[0].addEventListener('dragenter', function(evt) {
      evt.preventDefault();
      if (stopPropagation) evt.stopPropagation();
    }, false);
    elem[0].addEventListener('dragleave', function(evt) {
      leaveTimeout = $timeout(function() {
        elem.removeClass(actualDragOverClass);
        actualDragOverClass = null;
      }, dragOverDelay || 1);
    }, false);
    if (attr['ngFileDrop'] != '') {
      attr.ngFileChange = attr['ngFileDrop'];
    }
    elem[0].addEventListener('drop', function(evt) {
      evt.preventDefault();
      if (stopPropagation) evt.stopPropagation();
      elem.removeClass(actualDragOverClass);
      actualDragOverClass = null;
      extractFiles(evt, function(files, rejFiles) {
        $timeout(function() {
          if (ngModel) {
            $parse(attr.ngModel).assign(scope, files);
            ngModel && ngModel.$setViewValue(files != null && files.length == 0 ? '' : files);
          }
          if (attr['ngModelRejected']) {
            if (scope[attr.ngModelRejected]) {
              $parse(attr.ngModelRejected).assign(scope, rejFiles);
            }
          }
        });
        $timeout(function() {
          $parse(attr.ngFileChange)(scope, {
            $files: files,
            $rejectedFiles: rejFiles,
            $event: evt
          });
        });
      }, $parse(attr.allowDir)(scope) != false, attr.multiple || $parse(attr.ngMultiple)(scope));
    }, false);

    function calculateDragOverClass(scope, attr, evt) {
      var valid = true;
      if (regexp || acceptFn) {
        var items = evt.dataTransfer.items;
        if (items != null) {
          for (var i = 0; i < items.length && valid; i++) {
            valid = valid && (items[i].kind == 'file' || items[i].kind == '') &&
              ((acceptFn && $parse(acceptFn)(scope, {
                  $file: items[i],
                  $event: evt
                })) ||
                (regexp && (items[i].type != null && items[i].type.match(regexp)) ||
                  (items[i].name != null && items[i].name.match(regexp))));
          }
        }
      }
      var clazz = $parse(attr.dragOverClass)(scope, {
        $event: evt
      });
      if (clazz) {
        if (clazz.delay) dragOverDelay = clazz.delay;
        if (clazz.accept) clazz = valid ? clazz.accept : clazz.reject;
      }
      return clazz || attr['dragOverClass'] || 'dragover';
    }

    function extractFiles(evt, callback, allowDir, multiple) {
      var files = [],
        rejFiles = [],
        items = evt.dataTransfer.items,
        processing = 0;

      function addFile(file) {
        if ((!regexp || file.type.match(regexp) || (file.name != null && file.name.match(regexp))) &&
          (!acceptFn || $parse(acceptFn)(scope, {
            $file: file,
            $event: evt
          }))) {
          files.push(file);
        } else {
          rejFiles.push(file);
        }
      }
      if (items && items.length > 0 && $location.protocol() != 'file') {
        for (var i = 0; i < items.length; i++) {
          if (items[i].webkitGetAsEntry && items[i].webkitGetAsEntry() && items[i].webkitGetAsEntry().isDirectory) {
            var entry = items[i].webkitGetAsEntry();
            if (entry.isDirectory && !allowDir) {
              continue;
            }
            if (entry != null) {
              traverseFileTree(files, entry);
            }
          } else {
            var f = items[i].getAsFile();
            if (f != null) addFile(f);
          }
          if (!multiple && files.length > 0) break;
        }
      } else {
        var fileList = evt.dataTransfer.files;
        if (fileList != null) {
          for (var i = 0; i < fileList.length; i++) {
            addFile(fileList.item(i));
            if (!multiple && files.length > 0) break;
          }
        }
      }
      var delays = 0;
      (function waitForProcess(delay) {
        $timeout(function() {
          if (!processing) {
            if (!multiple && files.length > 1) {
              var i = 0;
              while (files[i].type == 'directory') i++;
              files = [files[i]];
            }
            callback(files, rejFiles);
          } else {
            if (delays++ * 10 < 20 * 1000) {
              waitForProcess(10);
            }
          }
        }, delay || 0)
      })();

      function traverseFileTree(files, entry, path) {
        if (entry != null) {
          if (entry.isDirectory) {
            var filePath = (path || '') + entry.name;
            addFile({
              name: entry.name,
              type: 'directory',
              path: filePath
            });
            var dirReader = entry.createReader();
            var entries = [];
            processing++;
            var readEntries = function() {
              dirReader.readEntries(function(results) {
                try {
                  if (!results.length) {
                    for (var i = 0; i < entries.length; i++) {
                      traverseFileTree(files, entries[i], (path ? path : '') + entry.name + '/');
                    }
                    processing--;
                  } else {
                    entries = entries.concat(Array.prototype.slice.call(results || [], 0));
                    readEntries();
                  }
                } catch (e) {
                  processing--;
                  console.error(e);
                }
              }, function() {
                processing--;
              });
            };
            readEntries();
          } else {
            processing++;
            entry.file(function(file) {
              try {
                processing--;
                file.path = (path ? path : '') + file.name;
                addFile(file);
              } catch (e) {
                processing--;
                console.error(e);
              }
            }, function(e) {
              processing--;
            });
          }
        }
      }
    }
  }

  function dropAvailable() {
    var div = document.createElement('div');
    return ('draggable' in div) && ('ondrop' in div);
  }

  function globStringToRegex(str) {
    if (str.length > 2 && str[0] === '/' && str[str.length - 1] === '/') {
      return str.substring(1, str.length - 1);
    }
    var split = str.split(','),
      result = '';
    if (split.length > 1) {
      for (var i = 0; i < split.length; i++) {
        result += '(' + globStringToRegex(split[i]) + ')';
        if (i < split.length - 1) {
          result += '|'
        }
      }
    } else {
      if (str.indexOf('.') == 0) {
        str = '*' + str;
      }
      result = '^' + str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + '-]', 'g'), '\\$&') + '$';
      result = result.replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
    }
    return result;
  }
  var ngFileUpload = angular.module('ngFileUpload', []);
  for (var key in angularFileUpload) {
    ngFileUpload[key] = angularFileUpload[key];
  }
})();
(function() {
  var hasFlash = function() {
    try {
      var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
      if (fo) return true;
    } catch (e) {
      if (navigator.mimeTypes['application/x-shockwave-flash'] != undefined) return true;
    }
    return false;
  }

  function patchXHR(fnName, newFn) {
    window.XMLHttpRequest.prototype[fnName] = newFn(window.XMLHttpRequest.prototype[fnName]);
  };
  if ((window.XMLHttpRequest && !window.FormData) || (window.FileAPI && FileAPI.forceLoad)) {
    var initializeUploadListener = function(xhr) {
      if (!xhr.__listeners) {
        if (!xhr.upload) xhr.upload = {};
        xhr.__listeners = [];
        var origAddEventListener = xhr.upload.addEventListener;
        xhr.upload.addEventListener = function(t, fn, b) {
          xhr.__listeners[t] = fn;
          origAddEventListener && origAddEventListener.apply(this, arguments);
        };
      }
    }
    patchXHR('open', function(orig) {
      return function(m, url, b) {
        initializeUploadListener(this);
        this.__url = url;
        try {
          orig.apply(this, [m, url, b]);
        } catch (e) {
          if (e.message.indexOf('Access is denied') > -1) {
            this.__origError = e;
            orig.apply(this, [m, '_fix_for_ie_crossdomain__', b]);
          }
        }
      }
    });
    patchXHR('getResponseHeader', function(orig) {
      return function(h) {
        return this.__fileApiXHR && this.__fileApiXHR.getResponseHeader ? this.__fileApiXHR.getResponseHeader(h) : (orig == null ? null : orig.apply(this, [h]));
      };
    });
    patchXHR('getAllResponseHeaders', function(orig) {
      return function() {
        return this.__fileApiXHR && this.__fileApiXHR.getAllResponseHeaders ? this.__fileApiXHR.getAllResponseHeaders() : (orig == null ? null : orig.apply(this));
      }
    });
    patchXHR('abort', function(orig) {
      return function() {
        return this.__fileApiXHR && this.__fileApiXHR.abort ? this.__fileApiXHR.abort() : (orig == null ? null : orig.apply(this));
      }
    });
    patchXHR('setRequestHeader', function(orig) {
      return function(header, value) {
        if (header === '__setXHR_') {
          initializeUploadListener(this);
          var val = value(this);
          if (val instanceof Function) {
            val(this);
          }
        } else {
          this.__requestHeaders = this.__requestHeaders || {};
          this.__requestHeaders[header] = value;
          orig.apply(this, arguments);
        }
      }
    });

    function redefineProp(xhr, prop, fn) {
      try {
        Object.defineProperty(xhr, prop, {
          get: fn
        });
      } catch (e) {}
    }
    patchXHR('send', function(orig) {
      return function() {
        var xhr = this;
        if (arguments[0] && arguments[0].__isFileAPIShim) {
          var formData = arguments[0];
          var config = {
            url: xhr.__url,
            jsonp: false,
            cache: true,
            complete: function(err, fileApiXHR) {
              xhr.__completed = true;
              if (!err && xhr.__listeners['load'])
                xhr.__listeners['load']({
                  type: 'load',
                  loaded: xhr.__loaded,
                  total: xhr.__total,
                  target: xhr,
                  lengthComputable: true
                });
              if (!err && xhr.__listeners['loadend'])
                xhr.__listeners['loadend']({
                  type: 'loadend',
                  loaded: xhr.__loaded,
                  total: xhr.__total,
                  target: xhr,
                  lengthComputable: true
                });
              if (err === 'abort' && xhr.__listeners['abort'])
                xhr.__listeners['abort']({
                  type: 'abort',
                  loaded: xhr.__loaded,
                  total: xhr.__total,
                  target: xhr,
                  lengthComputable: true
                });
              if (fileApiXHR.status !== undefined) redefineProp(xhr, 'status', function() {
                return (fileApiXHR.status == 0 && err && err !== 'abort') ? 500 : fileApiXHR.status
              });
              if (fileApiXHR.statusText !== undefined) redefineProp(xhr, 'statusText', function() {
                return fileApiXHR.statusText
              });
              redefineProp(xhr, 'readyState', function() {
                return 4
              });
              if (fileApiXHR.response !== undefined) redefineProp(xhr, 'response', function() {
                return fileApiXHR.response
              });
              var resp = fileApiXHR.responseText || (err && fileApiXHR.status == 0 && err !== 'abort' ? err : undefined);
              redefineProp(xhr, 'responseText', function() {
                return resp
              });
              redefineProp(xhr, 'response', function() {
                return resp
              });
              if (err) redefineProp(xhr, 'err', function() {
                return err
              });
              xhr.__fileApiXHR = fileApiXHR;
              if (xhr.onreadystatechange) xhr.onreadystatechange();
              if (xhr.onload) xhr.onload();
            },
            fileprogress: function(e) {
              e.target = xhr;
              xhr.__listeners['progress'] && xhr.__listeners['progress'](e);
              xhr.__total = e.total;
              xhr.__loaded = e.loaded;
              if (e.total === e.loaded) {
                var _this = this
                setTimeout(function() {
                  if (!xhr.__completed) {
                    xhr.getAllResponseHeaders = function() {};
                    _this.complete(null, {
                      status: 204,
                      statusText: 'No Content'
                    });
                  }
                }, FileAPI.noContentTimeout || 10000);
              }
            },
            headers: xhr.__requestHeaders
          }
          config.data = {};
          config.files = {}
          for (var i = 0; i < formData.data.length; i++) {
            var item = formData.data[i];
            if (item.val != null && item.val.name != null && item.val.size != null && item.val.type != null) {
              config.files[item.key] = item.val;
            } else {
              config.data[item.key] = item.val;
            }
          }
          setTimeout(function() {
            if (!hasFlash()) {
              throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
            }
            xhr.__fileApiXHR = FileAPI.upload(config);
          }, 1);
        } else {
          if (this.__origError) {
            throw this.__origError;
          }
          orig.apply(xhr, arguments);
        }
      }
    });
    window.XMLHttpRequest.__isFileAPIShim = true;
    var addFlash = function(elem) {
      if (!hasFlash()) {
        throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
      }
      var el = angular.element(elem);
      if (!el.attr('disabled')) {
        var hasFileSelect = false;
        for (var i = 0; i < el[0].attributes.length; i++) {
          var attrib = el[0].attributes[i];
          if (attrib.name.indexOf('file-select') !== -1) {
            hasFileSelect = true;
            break;
          }
        }
        if (!el.hasClass('js-fileapi-wrapper') && (hasFileSelect || el.attr('__afu_gen__') != null)) {
          el.addClass('js-fileapi-wrapper');
          if (el.attr('__afu_gen__') != null) {
            var ref = (el[0].__refElem__ && angular.element(el[0].__refElem__)) || el;
            while (ref && !ref.attr('__refElem__')) {
              ref = angular.element(ref[0].nextSibling);
            }
            ref.bind('mouseover', function() {
              if (el.parent().css('position') === '' || el.parent().css('position') === 'static') {
                el.parent().css('position', 'relative');
              }
              el.css('position', 'absolute').css('top', ref[0].offsetTop + 'px').css('left', ref[0].offsetLeft + 'px')
                .css('width', ref[0].offsetWidth + 'px').css('height', ref[0].offsetHeight + 'px')
                .css('padding', ref.css('padding')).css('margin', ref.css('margin')).css('filter', 'alpha(opacity=0)');
              ref.attr('onclick', '');
              el.css('z-index', '1000');
            });
          }
        }
      }
    };
    var changeFnWrapper = function(fn) {
      return function(evt) {
        var files = FileAPI.getFiles(evt);
        for (var i = 0; i < files.length; i++) {
          if (files[i].size === undefined) files[i].size = 0;
          if (files[i].name === undefined) files[i].name = 'file';
          if (files[i].type === undefined) files[i].type = 'undefined';
        }
        if (!evt.target) {
          evt.target = {};
        }
        evt.target.files = files;
        if (evt.target.files != files) {
          evt.__files_ = files;
        }
        (evt.__files_ || evt.target.files).item = function(i) {
          return (evt.__files_ || evt.target.files)[i] || null;
        }
        if (fn) fn.apply(this, [evt]);
      };
    };
    var isFileChange = function(elem, e) {
      return (e.toLowerCase() === 'change' || e.toLowerCase() === 'onchange') && elem.getAttribute('type') == 'file';
    }
    if (HTMLInputElement.prototype.addEventListener) {
      HTMLInputElement.prototype.addEventListener = (function(origAddEventListener) {
        return function(e, fn, b, d) {
          if (isFileChange(this, e)) {
            addFlash(this);
            origAddEventListener.apply(this, [e, changeFnWrapper(fn), b, d]);
          } else {
            origAddEventListener.apply(this, [e, fn, b, d]);
          }
        }
      })(HTMLInputElement.prototype.addEventListener);
    }
    if (HTMLInputElement.prototype.attachEvent) {
      HTMLInputElement.prototype.attachEvent = (function(origAttachEvent) {
        return function(e, fn) {
          if (isFileChange(this, e)) {
            addFlash(this);
            if (window.jQuery) {
              angular.element(this).bind('change', changeFnWrapper(null));
            } else {
              origAttachEvent.apply(this, [e, changeFnWrapper(fn)]);
            }
          } else {
            origAttachEvent.apply(this, [e, fn]);
          }
        }
      })(HTMLInputElement.prototype.attachEvent);
    }
    window.FormData = FormData = function() {
      return {
        append: function(key, val, name) {
          if (val.__isFileAPIBlobShim) {
            val = val.data[0];
          }
          this.data.push({
            key: key,
            val: val,
            name: name
          });
        },
        data: [],
        __isFileAPIShim: true
      };
    };
    window.Blob = Blob = function(b) {
      return {
        data: b,
        __isFileAPIBlobShim: true
      };
    };
    (function() {
      if (!window.FileAPI) {
        window.FileAPI = {};
      }
      if (FileAPI.forceLoad) {
        FileAPI.html5 = false;
      }
      if (!FileAPI.upload) {
        var jsUrl, basePath, script = document.createElement('script'),
          allScripts = document.getElementsByTagName('script'),
          i, index, src;
        if (window.FileAPI.jsUrl) {
          jsUrl = window.FileAPI.jsUrl;
        } else if (window.FileAPI.jsPath) {
          basePath = window.FileAPI.jsPath;
        } else {
          for (i = 0; i < allScripts.length; i++) {
            src = allScripts[i].src;
            index = src.search(/\/angular\-file\-upload[\-a-zA-z0-9\.]*\.js/)
            if (index > -1) {
              basePath = src.substring(0, index + 1);
              break;
            }
          }
        }
        if (FileAPI.staticPath == null) FileAPI.staticPath = basePath;
        script.setAttribute('src', jsUrl || basePath + 'FileAPI.min.js');
        document.getElementsByTagName('head')[0].appendChild(script);
        FileAPI.hasFlash = hasFlash();
      }
    })();
    FileAPI.disableFileInput = function(elem, disable) {
      if (disable) {
        elem.removeClass('js-fileapi-wrapper')
      } else {
        elem.addClass('js-fileapi-wrapper');
      }
    }
  }
  if (!window.FileReader) {
    window.FileReader = function() {
      var _this = this,
        loadStarted = false;
      this.listeners = {};
      this.addEventListener = function(type, fn) {
        _this.listeners[type] = _this.listeners[type] || [];
        _this.listeners[type].push(fn);
      };
      this.removeEventListener = function(type, fn) {
        _this.listeners[type] && _this.listeners[type].splice(_this.listeners[type].indexOf(fn), 1);
      };
      this.dispatchEvent = function(evt) {
        var list = _this.listeners[evt.type];
        if (list) {
          for (var i = 0; i < list.length; i++) {
            list[i].call(_this, evt);
          }
        }
      };
      this.onabort = this.onerror = this.onload = this.onloadstart = this.onloadend = this.onprogress = null;
      var constructEvent = function(type, evt) {
        var e = {
          type: type,
          target: _this,
          loaded: evt.loaded,
          total: evt.total,
          error: evt.error
        };
        if (evt.result != null) e.target.result = evt.result;
        return e;
      };
      var listener = function(evt) {
        if (!loadStarted) {
          loadStarted = true;
          _this.onloadstart && _this.onloadstart(constructEvent('loadstart', evt));
        }
        if (evt.type === 'load') {
          _this.onloadend && _this.onloadend(constructEvent('loadend', evt));
          var e = constructEvent('load', evt);
          _this.onload && _this.onload(e);
          _this.dispatchEvent(e);
        } else if (evt.type === 'progress') {
          var e = constructEvent('progress', evt);
          _this.onprogress && _this.onprogress(e);
          _this.dispatchEvent(e);
        } else {
          var e = constructEvent('error', evt);
          _this.onerror && _this.onerror(e);
          _this.dispatchEvent(e);
        }
      };
      this.readAsArrayBuffer = function(file) {
        FileAPI.readAsBinaryString(file, listener);
      }
      this.readAsBinaryString = function(file) {
        FileAPI.readAsBinaryString(file, listener);
      }
      this.readAsDataURL = function(file) {
        FileAPI.readAsDataURL(file, listener);
      }
      this.readAsText = function(file) {
        FileAPI.readAsText(file, listener);
      }
    }
  }
})();;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/_module.js */
angular.module('sn.common.attachments', [
  'angularFileUpload',
  'sn.common.util'
]);;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/factory.nowAttachmentHandler.js */
angular.module("sn.common.attachments").factory("nowAttachmentHandler", function($http, nowServer, $upload, $rootScope, $timeout,
  snNotification) {
  "use strict";
  return function(setAttachments, appendError) {
    var self = this;
    self.cardUploading = '';
    self.setAttachments = setAttachments;
    self.appendError = appendError;
    self.ADDED = 'added';
    self.DELETED = 'deleted';
    self.RENAMED = 'renamed';
    self.getAttachmentList = function(action) {
      var url = nowServer.getURL('ngk_attachments', {
        action: 'list',
        sys_id: self.tableId,
        table: self.tableName
      });
      $http.get(url).then(function(response) {
        var attachments = response.data.files || [];
        self.setAttachments(attachments, action);
        if (self.startedUploadingTimeout || self.errorTimeout) {
          self.stopAllUploading();
          $rootScope.$broadcast('board.uploading.end');
        }
      });
    };
    self.stopAllUploading = function() {
      $timeout.cancel(self.errorTimeout);
      $timeout.cancel(self.startedUploadingTimeout);
      hideProgressBar();
      $rootScope.$broadcast("attachment.upload.stop");
    };
    self.onFileSelect = function($files) {
      if (!$files.length)
        return;
      var url = nowServer.getURL('ngk_attachments', {
        sys_id: self.tableId,
        table: self.tableName,
        action: 'add'
      });
      self.cardUploading = self.tableId;
      self.maxfiles = $files.length;
      self.fileCount = 1;
      self.filesUploaded = self.maxfiles;
      self.startedUploadingTimeout = $timeout(showUploaderDialog, 1500);
      for (var i = 0; i < self.maxfiles; i++) {
        if (parseInt($files[i].size) > parseInt(self.fileUploadSizeLimit)) {
          self.stopAllUploading();
          $rootScope.$broadcast('dialog.upload_too_large.show');
          return;
        }
      }
      for (var i = 0; i < self.maxfiles; i++) {
        $rootScope.$broadcast("attachment.upload.start");
        var file = $files[i];
        self.filesUploaded--;
        self.upload = $upload.upload({
          url: url,
          fields: {
            attachments_modified: 'true',
            sysparm_table: self.tableName,
            sysparm_sys_id: self.tableId,
            sysparm_nostack: 'yes',
            sysparm_encryption_context: '',
            sysparm_ck: window.g_ck
          },
          fileFormDataName: 'attachFile',
          file: file
        }).progress(function(evt) {
          var percent = parseInt(100.0 * evt.loaded / evt.total, 10);
          updateProgress(percent);
        }).success(function(data, status, headers, config) {
          processError(data);
          self.stopAllUploading();
          self.getAttachmentList(self.ADDED);
          if (self.filesUploaded <= 0) {
            self.cardUploading = '';
          }
        });
      }
    };
    self.downloadAttachment = function(attachment) {
      window.location.href = '/sys_attachment.do?sys_id=' + attachment.sys_id;
    };
    self.viewAttachment = function($event, attachment) {
      var url = window.location.protocol + '//' + window.location.host;
      url += '/sys_attachment.do?sysparm_referring_url=tear_off&view=true&sys_id=' + attachment.sys_id;
      window.open(url, attachment.sys_id,
        "toolbar=no,menubar=no,personalbar=no,width=800,height=600,scrollbars=yes,resizable=yes");
    };
    self.editAttachment = function($event, attachment) {
      var parent = $($event.currentTarget).closest('.file-attachment');
      var thumbnail = parent.find('.thumbnail');
      var input = parent.find('input');
      var tools = parent.find('.tools');
      var fileName = attachment.file_name;
      if (attachment.file_name.indexOf('.') !== -1) {
        attachment.ext = fileName.match(/(\.[^\.]+)$/i)[0];
        fileName = attachment.file_name.replace(/(\.[^\.]+)$/i, '');
      }
      input.val(fileName);
      var w = input.prev().width();
      input.width(w);
      input.prev().hide();
      input.css('display', 'block');
      thumbnail.addClass('state-locked');
      tools.find('.delete-edit').hide();
      tools.find('.rename-cancel').css('display', 'inline-block');
      input.focus();
    }
    self.onKeyDown = function($event, attachment) {
      var keyCode = $event.keyCode;
      if (keyCode === 13) {
        $event.stopPropagation();
        $event.preventDefault();
        self.updateAttachment($event, attachment);
      } else if (keyCode === 27) {
        $event.stopPropagation();
        self.updateAttachment($event);
      }
    };
    self.updateAttachment = function($event, attachment) {
      var el = $($event.currentTarget);
      var parent = el.closest('.file-attachment');
      var thumbnail = parent.find('.thumbnail');
      var input = parent.find('input');
      var link = parent.find('a');
      var tools = parent.find('.tools');
      if (attachment) {
        var fileName = input.val();
        if (fileName.length) {
          fileName += attachment.ext;
          if (fileName !== attachment.file_name) {
            link.text(fileName);
            self.renameAttachment(attachment, fileName);
          }
        }
      }
      input.hide();
      input.prev().show();
      tools.find('.rename-cancel').hide();
      thumbnail.removeClass('state-locked');
      tools.find('.delete-edit').css('display', 'inline-block');
    };
    self.dismissMsg = function($event, $index, errorMessages) {
      var msg = $($event.currentTarget);
      msg.addClass('remove');
      setTimeout(function() {
        msg.remove();
        errorMessages.splice($index, 1);
      }, 500);
    };
    $rootScope.$on("dialog.comment_form.close", function() {
      hideProgressBar();
    });
    self.openSelector = function($event) {
      $event.stopPropagation();
      var target = $($event.currentTarget);
      var input = target.parent().find('input[type=file]');
      input.click();
    }
    self.deleteAttachment = function(attachment) {
      if (attachment && attachment.sys_id) {
        $('#' + attachment.sys_id).hide();
        var url = nowServer.getURL('ngk_attachments', {
          action: 'delete',
          sys_id: attachment.sys_id
        });
        $http.get(url).then(function(response) {
          processError(response.data);
          self.getAttachmentList(self.DELETED);
        });
      }
    };
    self.renameAttachment = function(attachment, newName) {
      $http({
        url: nowServer.getURL('ngk_attachments'),
        method: 'POST',
        params: {
          action: 'rename',
          sys_id: attachment.sys_id,
          new_name: newName
        }
      }).then(function(response) {
        processError(response.data);
        self.getAttachmentList(self.RENAMED);
      });
    };

    function showUploaderDialog() {
      $rootScope.$broadcast('board.uploading.start', self.tableId);
    }

    function updateProgress(percent) {
      if (self.prevPercent === percent && self.fileCount <= self.maxfiles)
        return;
      if (self.fileCount <= self.maxfiles) {
        if (percent > 99)
          self.fileCount++;
        if (self.fileCount <= self.maxfiles) {
          $timeout.cancel(self.errorTimeout);
          self.errorTimeout = $timeout(broadcastError, 15000);
          $('.progress-label').text('Uploading file ' + self.fileCount + ' of ' + self.maxfiles);
          $('.upload-progress').val(percent);
          $('.progress-wrapper').show();
        }
      }
      self.prevPercent = percent;
    }

    function hideProgressBar() {
      try {
        $('.progress-wrapper').hide();
      } catch (e) {}
    }
    self.setParams = function(tableName, tableId, fileUploadSizeLimit) {
      self.tableName = tableName;
      self.tableId = tableId;
      self.fileUploadSizeLimit = fileUploadSizeLimit;
    };

    function broadcastError() {
      $rootScope.$broadcast('board.uploading.end');
      snNotification.show('error', 'An error occured when trying to upload your file. Please try again.');
      self.stopAllUploading();
    }

    function processError(data) {
      if (data.error) {
        self.appendError({
          msg: data.error + ' : ',
          fileName: '"' + data.fileName + '"'
        });
      }
    }
  };
});;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/directive.nowAttachmentsList.js */
angular.module('sn.common.attachments').directive('nowAttachmentsList', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl("attachments_list.xml"),
    link: function(scope, elem, attrs, $parse) {
      scope.icons = {
        preview: attrs.previewIcon,
        edit: attrs.editIcon,
        delete: attrs.deleteIcon,
        ok: attrs.okIcon,
        cancel: attrs.cancelIcon
      };
      scope.listClass = "list-group";
      var inline = scope.$eval(attrs.inline);
      if (inline)
        scope.listClass = "list-inline";
      scope.entryTemplate = getTemplateUrl(attrs.template || "attachment");
    }
  };
});;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/factory.snAttachmentHandler.js */
angular.module('sn.common.attachments').factory('snAttachmentHandler', function(urlTools, $http, $upload, $window, $q) {
  "use strict";
  return {
    getViewUrl: getViewUrl,
    create: createAttachmentHandler,
    deleteAttachment: deleteAttachmentBySysID,
    renameAttachment: renameAttachmentBySysID
  };

  function getViewUrl(sysId) {
    return '/sys_attachment.do?sys_id=' + sysId;
  }

  function deleteAttachmentBySysID(sysID) {
    var url = urlTools.getURL('ngk_attachments', {
      action: 'delete',
      sys_id: sysID
    });
    return $http.get(url);
  }

  function renameAttachmentBySysID(sysID, newName) {
    var url = urlTools.getURL('ngk_attachments', {
      action: 'rename',
      sys_id: sysID,
      new_name: newName
    });
    return $http.post(url);
  }

  function createAttachmentHandler(tableName, sysID, options) {
    var _tableName = tableName;
    var _sysID = sysID;
    var _files = [];

    function getTableName() {
      return _tableName;
    }

    function getSysID() {
      return _sysID;
    }

    function getAttachments() {
      var url = urlTools.getURL('ngk_attachments', {
        action: 'list',
        sys_id: _sysID,
        table: _tableName
      });
      return $http.get(url).then(function(response) {
        var files = response.data.files;
        if (_files.length == 0) {
          files.forEach(function(file) {
            if (file && file.sys_id) {
              _transformFileResponse(file);
              _files.push(file);
            }
          })
        } else {
          _files = files;
        }
        return _files;
      });
    }

    function addAttachment(attachment) {
      _files.unshift(attachment);
    }

    function deleteAttachment(attachment) {
      var index = _files.indexOf(attachment);
      if (index !== -1) {
        return deleteAttachmentBySysID(attachment.sys_id).then(function() {
          _files.splice(index, 1);
        });
      }
    }

    function uploadAttachments(files, uploadFields) {
      var defer = $q.defer();
      var promises = [];
      var fileData = [];
      angular.forEach(files, function(file) {
        promises.push(uploadAttachment(file, uploadFields).then(function(response) {
          fileData.push(response);
        }));
      });
      $q.all(promises).then(function() {
        defer.resolve(fileData);
      });
      return defer.promise;
    }

    function uploadAttachment(file, uploadFields, uploadMethods) {
      var url = urlTools.getURL('ngk_attachments', {
        action: 'add',
        sys_id: _sysID,
        table: _tableName,
        load_attachment_record: 'true'
      });
      var fields = {
        attachments_modified: 'true',
        sysparm_table: _tableName,
        sysparm_sys_id: _sysID,
        sysparm_nostack: 'yes',
        sysparm_encryption_context: ''
      };
      if (typeof $window.g_ck !== 'undefined') {
        fields['sysparm_ck'] = $window.g_ck;
      }
      if (uploadFields) {
        angular.extend(fields, uploadFields);
      }
      var upload = $upload.upload({
        url: url,
        fields: fields,
        fileFormDataName: 'attachFile',
        file: file
      });
      if (uploadMethods !== undefined) {
        if (uploadMethods.hasOwnProperty('progress')) {
          upload.progress(uploadMethods.progress);
        }
        if (uploadMethods.hasOwnProperty('success')) {
          upload.success(uploadMethods.success);
        }
        if (uploadMethods.hasOwnProperty('error')) {
          upload.error(uploadMethods.error);
        }
      }
      return upload.then(function(response) {
        var sysFile = response.data;
        if (sysFile.error) {
          return $q.reject("Exception when adding attachment: " + sysFile.error);
        }
        if (typeof sysFile === "object" && sysFile.hasOwnProperty('sys_id')) {
          _transformFileResponse(sysFile);
          addAttachment(sysFile);
        }
        if (options && options.onUploadComplete) {
          options.onUploadComplete(sysFile);
        }
        return sysFile;
      });
    }

    function _transformFileResponse(file) {
      file.isImage = false;
      file.canPreview = false;
      if (file.content_type.indexOf('image') !== -1) {
        file.isImage = true;
        if (!file.thumbSrc) {} else if (file.thumbSrc[0] !== '/') {
          file.thumbSrc = '/' + file.thumbSrc;
        }
        file.canPreview = file.content_type.indexOf('tiff') === -1;
      }
      file.viewUrl = getViewUrl(file.sys_id);
    }
    return {
      getSysID: getSysID,
      getTableName: getTableName,
      getAttachments: getAttachments,
      addAttachment: addAttachment,
      deleteAttachment: deleteAttachment,
      uploadAttachment: uploadAttachment,
      uploadAttachments: uploadAttachments
    };
  }
});;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/directive.snFileUploadInput.js */
angular.module('sn.common.attachments').directive('snFileUploadInput', function(cabrillo, $document) {
  'use strict';
  return {
    restrict: 'E',
    scope: {
      attachmentHandler: '=',
      customClassNames: '@classNames'
    },
    template: function() {
      var inputTemplate;
      if (cabrillo.isNative()) {
        inputTemplate = '<button class="{{classNames}}" ng-click="showAttachOptions($event)"><span class="upload-label"><translate key="Add Attachment" /></span></button>';
      } else {
        inputTemplate = '<button class="{{classNames}}" ng-file-select="onFileSelect($files)"><span class="upload-label"><translate key="Add Attachment" /></span></button>';
      }
      return [
        '<div class="file-upload-input">',
        inputTemplate,
        '</div>'
      ].join('');
    },
    controller: function($element, $scope) {
      var classNames = 'btn btn-icon attachment-btn icon-paperclip';
      if ($scope.customClassNames) {
        classNames += ' ' + $scope.customClassNames;
      }
      $scope.classNames = classNames;
      $scope.showAttachOptions = function($event) {
        var handler = $scope.attachmentHandler;
        var target = angular.element($event.currentTarget);
        var elRect = target[0].getBoundingClientRect();
        var body = $document[0].body;
        var rect = {
          x: elRect.left + body.scrollLeft,
          y: elRect.top + body.scrollTop,
          width: elRect.width,
          height: elRect.height
        };
        var options = {
          sourceRect: rect
        };
        cabrillo.attachments.addFile(
          handler.getTableName(),
          handler.getSysID(),
          null,
          options
        ).then(function(data) {
          console.log('Attached new file', data);
          handler.addAttachment(data);
        }, function() {
          console.log('Failed to attach new file');
        });
      };
      $scope.onFileSelect = function($files) {
        $scope.attachmentHandler.uploadAttachments($files);
      };
      $scope.showFileSelector = function($event) {
        $event.stopPropagation();
        var target = angular.element($event.currentTarget);
        var input = target.parent().find('input');
        input.triggerHandler('click');
      };
    }
  }
});;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/directive.snPasteFileHandler.js */
angular.module('sn.common.attachments').directive('snPasteFileHandler', function($parse) {
  'use strict';
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var snPasteFileHandler = $parse(attrs.snPasteFileHandler);
      element.bind("paste", function(event) {
        event = event.originalEvent || event;
        var item = event.clipboardData.items[0];
        if (!item)
          return;
        var file = item.getAsFile();
        if (!file)
          return;
        snPasteFileHandler(scope, {
          file: file
        });
        event.preventDefault();
        event.stopPropagation();
      });
    }
  };
});;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/directive.snAttachmentList.js */
angular.module('sn.common.attachments').directive('snAttachmentList', function(getTemplateUrl, snAttachmentHandler, $rootScope, $window, $timeout, $q) {
    'use strict';
    return {
      restrict: 'E',
      replace: true,
      templateUrl: getTemplateUrl("sn_attachment_list.xml"),
      scope: {
        tableName: "=?",
        sysID: "=?sysId",
        attachmentList: "=?",
        uploadFileFn: "&",
        deleteFileFn: "=?",
        canEdit: "=?",
        canRemove: "=?",
        canAdd: "=?",
        canDownload: "=?",
        showHeader: "=?",
        clickImageFn: "&?",
        confirmDelete: "=?"
      },
      controller: function($scope) {
        $scope.canEdit = $scope.canEdit || false;
        $scope.canDownload = $scope.canDownload || false;
        $scope.canRemove = $scope.canRemove || false;
        $scope.canAdd = $scope.canAdd || false;
        $scope.showHeader = $scope.showHeader || false;
        $scope.clickImageFn = $scope.clickImageFn || function() {};
        $scope.confirmDelete = $scope.confirmDelete || false;
        $scope.filesInProgress = {};
        $scope.attachmentToDelete = null;

        function refreshResources() {
          var handler = snAttachmentHandler.create($scope.tableName, $scope.sysID);
          handler.getAttachments().then(function(files) {
            $scope.attachmentList = files;
          });
        }
        if (!$scope.attachmentList) {
          $scope.attachmentList = [];
          refreshResources();
        }
        $scope.$on('attachments_list.update', function(e, tableName, sysID) {
          if (tableName === $scope.tableName && sysID === $scope.sysID) {
            refreshResources();
          }
        });

        function removeFromFileProgress(fileName) {
          delete $scope.filesInProgress[fileName];
        }

        function updateFileProgress(file) {
          if (!$scope.filesInProgress[file.name])
            $scope.filesInProgress[file.name] = file;
        }
        $scope.$on('attachments_list.upload.progress', function(e, file) {
          updateFileProgress(file);
        });
        $scope.$on('attachments_list.upload.success', function(e, file) {
          removeFromFileProgress(file.name);
        });
        $scope.attachFiles = function(files) {
          if ($scope.tableName && $scope.sysID) {
            var handler = snAttachmentHandler.create($scope.tableName, $scope.sysID);
            var promises = [];
            files.forEach(function(file) {
              var promise = handler.uploadAttachment(file, null, {
                progress: function(e) {
                  var file = e.config.file;
                  file.progress = 100.0 * event.loaded / event.total;
                  updateFileProgress(file);
                },
                success: function(data) {
                  removeFromFileProgress(data.file_name);
                }
              });
              promises.push(promise);
            });
            $q.all(promises).then(function() {
              refreshResources();
            });
          } else {
            if ($scope.uploadFileFn)
              $scope.uploadFileFn({
                files: files
              });
          }
        };
        $scope.getProgressStyle = function(fileName) {
          return {
            'width': $scope.filesInProgress[fileName].progress + '%'
          };
        };
        $scope.openSelector = function($event) {
          $event.stopPropagation();
          var target = angular.element($event.currentTarget);
          $timeout(function() {
            target.parent().find('input').click();
          });
        };
        $scope.confirmDeleteAttachment = function(attachment) {
          $scope.attachmentToDelete = attachment;
          $scope.$broadcast('dialog.confirm-delete.show');
        };
        $scope.deleteAttachment = function() {
          snAttachmentHandler.deleteAttachment($scope.attachmentToDelete.sys_id).then(function() {
            var index = $scope.attachmentList.indexOf($scope.attachmentToDelete);
            $scope.attachmentList.splice(index, 1);
          });
        };
      }
    };
  })
  .directive('snAttachmentListItem', function(getTemplateUrl, snAttachmentHandler, $rootScope, $window, $timeout, $parse) {
    'use strict';
    return {
      restrict: "E",
      replace: true,
      templateUrl: getTemplateUrl("sn_attachment_list_item.xml"),
      link: function(scope, element, attrs) {
        function translateAttachment(att) {
          return {
            content_type: att.content_type,
            file_name: att.file_name,
            image: (att.thumbSrc !== undefined),
            size_bytes: att.size,
            sys_created_by: "",
            sys_created_on: "",
            sys_id: att.sys_id,
            thumb_src: att.thumbSrc
          };
        }
        scope.attachment = ($parse(attrs.attachment.size_bytes)) ?
          scope.$eval(attrs.attachment) :
          translateAttachment(attrs.attachment);
        var fileNameView = element.find('.sn-widget-list-title_view');
        var fileNameEdit = element.find('.sn-widget-list-title_edit');

        function editFileName() {
          fileNameView.hide();
          fileNameEdit.show();
          element.find('.edit-text-input').focus();
        }

        function viewFileName() {
          fileNameView.show();
          fileNameEdit.hide();
        }
        viewFileName();
        scope.editModeToggle = function($event) {
          $event.preventDefault();
          $event.stopPropagation();
          scope.editMode = !scope.editMode;
          if (scope.editMode)
            editFileName();
          else
            viewFileName();
        };
        scope.updateName = function() {
          scope.editMode = false;
          viewFileName();
          snAttachmentHandler.renameAttachment(scope.attachment.sys_id, scope.attachment.file_name);
        };
      },
      controller: function($scope, snCustomEvent) {
        $scope.editMode = false;
        $scope.removeAttachment = function(attachment, index) {
          if ($scope.deleteFileFn !== undefined && $scope.deleteFileFn instanceof Function) {
            $scope.deleteFileFn.apply(null, arguments);
            return;
          }
          if ($scope.confirmDelete) {
            $scope.confirmDeleteAttachment($scope.attachment);
            return;
          }
          snAttachmentHandler.deleteAttachment($scope.attachment.sys_id).then(function() {
            $scope.attachmentList.splice($scope.$index, 1);
          });
        };
        var contentTypeMap = {
          "application/pdf": "icon-document-pdf",
          "text/plain": "icon-document-txt",
          "application/zip": "icon-document-zip",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "icon-document-doc",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation": "icon-document-ppt",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "icon-document-xls",
          "application/vnd.ms-powerpoint": "icon-document-ppt"
        };
        $scope.getDocumentType = function(contentType) {
          return contentTypeMap[contentType] || "icon-document";
        };
        $scope.handleAttachmentClick = function(event) {
          if (event.keyCode === 9)
            return;
          if ($scope.editMode)
            return;
          if (!$scope.attachment)
            return;
          if ($scope.attachment.image)
            openImageInLightBox(event);
          else
            downloadAttachment();
        };

        function downloadAttachment() {
          if (!$scope.attachment.sys_id)
            return;
          $window.location.href = 'sys_attachment.do?sys_id=' + $scope.attachment.sys_id;
        }

        function openImageInLightBox(event) {
          if (!$scope.attachment.size)
            $scope.attachment.size = $scope.getSize($scope.attachment.size_bytes, 2);
          $scope.clickImageFn({
            file: $scope.attachment
          });
          snCustomEvent.fire('sn.attachment.preview', event, $scope.attachment);
        }
        $scope.getSize = function(bytes, precision) {
          if (typeof bytes === 'string' && bytes.slice(-1) === 'B')
            return bytes;
          var kb = 1024;
          var mb = kb * 1024;
          var gb = mb * 1024;
          if ((bytes >= 0) && (bytes < kb))
            return bytes + ' B';
          else if ((bytes >= kb) && (bytes < mb))
            return (bytes / kb).toFixed(precision) + ' KB';
          else if ((bytes >= mb) && (bytes < gb))
            return (bytes / mb).toFixed(precision) + ' MB';
          else if (bytes >= gb)
            return (bytes / gb).toFixed(precision) + ' GB';
          else
            return bytes + ' B';
        }
      }
    };
  });;;