/*! RESOURCE: /scripts/GwtCursor.js */
var GwtCursor = Class.create({
  initialize: function() {
    this._cursorElem = null;
    this.hidden = true;
  },
  isHidden: function() {
    return this.hidden;
  },
  hideCursor: function() {
    if (this._cursorElem && this._cursorElem.parentNode) {
      this._cursorElem.remove();
      this.hidden = true;
    }
  },
  createCursor: function(cell) {
    this.hideCursor();
    this._cursorElem = new Element('div', {
      'class': 'list_edit_cursor_box'
    });
    var offset = cell.cumulativeOffset();
    var parent = getFormContentParent();
    var parentOffset = parent.cumulativeOffset();
    var offsetLeft = offset.left;
    if (isDoctype())
      if ($j(cell).closest('div.custom-form-group').length != 0)
        offsetLeft = offsetLeft - $j(cell).closest('div.custom-form-group').scrollLeft();
    this._cursorElem.setStyle({
      top: (offset.top - parentOffset.top - 2) + 'px',
      left: (offsetLeft - parentOffset.left - 2) + 'px',
      height: '0px',
      width: '0px'
    });
    var width = cell.getWidth();
    var height = cell.getHeight();
    o = {
      width: width,
      height: height,
      top: 2,
      left: 2,
      leftRight: width,
      topBottom: height
    };
    this._cursorElem.innerHTML = GwtCursor.Templates.LIST_EDIT_CURSOR.evaluate(o);
    parent.appendChild(this._cursorElem);
    this.hidden = false;
  },
  toString: function() {
    return 'GwtCursor';
  }
});
GwtCursor.Templates = {
  LIST_EDIT_CURSOR: new Template(
    '<div class="left" style="height: #{height}px; top:#{top}px; left:#{left}px;"></div>' +
    '<div class="top" style="width: #{width}px; top:#{top}px; left:#{left}px;" ></div>' +
    '<div class="right" style="height: #{height}px; top:#{top}px; left:#{leftRight}px;"></div>' +
    '<div class="bottom" style="width: #{width}px; top:#{topBottom}px; left:#{left}px;"></div>'
  )
};;