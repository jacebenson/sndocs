/*! RESOURCE: /scripts/classes/ui/GlideDraggable.js */
var GlideDraggable = Class.create({
      V_SCROLL_REFRESH_FREQ_MS: 70,
      H_SCROLL_REFRESH_FREQ_MS: 50,
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
          dragElem.style.top = drag