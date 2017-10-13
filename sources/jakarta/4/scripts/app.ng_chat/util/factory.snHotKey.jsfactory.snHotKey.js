/*! RESOURCE: /scripts/app.ng_chat/util/factory.snHotKey.js */
angular.module("sn.connect.util").factory("snHotKey", function() {
  "use strict";
  var commonKeys = {
    "ENTER": 13,
    "TAB": 9,
    "ESC": 27,
    "ESCAPE": 27,
    "SPACE": 32,
    "LEFT": 37,
    "UP": 38,
    "RIGHT": 39,
    "DOWN": 40
  };
  var modKeys = {
    "SHIFT": "shiftKey",
    "CTRL": "ctrlKey",
    "CONTROL": "ctrlKey",
    "ALT": "altKey",
    "OPT": "altKey",
    "OPTION": "altKey",
    "CMD": "metaKey",
    "COMMAND": "metaKey",
    "APPLE": "metaKey",
    "META": "metaKey"
  };

  function HotKey(options) {
    options = options || {};
    this.callback = angular.isFunction(options.callback) ? options.callback : void(0);
    this.modifiers = {
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
      metaKey: false
    };
    if (typeof options.key === "number")
      this.key = options.key;
    else if (typeof options.key === "string") {
      if (options.key.length === 1)
        this.key = options.key.toUpperCase().charCodeAt(0);
      else
        this.key = commonKeys[options.key.toUpperCase()];
    }
    if (options.modifiers) {
      var modifier;
      if (typeof options.modifiers === "string") {
        modifier = modKeys[options.modifiers.toUpperCase()];
        this.modifiers[modifier] = true;
      } else if (angular.isArray(options.modifiers)) {
        for (var i = 0, len = options.modifiers.length; i < len; i++) {
          modifier = modKeys[options.modifiers[i].toUpperCase()];
          this.modifiers[modifier] = true;
        }
      }
    }
  }
  HotKey.prototype.trigger = function(e) {
    for (var key in this.modifiers)
      if (this.modifiers.hasOwnProperty(key))
        if (this.modifiers[key] !== e[key])
          return;
    this.callback(e);
  };
  return HotKey;
});