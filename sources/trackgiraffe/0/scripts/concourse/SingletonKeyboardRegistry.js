/*! RESOURCE: /scripts/concourse/SingletonKeyboardRegistry.js */
var SingletonKeyboardRegistry = (function($) {
  var instance;
  var windowNames = [];
  var createInstance = function() {
    instance = new ChildKeyboardRegistry();
    return instance;
  };
  var ChildKeyboardRegistry = function() {
    this.initialize(window);
  };
  ChildKeyboardRegistry.prototype = Object.create(KeyboardRegistry.prototype);
  ChildKeyboardRegistry.prototype.addFrame = function(frameWindow) {
    var bindings, binding, index, frame;
    if (frameWindow.name) {
      index = frameWindow.name;
      frame = $(frameWindow.parent.document).find('iframe[name=' + index + ']');
      if (frame.length) {
        $(frameWindow).bind('unload.keyJS', {
          context: window,
          index: index,
          children: this.children,
          registry: this
        }, function(e) {
          $(this.document).unbind('.keyJS');
          $(this).unbind('.keyJS');
        });
        $(frame).bind('load.keyJS', {
          children: this.children,
          index: index,
          win: window,
          registry: this
        }, function(e) {
          if (!this.contentWindow)
            return;
          e.data.children[e.data.index] = e.data.win.KeyboardJS(this.contentWindow, this, e.data.children[e.data.index]);
          $(this.contentWindow).bind('unload.keyJS', {
            index: e.data.index,
            children: e.data.children,
            registry: e.data.registry
          }, function(e) {
            $(frame).unbind('.keyJS');
          });
        });
      }
    }
  };
  if (window.self != window.top)
    return null;
  CustomEvent.on('navigation.complete', function(frame) {
    if (instance) {
      instance.addFrame(frame);
    }
  });
  return {
    getInstance: function() {
      if (!instance) {
        return createInstance();
      } else {
        return instance;
      }
    }
  }
})(jQuery);;