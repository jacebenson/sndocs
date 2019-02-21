/*! RESOURCE: /scripts/keyboard/KeyboardRegistry.js */
window.top.validKeys = {
  "backspace": 8,
  "tab": 9,
  "enter": 13,
  "shift": 16,
  "ctrl": 17,
  "alt": 18,
  "pause": 19,
  "break": 19,
  "capslock": 20,
  "escape": 27,
  "esc": 27,
  "space": 32,
  "spacebar": 32,
  "pageup": 33,
  "pagedown": 34,
  "end": 35,
  "home": 36,
  "left": 37,
  "up": 38,
  "right": 39,
  "down": 40,
  "insert": 45,
  "delete": 46,
  "0": 48,
  "1": 49,
  "2": 50,
  "3": 51,
  "4": 52,
  "5": 53,
  "6": 54,
  "7": 55,
  "8": 56,
  "9": 57,
  "a": 65,
  "b": 66,
  "c": 67,
  "d": 68,
  "e": 69,
  "f": 70,
  "g": 71,
  "h": 72,
  "i": 73,
  "j": 74,
  "k": 75,
  "l": 76,
  "m": 77,
  "n": 78,
  "o": 79,
  "p": 80,
  "q": 81,
  "r": 82,
  "s": 83,
  "t": 84,
  "u": 85,
  "v": 86,
  "w": 87,
  "x": 88,
  "y": 89,
  "z": 90,
  "meta": 91,
  "command": 91,
  "windows": 91,
  "win": 91,
  "_91": 92,
  "select": 93,
  "num0": 96,
  "num1": 97,
  "num2": 98,
  "num3": 99,
  "num4": 100,
  "num5": 101,
  "num6": 102,
  "num7": 103,
  "num8": 104,
  "num9": 105,
  "multiply": 106,
  "add": 107,
  "subtract": 109,
  "decimal": 110,
  "divide": 111,
  "f1": 112,
  "f2": 113,
  "f3": 114,
  "f4": 115,
  "f5": 116,
  "f6": 117,
  "f7": 118,
  "f8": 119,
  "f9": 120,
  "f10": 121,
  "f11": 122,
  "f12": 123,
  "numlock": 144,
  "num": 144,
  "scrolllock": 145,
  "scroll": 145,
  "semicolon": 186,
  "equal": 187,
  "equalsign": 187,
  "comma": 188,
  "dash": 189,
  "period": 190,
  "slash": 191,
  "forwardslash": 191,
  "graveaccent": 192,
  "openbracket": 219,
  "backslash": 220,
  "closebracket": 221,
  "singlequote": 222
};
(function patchKeyboardJs(window) {
  var parentKeyboardJS = window.KeyboardJS;
  window.KeyboardJS = function() {
    var patchedKeyboardJS = parentKeyboardJS.apply(this, arguments);
    patchedKeyboardJS.locale.add("snow:us", window.top.validKeys);
    patchedKeyboardJS.locale.set("snow:us");
    return patchedKeyboardJS;
  };
})(window);
var KeyboardRegistry = function(context) {
  this.initialize(context);
}
KeyboardRegistry.prototype = {
  mainFrame: "gsft_main",
  formFrame: "gsft_main_form",
  initialize: function(context) {
    var primary = window.KeyboardJS(window);
    var children = new Object();
    if ($j(window.document).find('iframe').length > 0) {
      var frames = $j(window.document).find('iframe');
      for (var i = 0; i < frames.length; i++) {
        var frameElem = frames.get(i);
        var index = $j(frameElem).attr('name');
        var fWindow = frameElem.contentWindow;
        children[index] = window.KeyboardJS(fWindow, frameElem);
      }
    }
    this.primary = primary;
    this.children = children;
  },
  bind: function(keyCombo, onDownCallback, onUpCallbackOrData, data) {
    var obj = {
      registry: this,
      global: function(exclude) {
        return this._selector(null, null, null, exclude);
      },
      formFrame: function() {
        return this.frame(this.registry.formFrame);
      },
      form: function(id, name, action, method) {
        var elementName = 'form';
        var attrMap1 = new Object();
        var attrMap2 = new Object();
        attrMap1['id'] = attrMap2['id'] = id;
        attrMap1['name'] = attrMap2['name'] = name;
        attrMap1['action'] = attrMap2['action'] = action;
        attrMap1['method'] = method != null ? method.toLowerCase() : null;
        attrMap2['method'] = method != null ? method.toUpperCase() : null;
        return this._selector(this._buildSelector(elementName, attrMap1, attrMap2));
      },
      frame: function(name, selector, exact) {
        return this._selector(selector, name, exact);
      },
      selector: function(selector, exact) {
        return this._selector(selector, null, exact);
      },
      _selector: function(selector, frameName, exact, exclude) {
        var onDownCallback = this.onDownCallback;
        var getEventTarget = this._getEventTarget;
        var onUpCallback = this.onUpCallback;
        var data = typeof onUpCallback === 'function' || onUpCallback == null ? this.data : onUpCallback;
        var callback = function(event, keys, combo, callback) {
          if (callback == null || typeof callback !== 'function')
            return true;
          var target = getEventTarget(event)
          var isMatch = selector == null || $j(target).is(selector);
          if (!isMatch && exact)
            return true;
          if (!isMatch) {
            $j(target).parents().each(function() {
              isMatch = $j(this).is(selector);
              if (isMatch)
                return false;
            });
            if (!isMatch)
              return true;
          }
          var e = !event ? window.event : event;
          e.data = data != null ? data : {};
          e.data._target = target;
          var output = callback(e, keys, combo);
          return output === false ? false : true;
        };
        var onDown = function(event, keys, combo) {
          return callback(event, keys, combo, onDownCallback);
        };
        var onUp = function(event, keys, combo) {
          return callback(event, keys, combo, onUpCallback);
        };
        frameName = this.registry.primary != null ? frameName :
          (frameName == null || frameName == this.registry.mainFrame ? this.registry.formFrame : 'dummy');
        exclude = frameName == null ? exclude : null;
        var response = new Object();
        if ((frameName == null || frameName == 'top' || $j.isEmptyObject(this.registry.children)) && (exclude == null || exclude != 'top')) {
          response['top'] = this.registry.primary.bind.key(this.keyCombo, onDown, onUp);
        }
        var c = typeof window.console == "undefined" ? {
          log: function(str) {}
        } : window.console;
        for (var key in this.registry.children) {
          if ((frameName == null || frameName == key) && (exclude == null || exclude != key)) {
            response[key] = this.registry.children[key].bind.key(this.keyCombo, onDown, onUp);
          }
        }
        if (frameName == null || frameName != 'dummy') {
          var fName = frameName != null && this.registry.children[key] != null ? frameName : null;
          var logging = false;
          if (logging && (fName != null || frameName == null || $j.isEmptyObject(this.registry.children)) &&
            (exclude == null || fName != exclude)) {
            c.log("KeyboardRegistry: The '" + this.keyCombo + "' key has been bound to the " +
              (selector != null ? "selector '" + selector + "' " : "document ") + (exact ? "as an exact match " : "as a parent match ") +
              (fName != null ? ("to frame '" + fName + "'") : "to all frames") + ".");
          }
        }
        return {
          "clear": function() {
            for (var key in response) {
              var keyBindingGroups = response[key].clear();
            }
          }
        }
      },
      _buildSelector: function(selector, attrMap1, attrMap2) {
        var sel1 = this._buildSelector0(selector, attrMap1);
        if (attrMap2 != null) {
          var sel2 = this._buildSelector0(selector, attrMap2);
          return sel1 + "," + sel2;
        } else {
          return sel1;
        }
      },
      _buildSelector0: function(selector, attrMap) {
        for (var key in attrMap) {
          if (attrMap[key] != null) {
            selector += '[' + key + '="' + attrMap[key] + '"]';
          }
        }
        return selector;
      },
      _getEventTarget: function(e) {
        if (!e) var e = window.event;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        if (targ.nodeType == 3)
          targ = targ.parentNode;
        return targ;
      }
    };
    obj.keyCombo = keyCombo.toLowerCase();
    obj.onDownCallback = onDownCallback;
    obj.onUpCallback = onUpCallbackOrData;
    obj.data = data;
    return obj;
  },
  toString: function() {
    return "KeyboardRegistry";
  }
};;