/*! RESOURCE: /scripts/concourse_pane_extension/js_includes_concourse_pane_extension.js */
/*! RESOURCE: /scripts/thirdparty/ocLazyLoad/ocLazyLoad.js */
(function(angular, window) {
  'use strict';
  var regModules = ['ng', 'oc.lazyLoad'],
    regInvokes = {},
    regConfigs = [],
    modulesToLoad = [],
    realModules = [],
    recordDeclarations = [],
    broadcast = angular.noop,
    runBlocks = {},
    justLoaded = [];
  var ocLazyLoad = angular.module('oc.lazyLoad', ['ng']);
  ocLazyLoad.provider('$ocLazyLoad', ["$controllerProvider", "$provide", "$compileProvider", "$filterProvider", "$injector", "$animateProvider", function($controllerProvider, $provide, $compileProvider, $filterProvider, $injector, $animateProvider) {
    var modules = {},
      providers = {
        $controllerProvider: $controllerProvider,
        $compileProvider: $compileProvider,
        $filterProvider: $filterProvider,
        $provide: $provide,
        $injector: $injector,
        $animateProvider: $animateProvider
      },
      debug = false,
      events = false,
      moduleCache = [],
      modulePromises = {};
    moduleCache.push = function(value) {
      if (this.indexOf(value) === -1) {
        Array.prototype.push.apply(this, arguments);
      }
    };
    this.config = function(config) {
      if (angular.isDefined(config.modules)) {
        if (angular.isArray(config.modules)) {
          angular.forEach(config.modules, function(moduleConfig) {
            modules[moduleConfig.name] = moduleConfig;
          });
        } else {
          modules[config.modules.name] = config.modules;
        }
      }
      if (angular.isDefined(config.debug)) {
        debug = config.debug;
      }
      if (angular.isDefined(config.events)) {
        events = config.events;
      }
    };
    this._init = function _init(element) {
      if (modulesToLoad.length === 0) {
        var elements = [element],
          names = ['ng:app', 'ng-app', 'x-ng-app', 'data-ng-app'],
          NG_APP_CLASS_REGEXP = /\sng[:\-]app(:\s*([\w\d_]+);?)?\s/,
          append = function append(elm) {
            return elm && elements.push(elm);
          };
        angular.forEach(names, function(name) {
          names[name] = true;
          append(document.getElementById(name));
          name = name.replace(':', '\\:');
          if (typeof element[0] !== 'undefined' && element[0].querySelectorAll) {
            angular.forEach(element[0].querySelectorAll('.' + name), append);
            angular.forEach(element[0].querySelectorAll('.' + name + '\\:'), append);
            angular.forEach(element[0].querySelectorAll('[' + name + ']'), append);
          }
        });
        angular.forEach(elements, function(elm) {
          if (modulesToLoad.length === 0) {
            var className = ' ' + element.className + ' ';
            var match = NG_APP_CLASS_REGEXP.exec(className);
            if (match) {
              modulesToLoad.push((match[2] || '').replace(/\s+/g, ','));
            } else {
              angular.forEach(elm.attributes, function(attr) {
                if (modulesToLoad.length === 0 && names[attr.name]) {
                  modulesToLoad.push(attr.value);
                }
              });
            }
          }
        });
      }
      if (modulesToLoad.length === 0 && !((window.jasmine || window.mocha) && angular.isDefined(angular.mock))) {
        console.error('No module found during bootstrap, unable to init ocLazyLoad. You should always use the ng-app directive or angular.boostrap when you use ocLazyLoad.');
      }
      var addReg = function addReg(moduleName) {
        if (regModules.indexOf(moduleName) === -1) {
          regModules.push(moduleName);
          var mainModule = angular.module(moduleName);
          _invokeQueue(null, mainModule._invokeQueue, moduleName);
          _invokeQueue(null, mainModule._configBlocks, moduleName);
          angular.forEach(mainModule.requires, addReg);
        }
      };
      angular.forEach(modulesToLoad, function(moduleName) {
        addReg(moduleName);
      });
      modulesToLoad = [];
      recordDeclarations.pop();
    };
    var stringify = function stringify(obj) {
      try {
        return JSON.stringify(obj);
      } catch (e) {
        var cache = [];
        return JSON.stringify(obj, function(key, value) {
          if (angular.isObject(value) && value !== null) {
            if (cache.indexOf(value) !== -1) {
              return;
            }
            cache.push(value);
          }
          return value;
        });
      }
    };
    var hashCode = function hashCode(str) {
      var hash = 0,
        i,
        chr,
        len;
      if (str.length == 0) {
        return hash;
      }
      for (i = 0, len = str.length; i < len; i++) {
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
      }
      return hash;
    };

    function _register(providers, registerModules, params) {
      if (registerModules) {
        var k,
          moduleName,
          moduleFn,
          tempRunBlocks = [];
        for (k = registerModules.length - 1; k >= 0; k--) {
          moduleName = registerModules[k];
          if (!angular.isString(moduleName)) {
            moduleName = getModuleName(moduleName);
          }
          if (!moduleName || justLoaded.indexOf(moduleName) !== -1 || modules[moduleName] && realModules.indexOf(moduleName) === -1) {
            continue;
          }
          var newModule = regModules.indexOf(moduleName) === -1;
          moduleFn = ngModuleFct(moduleName);
          if (newModule) {
            regModules.push(moduleName);
            _register(providers, moduleFn.requires, params);
          }
          if (moduleFn._runBlocks.length > 0) {
            runBlocks[moduleName] = [];
            while (moduleFn._runBlocks.length > 0) {
              runBlocks[moduleName].push(moduleFn._runBlocks.shift());
            }
          }
          if (angular.isDefined(runBlocks[moduleName]) && (newModule || params.rerun)) {
            tempRunBlocks = tempRunBlocks.concat(runBlocks[moduleName]);
          }
          _invokeQueue(providers, moduleFn._invokeQueue, moduleName, params.reconfig);
          _invokeQueue(providers, moduleFn._configBlocks, moduleName, params.reconfig);
          broadcast(newModule ? 'ocLazyLoad.moduleLoaded' : 'ocLazyLoad.moduleReloaded', moduleName);
          registerModules.pop();
          justLoaded.push(moduleName);
        }
        var instanceInjector = providers.getInstanceInjector();
        angular.forEach(tempRunBlocks, function(fn) {
          instanceInjector.invoke(fn);
        });
      }
    }

    function _registerInvokeList(args, moduleName) {
      var invokeList = args[2][0],
        type = args[1],
        newInvoke = false;
      if (angular.isUndefined(regInvokes[moduleName])) {
        regInvokes[moduleName] = {};
      }
      if (angular.isUndefined(regInvokes[moduleName][type])) {
        regInvokes[moduleName][type] = {};
      }
      var onInvoke = function onInvoke(invokeName, invoke) {
        if (!regInvokes[moduleName][type].hasOwnProperty(invokeName)) {
          regInvokes[moduleName][type][invokeName] = [];
        }
        if (checkHashes(invoke, regInvokes[moduleName][type][invokeName])) {
          newInvoke = true;
          regInvokes[moduleName][type][invokeName].push(invoke);
          broadcast('ocLazyLoad.componentLoaded', [moduleName, type, invokeName]);
        }
      };

      function checkHashes(potentialNew, invokes) {
        var isNew = true,
          newHash;
        if (invokes.length) {
          newHash = signature(potentialNew);
          angular.forEach(invokes, function(invoke) {
            isNew = isNew && signature(invoke) !== newHash;
          });
        }
        return isNew;
      }

      function signature(data) {
        if (angular.isArray(data)) {
          return hashCode(data.toString());
        } else if (angular.isObject(data)) {
          return hashCode(stringify(data));
        } else {
          if (angular.isDefined(data) && data !== null) {
            return hashCode(data.toString());
          } else {
            return data;
          }
        }
      }
      if (angular.isString(invokeList)) {
        onInvoke(invokeList, args[2][1]);
      } else if (angular.isObject(invokeList)) {
        angular.forEach(invokeList, function(invoke, key) {
          if (angular.isString(invoke)) {
            onInvoke(invoke, invokeList[1]);
          } else {
            onInvoke(key, invoke);
          }
        });
      } else {
        return false;
      }
      return newInvoke;
    }

    function _invokeQueue(providers, queue, moduleName, reconfig) {
      if (!queue) {
        return;
      }
      var i, len, args, provider;
      for (i = 0, len = queue.length; i < len; i++) {
        args = queue[i];
        if (angular.isArray(args)) {
          if (providers !== null) {
            if (providers.hasOwnProperty(args[0])) {
              provider = providers[args[0]];
            } else {
              throw new Error('unsupported provider ' + args[0]);
            }
          }
          var isNew = _registerInvokeList(args, moduleName);
          if (args[1] !== 'invoke') {
            if (isNew && angular.isDefined(provider)) {
              provider[args[1]].apply(provider, args[2]);
            }
          } else {
            var callInvoke = function callInvoke(fct) {
              var invoked = regConfigs.indexOf(moduleName + '-' + fct);
              if (invoked === -1 || reconfig) {
                if (invoked === -1) {
                  regConfigs.push(moduleName + '-' + fct);
                }
                if (angular.isDefined(provider)) {
                  provider[args[1]].apply(provider, args[2]);
                }
              }
            };
            if (angular.isFunction(args[2][0])) {
              callInvoke(args[2][0]);
            } else if (angular.isArray(args[2][0])) {
              for (var j = 0, jlen = args[2][0].length; j < jlen; j++) {
                if (angular.isFunction(args[2][0][j])) {
                  callInvoke(args[2][0][j]);
                }
              }
            }
          }
        }
      }
    }

    function getModuleName(module) {
      var moduleName = null;
      if (angular.isString(module)) {
        moduleName = module;
      } else if (angular.isObject(module) && module.hasOwnProperty('name') && angular.isString(module.name)) {
        moduleName = module.name;
      }
      return moduleName;
    }

    function moduleExists(moduleName) {
      if (!angular.isString(moduleName)) {
        return false;
      }
      try {
        return ngModuleFct(moduleName);
      } catch (e) {
        if (/No module/.test(e) || e.message.indexOf('$injector:nomod') > -1) {
          return false;
        }
      }
    }
    this.$get = ["$log", "$rootElement", "$rootScope", "$cacheFactory", "$q", function($log, $rootElement, $rootScope, $cacheFactory, $q) {
      var instanceInjector,
        filesCache = $cacheFactory('ocLazyLoad');
      if (!debug) {
        $log = {};
        $log['error'] = angular.noop;
        $log['warn'] = angular.noop;
        $log['info'] = angular.noop;
      }
      providers.getInstanceInjector = function() {
        return instanceInjector ? instanceInjector : instanceInjector = $rootElement.data('$injector') || angular.injector();
      };
      broadcast = function broadcast(eventName, params) {
        if (events) {
          $rootScope.$broadcast(eventName, params);
        }
        if (debug) {
          $log.info(eventName, params);
        }
      };

      function reject(e) {
        var deferred = $q.defer();
        $log.error(e.message);
        deferred.reject(e);
        return deferred.promise;
      }
      return {
        _broadcast: broadcast,
        _$log: $log,
        _getFilesCache: function getFilesCache() {
          return filesCache;
        },
        toggleWatch: function toggleWatch(watch) {
          if (watch) {
            recordDeclarations.push(true);
          } else {
            recordDeclarations.pop();
          }
        },
        getModuleConfig: function getModuleConfig(moduleName) {
          if (!angular.isString(moduleName)) {
            throw new Error('You need to give the name of the module to get');
          }
          if (!modules[moduleName]) {
            return null;
          }
          return angular.copy(modules[moduleName]);
        },
        setModuleConfig: function setModuleConfig(moduleConfig) {
          if (!angular.isObject(moduleConfig)) {
            throw new Error('You need to give the module config object to set');
          }
          modules[moduleConfig.name] = moduleConfig;
          return moduleConfig;
        },
        getModules: function getModules() {
          return regModules;
        },
        isLoaded: function isLoaded(modulesNames) {
          var moduleLoaded = function moduleLoaded(module) {
            var isLoaded = regModules.indexOf(module) > -1;
            if (!isLoaded) {
              isLoaded = !!moduleExists(module);
            }
            return isLoaded;
          };
          if (angular.isString(modulesNames)) {
            modulesNames = [modulesNames];
          }
          if (angular.isArray(modulesNames)) {
            var i, len;
            for (i = 0, len = modulesNames.length; i < len; i++) {
              if (!moduleLoaded(modulesNames[i])) {
                return false;
              }
            }
            return true;
          } else {
            throw new Error('You need to define the module(s) name(s)');
          }
        },
        _getModuleName: getModuleName,
        _getModule: function getModule(moduleName) {
          try {
            return ngModuleFct(moduleName);
          } catch (e) {
            if (/No module/.test(e) || e.message.indexOf('$injector:nomod') > -1) {
              e.message = 'The module "' + stringify(moduleName) + '" that you are trying to load does not exist. ' + e.message;
            }
            throw e;
          }
        },
        moduleExists: moduleExists,
        _loadDependencies: function _loadDependencies(moduleName, localParams) {
          var loadedModule,
            requires,
            diff,
            promisesList = [],
            self = this;
          moduleName = self._getModuleName(moduleName);
          if (moduleName === null) {
            return $q.when();
          } else {
            try {
              loadedModule = self._getModule(moduleName);
            } catch (e) {
              return reject(e);
            }
            requires = self.getRequires(loadedModule);
          }
          angular.forEach(requires, function(requireEntry) {
            if (angular.isString(requireEntry)) {
              var config = self.getModuleConfig(requireEntry);
              if (config === null) {
                moduleCache.push(requireEntry);
                return;
              }
              requireEntry = config;
              config.name = undefined;
            }
            if (self.moduleExists(requireEntry.name)) {
              diff = requireEntry.files.filter(function(n) {
                return self.getModuleConfig(requireEntry.name).files.indexOf(n) < 0;
              });
              if (diff.length !== 0) {
                self._$log.warn('Module "', moduleName, '" attempted to redefine configuration for dependency. "', requireEntry.name, '"\n Additional Files Loaded:', diff);
              }
              if (angular.isDefined(self.filesLoader)) {
                promisesList.push(self.filesLoader(requireEntry, localParams).then(function() {
                  return self._loadDependencies(requireEntry);
                }));
              } else {
                return reject(new Error('Error: New dependencies need to be loaded from external files (' + requireEntry.files + '), but no loader has been defined.'));
              }
              return;
            } else if (angular.isArray(requireEntry)) {
              var files = [];
              angular.forEach(requireEntry, function(entry) {
                var config = self.getModuleConfig(entry);
                if (config === null) {
                  files.push(entry);
                } else if (config.files) {
                  files = files.concat(config.files);
                }
              });
              if (files.length > 0) {
                requireEntry = {
                  files: files
                };
              }
            } else if (angular.isObject(requireEntry)) {
              if (requireEntry.hasOwnProperty('name') && requireEntry['name']) {
                self.setModuleConfig(requireEntry);
                moduleCache.push(requireEntry['name']);
              }
            }
            if (angular.isDefined(requireEntry.files) && requireEntry.files.length !== 0) {
              if (angular.isDefined(self.filesLoader)) {
                promisesList.push(self.filesLoader(requireEntry, localParams).then(function() {
                  return self._loadDependencies(requireEntry);
                }));
              } else {
                return reject(new Error('Error: the module "' + requireEntry.name + '" is defined in external files (' + requireEntry.files + '), but no loader has been defined.'));
              }
            }
          });
          return $q.all(promisesList);
        },
        inject: function inject(moduleName) {
          var localParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
          var real = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
          var self = this,
            deferred = $q.defer();
          if (angular.isDefined(moduleName) && moduleName !== null) {
            if (angular.isArray(moduleName)) {
              var promisesList = [];
              angular.forEach(moduleName, function(module) {
                promisesList.push(self.inject(module, localParams, real));
              });
              return $q.all(promisesList);
            } else {
              self._addToLoadList(self._getModuleName(moduleName), true, real);
            }
          }
          if (modulesToLoad.length > 0) {
            var res = modulesToLoad.slice();
            var loadNext = function loadNext(moduleName) {
              moduleCache.push(moduleName);
              modulePromises[moduleName] = deferred.promise;
              self._loadDependencies(moduleName, localParams).then(function success() {
                try {
                  justLoaded = [];
                  _register(providers, moduleCache, localParams);
                } catch (e) {
                  self._$log.error(e.message);
                  deferred.reject(e);
                  return;
                }
                if (modulesToLoad.length > 0) {
                  loadNext(modulesToLoad.shift());
                } else {
                  deferred.resolve(res);
                }
              }, function error(err) {
                deferred.reject(err);
              });
            };
            loadNext(modulesToLoad.shift());
          } else if (localParams && localParams.name && modulePromises[localParams.name]) {
            return modulePromises[localParams.name];
          } else {
            deferred.resolve();
          }
          return deferred.promise;
        },
        getRequires: function getRequires(module) {
          var requires = [];
          angular.forEach(module.requires, function(requireModule) {
            if (regModules.indexOf(requireModule) === -1) {
              requires.push(requireModule);
            }
          });
          return requires;
        },
        _invokeQueue: _invokeQueue,
        _registerInvokeList: _registerInvokeList,
        _register: _register,
        _addToLoadList: _addToLoadList,
        _unregister: function _unregister(modules) {
          if (angular.isDefined(modules)) {
            if (angular.isArray(modules)) {
              angular.forEach(modules, function(module) {
                regInvokes[module] = undefined;
              });
            }
          }
        }
      };
    }];
    this._init(angular.element(window.document));
  }]);
  var bootstrapFct = angular.bootstrap;
  angular.bootstrap = function(element, modules, config) {
    angular.forEach(modules.slice(), function(module) {
      _addToLoadList(module, true, true);
    });
    return bootstrapFct(element, modules, config);
  };
  var _addToLoadList = function _addToLoadList(name, force, real) {
    if ((recordDeclarations.length > 0 || force) && angular.isString(name) && modulesToLoad.indexOf(name) === -1) {
      modulesToLoad.push(name);
      if (real) {
        realModules.push(name);
      }
    }
  };
  var ngModuleFct = angular.module;
  angular.module = function(name, requires, configFn) {
    _addToLoadList(name, false, true);
    return ngModuleFct(name, requires, configFn);
  };
  if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
    module.exports = 'oc.lazyLoad';
  }
})(angular, window);
(function(angular) {
  'use strict';
  angular.module('oc.lazyLoad').directive('ocLazyLoad', ["$ocLazyLoad", "$compile", "$animate", "$parse", "$timeout", function($ocLazyLoad, $compile, $animate, $parse, $timeout) {
    return {
      restrict: 'A',
      terminal: true,
      priority: 1000,
      compile: function compile(element, attrs) {
        var content = element[0].innerHTML;
        element.html('');
        return function($scope, $element, $attr) {
          var model = $parse($attr.ocLazyLoad);
          $scope.$watch(function() {
            return model($scope) || $attr.ocLazyLoad;
          }, function(moduleName) {
            if (angular.isDefined(moduleName)) {
              $ocLazyLoad.load(moduleName).then(function() {
                $animate.enter(content, $element);
                $compile($element.contents())($scope);
              });
            }
          }, true);
        };
      }
    };
  }]);
})(angular);
(function(angular) {
  'use strict';
  angular.module('oc.lazyLoad').config(["$provide", function($provide) {
    $provide.decorator('$ocLazyLoad', ["$delegate", "$q", "$window", "$interval", function($delegate, $q, $window, $interval) {
      var uaCssChecked = false,
        useCssLoadPatch = false,
        anchor = $window.document.getElementsByTagName('head')[0] || $window.document.getElementsByTagName('body')[0];
      $delegate.buildElement = function buildElement(type, path, params) {
        var deferred = $q.defer(),
          el,
          loaded,
          filesCache = $delegate._getFilesCache(),
          cacheBuster = function cacheBuster(url) {
            var dc = new Date().getTime();
            if (url.indexOf('?') >= 0) {
              if (url.substring(0, url.length - 1) === '&') {
                return url + '_dc=' + dc;
              }
              return url + '&_dc=' + dc;
            } else {
              return url + '?_dc=' + dc;
            }
          };
        if (angular.isUndefined(filesCache.get(path))) {
          filesCache.put(path, deferred.promise);
        }
        switch (type) {
          case 'css':
            el = $window.document.createElement('link');
            el.type = 'text/css';
            el.rel = 'stylesheet';
            el.href = params.cache === false ? cacheBuster(path) : path;
            break;
          case 'js':
            el = $window.document.createElement('script');
            el.src = params.cache === false ? cacheBuster(path) : path;
            break;
          default:
            filesCache.remove(path);
            deferred.reject(new Error('Requested type "' + type + '" is not known. Could not inject "' + path + '"'));
            break;
        }
        el.onload = el['onreadystatechange'] = function(e) {
          if (el['readyState'] && !/^c|loade/.test(el['readyState']) || loaded) return;
          el.onload = el['onreadystatechange'] = null;
          loaded = 1;
          $delegate._broadcast('ocLazyLoad.fileLoaded', path);
          deferred.resolve();
        };
        el.onerror = function() {
          filesCache.remove(path);
          deferred.reject(new Error('Unable to load ' + path));
        };
        el.async = params.serie ? 0 : 1;
        var insertBeforeElem = anchor.lastChild;
        if (params.insertBefore) {
          var element = angular.element(angular.isDefined(window.jQuery) ? params.insertBefore : document.querySelector(params.insertBefore));
          if (element && element.length > 0) {
            insertBeforeElem = element[0];
          }
        }
        insertBeforeElem.parentNode.insertBefore(el, insertBeforeElem);
        if (type == 'css') {
          if (!uaCssChecked) {
            var ua = $window.navigator.userAgent.toLowerCase();
            if (/iP(hone|od|ad)/.test($window.navigator.platform)) {
              var v = $window.navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
              var iOSVersion = parseFloat([parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)].join('.'));
              useCssLoadPatch = iOSVersion < 6;
            } else if (ua.indexOf("android") > -1) {
              var androidVersion = parseFloat(ua.slice(ua.indexOf("android") + 8));
              useCssLoadPatch = androidVersion < 4.4;
            } else if (ua.indexOf('safari') > -1) {
              var versionMatch = ua.match(/version\/([\.\d]+)/i);
              useCssLoadPatch = versionMatch && versionMatch[1] && parseFloat(versionMatch[1]) < 6;
            }
          }
          if (useCssLoadPatch) {
            var tries = 1000;
            var interval = $interval(function() {
              try {
                el.sheet.cssRules;
                $interval.cancel(interval);
                el.onload();
              } catch (e) {
                if (--tries <= 0) {
                  el.onerror();
                }
              }
            }, 20);
          }
        }
        return deferred.promise;
      };
      return $delegate;
    }]);
  }]);
})(angular);
(function(angular) {
  'use strict';
  angular.module('oc.lazyLoad').config(["$provide", function($provide) {
    $provide.decorator('$ocLazyLoad', ["$delegate", "$q", function($delegate, $q) {
      $delegate.filesLoader = function filesLoader(config) {
        var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        var cssFiles = [],
          templatesFiles = [],
          jsFiles = [],
          promises = [],
          cachePromise = null,
          filesCache = $delegate._getFilesCache();
        $delegate.toggleWatch(true);
        angular.extend(params, config);
        var pushFile = function pushFile(path) {
          var file_type = null,
            m;
          if (angular.isObject(path)) {
            file_type = path.type;
            path = path.path;
          }
          cachePromise = filesCache.get(path);
          if (angular.isUndefined(cachePromise) || params.cache === false) {
            if ((m = /^(css|less|html|htm|js)?(?=!)/.exec(path)) !== null) {
              file_type = m[1];
              path = path.substr(m[1].length + 1, path.length);
            }
            if (!file_type) {
              if ((m = /[.](css|less|html|htm|js)?((\?|#).*)?$/.exec(path)) !== null) {
                file_type = m[1];
              } else if (!$delegate.jsLoader.hasOwnProperty('ocLazyLoadLoader') && $delegate.jsLoader.hasOwnProperty('requirejs')) {
                file_type = 'js';
              } else {
                $delegate._$log.error('File type could not be determined. ' + path);
                return;
              }
            }
            if ((file_type === 'css' || file_type === 'less') && cssFiles.indexOf(path) === -1) {
              cssFiles.push(path);
            } else if ((file_type === 'html' || file_type === 'htm') && templatesFiles.indexOf(path) === -1) {
              templatesFiles.push(path);
            } else if (file_type === 'js' || jsFiles.indexOf(path) === -1) {
              jsFiles.push(path);
            } else {
              $delegate._$log.error('File type is not valid. ' + path);
            }
          } else if (cachePromise) {
            promises.push(cachePromise);
          }
        };
        if (params.serie) {
          pushFile(params.files.shift());
        } else {
          angular.forEach(params.files, function(path) {
            pushFile(path);
          });
        }
        if (cssFiles.length > 0) {
          var cssDeferred = $q.defer();
          $delegate.cssLoader(cssFiles, function(err) {
            if (angular.isDefined(err) && $delegate.cssLoader.hasOwnProperty('ocLazyLoadLoader')) {
              $delegate._$log.error(err);
              cssDeferred.reject(err);
            } else {
              cssDeferred.resolve();
            }
          }, params);
          promises.push(cssDeferred.promise);
        }
        if (templatesFiles.length > 0) {
          var templatesDeferred = $q.defer();
          $delegate.templatesLoader(templatesFiles, function(err) {
            if (angular.isDefined(err) && $delegate.templatesLoader.hasOwnProperty('ocLazyLoadLoader')) {
              $delegate._$log.error(err);
              templatesDeferred.reject(err);
            } else {
              templatesDeferred.resolve();
            }
          }, params);
          promises.push(templatesDeferred.promise);
        }
        if (jsFiles.length > 0) {
          var jsDeferred = $q.defer();
          $delegate.jsLoader(jsFiles, function(err) {
            if (angular.isDefined(err) && ($delegate.jsLoader.hasOwnProperty("ocLazyLoadLoader") || $delegate.jsLoader.hasOwnProperty("requirejs"))) {
              $delegate._$log.error(err);
              jsDeferred.reject(err);
            } else {
              jsDeferred.resolve();
            }
          }, params);
          promises.push(jsDeferred.promise);
        }
        if (promises.length === 0) {
          var deferred = $q.defer(),
            err = "Error: no file to load has been found, if you're trying to load an existing module you should use the 'inject' method instead of 'load'.";
          $delegate._$log.error(err);
          deferred.reject(err);
          return deferred.promise;
        } else if (params.serie && params.files.length > 0) {
          return $q.all(promises).then(function() {
            return $delegate.filesLoader(config, params);
          });
        } else {
          return $q.all(promises)['finally'](function(res) {
            $delegate.toggleWatch(false);
            return res;
          });
        }
      };
      $delegate.load = function(originalModule) {
        var originalParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        var self = this,
          config = null,
          deferredList = [],
          deferred = $q.defer(),
          errText;
        var module = angular.copy(originalModule);
        var params = angular.copy(originalParams);
        if (angular.isArray(module)) {
          angular.forEach(module, function(m) {
            deferredList.push(self.load(m, params));
          });
          $q.all(deferredList).then(function(res) {
            deferred.resolve(res);
          }, function(err) {
            deferred.reject(err);
          });
          return deferred.promise;
        }
        if (angular.isString(module)) {
          config = self.getModuleConfig(module);
          if (!config) {
            config = {
              files: [module]
            };
          }
        } else if (angular.isObject(module)) {
          if (angular.isDefined(module.path) && angular.isDefined(module.type)) {
            config = {
              files: [module]
            };
          } else {
            config = self.setModuleConfig(module);
          }
        }
        if (config === null) {
          var moduleName = self._getModuleName(module);
          errText = 'Module "' + (moduleName || 'unknown') + '" is not configured, cannot load.';
          $delegate._$log.error(errText);
          deferred.reject(new Error(errText));
          return deferred.promise;
        } else {
          if (angular.isDefined(config.template)) {
            if (angular.isUndefined(config.files)) {
              config.files = [];
            }
            if (angular.isString(config.template)) {
              config.files.push(config.template);
            } else if (angular.isArray(config.template)) {
              config.files.concat(config.template);
            }
          }
        }
        var localParams = angular.extend({}, params, config);
        if (angular.isUndefined(config.files) && angular.isDefined(config.name) && $delegate.moduleExists(config.name)) {
          return $delegate.inject(config.name, localParams, true);
        }
        $delegate.filesLoader(config, localParams).then(function() {
          $delegate.inject(null, localParams).then(function(res) {
            deferred.resolve(res);
          }, function(err) {
            deferred.reject(err);
          });
        }, function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      };
      return $delegate;
    }]);
  }]);
})(angular);
(function(angular) {
  'use strict';
  angular.module('oc.lazyLoad').config(["$provide", function($provide) {
    $provide.decorator('$ocLazyLoad', ["$delegate", "$q", function($delegate, $q) {
      $delegate.cssLoader = function(paths, callback, params) {
        var promises = [];
        angular.forEach(paths, function(path) {
          promises.push($delegate.buildElement('css', path, params));
        });
        $q.all(promises).then(function() {
          callback();
        }, function(err) {
          callback(err);
        });
      };
      $delegate.cssLoader.ocLazyLoadLoader = true;
      return $delegate;
    }]);
  }]);
})(angular);
(function(angular) {
  'use strict';
  angular.module('oc.lazyLoad').config(["$provide", function($provide) {
    $provide.decorator('$ocLazyLoad', ["$delegate", "$q", function($delegate, $q) {
      $delegate.jsLoader = function(paths, callback, params) {
        var promises = [];
        angular.forEach(paths, function(path) {
          promises.push($delegate.buildElement('js', path, params));
        });
        $q.all(promises).then(function() {
          callback();
        }, function(err) {
          callback(err);
        });
      };
      $delegate.jsLoader.ocLazyLoadLoader = true;
      return $delegate;
    }]);
  }]);
})(angular);
(function(angular) {
  'use strict';
  angular.module('oc.lazyLoad').config(["$provide", function($provide) {
    $provide.decorator('$ocLazyLoad', ["$delegate", "$templateCache", "$q", "$http", function($delegate, $templateCache, $q, $http) {
      $delegate.templatesLoader = function(paths, callback, params) {
        var promises = [],
          filesCache = $delegate._getFilesCache();
        angular.forEach(paths, function(url) {
          var deferred = $q.defer();
          promises.push(deferred.promise);
          $http.get(url, params).success(function(data) {
            if (angular.isString(data) && data.length > 0) {
              angular.forEach(angular.element(data), function(node) {
                if (node.nodeName === 'SCRIPT' && node.type === 'text/ng-template') {
                  $templateCache.put(node.id, node.innerHTML);
                }
              });
            }
            if (angular.isUndefined(filesCache.get(url))) {
              filesCache.put(url, true);
            }
            deferred.resolve();
          }).error(function(err) {
            deferred.reject(new Error('Unable to load template file "' + url + '": ' + err));
          });
        });
        return $q.all(promises).then(function() {
          callback();
        }, function(err) {
          callback(err);
        });
      };
      $delegate.templatesLoader.ocLazyLoadLoader = true;
      return $delegate;
    }]);
  }]);
})(angular);
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(searchElement, fromIndex) {
    var k;
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if (len === 0) {
      return -1;
    }
    var n = +fromIndex || 0;
    if (Math.abs(n) === Infinity) {
      n = 0;
    }
    if (n >= len) {
      return -1;
    }
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
    while (k < len) {
      if (k in O && O[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  };
};
/*! RESOURCE: /scripts/concourse_pane_extension/_module.js */
angular.module('sn.concourse_pane_extension', ['oc.lazyLoad']);;
/*! RESOURCE: /scripts/concourse_pane_extension/service.concoursePaneExtensionRegistry.js */
angular.module('sn.concourse_pane_extension').service('concoursePaneExtensionRegistry', function() {
  var handlers = {};
  return {
    register: function(type, handler) {
      handlers[type] = handler;
    },
    hasHandler: function(type) {
      return handlers.hasOwnProperty(type);
    },
    process: function(type, elementRoot, url, otherStuff) {
      handlers[type].call(null, elementRoot, url, otherStuff);
      console.log("Intercept handled", type, url, otherStuff);
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/bindWatch/js_includes_bind_watch.js */
/*! RESOURCE: /scripts/sn/common/bindWatch/_module.js */
angular.module('sn.common.bindWatch', []);;
/*! RESOURCE: /scripts/sn/common/bindWatch/config.bindWatch.js */
angular.module('sn.common.bindWatch').config(function($provide) {
  "use strict";
  $parseExpressionator.$inject = ['$delegate'];

  function $parseExpressionator($delegate) {
    function wrapParse(parse, exp, interceptor) {
      var parts;
      var part;
      var expression;
      var rawExpression;
      var notifiers;
      if (typeof exp === 'string' && /^:([a-zA-Z0-9][\w-]*):(.+)$/.test(exp)) {
        parts = exp.split(/:/);
        notifiers = [];
        while (parts.length) {
          part = parts.shift();
          if (part) {
            if (/^\s*[\{\[]/.test(part)) {
              rawExpression = [part].concat(parts).join(':');
              break;
            }
            notifiers.push(part);
          }
        }
        if (!rawExpression)
          rawExpression = notifiers.splice(-1, 1)[0];
        expression = parse.call(this, '::' + rawExpression, interceptor);
        expression.$$watchDelegate = dynamicWatcher(expression, notifiers);
        return expression;
      } else {
        return parse.call(this, exp, interceptor);
      }
    }
    return wrapParse.bind(null, $delegate);
  }

  function dynamicWatcher(expression, keys) {
    if (expression.$$watchDelegate.wrapped)
      return expression.$$watchDelegate;

    function setupListeners(scope, callback) {
      keys.forEach(function(newKey) {
        scope.$on('$$applyTwoWayBinding::' + newKey, callback);
      });
    }

    function wrapDelegate(watchDelegate, scope, listener, objectEquality, parsedExpression) {
      var delegateCall = watchDelegate.bind(this, scope, listener, objectEquality, parsedExpression);
      setupListeners(scope, delegateCall);
      delegateCall();
    }
    var delegate = wrapDelegate.bind(this, expression.$$watchDelegate);
    delegate.wrapped = true;
    return delegate;
  }
  $provide.decorator('$parse', $parseExpressionator);
});;
/*! RESOURCE: /scripts/sn/common/bindWatch/BindWatch.js */
angular.module('sn.common.bindWatch').factory('BindWatch', function() {
  "use strict";
  return function(scope, map) {
    if (!scope || !map)
      throw new Error('No scope or map provided');
    Object.keys(map).forEach(function(key) {
      scope.$watch(map[key], function(key, n, o) {
        if (n !== o)
          scope.$broadcast('$$applyTwoWayBinding::' + key);
      }.bind(null, key));
    });
  }
});;;
/*! RESOURCE: scripts/app.snList/optional/service.listv3PaneExtension.js */
angular.module('sn.concourse_pane_extension').run(function(concoursePaneExtensionRegistry, getTemplateUrl, glideUrlBuilder, $ocLazyLoad, $compile, $log, snCustomEvent) {
  var listv3FilesLoaded = false;
  var listv3OuterScope = null;
  concoursePaneExtensionRegistry.register('list', function(elementRoot, url, params) {
    params.startTime = new Date();
    if (listv3FilesLoaded) {
      loadList(elementRoot, url, params);
      return;
    }
    $ocLazyLoad.load([
      'scripts/js_includes_list_v3.js',
      'styles/css_includes_list_v3.css',
      getTemplateUrl('sn_list_template_preload.xml&sysparm_nothing=.html')
    ]).then(function() {
      loadList(elementRoot, url, params);
      listv3FilesLoaded = true;
    }, function(err) {
      $log.error('Error while lazy loading list', err);
    });
  });

  function loadList(elementRoot, url, params) {
    var listConfig = parseListConfig(url);
    if (elementRoot.find('sn-list').length > 0) {
      var dirty = false;
      angular.forEach(listConfig, function(item, name) {
        if (angular.equals(listv3OuterScope[name], item))
          return;
        dirty = true;
        listv3OuterScope[name] = item;
      });
      if (dirty)
        snCustomEvent.fire('list_v3.list_reload', listv3OuterScope);
    } else {
      var snList = document.createElement('sn-list');
      listv3OuterScope = angular.element(elementRoot).scope().$new();
      angular.forEach(listConfig, function(item, name) {
        listv3OuterScope[name] = item;
        snList.setAttribute(name, name);
      });
      var element = $compile(snList)(listv3OuterScope);
      elementRoot.append(element);
    }
  }

  function parseListConfig(url) {
    var urlBuilder = glideUrlBuilder.newGlideUrl(parseTheBeginningOutOf(url));
    var table = urlBuilder.contextPath.replace('_list.do', '');
    var params = urlBuilder.getParams();
    var query = params.sysparm_query || '';
    return {
      table: table,
      query: query,
      concourse: true,
      parameters: angular.extend({
        sysparm_limit: '20',
        sysparm_field_styles: 'true',
        sysparm_exclude_reference_link: 'true',
        sysparm_display_value: 'all',
        sysparm_read_replica_category: 'list'
      }, params),
      properties: {
        listId: table,
        table: table,
        listControl: {
          omitFilter: 'false',
          omitEmpty: 'false',
          omitLinks: 'false'
        },
        related: {},
        isRefList: 'false',
        maxRows: '20',
        isModernCellStyles: 'true',
        isEmbedded: 'false',
        isRelated: 'false',
        isRegularList: true,
        live: 'true',
        showFixedHeaders: 'true',
        showVTB: 'true',
        target: 'gsft_main'
      },
      include: {
        header: "true",
        activityStream: "true",
        modeSelector: "true",
        uiActions: "true",
        footer: "true",
        isReferenceList: "false",
        listEdit: "true",
        titleContextMenu: "true"
      }
    }
  }

  function parseTheBeginningOutOf(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://'))
      return url;
    return url.match(/\/\/[^\/]+\/(.+)/)[1];
  }
});;;