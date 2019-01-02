/*! RESOURCE: /scripts/GwtListEditor.js */
var GwtListEditor = Class.create({
      initialize: function() {
        this.cellEditor = null;
        this.ignoreTypes = [];
        this._preparedTables = [];
        this._clearListEditorCache();
        CustomEvent.observe("tab.activated", this._onTabActivated.bind(this));
        this.dirtyFormMessage = null;
        this.openEditorMessage = null;
        this.cursor = new GwtCursor();
      },
      edit: function(element) {
        this.savePreviousEditor();
        var cellEditor = this._createCellEditor(element);
        if (cellEditor)
          this.cellEditor = cellEditor;
      },
      _createCellEditor: function(element) {
        var listEditor = this._getListEditorForElement(element);
        if (listEditor)
          return listEditor.createCellEditor(element, this.ignoreTypes);
        else
          return null;
      },
      savePreviousEditor: function() {
        if (!this.cellEditor)
          return;
        if (this.cellEditor.saveAndClose())
          this.cellEditor = null;
      },
      ignoreClick: function(element) {
        if (element.tagName != 'TD')
          return true;
        if (!hasClassName(element, 'vt'))
          return true;
        if (hasClassName(element, 'vt-spacer'))
          return true;
      },
      onClickedAndDisabled: function(e) {
          var element = Event.element(e);
          if (element.tagName == 'DIV' && element.parentNode.tagName ==