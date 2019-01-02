var AJAXTableCompleter = Class.create(AJAXReferenceCompleter, {
  _processDoc: function(doc) {
    AJAXReferenceCompleter.prototype._processDoc.call(this, doc);
    this.showDisplayValue = doc.getAttribute('show_display_value');
    this.queryType = doc.getAttribute('query_type');
    this.queryText = doc.getAttribute('sysparm_chars');
    this.columnsSearch = doc.getAttribute('columns_search');
  },
  appendElement: function(element) {
    this.tbody.appendChild(element);
  },
  createInnerDropDown: function() {
    if (this.dropDown.childNodes.length > 0)
      return;
    this._createTable();
  },
  createChild: function(item) {
    if (this.currentMenuCount == 0) {
      this.createInnerDropDown();
    }
    var tr = cel("tr");
    if (this.showDisplayValue != "false") {
      var displayValue = item['label'];
      this._createTD(tr, displayValue);
    }
    this._addColumns(tr, item);
    return tr;
  },
  onDisplayDropDown: function() {
    var width = this.table.offsetWidth + 2;
    var height = this.table.offsetHeight + 2;
    this.getDropDown().style.width = width + "px";
    if (!g_isInternetExplorer) {
      width = width - 4;
      height = height - 4;
    }
    this.getIFrame().style.width = width + "px";
    this.getIFrame().style.height = height + "px";
  },
  _addColumns: function(tr, item) {
    var xml = item["XML"];
    var fields = xml.getElementsByTagName("field");
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var value = field.getAttribute("value");
      var td = $(this._createTD(tr, value));
      if (this.prevText[i] == value)
        td.addClassName("ac_additional_repeat");
      else
        this.prevText[i] = value;
      td.addClassName("ac_additional");
    }
  },
  _showMax: function(foundStrings, foundRecents) {
    if (!this.rowCount)
      return;
    var max = 1 * this.max;
    var showing = Math.min(foundStrings.length, max);
    var recentsLength = foundRecents ? foundRecents.length : 0;
    var total = this.rowCount - recentsLength;
    var tr = cel("tr");
    $(tr).addClassName("ac_header");
    var td = cel("td", tr);
    td.setAttribute("colSpan", 99);
    td.setAttribute("width", "100%");
    var a = cel("a", td);
    a.onmousedown = this._showAll.bindAsEventListener(this);
    var x = "";
    if (this.rowCount >= 250)
      x = " more than ";
    a.innerHTML = new GwtMessage().getMessage("Showing 1 through {0} of {1}", showing, x + total);
    this.appendElement(tr);
  },
  _showRecents: function() {
    var tr = cel("tr");
    tr.className = "ac_header";
    var td = cel("td", tr);
    td.setAttribute('colspan', 99);
    td.setAttribute("width", "100%");
    td.innerHTML = new GwtMessage().getMessage("Recent selections");
    this.appendElement(tr);
  },
  _showAll: function() {
    this.clearTimeout();
    this.max = this.rowCount;
    this.timer = setTimeout(this.ajaxRequest.bind(this), g_key_delay);
  },
  _createTD: function(tr, text) {
    var td = cel("td", tr);
    $(td).addClassName("ac_cell");
    td.innerHTML = text.escapeHTML();
    return td;
  },
  _createTable: function() {
    this.table = cel("table");
    $(this.table).addClassName("ac_table_completer");
    this.tbody = cel("tbody", this.table);
    this.dropDown.appendChild(this.table);
    this.prevText = new Object();
  }
});