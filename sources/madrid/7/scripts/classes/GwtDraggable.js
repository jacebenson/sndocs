/*! RESOURCE: /scripts/classes/GwtDraggable.js */
var GwtDraggable = Class.create(GwtObservable, {
      initialize: function(header, itemDragged) {
        this.header = $(header);
        if (!itemDragged)
          itemDragged = this.header;
        this.parentElement = getFormContentParent();
        this.setDraggable($(itemDragged));
        this.setCursor("move");
        this.setStart(this.genericStart.bind(this));
        this.setDrag(this.genericDrag.bind(this));
        this.setEnd(this.genericEnd.bind(this));
        this.scroll = false;
        this.differenceX = 0;
        this.differenceY = 0;
        this.shiftKey = false;
        this.fDrag = this.drag.bind(this);
        this.fEnd = this.end.bind(this);
        this.enable();
      },
      enable: function() {
        this.header.onmousedown = this.start.bind(this);
        this.header.ontouchstart = this.start.bind(this);
      },
      disable: function() {
        this.header.onmousedown = null;
        this.header.ontouchstart = null;
      },
      start: function(e) {
        e = getRealEvent(e);
        var ex, ey;
        if (e.type == 'touchstart') {
          ex = e.touches[0].pageX;
          ey = e.touches[0].pageY;
        } else {
          ex = e.clientX;
          ey = e.clientY;
        }
        if (this.getScroll()) {
          ex += getScrollX();
          ey += getScrollY();
        }
        this.differenceX = ex - grabOffsetLeft(this.draggable) + grabScrollLeft(this.draggable);
        this.differenceY = ey - grabOffsetTop(this.draggable) + grabScrollTop(this.draggable);
        this.shiftKey = e.shiftKey;
        Event.observe(this.parentElement, "mousemove", this.fDrag);
        Event.observe(this.parentElement, "mouseup", this.fEnd);
        Event.observe(this.parentElement, "touchmove", this.fDrag);
        Event.observe(this.parentElement, "touchend", this.fEnd);
        this.active = false;
        this._stopSelection(e);
        this.draggable.dragging_active = true;
        var ret = this.onDragStart(this, ex, ey, e);
        this.fireEvent("beforedrag", this, ex, ey, e);
        return ret;
      },
      destroy: function() {
        if (this.header) {
          this.header.onmousedown = null;
          this.header.ontouchstart = null;
        }
        this.header = null;
        this.draggable = null;
        this.parentElement = null;
      },
      drag: function(e) {
        if (!this.active) {
          createPageShim(this.parentElement);
          this.active = true;
        }
        this._stopSelection(e);
        e = getRealEvent(e);
        var ex, ey;
        if (e.type == 'touchmove') {
          ex = e.touches[0].pageX;
          ey = e.touches[0].pageY;
        } else {
          ex = e.clientX;
          ey = e.clientY;
        }
        if (this.getScroll()) {
          ex += getScrollX();
          ey += getScrollY();
        }
        var posX = parseInt(ex - this.differenceX);
        var posY = parseInt(ey - this.differenceY);
        var ret = this.onDrag(this, posX, posY, e);
        this.fireEvent("dragging", this, posX, posY, e);
        return ret;
      },
      end: function(e) {
          e = getRealEvent(e);
          Event.stopObserving(this.parentElement, "mousemove", this.fDrag);
          Event.stopObserving(this.parentElement, "mouseup", this.fEnd);
          Event.stopObserving(this.parentElement, "touchmove", this.fDrag);
          Event.stopObserving(this.parentElement, "touchend", this.fEnd);
          this.shiftKey = e.shiftKey;
          removePageShim(this.parentElement);
          this._restoreSelection();
          this.draggable.dragging_active = false;
          var ret = this.onDragEnd(this, e);
          if (!this.active)
            return;
          this.active = false;
          this.fireEvent("dragged", this, e);
          this.