/*! RESOURCE: /scripts/classes/GwtDraggableSnap.js */
var debugId = 0;
var GwtDraggableSnap = Class.create(GwtDraggable, {
  initialize: function(header, itemDragged) {
    GwtDraggable.prototype.initialize.call(this, header, itemDragged);
    this.snapTable = null;
    this.dropZoneList = [];
    this.initDropZones = null;
    this.boundDirection = null;
    this.boundElement = null;
    this.setStart(this.snapStart.bind(this));
    this.setDrag(this.snapDrag.bind(this));
    this.setEnd(this.snapEnd.bind(this));
    this.setCreateFloat(this._createFloat.bind(this));
    this.setFloatClassName("drag_float_visible");
  },
  destroy: function() {
    this.snapTable = null;
    this.dropZoneList = null;
    this.onInitDropZones = null;
    this.boundElement = null;
    GwtDraggable.prototype.destroy.call(this);
  },
  setCreateFloat: function(f) {
    this.onCreateFloat = f;
    if (!f)
      this.onCreateFloat = this._createFloat.bind(this);
  },
  setFloatClassName: function(n) {
    this.floatClassName = n;
  },
  setSnapTable: function(table) {
    this.snapTable = table;
    this.dropZoneList = [];
  },
  setInitDropZones: function(f) {
    this.onInitDropZones = f;
    this.snapTable = null;
    this.dropZoneList = [];
  },
  setBoundLeftRight: function() {
    this.boundDirection = "l-r";
  },
  setBoundUpDown: function() {
    this.boundDirection = "u-d";
  },
  setBoundElement: function(element) {
    this.boundElement = element;
  },
  addDropZone: function(element) {
    this.dropZoneList.push(element);
  },
  removeDropZone: function(element) {
    for (var i = 0; i < this.dropZoneList.length; i++) {
      if (element.id == this.dropZoneList[i].id) {
        this.dropZoneList.remove(i);
        break;
      }
    }
  },
  clearDropZones: function() {
    this.dropZoneList = [];
  },
  snapStart: function(dragObj, x, y, e) {
    x -= this.differenceX;
    y -= this.differenceY;
    if (dragObj.draggable.style.position == "absolute")
      this.snapMode = "absolute";
    else
      this.snapMode = "relative";
    this.currentDropZone = null;
    this.snapElement = null;
    this.dragFloat = null;
    this._initDropZones(dragObj, x, y);
    this._initDragBounds(x, y);
    return true;
  },
  snapDrag: function(dragObj, x, y, e) {
    var pos = this._boundDragging(x, y);
    x = pos[0];
    y = pos[1];
    if (!this.dragFloat)
      this.dragFloat = this.onCreateFloat(dragObj, x, y);
    if (this.dragFloat) {
      this.dragFloat.style.left = x;
      this.dragFloat.style.top = y;
    }
    this._findDropZoneAndMove(dragObj, x + this.differenceX, y + this.differenceY);
    return true;
  },
  snapEnd: function(dragObj, x, y, e) {
    this.dropZones = [];
    if (this.dragFloat)
      this.floatIntv = this._floatBackAndDelete(this, 150, 15);
    return true;
  },
  hasSnapMoved: function() {
    return this.originalDropZone != this.currentDropZone;
  },
  _createFloat: function(dragObj, x, y) {
    var dfloat = cel("div");
    dfloat.id = "floater";
    dfloat.className = this.floatClassName;
    dfloat.style.position = "absolute";
    dfloat.style.width = dragObj.draggable.offsetWidth - (!isMSIE ? 2 : 0);
    dfloat.style.height = dragObj.draggable.offsetHeight - (!isMSIE ? 2 : 0);
    document.body.appendChild(dfloat);
    return dfloat;
  },
  _boundDragging: function(x, y) {
    if (this.boundDirection == "l-r")
      y = this.origY;
    else if (this.boundDirection == "u-d")
      x = this.origX;
    if (this.boundElement) {
      if (y < this.boundTop)
        y = this.boundTop;
      if (y > this.boundBottom)
        y = this.boundBottom;
      if (x < this.boundLeft)
        x = this.boundLeft;
      if (x > this.boundRight)
        x = this.boundRight;
    }
    return [x, y];
  },
  _findDropZoneAndMove: function(dragObj, x, y) {
    if (this.snapMode == "absolute") {
      if (this.currentDropZone && this._overlaps(this.currentDropZone, x, y))
        return false;
      var dz = this._findDropZoneAbsolute(dragObj, x, y);
      if (dz && dz != this.currentDropZone) {
        this.currentDropZone = dz;
        this.snapElement = dz.element;
        if (!this.fireEvent("beforedrop", dragObj, dz.element, dz.element, x, y))
          return false;
        dragObj.draggable.style.left = this.currentDropZone.left;
        dragObj.draggable.style.top = this.currentDropZone.top;
        return true;
      }
    } else {
      var dz = this._findDropZoneRelative(dragObj, x, y);
      if (dz && dragObj.draggable.nextSibling != dz.element) {
        this.currentDropZone = dz;
        this.snapElement = dz.element.parentNode;
        if (!this.fireEvent("beforedrop", dragObj, dz.element.parentNode, dz.element, x, y))
          return false;
        dz.element.parentNode.insertBefore(dragObj.draggable, dz.element);
        dragObj.draggable.parentNode.style.display = "none";
        dragObj.draggable.parentNode.style.display = "";
        return true;
      }
    }
    return false;
  },
  _findDropZoneAbsolute: function(dragObj, x, y) {
    var dz = null;
    for (var i = 0; i < this.dropZones.length; i++) {
      if (this._overlaps(this.dropZones[i], x, y)) {
        dz = this.dropZones[i];
        break;
      }
    }
    return dz;
  },
  _findDropZoneRelative: function(dragObj, x, y) {
    var draggable = dragObj.getDraggable();
    var cCell = null;
    var aLargeNumber = 100000000;
    for (var z = 0; z < this.dropZones.length; z++) {
      var dz = this.dropZones[z];
      if (draggable == dz)
        continue;
      var ai = Math.sqrt(Math.pow(x - dz.left, 2) + Math.pow(y - dz.top, 2));
      if (isNaN(ai))
        continue;
      if (ai < aLargeNumber) {
        aLargeNumber = ai;
        cCell = dz;
      }
    }
    return cCell;
  },
  _initDragBounds: function(x, y) {
    this.origX = x;
    this.origY = y;
    if (this.boundElement) {
      this.boundLeft = grabOffsetLeft(this.boundElement) - grabScrollLeft(this.boundElement);
      this.boundTop = grabOffsetTop(this.boundElement) - grabScrollTop(this.boundElement);
      this.boundRight = this.boundLeft + this.boundElement.offsetWidth - this.draggable.offsetWidth;
      this.boundBottom = this.boundTop + this.boundElement.offsetHeight - this.draggable.offsetHeight;
      this.boundLeft -= 4;
      this.boundTop -= 4;
      this.boundRight += 4;
      this.boundBottom += 4;
    }
  },
  _initDropZones: function(dragObj, x, y) {
    this.dropZones = [];
    var zones = [];
    if (this.onInitDropZones) {
      zones = this.onInitDropZones(this, x, y);
    } else if (this.snapTable) {
      zones = this._initDropZonesFromTable(this.snapTable);
    } else {
      for (var i = 0; i < this.dropZoneList.length; i++)
        zones.push(this.dropZoneList[i]);
    }
    for (var i = 0; i < zones.length; i++) {
      var zone = zones[i];
      if (this.snapMode == "absolute") {
        this._addDropZone(zone);
      } else {
        this._initDropZonesRelative(dragObj, zone);
      }
    }
    if (this.snapMode == "absolute") {
      this.originalDropZone = this._findDropZoneAbsolute(dragObj, x, y);
    } else {
      var nextSibling = dragObj.draggable.nextSibling;
      for (var i = 0; i < this.dropZones.length; i++) {
        if (this.dropZones[i].element == nextSibling) {
          this.originalDropZone = this.dropZones[i];
          break;
        }
      }
    }
  },
  _initDropZonesFromTable: function(t) {
    var zones = [];
    var rowCnt = t.rows.length;
    var colCnt = t.rows[0].cells.length;
    for (var row = 0; row < rowCnt; row++) {
      for (var col = 0; col < colCnt; col++) {
        var cell = t.rows[row].cells[col];
        if (getAttributeValue(cell, "dropzone") == "true" || cell.dropzone == "true")
          zones.push(cell);
      }
    }
    return zones;
  },
  _initDropZonesRelative: function(dragObj, zone) {
    var myHeight = 0;
    var lastDivExists = false;
    for (var i = 0; i < zone.childNodes.length; i++) {
      var node = zone.childNodes[i];
      if (getAttributeValue(node, "dragpart") ||
        node.dragpart == "true" ||
        getAttributeValue(node, "dropzone") ||
        node.dropzone == "true") {
        if ((node.id == "lastdiv") || (node.name == "lastdiv"))
          lastDivExists = true;
        if (node == dragObj.draggable) {
          myHeight = dragObj.draggable.offsetHeight;
        }
        if (this._isInScrollRegion(node, zone)) {
          this._addDropZone(node, myHeight);
        }
      }
    }
    if (!lastDivExists) {
      var lastDiv = cel("DIV");
      lastDiv.name = "lastdiv";
      lastDiv.dropzone = "true";
      lastDiv.style.width = "100%";
      lastDiv.style.height = "0";
      zone.appendChild(lastDiv);
      this._addDropZone(lastDiv, myHeight);
    }
  },
  _addDropZone: function(element, topOffset) {
    if (!topOffset)
      topOffset = 0;
    var dropZone = {};
    dropZone.element = element;
    dropZone.left = grabOffsetLeft(element) - grabScrollLeft(element);
    dropZone.top = grabOffsetTop(element) - topOffset - grabScrollTop(element);
    dropZone.right = dropZone.left + element.offsetWidth;
    dropZone.bottom = dropZone.top + element.offsetHeight;
    this.dropZones.push(dropZone);
  },
  _isInScrollRegion: function(element, region) {
    var left = element.offsetLeft;
    var top = element.offsetTop;
    if (left < 0)
      left = 0;
    if (top < 0)
      top = 0;
    return (left >= region.scrollLeft) &&
      (top >= region.scrollTop) &&
      (left <= (region.scrollLeft + region.offsetWidth)) &&
      (top <= (region.scrollTop + region.offsetHeight));
  },
  _overlaps: function(dz, x, y) {
    return ((dz.left < x) && (x < dz.right) && (dz.top < y) && (y < dz.bottom));
  },
  _floatBackAndDelete: function(gd, tTime, tMoves) {
    var baseObj = gd.getDraggable();
    var movenObj = gd.dragFloat;
    var currentX = parseInt(movenObj.style.left);
    var currentY = parseInt(movenObj.style.top);
    var backX = (currentX - grabOffsetLeft(baseObj) - grabScrollLeft(baseObj)) / tMoves;
    var backY = (currentY - grabOffsetTop(baseObj) - grabScrollTop(baseObj)) / tMoves;
    return setInterval(
      function() {
        if (tMoves < 1) {
          clearInterval(gd.floatIntv);
          gd.dragFloat.parentNode.removeChild(gd.dragFloat);
          gd.dragFloat = null;
          return;
        }
        tMoves--;
        currentX -= backX;
        currentY -= backY;
        movenObj.style.left = parseInt(currentX) + "px";
        movenObj.style.top = parseInt(currentY) + "px"
      }, tTime / tMoves)
  },
  z: null
});;