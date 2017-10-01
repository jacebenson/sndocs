/*! RESOURCE: /scripts/classes/drag/Draggable2.js */
var Draggable = Class.create(GwtObservable, {
    initialize: function(elem, dragElem, dragClickFunction, topProxyElem, bottomProxyElem, targets, invalidTargets, addBorder, background) {
        this.elem = elem;
        this.dragElem = dragElem;
        this.targets = targets;
        this.invalidTargets = invalidTargets;
        this.currentTarget = null;
        this.dragClickFunction = dragClickFunction;
        this.topProxyElem = topProxyElem;
        this.bottomProxyElem = bottomProxyElem;
        this.gd = new GwtDraggable(this.dragElem);
        if (!Draggable.startDisabled)
            this.gd.setStart(this.dragStart.bind(this));
        this.gd.setEnd(this.dragEnd.bind(this));
        this.gd.setDrag(this.dragging.bind(this));
        this.addBorder = addBorder;
        this.background = background;
        this.isMulti = false;
    },
    onStartHandler: function() {},
    postStartHandler: function() {},
    onEndHandler: function() {},
    processCoordinates: function() {},
    getElem: function() {
        return this.elem;
    },
    setMulti: function(isMulti) {
        this.isMulti = isMulti;
    },
    disable: function() {
        this.dragDisabled = true;
    },
    enable: function() {
        this.dragDisabled = false;
    },
    isDisabled: function() {
        return this.dragDisabled;
    },
    getFontHeight: function() {
        var elem = $(cel("div"));
        elem.style.visibility = "hidden";
        document.body.appendChild(elem);
        elem.update("<table><tr><td>M</td></tr></table>");
        elem.addClassName("dragRow");
        var height = elem.getHeight();
        elem.parentNode.removeChild(elem);
        return height;
    },
    dragStart: function(me, x, y, e) {
        if (this.isDisabled())
            return;
        this.dragClickFunction(e);
        this.x = x - 20;
        this.y = y - me.differenceY;
        this.dragHeight = this.getFontHeight() + 2;
        if (isMSIE)
            this.dragHeight = this.dragHeight + 2;
        this.onStartHandler();
        this.processCoordinates();
        if (this.isMulti) {
            var div = cel('div');
            this._setDragDivAttributes(div, this.y, this.x, this.getDragWidth() + 9, this.getDragHeight() + 9, false, null);
            var div1 = cel('div');
            this._setDragDivAttributes(div1, 6, 6, this.getDragWidth(), this.getDragHeight(), this.addBorder, "#EEE");
            div.appendChild(div1);
            var div2 = cel('div');
            this._setDragDivAttributes(div2, 3, 3, this.getDragWidth(), this.getDragHeight(), this.addBorder, "#EEE");
            div.appendChild(div2);
            var div3 = cel('div');
            this._setDragDivAttributes(div3, 0, 0, this.getDragWidth(), this.getDragHeight(), this.addBorder, this.background);
            this.updateMultiDragElem();
            var proxyClone = $(this.topProxyElem).clone(true);
            proxyClone.style.width = this.getProxyWidth() + "px";
            $(div3).appendChild(proxyClone);
            $(div1).addClassName("dragRow2");
            $(div2).addClassName("dragRow1");
            $(div3).addClassName("dragRow");
            $(div).addClassName("dragRow");
            div.appendChild(div3);
            this.dragDiv = div;
        } else {
            var div = cel('div');
            this._setDragDivAttributes(div, this.y, this.x, this.getDragWidth(), this.getDragHeight(), this.addBorder, this.background);
            this.updateMultiDragElem();
            var proxyClone = $(this.topProxyElem).clone(true);
            proxyClone.style.width = this.getProxyWidth() + "px";
            $(div).appendChild(proxyClone);
            $(div).addClassName("dragRow");
            this.dragDiv = div;
        }
        if (this.invalidTargets)
            for (var i = 0; i < this.invalidTargets.length; i++)
                this.invalidTargets[i].fireGreyOut();
        document.body.appendChild(this.dragDiv);
        var cell = this.dragDiv.down(".dragCell");
        if (!this.isMulti && cell) {
            var siblings = cell.up("td").nextSiblings();
            if (siblings.length > 0)
                siblings[0].style.display = "none";
        }
        this.postStartHandler();
        CustomEvent.fire('refresh.event');
        CustomEvent.fire('drag.start');
    },
    getProxyWidth: function() {
        return BoundsUtil.getInstance().getElemBounds(this.elem).width;
    },
    getDragWidth: function() {
        return $(this.elem).getWidth();
    },
    getDragHeight: function() {
        return this.dragHeight;
    },
    updateMultiDragElem: function() {
        $(this.bottomProxyElem).update(this.elem.innerHTML);
    },
    _setDragDivAttributes: function(div, top, left, width, height, border, back) {
        div.style.position = "absolute";
        if (border) {
            div.style.borderWidth = "1px";
            div.style.borderStyle = "solid";
            div.style.borderColor = "#DDD";
        }
        if (back) {
            div.style.background = back;
            div.style.backgroundColor = back;
        }
        div.style.top = top + "px";
        div.style.left = left + "px";
        div.style.width = (width) + "px";
        div.style.height = (height) + "px";
        div.style.overflow = "hidden";
    },
    dragging: function(me, x, y, e) {
        if (!this.dragDiv || this.isDisabled())
            return;
        var oldX = this.x;
        var oldY = this.y;
        this.x = x + me.differenceX - 20;
        this.y = y;
        var compX = e.pointerX() + (this.dragDiv.getDimensions().width / 2);
        var compY = e.pointerY() + (this.dragDiv.getDimensions().height / 2);
        if (Draggable.alternateCompare)
            compX = BoundsUtil.getInstance().getElemBounds($(this.dragDiv)).left + (this.dragDiv.getDimensions().width / 2);
        this._highlightTarget(compX, compY);
        this.processCoordinates();
        this.dragDiv.style.left = this.x + 'px';
        this.dragDiv.style.top = this.y + 'px';
        this.fireEvent("drag", this, this.x - oldX, this.y - oldY);
    },
    _highlightTarget: function(x, y) {
        if (!this.processing) {
            this.processing = true;
            var newTarget = null;
            for (var i = 0; i < this.targets.length; i++)
                if (this.targets[i].isDragOver(x, y)) {
                    newTarget = this.targets[i];
                    break;
                }
            var diffTarget = !this.currentTarget || !newTarget || newTarget.isDifferentTarget(this.currentTarget);
            if (diffTarget) {
                if (this.currentTarget) {
                    this.currentTarget.fireDragOut();
                    this.currentTarget = null;
                }
                if (newTarget)
                    this.currentTarget = newTarget;
            }
            this.processing = false;
        }
    },
    dragEnd: function(me, e) {
        if (!this.dragDiv || this.isDisabled())
            return;
        if (this.dragDiv.parentNode) {
            this.onEndHandler();
            document.body.removeChild(this.dragDiv);
            if (this.currentTarget != null) {
                this.currentTarget.fireDragDrop(this);
                this.currentTarget.fireDragOut();
                this.currentTarget = null;
            }
            if (this.invalidTargets)
                for (var i = 0; i < this.invalidTargets.length; i++)
                    this.invalidTargets[i].fireRemoveGreyOut();
            this.fireEvent("dragend", this);
            CustomEvent.fire('refresh.event');
        }
    }
});;