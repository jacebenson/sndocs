/*! RESOURCE: /scripts/app.$sp/service.spContextManager.js */
angular.module('sn.$sp').factory('spContextManager', function($rootScope, $window, $interval, $q) {
  'use strict';
  var GLOBAL_CTX_KEY = 'global';
  var _initialized, _initializing, _context;

  function _clear() {
    _context = {};
  }

  function _clone(obj) {
    if (!obj)
      return undefined;
    return JSON.parse(JSON.stringify(obj));
  }

  function _cleanKey(key) {
    key = (key || '').trim().toLowerCase();
    if (key === '')
      throw new Error('Please provide proper key for the context');
    return key;
  }

  function _removeKey(key) {
    if (_context[key])
      delete _context[key];
  }

  function _setGlobalContext(rootScope) {
    return $q(function(resolve) {
      var interval;
      var cancelInterval = function() {
        $interval.cancel(interval);
        interval = undefined;
      }
      interval = $interval(function() {
        var scope = rootScope || $rootScope;
        if (!scope.portal || !scope.page || !scope.user)
          return;
        _removeKey(GLOBAL_CTX_KEY);
        addContext(GLOBAL_CTX_KEY, {
          portal: {
            sys_id: scope.portal.sys_id,
            title: scope.portal.title,
            url_suffix: scope.portal.url_suffix
          },
          page: {
            sys_id: scope.page.sys_id,
            id: scope.page.id,
            title: scope.page.title,
            is_public: scope.page.public
          },
          user: {
            sys_id: scope.user.sys_id,
            username: scope.user.user_name,
            first_name: scope.user.first_name,
            last_name: scope.user.last_name,
            email: scope.user.email,
            roles: scope.user.roles
          },
          language: {
            user: $window.g_lang,
            system: $window.g_system_lang
          }
        });
        cancelInterval(interval);
        resolve();
      }, 0);
    });
  }

  function _getContextForKey(key) {
    if (!_context)
      return;
    return _clone(_context[key]);
  }

  function addContext(key, context) {
    key = _cleanKey(key);
    if (!context)
      throw new Error('Please provide proper context for the key: ' + key);
    if (_context[key] !== undefined)
      throw new Error('Context for the key "' + key + '" is already registered');
    _context[key] = context;
  }

  function getContext() {
    return _clone(_context);
  }

  function getContextForKey(key, returnPromise) {
    if (!returnPromise)
      return _clone(_context[key]);
    var interval;
    var cancelInterval = function() {
      $interval.cancel(interval);
      interval = undefined;
    }
    return $q(function(resolve) {
      var expire = new Date().getTime() + $window.NOW.sp_ctx_mgr_timeout;
      interval = $interval(function() {
        var context = _getContextForKey(key);
        if (context) {
          cancelInterval();
          resolve(context);
          return;
        }
        if (new Date().getTime() > expire) {
          cancelInterval();
          throw new Error('Request to get context for the key "' + key + '" timed out');
        }
      }, 10);
    });
  }

  function updateContextForKey(key, context) {
    _removeKey(key);
    addContext(key, context);
  }

  function init() {
    if (_initialized || _initializing) {
      return $q(function(resolve) {
        resolve();
      });
    }
    _initializing = true;
    return $q(function(resolve) {
      _clear();
      _setGlobalContext().then(function() {
        _initialized = true;
        _initializing = false;
        resolve();
      });
    });
  }
  $rootScope.$on('sp.page.loaded', function() {
    _setGlobalContext($rootScope);
  });
  return {
    init: init,
    addContext: addContext,
    getContext: getContext,
    getContextForKey: getContextForKey,
    updateContextForKey: updateContextForKey
  };
});;