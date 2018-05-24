/*! RESOURCE: /scripts/classes/GlideWidgetVCR.js */
var GlideWidgetVCR = Class.create(GlideListWidget, {
  initialize: function($super, widgetID, listID) {
    $super(widgetID, listID);
    this.backAllowed = false;
    this.nextAllowed = false;
    this._initEvents();
    CustomEvent.observe("list_v2.orderby.update", this._updateOrderBy.bind(this));
  },
  gotoAction: function(ev, el) {
    ev.preventDefault();
    var action = el.name.substring(4);
    if (!this.backAllowed && ((action == 'first') || (action == 'back')))
      return;
    if (!this.nextAllowed && ((action == 'next') || (action == 'last')))
      return;
    var list = GlideList2.get(this.listID);
    var row;
    if (action == 'first')
      row = 1;
    else if (action == 'back')
      row = list.firstRow - list.rowsPerPage;
    else if (action == 'next')
      row = list.firstRow + list.rowsPerPage;
    else if (action == 'last')
      row = (list.totalRows + 1) - list.rowsPerPage;
    else
      return;
    list._refreshAjax(row, {}, true);
  },
  gotoRow: function(ev) {
    ev = getEvent(ev);
    if (!ev || ev.keyCode != 13)
      return;
    ev.stop();
    var row = this._getElement('first_row').value;
    if (isNaN(row))
      row = 1;
    var list = GlideList2.get(this.listID);
    list._refreshAjax(row, {}, true);
  },
  _initEvents: function() {
    this.span = $(this.widgetID + "_vcr");
    if (!this.span)
      return;
    this.span.on('click', "[data-nav=true]", this.gotoAction.bind(this));
    var input = this.span.getElementsByTagName("INPUT")[0];
    $(input).observe('keypress', this.gotoRow.bind(this));
  },
  _refresh: function(listTable, list) {
    if (!this.span || this.span.innerHTML == "")
      this.span = $(this.widgetID + "_vcr");
    if (list.totalRows == 0) {
      this._setVisible(false);
      this._setRepVisible(false);
    } else if (list.totalRows <= list.rowsPerPage && GlideList2.get(this.listID).isHierarchical()) {
      this._setVisible(false);
      if (this._setRepVisible(true, list.totalRows))
        this._setInner('rep_total_rows', list.totalRows);
    } else {
      this._setVisible(true);
      this._setRepVisible(false);
      this.backAllowed = (list.firstRow > 1);
      this.nextAllowed = (list.lastRow < list.totalRows);
      this._setRowNumbers(list);
      var images = $(this.span).select("[data-nav=true]");
      if (images && images.length) {
        this._setAction(images[0], this.backAllowed);
        this._setAction(images[1], this.backAllowed);
        this._setAction(images[2], this.nextAllowed);
        this._setAction(images[3], this.nextAllowed);
      }
    }
  },
  _setRowNumbers: function(list) {
    var lastRow = $(this.widgetID + '_last_row'),
      totalRows = $(this.widgetID + '_total_rows'),
      firstRow = $(this.widgetID + '_first_row');
    if (lastRow)
      lastRow.innerHTML = list.lastRow;
    if (totalRows)
      totalRows.innerHTML = list.totalRows;
    if (firstRow)
      firstRow.value = list.firstRow;
  },
  _setAction: function(img, allowed) {
    if (img.tagName.toLowerCase() == "img") {
      if (allowed) {
        img.addClassName("pointerhand");
        this._removeDis(img);
      } else {
        img.removeClassName("pointerhand");
        this._addDis(img);
      }
    } else {
      if (!allowed)
        img.addClassName("tab_button_disabled");
      else
        img.removeClassName("tab_button_disabled");
    }
  },
  _removeDis: function(img) {
    var src = img.src;
    if (src.indexOf('_dis.gifx') != -1)
      img.src = src.replace(/\_dis\.gifx/i, ".gifx");
  },
  _addDis: function(img) {
    var src = img.src;
    if (src.indexOf('_dis.gifx') == -1)
      img.src = src.replace(/\.gifx/i, "_dis.gifx");
  },
  _setVisible: function(flag) {
    var e = this.span;
    if (!e)
      return;
    if ((flag && !e.visible()) || (!flag && e.visible()))
      e.toggle();
  },
  _setRepVisible: function(flag, total_rows) {
    var e = $(this.widgetID + "_rep_vcr");
    if (!e)
      return false;
    if ((flag && !e.visible()) || (!flag && e.visible()))
      e.toggle();
    if (!flag)
      return true;
    var showPlural = false;
    var showSingular = false;
    if (total_rows > 1)
      showPlural = flag;
    else
      showSingular = flag;
    var e = $(this.widgetID + "_rep_plural_label");
    if (e)
      if ((showPlural && !e.visible()) || (!showPlural && e.visible()))
        e.toggle();
    var e = $(this.widgetID + "_rep_singular_label");
    if (e)
      if ((showSingular && !e.visible()) || (!showSingular && e.visible()))
        e.toggle();
    return true;
  },
  _updateOrderBy: function(orderBy) {
    var list = GlideList2.get(this.listID);
    if (list)
      list.setOrderBy(orderBy);
  },
  type: 'GlideWidgetVCR'
});;