/*! RESOURCE: /scripts/classes/drag/DropTarget2.js */
var DropTarget = Class.create(GwtObservable, {
    initialize: function(elem, dragContainer) {
        this.elem = elem.getAttribute("id");
        if (dragContainer)
            this.dragContainer = dragContainer.getAttribute("id");
        else
            this.dragContainer = null;
    },
    getElem: function() {
        return $(this.elem);
    },
    getDragBounds: function() {
        if (this.dragContainer)
            return BoundsUtil.getInstance().getElemBounds($(this.dragContainer));
        else
            return this.getBounds();
    },
    getBounds: function() {
        return BoundsUtil.getInstance().getElemBounds($(this.getElem()));
    },
    isDragOver: function(x, y) {
        if (this.getElem()) {
            var bounds = this.getBounds();
            if (x > bounds.left && x < bounds.right &&
                y > bounds.top && y < bounds.bottom) {
                this.fireEvent("dragover", this, x, y);
                return true;
            }
        }
        return false;
    },
    toString: function() {
        return "Drop Target";
    },
    fireGreyOut: function() {
        this.fireEvent("greyout", this);
    },
    fireRemoveGreyOut: function() {
        this.fireEvent("removegreyout", this);
    },
    fireDragOut: function() {
        this.fireEvent("dragout", this);
    },
    fireDragDrop: function(draggable) {
        this.fireEvent("dragdrop", this, draggable);
    },
    isDifferentTarget: function(otherTarget) {
        return $(this.getElem()).getAttribute("id") != $(otherTarget.getElem()).getAttribute("id");
    }
});;