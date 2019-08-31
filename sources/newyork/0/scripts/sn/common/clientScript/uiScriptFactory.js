/*! RESOURCE: /scripts/sn/common/clientScript/uiScriptFactory.js */
(function(exports, undefined) {
  'use strict';
  exports.uiScriptFactory = {
    create: create
  };

  function create(scripts, $q) {
    var uiScripts = {
      getUIScript: function(name) {
        var script = uiScripts[name];
        if (!script) {
          console.error('No script registered with name: ' + name);
          return;
        }
        return ($q ? $q : function(fn) {
          return new Promise(fn);
        })(function(resolve) {
          return resolve(script);
        });
      }
    };
    if (scripts && scripts.length > 0) {
      scripts.forEach(function(script) {
        var name = script.name;
        var wrapped = createSandboxUIScript(script.name, script.script);
        if (wrapped) {
          uiScripts[name] = wrapped;
        }
      })
    }
    return uiScripts;
  }

  function createSandboxUIScript(name, script) {
    var uiScript = null;
    try {
      script = sandboxAnonymousFunction(script);
      var functionArgs = ['window', 'document'].concat(
        'return (function() { return ' + script + '; }).call(this);'
      );
      var fn = Function.apply({}, functionArgs);
      uiScript = fn.call(fn, [null, null])
    } catch (e) {}
    if (uiScript !== null && (typeof uiScript !== 'object' && typeof uiScript !== 'function')) {
      uiScript = null;
      console.warn('UI Script does not return an object or function: ' + name);
    }
    return uiScript;
  }

  function sandboxAnonymousFunction(script) {
    script = script.trim();
    var scriptLength = script.length;
    var modified = false;
    if (script.substr(-3) === '();') {
      script = script.substr(0, scriptLength - 3);
      modified = true;
    } else if (script.substr(-2) === '()') {
      script = script.substr(0, scriptLength - 2);
      modified = true;
    }
    if (modified) {
      script += '.call(this);';
    }
    return script;
  }
})(window);;