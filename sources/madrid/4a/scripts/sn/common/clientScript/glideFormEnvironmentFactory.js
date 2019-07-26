/*! RESOURCE: /scripts/sn/common/clientScript/glideFormEnvironmentFactory.js */
(function(exports, $log, undefined) {
  'use strict';
  var factory = exports.glideFormEnvironmentFactory = {
    create: createGlideFormEnvironment,
    createWithConfiguration: createWithConfiguration,
    defaultExtensionPoints: {
      'window': null,
      'document': null,
      '$': null,
      'jQuery': null,
      '$$': null,
      '$j': null,
      'angular': null,
      'snmCabrillo': null,
      'cabrillo': null,
      'NOW': window.NOW || {}
    }
  };

  function createWithConfiguration(g_form, g_user, g_scratchpad, clientScripts, uiPolicies, g_modal, validationScripts, g_ui_scripts) {
    if (typeof g_modal === 'undefined') {}
    var g_env = factory.create(g_form, g_scratchpad, g_user, g_modal, g_ui_scripts);
    if (clientScripts && clientScripts.messages) {
      for (var key in clientScripts.messages) {}
    }
    return {
      g_env: g_env,
      getUserGlideForm: g_env.getUserGlideForm,
      initialize: function() {
        g_env.initScripts(clientScripts, validationScripts);
        if (uiPolicies && (uiPolicies.length > 0)) {
          g_env.initUIPolicyScripts(uiPolicies);
        }
      }
    };
  };

  function createGlideFormEnvironment(g_form, g_scratchpad, g_user, g_modal, g_ui_scripts) {
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
    if (typeof g_ui_scripts !== 'undefined') {
      _extensionPoints['g_ui_scripts'] = g_ui_scripts;
    }
    var defaults = factory.defaultExtensionPoints;
    Object.keys(defaults).forEach(function(name) {
      registerExtensionPoint(name, defaults[name]);
    });
    var _isFormLoading = true;
    var _isTemplateLoading = false;
    var _onChangeScripts = {};
    var _validationScripts = {};
    var _onSubmitScripts = [];
    return {
      initScripts: initScripts,
      initUIPolicyScripts: initUIPolicyScripts,
      getExtensionPoints: getExtensionPoints,
      registerExtensionPoint: registerExtensionPoint,
      getUserGlideForm: getUserGlideForm
    };

    function getUserGlideForm() {
      var facade = {};
      Object.keys(g_form).forEach(function(key) {
        facade[key] = g_form[key];
      });
      facade.setValue = facade.setUserValue;
      return facade;
    }

    function initScripts(scriptMap, validationScripts) {
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
      if (validationScripts) {
        registerExtensionPoint('g_validation_script_field_count', 0);
        for (var k = 0; k < validationScripts.length; k++) {
          try {
            cs = validationScripts[k];
            script = _wrapScript(cs.script, ['value', 'fieldName'], 'validate');
            var fieldNames = cs.fields;
            var wrappedScript = _wrapExecuteClientScript(script, g_form, cs.name);
            fieldNames.forEach(function(fieldName) {
              if (!_validationScripts[fieldName]) {
                _validationScripts[fieldName] = [];
              }
              _validationScripts[fieldName].push(
                wrappedScript
              );
            });
          } catch (e) {
            _logError('CS:VALIDATE', 'Could not load Validation Client Script "' + cs.name + '": ' + e);
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
      if (_extensionPoints.hasOwnProperty(name)) {}
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
          isTemplate: g_form.$private.fieldState.isTemplateLoading(fieldName)
        };
        scripts.forEach(function(script) {
          script.call(null, scriptVariables);
        });
        g_form.$private.fieldState.setTemplateLoading(fieldName, false);
      }
    }

    function _onSubmitForm() {
      if (!_runValidationScripts()) {
        return false;
      }
      var result;
      for (var i = 0, iM = _onSubmitScripts.length; i < iM; i++) {
        result = _onSubmitScripts[i].call(null);
        if (result === false) {
          return result;
        }
      }
    }

    function _runValidationScripts() {
      var passedValidation = true;
      var fieldNames = Object.keys(_validationScripts);
      var totalFieldValidationsRequired = 0;
      var fieldLength = fieldNames.length;
      for (var list = 0, iM = fieldLength; list < iM; list++) {
        var fieldName = fieldNames[list];
        if (!g_form.isReadOnly(fieldName) && g_form.isVisible(fieldName))
          totalFieldValidationsRequired++;
      }
      registerExtensionPoint('g_validation_script_field_count', totalFieldValidationsRequired);
      for (var i = 0, iM = fieldNames.length; i < iM; i++) {
        var fieldName = fieldNames[i];
        if (g_form.isReadOnly(fieldName) || !g_form.isVisible(fieldName)) {
          continue;
        }
        var scripts = _validationScripts[fieldName];
        if (scripts.length > 0) {
          var scriptVariables = {
            value: g_form.getValue(fieldName),
            fieldName: fieldName
          };
          for (var j = 0, jM = scripts.length; j < jM; j++) {
            var result = scripts[j].call(null, scriptVariables);
            var isString = typeof result === 'string';
            if (result === false || isString) {
              if (isString) {
                g_form.showFieldMsg(fieldName, result, 'error');
                g_form.$private.setFieldInvalid(fieldName, true);
              }
              passedValidation = false;
            }
          }
        }
      }
      return passedValidation;
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