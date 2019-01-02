/*! RESOURCE: /scripts/classes/event/CustomEventManager.js */
var CustomEventManager = Class.create(GwtObservable, {
  trace: false,
  initialize: function($super) {
    $super();
  },
  observe: function(eventName, fn) {
    if (this.trace)
      jslog("$CustomEventManager observing: " + eventName);
    this.on(eventName, fn);
  },
  fire: function(eventName, args) {
    if (this.trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
    return this.fireEvent.apply(this, arguments);
  },
  fireTop: function(eventName, args) {
    if (this.trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
    this.fireEvent.apply(this, arguments);
    var t = getTopWindow();
    if (t != null && window != t)
      t.CustomEvent.fireEvent(eventName, args);
  },
  fireAll: function(eventName, args) {
    if (this.trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
    var t = getTopWindow();
    if (t == null) {
      this.fireEvent.apply(this, arguments);
      return;
    }
    t.CustomEvent.fireEvent(eventName, args);
    for (var i = 0; i < t.length; i++) {
      try {
        if (!t[i])
          continue;
        if (t[i].CustomEvent && typeof t[i].CustomEvent.fireEvent == "function")
          t[i].CustomEvent.fireEvent(eventName, args);
      } catch (e) {}
    }
  },
  toString: function() {
    return 'CustomEventManager';
  }
});
window.NOW = window.NOW || {};
window.NOW.CustomEvent = new CustomEventManager();
if (typeof CustomEvent !== "undefined") {
  CustomEvent.observe = NOW.CustomEvent.observe.bind(NOW.CustomEvent);
  CustomEvent.fire = NOW.CustomEvent.fire.bind(NOW.CustomEvent);
  CustomEvent.fireTop = NOW.CustomEvent.fireTop.bind(NOW.CustomEvent);
  CustomEvent.fireAll = NOW.CustomEvent.fireAll.bind(NOW.CustomEvent);
  CustomEvent.on = NOW.CustomEvent.on.bind(NOW.CustomEvent);
  CustomEvent.un = NOW.CustomEvent.un.bind(NOW.CustomEvent);
  CustomEvent.unAll = NOW.CustomEvent.unAll.bind(NOW.CustomEvent);
  CustomEvent.forward = NOW.CustomEvent.forward.bind(NOW.CustomEvent);
  CustomEvent.isFiring = NOW.CustomEvent.isFiring.bind(NOW.CustomEvent);
  CustomEvent.fireEvent = NOW.CustomEvent.fireEvent.bind(NOW.CustomEvent);
} else {
  window.CustomEvent = NOW.CustomEvent;
};