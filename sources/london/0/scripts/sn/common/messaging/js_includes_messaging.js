/*! RESOURCE: /scripts/sn/common/messaging/js_includes_messaging.js */
/*! RESOURCE: /scripts/doctype/CustomEventManager.js */
var NOW = NOW || {};
var CustomEventManager = (function(existingCustomEvent) {
      "use strict";
      var events = (existingCustomEvent && existingCustomEvent.events) || {};
      var isFiringFlag = false;
      var trace = false;
      var suppressEvents = false;
      var NOW_MSG = 'NOW.PostMessage';

      function observe(eventName, fn) {
        if (trace)
          jslog("$CustomEventManager observing: " + eventName);
        on(eventName, fn);
      }

      function on(name, func) {
        if (!func || typeof func !== 'function')
          return;
        if (typeof name === 'undefined')
          return;
        if (!events[name])
          events[name] = [];
        events[name].push(func);
      }

      function un(name, func) {
        if (!events[name])
          return;
        var idx = -1;
        for (var i = 0; i < events[name].length; i++) {
          if (events[name][i] === func) {
            idx = i;
            break;
          }
        }