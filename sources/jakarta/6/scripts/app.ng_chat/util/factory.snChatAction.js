/*! RESOURCE: /scripts/app.ng_chat/util/factory.snChatAction.js */
angular.module("sn.connect.util").factory("snChatAction", function(snHotKey) {
  "use strict";
  var order = 100;

  function defaultOrder() {
    return order += 10;
  }

  function ChatAction(config) {
    this.name = config.name || "";
    this.id = config.id || this.name;
    this.icon = config.icon || "";
    if (config.order && typeof config.order === "string")
      config.order = parseInt(config.order);
    this.$order = typeof config.order === "number" ? config.order : defaultOrder();
    this.numArgs = config.numArgs || 0;
    this.requiresArgs = !!config.requiresArgs;
    this.description = config.description || "";
    this.isActive = config.isActive || false;
    this.showInMenu = angular.isUndefined(config.showInMenu) ? true : !!config.showInMenu;
    if (angular.isFunction(config.isVisible))
      this.isVisible = config.isVisible;
    else {
      var isVisibleValue = angular.isUndefined(config.isVisible) ? true : config.isVisible;
      this.isVisible = function() {
        return isVisibleValue;
      };
    }
    this.shortcut = "/" + config.shortcut;
    this.hint = this.shortcut;
    this.argumentHint = config.argumentHint || '';
    if (this.requiresArgs)
      this.hint += "     " + this.argumentHint;
    this.action = angular.isFunction(config.action) ? config.action : void(0);
    if (config.hotKey) {
      if (config.hotKey instanceof snHotKey)
        this.hotKey = config.hotKey;
      else
        this.hotKey = new snHotKey(config.hotKey);
      this.hotKey.callback = this.trigger;
    }
  }
  ChatAction.prototype.trigger = function() {
    if (this.isValid() && this.isVisible(arguments[0]))
      this.action.apply(this, arguments);
  };
  ChatAction.prototype.isValid = function() {
    return this.action && this.id;
  };
  ChatAction.prototype.canRun = function(commandText) {
    return this.shortcut.toLowerCase().indexOf(commandText.trim().toLowerCase()) === 0;
  };
  return ChatAction;
});;