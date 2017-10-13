/*! RESOURCE: /scripts/sn/common/resources/appResourcesProvider.js */
angular.module('sn.common.resources').provider('appResources', function(i18nProvider) {
  'use strict';
  var GLOBAL_RESOURCES_KEY = 'SN_APP_RESOURCES';
  if (!angular.isDefined(window[GLOBAL_RESOURCES_KEY])) {
    var $log = angular.injector(['ng']).get('$log')
    $log.warn('AppResources not defined! Check plugin configurations.');
  }
  var _resources = window[GLOBAL_RESOURCES_KEY] || {};
  var _properties = _resources['properties'] || {};
  var _messages = _resources['messages'] || [];
  var _templates = _resources['templates'] || {};
  var _currentUser = _resources['current_user'];
  var _sessionToken = _resources['current_session_token'];
  window[GLOBAL_RESOURCES_KEY] = null;
  _resources = null;
  if (_sessionToken) {
    window.g_ck = _sessionToken;
  }
  _loadMessages();

  function getProperty(name, defaultValue) {
    var value = _properties[name];
    if (!angular.isDefined(value)) {
      value = defaultValue;
    }
    return value;
  }

  function getBooleanProperty(name) {
    var val = getProperty(name);
    return val === "true";
  }

  function getProperties() {
    return _properties;
  }

  function isCurrentUserLoggedIn() {
    return angular.isDefined(_currentUser) && angular.isDefined(_currentUser.user_id);
  }

  function getCurrentUser() {
    return _currentUser;
  }

  function _loadMessages() {
    if (_messages) {
      i18nProvider.preloadMessages(_messages);
    }
    _messages = null;
  }

  function _loadTemplates($templateCache) {
    if (_templates) {
      angular.forEach(_templates, function(template) {
        var url = template.url;
        if (url.charAt(0) === '/') {
          url = url.substring(1);
        }
        $templateCache.put(url, template.content);
      });
    }
    _templates = null;
  }
  this.getProperty = getProperty;
  this.getBooleanProperty = getBooleanProperty;
  this.isCurrentUserLoggedIn = isCurrentUserLoggedIn;
  this.getCurrentUser = getCurrentUser;
  this.getProperties = getProperties;
  this.$get = function($templateCache) {
    _loadTemplates($templateCache);
    return {
      getProperty: getProperty,
      getBooleanProperty: getBooleanProperty,
      getProperties: getProperties,
      isCurrentUserLoggedIn: isCurrentUserLoggedIn,
      getCurrentUser: getCurrentUser
    };
  };
}).run(function(appResources) {});;