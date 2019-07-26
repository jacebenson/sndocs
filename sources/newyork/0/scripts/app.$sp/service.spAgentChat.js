/*! RESOURCE: /scripts/app.$sp/service.spAgentChat.js */
angular.module('sn.$sp').factory('spAgentChat', function($q, $http, $window, $location, spContextManager) {
  'use strict';
  var CONTEXT_KEY = 'agent-chat';
  var STORAGE_KEY = 'sp.agent-chat';
  var DEFAULT_FRAME_URL = '/$sn-va-web-client-app.do?sysparm_nostack=true&sysparm_stack=no';
  var _url, _sessionId, _portalId;
  var _initialized = false;
  var _initializing = false;
  var _config = {
    isVisible: false,
    isOpen: false,
    hasUnreadMessage: false
  };
  var _handlers = {};
  var events = {
    NEW_UNREAD_MESSAGE: 'sn-va-web-client-app-new-message',
    REAUTH: 'sn-va-web-client-app-trigger-login',
    STATE_CHANGE: 'STATE_CHANGE'
  };

  function _appendParams(kvp, params) {
    var keys = Object.keys(kvp);
    keys.forEach(function(key) {
      params[key] = kvp[key];
    });
  }

  function _buildParamString(params) {
    var kvp = [];
    var keys = Object.keys(params);
    keys.forEach(function(key) {
      kvp.push('sysparm_' + key + '=' + params[key]);
    });
    return kvp.length > 0 ? '&' + kvp.join('&') : '';
  }

  function _getConfig() {
    var deferred = $q.defer();
    var state = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (state && state[_sessionId] && state[_sessionId][_url]) {
      var config = state[_sessionId][_url];
      _config.isVisible = true;
      _config.isOpen = config.is_open;
      deferred.resolve(_config);
      return deferred.promise;
    }
    $http({
      method: 'GET',
      url: '/api/now/sp/agent_chat/portal/' + _portalId + '/config'
    }).then(function(response) {
      if (response.data.result && response.data.result.id !== null) {
        _config.isVisible = true;
      }
      deferred.resolve(_config);
    });
    return deferred.promise;
  }

  function _handleEvent(event, payload) {
    (_handlers[event] || []).forEach(function(handler) {
      handler(payload);
    })
  }

  function _initEventHandlers() {
    Object.keys(events).forEach(function(event) {
      _handlers[events[event]] = [];
    });
    $window.addEventListener('message', function(e) {
      _handleEvent(e.data);
    });
    $window.addEventListener('storage', function(e) {
      if (e.key !== STORAGE_KEY)
        return;
      _getConfig().then(function(config) {
        _handleEvent(events.STATE_CHANGE, config);
      });
    }, true);
  }

  function _initStateStorage() {
    var state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    Object.keys(state).forEach(function(key) {
      if (key !== _sessionId)
        delete state[key]
    });
    state[_sessionId] = state[_sessionId] || {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getFrameUrl() {
    var deferred = $q.defer();
    $http({
      method: 'GET',
      url: '/api/now/sp/agent_chat/portal/' + _portalId + '/context'
    }).then(
      function(response) {
        spContextManager.getContextForKey('global', true).then(function(globalContext) {
          spContextManager.getContextForKey(CONTEXT_KEY, true).then(function(acContext) {
            var params = {};
            params['portal'] = globalContext.portal.url_suffix;
            params['page'] = globalContext.page.id;
            params['language'] = globalContext.language.user;
            _appendParams(spContextManager.getContextForKey('record') || {}, params);
            _appendParams(acContext, params);
            if (response.data && response.data.result)
              _appendParams(response.data.result, params);
            deferred.resolve(DEFAULT_FRAME_URL + _buildParamString(params));
          });
        });
      },
      function(response) {
        console.error('Unable to retrieve SP Agent Chat Context. Error: ' + response.data.error.message);
        deferred.resolve(DEFAULT_FRAME_URL);
      });
    return deferred.promise;
  }

  function setState(config) {
    var state = JSON.parse(localStorage.getItem(STORAGE_KEY));
    state[_sessionId][$location.path()] = {
      is_open: config.isOpen
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function subscribe(event, handler) {
    var eventHandlers = _handlers[event];
    if (Array.isArray(eventHandlers))
      eventHandlers.push(handler);
  }

  function registerParam(key, value) {
    if (typeof value !== 'string')
      throw new Error('Value for the "' + key + '" agent chat param must be of type "string"');
    spContextManager.getContextForKey(CONTEXT_KEY, true).then(function(context) {
      context[key] = value;
      spContextManager.updateContextForKey(CONTEXT_KEY, context);
    });
  }

  function init(portalId) {
    if (_initialized || _initializing) {
      return $q(function(resolve) {
        resolve(_config);
      });
    }
    _initializing = true;
    _url = $location.path();
    _sessionId = $window.NOW.session_id;
    _portalId = portalId;
    _initStateStorage();
    return $q(function(resolve) {
      _initEventHandlers();
      spContextManager.init().then(function() {
        spContextManager.addContext(CONTEXT_KEY, {});
        _getConfig().then(function(config) {
          _initialized = true;
          _initializing = false;
          resolve(config);
        });
      });
    });
  }
  return {
    init: init,
    events: events,
    subscribe: subscribe,
    getFrameUrl: getFrameUrl,
    setState: setState,
    registerParam: registerParam
  };
});;