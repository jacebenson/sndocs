Plugin.create('glideDraggable', {
  initialize: function(elem, options) {
    this.options = Object.extend({
      iframeFix: true,
      observeTouch: false,
      distance: 1,
      cursor: 'move',
      triggerElem: elem,
      dragElem: elem,
      clone: false,
      onDragStart: function(event) {
        this.options.dragElem.setStyle({
          position: 'absolute'
        });
        this.options.onDrag.call(this, event);
      },
      onDrag: function(event) {
        this.options.dragElem.setStyle({
          top: (event.pageY - this._originalPos.offsetY) + 'px',
          left: (event.pageX - this._originalPos.offsetX) + 'px'
        });
      },
      onDragEnd: function(event) {}
    }, options || {});
    if (this.options.triggerElem.retrieve('draggable'))
      return;
    this._fDraggableMove = this._onDrag.bind(this);
    this._fDraggableEnd = this._onEnd.bind(this);
    this.options.triggerElem.observe('mousedown', this._onStart.bind(this));
    if (this.options.observeTouch === true)
      this.options.triggerElem.observe('touchdown', this._onStart.bind(this));
    this.options.triggerElem.store('draggable', this);
  },
  getClone: function() {
    return this._clone;
  },
  getOriginalPosition: function() {
    return this._originalPos;
  },
  _fixEvent: function(event) {
    event = event || window.event;
    if (!event.pageX) {
      event.pageX = event.clientX;
      event.pageY = event.clientY;
    }
    return event;
  },
  _distanceRequirementMet: function(event) {
    if (this.options.distance == 0 ||
      Math.abs(event.pageX - this._originalPos.pageX) >= this.options.distance ||
      Math.abs(event.pageY - this._originalPos.pageY) >= this.options.distance)
      return true;
    return false;
  },
  _onStart: function(event) {
    event = this._fixEvent(event);
    if (this.options.iframeFix === true) {
      $$('iframe').each(function(iframe) {
        if (!iframe.visible())
          return;
        var offset = iframe.cumulativeOffset();
        var shim = $(document.createElement('div'));
        shim.addClassName('glide-draggable-iframe');
        shim.setStyle({
          position: 'absolute',
          top: offset.top + 'px',
          left: offset.left + 'px',
          width: iframe.measure('border-box-width') + 'px',
          height: iframe.measure('border-box-height') + 'px',
          display: 'block',
          zIndex: 9998,
          backgroundColor: (Prototype.Browser.IE && !isMSIE10) ? '#fff' : 'transparent',
          opacity: '0',
          filter: 'alpha(opacity=0)'
        });
        document.body.appendChild(shim);
      });
    }
    this._originalPos = {
      pageX: event.pageX,
      pageY: event.pageY,
      offsetX: event.layerX || event.offsetX,
      offsetY: event.layerY || event.offsetY
    };
    document.body.focus();
    document.onselectstart = function() {
      return false;
    };
    document.observe('mousemove', this._fDraggableMove);
    document.observe('mouseup', this._fDraggableEnd);
    if (this.options.observeTouch === true) {
      document.observe('touchmove', this._fDraggableMove);
      document.observe('touchup', this._fDraggableEnd);
    }
    this._isDragging = false;
    event.stop();
  },
  _onDrag: function(event) {
    event = this._fixEvent(event);
    if (!this._isDragging) {
      if (this._distanceRequirementMet(event)) {
        this._docOverlay = $(document.createElement('div'));
        this._docOverlay.setStyle({
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          display: 'block',
          zIndex: 9999,
          cursor: this.options.cursor,
          backgroundColor: (Prototype.Browser.IE && !isMSIE10) ? '#fff' : 'transparent',
          opacity: '0',
          filter: 'alpha(opacity=0)'
        });
        document.body.appendChild(this._docOverlay);
        if (this.options.clone) {
          this._clone = Element.clone(this.options.dragElem, true);
          var offsets = this.options.dragElem.cumulativeOffset();
          this._clone.writeAttribute('id', '');
          this._clone.setStyle({
            position: 'absolute',
            zIndex: 9999,
            top: offsets.top + 'px',
            left: offsets.left + 'px',
            height: this.options.dragElem.getHeight() + 'px',
            width: this.options.dragElem.getWidth() + 'px'
          });
          document.body.appendChild(this._clone);
        }
        if (this.options.cursor) {
          this._origCursor = this.options.dragElem.style.cursor;
          this.options.dragElem.style.cursor = this.options.cursor;
        }
        this._isDragging = true;
        this.options.onDragStart.call(this, event);
      }
      return;
    }
    this.options.onDrag.call(this, event);
  },
  _onEnd: function(event) {
    event = this._fixEvent(event);
    if (this.options.iframeFix === true) {
      $$('div.glide-draggable-iframe').each(function(elem) {
        elem.remove();
      });
    }
    document.onselectstart = null;
    document.stopObserving('mousemove', this._fDraggableMove);
    document.stopObserving('mouseup', this._fDraggableEnd);
    if (this.options.observeTouch === true) {
      document.stopObserving('touchmove', this._fDraggableMove);
      document.stopObserving('touchup', this._fDraggableEnd);
    }
    if (this._isDragging) {
      this._docOverlay.remove();
      if (this._origCursor)
        this.options.dragElem.style.cursor = this._origCursor;
      this.options.onDragEnd.call(this, event);
      if (this.options.clone && this._clone && this._clone.parentNode)
        this._clone.remove();
    }
    this._isDragging = false;
  },
  toString: function() {
    return 'glideDraggable';
  }
});