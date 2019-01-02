/*! RESOURCE: /scripts/app.ng_chat/util/service.hotKeyHandler.js */
angular.module("sn.connect.util").factory("hotKeyHandler", function(snHotKey) {
  "use strict";
  var activeHotKeys = {};
  var html = angular.element('html')[0];
  var oldKeyDown = html.onkeydown;

  function addHotKey(hotKey) {
    if (!arguments.length)
      return false;
    if (!hotKey instanceof snHotKey)
      hotKey = new snHotKey(hotKey);
    activeHotKeys[hotKey.key] = activeHotKeys[hotKey.key] || [];
    activeHotKeys[hotKey.key].push(hotKey);
    return hotKey;
  }

  function removeHotKey(hotKey) {
    if (!hotKey instanceof snHotKey || !activeHotKeys[hotKey.key].length)
      return false;
    var loc = activeHotKeys[hotKey.key].indexOf(hotKey);
    if (loc !== -1)
      return activeHotKeys[hotKey.key].splice(loc, 1);
    return false;
  }
  html.onkeydown = function(e) {
    if (typeof oldKeyDown === "function")
      oldKeyDown();
    angular.forEach(activeHotKeys[e.keyCode], function(handler) {
      handler.trigger(e)
    })
  };
  return {
    add: addHotKey,
    remove: removeHotKey
  }
});