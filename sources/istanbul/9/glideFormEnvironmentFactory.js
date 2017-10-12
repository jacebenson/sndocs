/*! RESOURCE: /scripts/sn/common/clientScript/angular/glideFormEnvironmentFactory.js */
angular.module('sn.common.clientScript').factory('glideFormEnvironmentFactory', function(
  $q,
  $window,
  $timeout,
  glideFormFieldFactory,
  glideAjaxFactory,
  glideRecordFactory,
  i18n,
  glideModalFactory,
  jQueryRequestShim
) {
  'use strict';
  var factory = $window.glideFormEnvironmentFactory;
  angular.extend(factory.defaultExtensionPoints, {
    GlideAjax: glideAjaxFactory.getClass(),
    GlideRecord: glideRecordFactory.getClass(),
    getMessage: i18n.getMessage,
    getMessages: i18n.getMessages,
    $: jQueryRequestShim
  });
  factory.createInitializer = function(g_form, g_user, g_scratchpad, clientScripts, uiPolicies, g_modal) {
    if (typeof g_modal === 'undefined') {
      g_modal = glideModalFactory.create();
    }
    var g_env = glideFormEnvironmentFactory.create(g_form, g_scratchpad, g_user, g_modal);
    if (clientScripts && clientScripts.messages) {
      for (var key in clientScripts.messages) {
        i18n.loadMessage(key, clientScripts.messages[key]);
      }
    }
    return function() {
      g_env.initScripts(clientScripts);
      if (uiPolicies && (uiPolicies.length > 0)) {
        g_env.initUIPolicyScripts(uiPolicies);
      }
      return g_env;
    };
  };
  factory.createWithConfiguration = function(g_form, g_user, g_scratchpad, clientScripts, uiPolicies, g_modal) {
    if (typeof g_modal === 'undefined') {
      g_modal = glideModalFactory.create();
    }
    var g_env = glideFormEnvironmentFactory.create(g_form, g_scratchpad, g_user, g_modal);
    if (clientScripts && clientScripts.messages) {
      for (var key in clientScripts.messages) {
        i18n.loadMessage(key, clientScripts.messages[key]);
      }
    }
    return {
      g_env: g_env,
      initialize: function() {
        g_env.initScripts(clientScripts);
        if (uiPolicies && (uiPolicies.length > 0)) {
          g_env.initUIPolicyScripts(uiPolicies);
        }
      }
    };
  };
  var FIELDS_INITIALIZED_INTERVAL = 195;
  factory.onFieldsInitialized = function(fields) {
    var $fieldsReady = $q.defer();
    var $readyTimeout = $timeout(checkFormFields, FIELDS_INITIALIZED_INTERVAL);

    function checkFormFields() {
      var ready = fields.reduce(function(previous, field) {
        return previous && glideFormFieldFactory.isInitialized(field);
      }, true);
      if (!ready) {
        $readyTimeout = $timeout(checkFormFields, FIELDS_INITIALIZED_INTERVAL);
        return;
      }
      $fieldsReady.resolve();
    }
    return $fieldsReady.promise;
  };
  return factory;
});; Script "' + cs.name + '": ' + e);
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