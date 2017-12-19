Plugin.create('tooltip', {
  HOVER_X_OFFSET: 15,
  HOVER_Y_OFFSET: 15,
  WINDOW_PADDING_TOP: 30,
  WINDOW_PADDING_RIGHT: 50,
  WINDOW_PADDING_BOTTOM: 20,
  initialize: function(elem, options) {
    if (elem.retrieve('tooltip'))
      return;
    this.options = Object.extend({
      load: false,
      loadMouseEvent: null,
      effect: 'toggle',
      fadeOutSpeed: "fast",
      predelay: 0,
      delay: 30,
      opacity: 1,
      tip: null,
      position: ['top', 'center'],
      ensureVisibility: true,
      offset: [0, 0],
      relative: false,
      cancelDefault: true,
      events: {
        def: 'mouseenter,mouseleave',
        input: 'focus,blur',
        widget: 'focus mouseenter,blur mouseleave',
        tooltip: 'mouseenter,mouseleave'
      },
      onTipInit: function() {},
      onBeforeHide: function() {},
      onHide: function() {},
      onBeforeShow: function() {},
      onShow: function() {},
      layoutElem: 'div',
      tipClass: 'tooltip'
    }, options || {});
    this.trigger = elem;
    this.shown = false;
    this.overTip = false;
    this.stopped = false;
    this.effect = this._effects[this.options.effect];
    if (typeof this.options.position == 'string')
      this.options.position = this.options.position.split(/,?\s/);
    var tn = this.trigger.tagName;
    var type = this.trigger.readAttribute('type');
    var isInput = tn == 'INPUT';
    var isWidget = isInput && (type == 'checkbox' || type == 'radio' || type == 'button' || type == 'submit' || tn == 'SELECT');
    var evt = this.options.events[type] || this.options.events[isInput ? (isWidget ? 'widget' : 'input') : 'def'];
    if (!this.effect)
      throw 'Nonexistent effect "' + this.options.effect + '"';
    evt = evt.split(/,\s*/);
    if (evt.length != 2)
      throw 'Tooltip: Bad events configuration for: ' + type;
    this.showEvents = evt[0].split(' ');
    this.hideEvents = evt[1].split(' ');
    if (this.options.cancelDefault === true) {
      this.title = this.trigger.readAttribute('title');
      this.trigger.writeAttribute('title', '');
    }
    for (var i = 0, l = this.showEvents.length; i < l; i++) {
      this.trigger.observe(this.showEvents[i], this._eventShow.bind(this));
    }
    for (var i = 0, l = this.hideEvents.length; i < l; i++) {
      this.trigger.observe(this.hideEvents[i], this._eventHide.bind(this));
    }
    this.trigger.store('tooltip', this);
    this.docDirection = $$('html')[0].dir === 'rtl' ? 'rtl' : 'ltr';
  },
  _eventShow: function(event) {
    clearTimeout(this.pretimer);
    clearTimeout(this.timer);
    if (this.preventShowEvent === true)
      return;
    if (this.options.predelay) {
      this.pretimer = setTimeout(function() {
        this.show(event);
      }.bind(this), this.options.predelay);
    } else {
      this.show(event);
    }
  },
  _eventHide: function(event) {
    this.overTip = false;
    clearTimeout(this.pretimer);
    clearTimeout(this.timer);
    if (this.preventHideEvent === true)
      return;
    if (this.options.delay) {
      this.timer = setTimeout(function() {
        if (!this.overTip)
          this.hide(event);
      }.bind(this), this.options.delay);
    } else if (!this.overTip) {
      this.hide(event);
    }
  },
  _effects: {
    toggle: [
      function(done) {
        var o = this.options.opacity;
        if (o < 1) {
          this.tip.setStyle({
            opacity: o
          });
        }
        this.tip.show();
        done.call();
      },
      function(done) {
        this.tip.hide();
        done.call();
      }
    ],
    fade: [
      function(done) {
        this.tip.fadeTo(this.options.fadeInSpeed, this.options.opacity, done);
      },
      function(done) {
        this.tip.fadeOut(this.options.fadeOutSpeed, done);
      }
    ]
  },
  _getPosition: function(checkVisibility) {
    var pos = this._getPosition0(this.options.relative ? this.trigger.positionedOffset() : this.trigger.cumulativeOffset());
    if (checkVisibility === true) {
      var tipHeight = this.tip.measure('border-box-height');
      var tipWidth = this.tip.measure('border-box-width');
      var dims = document.viewport.getDimensions();
      var scrollTop = document.body.scrollTop;
      var scrollLeft = document.body.scrollLeft;
      if (this.options.relative) {
        if (scrollTop > 0) {
          if (pos.top - scrollTop < 0)
            pos.top = scrollTop;
          if (dims.height - (pos.top - scrollTop + tipHeight) < 0)
            pos.top = pos.top - tipHeight;
        } else {
          if (pos.top + tipHeight > dims.height)
            pos.top = pos.top - tipHeight;
        }
        if (scrollLeft > 0) {
          if (pos.left - scrollLeft <= 0)
            pos.left = scrollLeft;
          if (this.docDirection !== "rtl") {
            if (dims.width - (pos.left - scrollLeft + tipWidth) < 0)
              pos.left = pos.left - tipWidth;
          } else {
            pos.right = pos.left;
            return {
              top: pos.top,
              right: pos.right
            };
          }
        } else {
          if (this.docDirection !== "rtl") {
            if (pos.left + tipWidth > dims.width)
              pos.left = Math.max(0, pos.left - tipWidth);
          } else {
            pos.right = pos.left;
            return {
              top: pos.top,
              right: pos.right
            };
          }
        }
      } else {
        if (pos.top + tipHeight > dims.height)
          pos.top = dims.height - tipHeight;
        else if (pos.top < 0)
          pos.top = 0;
        if (pos.left + tipWidth > dims.width) {
          if (this.docDirection !== "rtl")
            pos.left = dims.width - tipWidth;
          else {
            var edgeWest = document.getElementById("edge_west");
            pos.right = edgeWest.style.width.split("px")[0];
            return {
              top: pos.top,
              right: pos.right
            };
          }
        } else if (pos.left < 0)
          pos.left = 0;
      }
    }
    return {
      top: pos.top,
      left: pos.left
    };
  },
  _getPosition0: function(offset) {
    var o = this.options;
    var top = offset.top,
      left = offset.left,
      pos = o.position[1],
      tipHeight = this.tip.measure('border-box-height'),
      triggerWidth = this.trigger.measure('border-box-width');
    top -= tipHeight - o.offset[1];
    left += triggerWidth + o.offset[0];
    if (/iPad/i.test(navigator.userAgent)) {
      top -= document.viewport.getScrollOffsets().top;
    } else {
      top -= this.trigger.cumulativeScrollOffset().top;
    }
    var height = tipHeight + this.trigger.measure('border-box-height');
    if (pos == 'top-baseline') {
      top += tipHeight
    }
    if (pos == 'center') {
      top += height / 2;
    }
    if (pos == 'bottom') {
      top += height;
    }
    pos = o.position[0];
    var width = this.tip.measure('border-box-width') + triggerWidth;
    if (pos == 'center') {
      left -= width / 2;
    }
    if (pos == 'left') {
      left -= width;
    }
    return {
      top: top,
      left: left
    };
  },
  show: function(event) {
    clearTimeout(this.timer);
    if (this.shown)
      return this;
    if (!this.tip) {
      var attr = this.trigger.readAttribute('data-tooltip');
      if (attr) {
        this.tip = $$(attr)[0] || null;
      } else if (this.options.tip) {
        this.tip = $$(this.options.tip)[0] || null;
      } else if (this.title) {
        this.tip = new Element(this.options.layoutElem);
        this.tip.addClassName(this.options.tipClass);
        this.tip.title = this.title;
        document.body.appendChild(this.tip);
      } else {
        if (!this.trigger || !this.trigger.parentNode)
          return;
        this.tip = this.trigger.next() || this.trigger.up().next();
      }
      if (!this.tip)
        throw 'Cannot find tooltip for: ' + this.trigger;
      if (!this.options.relative && this.tip.parentNode != document.body) {
        var tmp = this.tip.clone(true);
        this.tip.remove();
        this.tip = tmp;
        document.body.appendChild(this.tip);
      }
      for (var i = 0, l = this.showEvents.length; i < l; i++) {
        this.tip.observe(this.showEvents[i], function() {
          this.overTip = true;
        }.bind(this));
      }
      for (var i = 0, l = this.hideEvents.length; i < l; i++)
        this.tip.observe(this.hideEvents[i], this._eventHide.bind(this));
      this.options.onTipInit.call(this);
    }
    this.tip.stop(true, true);
    var pos = this._getPosition();
    if (this.title)
      this.tip.innerHTML = this.title;
    if (this.options.onBeforeShow.call(this, event) === false)
      return;
    pos = this._getPosition(this.options.ensureVisibility);
    if (pos.left)
      this.tip.setStyle({
        position: 'absolute',
        top: pos.top + 'px',
        left: pos.left + 'px'
      });
    else
      this.tip.setStyle({
        position: 'absolute',
        top: pos.top + 'px',
        right: pos.right + 'px'
      });
    if (isMSIE6 && !this._iframeShim) {
      var dims = this.tip.getDimensions();
      this._iframeShim = $(document.createElement('iframe'));
      this._iframeShim.setStyle({
        top: pos.top + 'px',
        left: pos.left + 'px',
        height: dims.height + 'px',
        width: dims.width + 'px',
        position: 'absolute',
        zIndex: '10',
        filter: 'alpha(opacity=0)',
        opacity: 0
      });
      this._iframeShim.src = 'javascript:"<html></html>"';
      document.body.appendChild(this._iframeShim);
    }
    this.effect[0].call(this, function() {
      this.options.onShow.call(this, event);
      this.shown = true;
    }.bind(this));
    return this;
  },
  preventShow: function() {
    this.preventShowEvent = true;
  },
  hide: function(event) {
    clearTimeout(this.pretimer);
    if (!this.tip || !this.shown)
      return this;
    this.options.onBeforeHide.call(this, event);
    this.shown = false;
    this.overTip = false;
    this.preventHideEvent = false;
    if (isMSIE6 && this._iframeShim) {
      this._iframeShim.remove();
      this._iframeShim = null;
    }
    this.effect[1].call(this, function() {
      this.options.onHide.call(this, event);
    }.bind(this));
    return this;
  },
  updateIframeShim: function() {
    if (!this._iframeShim)
      return;
    var dims = this.tip.getDimensions();
    this._iframeShim.setStyle({
      height: dims.height + 'px',
      width: dims.width + 'px'
    });
    return this;
  },
  allowHide: function() {
    this.preventHideEvent = false;
  },
  preventHide: function() {
    this.preventHideEvent = true;
  },
  isShown: function() {
    return this.shown;
  },
  getOptions: function() {
    return this.options;
  },
  getTip: function() {
    return this.tip;
  },
  getTrigger: function() {
    return this.trigger;
  },
  toString: function() {
    return 'Tooltip';
  }
});