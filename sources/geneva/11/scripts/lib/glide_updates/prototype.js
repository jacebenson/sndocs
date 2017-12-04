/*! RESOURCE: /scripts/lib/glide_updates/prototype.js */
Object.extendsObject = function() {
  return Class.create.apply(null, arguments).prototype;
}
Prototype.ScriptFragmentDetailed = '<script(?:[^>]*type=\"([^>]*?)\")?(?:[^>]*src=\"([^>]*?)\")?[^>]*>([\\S\\s]*?)<\/script>';
var g_evalScriptCache = {};
Object.extend(String.prototype, (function() {
  function extractScriptsDetailed() {
    var matchAll = new RegExp(Prototype.ScriptFragmentDetailed, 'img');
    var matchOne = new RegExp(Prototype.ScriptFragmentDetailed, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      var m = scriptTag.match(matchOne) || ['', '', '', ''];
      if (m[1] == 'application/xml')
        return;
      if (m[1] == 'text/html')
        return;
      if (m[1] == 'text/ng-template')
        return;
      return {
        script: m[3],
        src: m[2]
      };
    });
  }

  function evalScripts(evalGlobal) {
    (function _executer(scripts) {
      if (!scripts || scripts.length == 0)
        return;
      var script = scripts.shift();
      if (!script)
        return _executer(scripts);
      if (script.src) {
        if (!g_evalScriptCache[script.src]) {
          g_evalScriptCache[script.src] = {
            state: 'loading',
            scripts: scripts
          };
          ajaxRequest(script.src, null, true, function(r) {
            g_evalScriptCache[script.src].state = 'loaded';
            var toEvalScripts = g_evalScriptCache[script.src].scripts;
            if (r && r.responseText)
              evalScript(r.responseText, evalGlobal);
            return _executer(toEvalScripts);
          });
        } else if (g_evalScriptCache[script.src].state == 'loading') {
          g_evalScriptCache[script.src].scripts = g_evalScriptCache[script.src].scripts.concat(scripts);
          return;
        } else if (g_evalScriptCache[script.src].state == 'loaded')
          return _executer(scripts);
      } else {
        if (script.script)
          evalScript(script.script, evalGlobal);
        return _executer(scripts);
      }
    })(this.extractScriptsDetailed());
  }
  return {
    evalScripts: evalScripts,
    extractScriptsDetailed: extractScriptsDetailed
  };
})());

function evalScript(s, evalGlobal) {
  if (s.length == 0)
    return;
  if (!evalGlobal)
    return eval(s);
  if (window.execScript)
    return window.execScript(s);
  return window.eval ? window.eval(s) : eval(s);
}
if (document.getElementsByClassName && typeof Element.Methods.getElementsByClassName === "function")
  document.getElementsByClassName = function(instanceMethods) {
    function iter(name) {
      return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]";
    }
    instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ? function(element, className) {
      className = className.toString().strip();
      var cond = /\s/.test(className) ? $w(className).map(iter).join('') : iter(className);
      return cond ? document._getElementsByXPath('.//*' + cond, element) : [];
    } : function(element, className) {
      className = className.toString().strip();
      var elements = [],
        classNames = (/\s/.test(className) ? $w(className) : null);
      if (!classNames && !className)
        return elements;
      if (Object.isString(element))
        element = document.getElementById(element);
      Element.extend(element);
      var nodes = element.getElementsByTagName('*');
      className = ' ' + className + ' ';
      for (var i = 0, child, cn; child = nodes[i]; i++) {
        if (child.className && (cn = ' ' + child.className + ' ') &&
          (cn.include(className) || (classNames && classNames.all(function(name) {
            return !name.toString().blank() && cn.include(' ' + name + ' ');
          }))))
          elements.push(Element.extend(child));
      }
      return elements;
    };
    return function(className, parentElement) {
      return $(parentElement || document.body).getElementsByClassName(className);
    };
  }(Element.Methods);
Object.equals = function(o1, o2) {
  var i1 = 0,
    i2 = 0;
  for (var p in o1) {
    if (!o1 || !o2 || typeof o1[p] !== typeof o2[p] || ((o1[p] === null) !== (o2[p] === null)))
      return false;
    switch (typeof o1[p]) {
      case 'undefined':
        if (typeof o2[p] != 'undefined')
          return false;
        break;
      case 'object':
        if (o1[p] !== null && o2[p] !== null && (o1[p].constructor.toString() !== o2[p].constructor.toString() || !Object.equals(o1[p], o2[p])))
          return false;
        break;
      case 'function':
        if (p != 'equals' && o1[p].toString() != o2[p].toString())
          return false;
        break;
      default:
        if (o1[p] !== o2[p])
          return false;
    }
    i1++;
  }
  for (var p in o2) i2++;
  if (i1 != i2)
    return false;
  return true;
}
document.viewport['getDimensions'] = function() {
  var el = window.document.compatMode === 'CSS1Compat' && (!Prototype.Browser.Opera ||
    window.parseFloat(window.opera.version()) < 9.5) ? window.document.documentElement : window.document.body;
  return {
    width: el.clientWidth,
    height: el.clientHeight
  };
};;