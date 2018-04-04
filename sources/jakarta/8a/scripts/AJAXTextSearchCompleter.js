/*! RESOURCE: /scripts/AJAXTextSearchCompleter.js */
var AJAXTextSearchCompleter = Class.create(AJAXTableCompleter, {
  PROCESSOR: "TSSuggestProcessor",
  initialize: function(name, elementName, horizontalAlign, searchContainer) {
    AJAXCompleter.prototype.initialize.call(this, name, elementName);
    this.className = "AJAXTextSearchCompleter";
    this.element = $(elementName);
    this.keyElement = this.element;
    this.horizontalAlign = horizontalAlign;
    this.enterSubmits = true;
    this.searchContainer = searchContainer;
    this.allowInvalid = true;
    this.ieIFrameAdjust = 2;
    this.oneMatchSelects = false;
    AJAXReferenceCompleter.prototype._commonSetup.call(this);
  },
  copyAttributes: function(node) {
    var text = node.childNodes[0].nodeValue;
    var attributes = new Array();
    attributes['label'] = text;
    attributes['name'] = text;
    return attributes;
  },
  setTopLeft: function(style, top, left) {
    if (this.horizontalAlign == "right")
      this._rightAlign(style, parseInt(left, 10));
    else
      style.left = left;
    style.top = top;
  },
  setInvalid: function() {},
  clearInvalid: function() {},
  onDisplayDropDown: function() {
    AJAXTableCompleter.prototype.onDisplayDropDown.call(this);
    if (this.horizontalAlign == "right") {
      var mLeft = grabOffsetLeft(this.element);
      var x = this._rightAlign(this.dropDown.style, mLeft);
      this.iFrame.style.left = x;
    }
  },
  _rightAlign: function(style, left) {
    var containerWidth = this._getContainerWidth();
    var dropWidth = this.dropDown.getWidth();
    var adjust = 0;
    if (isWebKit)
      adjust = 2;
    this.log("_rightAlign: " + left + "+" + containerWidth + "-" + dropWidth + "-" + adjust);
    var x = left + containerWidth - dropWidth - adjust + "px";
    style.left = x;
    return x;
  },
  _createTable: function() {
    AJAXTableCompleter.prototype._createTable.call(this);
    var tableWidth = this._getContainerWidth();
    if (!g_isInternetExplorer)
      tableWidth -= 2;
    this.table.style.width = tableWidth + "px";
  },
  _getContainerWidth: function() {
    var adjust = 1;
    if (!g_isInternetExplorer)
      adjust = 2;
    var width = 0;
    if (this.searchContainer)
      width = $(this.searchContainer).getWidth() - adjust;
    return width;
  }
});;