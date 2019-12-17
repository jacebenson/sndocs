/*! RESOURCE: /scripts/classes/ajax/AJAXTableCompleter.js */
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
            var displayValue = item['label'