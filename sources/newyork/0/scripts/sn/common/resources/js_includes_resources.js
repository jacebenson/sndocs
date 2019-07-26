/*! RESOURCE: /scripts/sn/common/resources/js_includes_resources.js */
/*! RESOURCE: /scripts/sn/common/resources/_module.js */
angular.module('sn.common.resources', [
  'sn.common.i18n'
]);;
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

      function getBoolea