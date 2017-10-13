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
        if (!frame.data('keyboard-js')) {
          frame.data('keyboard-js', true);
          this.children[index] = window.top.KeyboardJS(frame[0]);
          bindings = this.primary.keyBindingGroups;
          for (var j = 0; j < bindings.length; j++) {
            if (bindings[j]) {
              for (var i = 0; i < bindings[j].length; i++) {
                binding = bindings[j][i];
                this.children[index].bind.key(binding.keyCombo, binding.callback, binding.endCallback);
              }
            }
          }
        }
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
            $(this.document).unbind('.keyJS');
            $(this).unbind('.keyJS');
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