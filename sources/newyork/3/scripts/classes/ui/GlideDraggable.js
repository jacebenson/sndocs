/*! RESOURCE: /scripts/classes/ui/GlideDraggable.js */
var GlideDraggable = Class.create({
      V_SCROLL_REFRESH_FREQ_MS: 70,
      H_SCROLL_REFRESH_FREQ_MS: 50,
      IGNORED_DRAG_ELEMENTS: ['A', 'BUTTON', 'INPUT'],
      initialize: function(hoverElem, dragElem) {
        this.setHoverElem(hoverElem);
        if (this.hoverElem == null)
          return;
        this.setDragElm(dragElem || this.hoverElem);
        this.boundElem = document.body;
        this.setDragFunction(this.genericDrag);
        this.onScroll = {};
        this.allowedClasses = [];
      },
      destroy: function() {
        this.reset();
        this.hoverElem = null;
        this.dragElem = null;
        this.boundElem = null;
        this.onStart = null;
        this.onDrag = null;
        this.onScroll = null;
        this.onEnd = null;
      },
      reset: function() {
        clearInterval(this.leftScrollId);
        clearInterval(this.rightScrollId);
        clearInterval(this.topScrollId);
        clearInterval(this.bottomScrollId);
        this.leftScrollId = null;
        this.rightScrollId = null;
        this.topScrollId = null;
        this.bottomScrollId = null;
        delete this._origDragElmCoords;
        delete this._origPageCoords;
        delete this._shift;
        delete this._pageCoords;
        delete this._dragElmCoords;
      },
      genericDrag: function(e, dragElem, pageCoords, shift, dragCoords) {
        dragElem.style.left = dragCoords.x + 'px';
        dragElem.style.top = dragCoords.y + 'px';
      },
      setHoverCursor: function(c) {
        this.hoverCursor = c;
        this.hoverElem.style.cursor = c;
      },
      setHoverElem: function(obj) {
        this.hoverElem = $(obj);
        if (this.hoverElem) {
          this.hoverElem.style.MozUserSelect = '-moz-none';
          this.hoverElem.onselectstart = function() {
            return false;
          };
        }
      },
      getHoverElem: function() {
        return this.hoverElem;
      },
      setDragCursor: function(c) {
        this.dragCursor = c;
        if (this.pageShim)
          this.pageShim.style.cursor = this.dragCursor;
      },
      setDragElm: function(obj) {
        this.dragElem = $(obj);
        this.dragElem.style.MozUserSelect = '-moz-none';
      },
      setStartFunction: function(f) {
          if (this._fDraggableStart)
            document.stopObserving('mousedown', this._fD