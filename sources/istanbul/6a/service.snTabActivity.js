/*! RESOURCE: /scripts/sn/common/util/service.snTabActivity.js */
angular.module("sn.common.util").service("snTabActivity", function($window, $timeout, $rootElement, $document) {
      "use strict";
      var activeEvents = ["keydown", "DOMMouseScroll", "mousewheel", "mousedown", "touchstart", "mousemove", "mouseenter", "input", "focus", "scroll"],
        defaultIdle = 75000,
        isPrimary = true,
        idleTime = 0,
        isVisible = true,
        idleTimeout = void(0),
        pageIdleTimeout = void(0),
        hasActed = false,
        appName = $rootElement.attr('ng-app') || "",
        storageKey = "sn.tabs." + appName + ".activeTab";
      var callbacks = {
        "tab.primary": [],
        "tab.secondary": [],
        "activity.active": [],
        "activity.idle": [{
          delay: defaultIdle,
          cb: function() {}
        }]
      };
      $window.tabGUID = $window.tabGUID || createGUID();

      function getActiveEvents() {
        return activeEvents.join(".snTabActivity ") + ".snTabActivity";
      }

      function setAppName(an) {
        appName = an;
        storageKey = "sn.tabs." + appName + ".activeTab";
        makePrimary(true);
      }

      function createGUID(l) {
        l = l || 32;
        var strResult = '';
        while (strResult.length < l)
          strResult += (((1 + Math.random() + new Date().getTime()) * 0x10000) | 0).toString(16).substring(1);
        return strResult.substr