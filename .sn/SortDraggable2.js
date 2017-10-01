/*! RESOURCE: /scripts/classes/sort/SortDraggable2.js */
var SortDraggable = Class.create(Draggable, {
    initialize: function(elem, dragElem, dragClickFunction, topProxyElem, bottomProxyElem, targets, invalidTargets, addBorder, background, container, overrideEventHandlers) {
        this.container = container;
        this.overrideEventHandlers = overrideEventHandlers;
        Draggable.prototype.initialize.call(this, elem, dragElem, dragClickFunction, topProxyElem, bottomProxyElem, targets, invalidTargets, addBorder, background);
    },
    onStartHandler: function(e) {
        if (SortDraggable.adjForContainerScroll)
            SortDraggable.modY = -this.container.scrollTop;
        if (this.overrideEventHandlers) {
            var thisDr = this;
            if (this.gd.parentElement) {
                Event.stopObserving(this.gd.parentElement, "mouseup", this.fDrag);
                Event.stopObserving(this.gd.parentElement, "mousemove", this.fDrag);
            }
            this.mouseUpOverride = function(e) {
                thisDr.gd.end(e);
            };
            this.mouseMoveOverride = function(e) {
                thisDr.gd.drag(e);
            };
            Event.observe(document.body, "mouseup", this.mouseUpOverride);
            Event.observe(document.body, "mousemove", this.mouseMoveOverride);
        }
    },
    processCoordinates: function() {
        var width = this.getDragWidth();
        var height = this.getDragHeight();
        this.y = this.y - (height / 2) + 7;
        if (SortDraggable.modY)
            this.y = this.y + SortDraggable.modY;
        this.x = this.x + 5;
        var midX = this.x + (width / 2);
        var minY;
        var maxY;
        var minX;
        var maxX;
        var adj = 10;
        for (var i = 0; i < this.targets.length; i++)
            if (this.targets[i].getElem().visible()) {
                var bounds = this.targets[i].getDragBounds();
                if (!minY && !maxY && !minX && !maxX) {
                    minY = bounds.top + adj;
                    maxY = bounds.bottom - adj;
                    minX = bounds.left;
                    maxX = bounds.right;
                } else {
                    if (bounds.top < minY)
                        minY = bounds.top + adj;
                    if (bounds.bottom > maxY)
                        maxY = bounds.bottom - adj;
                    if (bounds.left < minX)
                        minX = bounds.left;
                    if (bounds.right > maxX)
                        maxX = bounds.right;
                }
            }
        var scrollChange;
        var adjMaxY = maxY - (height / 2);
        var adjMinY = minY - (height / 2);
        if (this.y < adjMinY || this.y > adjMaxY) {
            var target;
            for (var i = 0; i < this.targets.length; i++) {
                var bounds = this.targets[i].getBounds();
                if (midX > bounds.left && midX < bounds.right) {
                    target = this.targets[i];
                    break;
                }
            }
            if (this.y < adjMinY)
                this.y = adjMinY;
            if (this.y > adjMaxY)
                this.y = adjMaxY;
            if (target) {
                SortDraggable.setScrollInterval(this.y == adjMinY, target.getElem());
                scrollChange = true;
            }
        }
        if (this.x < minX)
            this.x = minX;
        if (this.x > maxX - width)
            this.x = maxX - width;
        if (!scrollChange)
            SortDraggable.clearScrollInterval();
    },
    getProxyWidth: function() {
        return BoundsUtil.getInstance().getElemBounds(this.elem).width;
    },
    getDragWidth: function() {
        return BoundsUtil.getInstance().getElemBounds(this.container).width;
    },
    onEndHandler: function() {
        SortDraggable.modY = 0;
        if (this.overrideEventHandlers) {
            Event.stopObserving(document.body, "mouseup", this.mouseUpOverride);
            Event.stopObserving(document.body, "mousemove", this.mouseMoveOverride);
        }
    },
    updateMultiDragElem: function() {
        if (this.isMulti) {
            var messageCell = $(cel("td"));
            messageCell.update(getMessage("Multiple items"));
            messageCell.style.verticalAlign = "middle";
            messageCell.style.width = "100%";
            messageCell.style.borderLeft = "7px solid white";
            var dragCell = $(cel("td"));
            dragCell.appendChild(ListDraggableRow.createRawDragDiv(true, getMessage("")));
            $(this.bottomProxyElem).update("");
            $(this.bottomProxyElem).appendChild(dragCell);
            $(this.bottomProxyElem).appendChild(messageCell);
            $(this.bottomProxyElem).up("table").style.height = "100%";
        } else
            $(this.bottomProxyElem).update(this.elem.innerHTML);
    }
});
SortDraggable.scrollIncrement = 10;
SortDraggable.adjForContainerScroll = false;
SortDraggable.setScrollInterval = function(up, container) {
    if (SortDraggable.scrollInterval)
        return;
    SortDraggable.scrollInterval = window.setInterval(function() {
        SortDraggable.scrollIncrement += 10;
        if (SortDraggable.scrollIncrement > 200)
            SortDraggable.scrollIncrement = 200;
        var oldScrolTop = container.scrollTop;
        var top = container.scrollTop;
        if (up) {
            top = top - SortDraggable.scrollIncrement;
            container.scrollTop = top;
        } else {
            top = top + SortDraggable.scrollIncrement;
            container.scrollTop = top;
        }
        if (oldScrolTop == container.scrollTop)
            SortDraggable.clearScrollInterval();
    }, 100);
}
SortDraggable.clearScrollInterval = function() {
    if (SortDraggable.scrollInterval) {
        clearInterval(SortDraggable.scrollInterval);
        SortDraggable.scrollInterval = null;
        SortDraggable.scrollIncrement = 10;
    }
};