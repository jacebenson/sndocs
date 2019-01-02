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
        return strResult.substr(0, l);
      }

      function ngObjectIndexOf(arr, obj) {
        for (var i = 0, len = arr.length; i < len; i++)
          if (angular.equals(arr[i], obj))
            return i;
        return -1;
      }
      var detectedApi,
        apis = [{
          eventName: 'visibilitychange',
          propertyName: 'hidden'
        }, {
          eventName: 'mozvisibilitychange',
          propertyName: 'mozHidden'
        }, {
          eventName: 'msvisibilitychange',
          propertyName: 'msHidden'
        }, {
          eventName: 'webkitvisibilitychange',
          propertyName: 'webkitHidden'
        }];
      apis.some(function(api) {
        if (angular.isDefined($document[0][api.propertyName])) {
          detectedApi = api;
          return true;
        }
      });
      if (detectedApi)
        $document.on(detectedApi.eventName, function() {
            if (!$document[0][detectedApi.propertyName]) {
              makePrimary();
              isVisible = true;
            } else {
              if (!idleTimeout && !idleTime)
                wait