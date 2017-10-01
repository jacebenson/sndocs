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
            document.stopObserving('mousedown', this._fDraggableStart);
        this._fDraggableStart = this._draggableStart.bind(this);
        this.hoverElem.observe('mousedown', this._fDraggableStart);
        this.onStart = f;
    },
    setDragFunction: function(f) {
        this.onDrag = f;
    },
    setEndFunction: function(f) {
        this.onEnd = f;
    },
    setAutoScrollLeft: function(f, x) {
        this.onScroll.LEFT = f;
        this.onScroll.LEFTX = x;
    },
    setAutoScrollRight: function(f, x) {
        this.onScroll.RIGHT = f;
        this.onScroll.RIGHTX = x;
    },
    setAutoScrollTop: function(f, y) {
        this.onScroll.TOP = f;
        this.onScroll.TOPX = y;
    },
    setAutoScrollBottom: function(f, y) {
        this.onScroll.BOTTOM = f;
        this.onScroll.BOTTOMX = y;
    },
    addAllowedTargetClass: function(className) {
        this.allowedClasses.push(className);
    },
    start: function(event) {
        this._getCoords(event);
        if (window.GlideContextMenu && typeof GlideContextMenu.closeAllMenus == 'function' && event.target && !$(event.target).up('.cm_menuwrapper')) {
            GlideContextMenu.closeAllMenus();
        }
        this._fDraggableMove = this._draggableMove.bind(this);
        this._fdraggableEnd = this._draggableEnd.bind(this);
        document.observe('mousemove', this._fDraggableMove);
        document.observe('mouseup', this._fdraggableEnd);
        if (this.dragCursor)
            this.dragElem.style.cursor = this.dragCursor;
        document.body.focus();
        document.onselectstart = function() {
            return false;
        };
    },
    _createPageShim: function() {
        this.pageShim = document.createElement('div');
        this.boundElem.appendChild(this.pageShim);
        this.pageShim.style.top = 0;
        this.pageShim.style.left = 0;
        this.pageShim.style.width = '100%';
        this.pageShim.style.height = '100%';
        this.pageShim.style.position = 'absolute';
        this.pageShim.style.display = 'block';
        this.pageShim.style.zIndex = '9999';
        this.pageShim.style.backgroundColor = Prototype.Browser.IE ? '#ccc' : 'transparent';
        this.pageShim.style.opacity = '0';
        this.pageShim.style.filter = 'alpha(opacity=0)';
        if (this.dragCursor) {
            this.pageShim.style.cursor = this.dragCursor;
            this.dragElem.style.cursor = this.dragCursor;
        }
    },
    _removePageShim: function() {
        if (this.pageShim)
            this.pageShim.parentNode.removeChild(this.pageShim);
        this.pageShim = null;
    },
    _getCoords: function(event) {
        event = event || window.event;
        if (!event.pageX) {
            event.pageX = event.clientX;
            event.pageY = event.clientY;
        }
        if (!this._origPageCoords)
            this._origPageCoords = {
                x: event.pageX,
                y: event.pageY
            };
        if (!this._origDragElmCoords) {
            var cumulativeOffset = this.dragElem.cumulativeOffset();
            if (this.dragElem.style.right) {
                this.dragElem.style.left = (this.dragElem.up().getWidth() - this.dragElem.getWidth() - parseInt(this.dragElem.style.right, 10)) + 'px';
                this.dragElem.setStyle({
                    right: ''
                });
            }
            this._origDragElmCoords = {
                x: parseInt(this.dragElem.style.left, 10) || cumulativeOffset.left,
                y: parseInt(this.dragElem.style.top, 10) || cumulativeOffset.top
            };
        }
        this._shift = !this._pageCoords ? {
            x: 0,
            y: 0
        } : {
            x: (event.pageX - this._pageCoords.x),
            y: (event.pageY - this._pageCoords.y)
        };
        this._pageCoords = {
            x: event.pageX,
            y: event.pageY
        };
        this._dragElmCoords = {
            x: this._origDragElmCoords.x + (this._pageCoords.x - this._origPageCoords.x),
            y: this._origDragElmCoords.y + (this._pageCoords.y - this._origPageCoords.y)
        };
    },
    _draggableStart: function(event) {
        var l = this.allowedClasses.length;
        if (l > 0) {
            var boolCanStart = false;
            for (var i = 0; i < l; i++) {
                if (event.target.className == this.allowedClasses[i]) {
                    boolCanStart = true;
                    break;
                }
            }
            if (!boolCanStart)
                return true;
        }
        this.start(event);
        return this.onStart(event, this.dragElem, this._pageCoords, this._shift, this._dragElmCoords, this);
    },
    _draggableMove: function(event) {
        this._getCoords(event);
        if (!this.pageShim) {
            this._createPageShim();
            if (Prototype.Browser.IE)
                this.dragElem.up().onselectstart = function() {
                    return false;
                };
        }
        if (this._shift.x == 0 && this._shift.y == 0)
            return;
        if (this.onScroll.LEFT && this._pageCoords.x < this.onScroll.LEFTX) {
            if (!this.leftScrollId)
                this.leftScrollId = setInterval(this._autoXScrollerInterceptor.bind(this, this.onScroll.LEFT, this.onScroll.LEFTX), this.H_SCROLL_REFRESH_FREQ_MS);
            if (this._shift.y == 0)
                return;
        } else if (this.onScroll.LEFT && this.leftScrollId && this._pageCoords.x >= this.onScroll.LEFTX) {
            clearInterval(this.leftScrollId);
            this.leftScrollId = null;
        }
        if (this.onScroll.RIGHT && this._pageCoords.x > this.onScroll.RIGHTX) {
            if (!this.rightScrollId)
                this.rightScrollId = setInterval(this._autoXScrollerInterceptor.bind(this, this.onScroll.RIGHT, this.onScroll.RIGHTX), this.H_SCROLL_REFRESH_FREQ_MS);
            if (this._shift.y == 0)
                return;
        } else if (this.onScroll.RIGHT && this.rightScrollId && this._pageCoords.x <= this.onScroll.RIGHTX) {
            clearInterval(this.rightScrollId);
            this.rightScrollId = null;
        }
        if (this.onScroll.TOP && this._pageCoords.y < this.onScroll.TOPX) {
            if (!this.topScrollId)
                this.topScrollId = setInterval(this._autoYScrollerInterceptor.bind(this, this.onScroll.TOP, this.onScroll.TOPX), this.V_SCROLL_REFRESH_FREQ_MS);
            if (this._shift.x == 0)
                return;
        } else if (this.onScroll.TOP && this.topScrollId && this._pageCoords.y >= this.onScroll.TOPX) {
            clearInterval(this.topScrollId);
            this.topScrollId = null;
        }
        if (this.onScroll.BOTTOM && this._pageCoords.y > this.onScroll.BOTTOMX) {
            if (!this.bottomScrollId)
                this.bottomScrollId = setInterval(this._autoYScrollerInterceptor.bind(this, this.onScroll.BOTTOM, this.onScroll.BOTTOMX), this.V_SCROLL_REFRESH_FREQ_MS);
            if (this._shift.x == 0)
                return;
        } else if (this.onScroll.BOTTOM && this.bottomScrollId && this._pageCoords.y <= this.onScroll.BOTTOMX) {
            clearInterval(this.bottomScrollId);
            this.bottomScrollId = null;
        }
        this.onDrag(event, this.dragElem, this._pageCoords, this._shift, this._dragElmCoords, this);
        return false;
    },
    _autoXScrollerInterceptor: function(f, boundaryX) {
        f(this.dragElem, this._pageCoords.x - boundaryX, this._pageCoords);
    },
    _autoYScrollerInterceptor: function(f, boundaryY) {
        f(this.dragElem, this._pageCoords.y - boundaryY, this._pageCoords);
    },
    _draggableEnd: function(event) {
        this._removePageShim();
        document.onselectstart = null;
        if (Prototype.Browser.IE)
            this.dragElem.up().onselectstart = null;
        if (this.hoverCursor)
            this.hoverElem.style.cursor = this.hoverCursor;
        document.stopObserving('mousemove', this._fDraggableMove);
        document.stopObserving('mouseup', this._fdraggableEnd);
        event.stopPropagation();
        this._getCoords(event);
        var boolReturn = this.onEnd ? this.onEnd(event, this.dragElem, this._pageCoords, this._shift, this._dragElmCoords, this) : true;
        this.reset();
        return boolReturn;
    },
    toString: function() {
        return 'GlideDraggable';
    }
});;