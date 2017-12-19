var GlideOverlay = Class.create(GlideBox, {
  initialize: function($super, options) {
    var opts = Object.extend({
      closeOnEscape: true,
      isModal: true,
      id: typeof options == 'string' ? options : guid()
    }, options || {});
    opts.boxClass = [options.boxClass || '', 'glide_overlay'].join(' ');
    $super(opts);
    GlideOverlay.showMask();
    this.getBoxElement().observe('click', function(event) {
      event.stopPropagation();
      CustomEvent.fire(GlideEvent.WINDOW_CLICKED, event, window);
    });
    this.closeOnEscape(this.options.closeOnEscape);
  },
  isModal: function(b) {
    return this.options.isModal;
  },
  closeOnEscape: function(b) {
    if (!b && this._escapeCloseHandler) {
      $(document).stopObserving('keydown', this._escapeCloseHandler);
    } else if (b && !this._escapeCloseHandler) {
      this._escapeCloseHandler = function(event) {
        if (event.keyCode === Event.KEY_ESC)
          this.close();
      }.bind(this);
      $(document).observe('keydown', this._escapeCloseHandler);
    }
  },
  close: function($super, options) {
    if (this._isClosing === true)
      return;
    if (this._escapeCloseHandler) {
      $(document).stopObserving('keydown', this._escapeCloseHandler);
      this._escapeCloseHandler = null;
    }
    var opts = {
      timeout: this.options.fadeOutTime,
      closeMask: true
    };
    if (typeof options == 'number')
      opts.timeout = options;
    else
      Object.extend(opts, options || {});
    var mask = $('glide_expose_mask');
    if (this.isModal() && mask && opts.closeMask === true) {
      if (opts.timeout !== 0)
        mask.fadeOut(opts.timeout, function() {
          this.remove();
        });
      else
        mask.remove();
    }
    $super(opts.timeout);
  },
  toString: function() {
    return 'GlideOverlay';
  }
});
GlideOverlay.get = function(objIdOrElem) {
  if (objIdOrElem)
    return GlideBox.get(objIdOrElem);
  for (var i in g_glideBoxes) {
    var box = g_glideBoxes[i];
    if (box.toString() == 'GlideOverlay')
      return box;
  }
}
GlideOverlay.close = function(objIdOrElem, options) {
  if (objIdOrElem)
    return GlideBox.close(objIdOrElem, options);
  for (var i in g_glideBoxes) {
    var box = g_glideBoxes[i];
    if (box.toString() == 'GlideOverlay')
      return box.close(options);
  }
}
GlideOverlay.showMask = function() {
  if ($('grayBackground'))
    return;
  var mask = $('glide_expose_mask');
  if (!mask) {
    mask = $(document.createElement('div'));
    mask.id = 'glide_expose_mask';
    mask.className = 'glide_mask';
    document.body.appendChild(mask);
    mask.observe('click', function(event) {
      event.stopPropagation();
      CustomEvent.fire(GlideEvent.WINDOW_CLICKED, event, window);
    });
  }
  mask.show();
  return mask;
}
GlideOverlay.hideMask = function(boolRemove) {
  var mask = $('glide_expose_mask');
  if (mask)
    mask[boolRemove === true ? 'remove' : 'hide']();
}