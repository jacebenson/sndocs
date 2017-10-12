/*! RESOURCE: /scripts/GwtGridEdit.js */
var GwtGridEdit = Class.create({
      initialize: function(tableController) {
        this.tableController = tableController;
        this.anchor = null;
        this.rec = 0;
        this.col = 0;
        this.editOnInsert = false;
        this.updateTable();
        Event.observe(window, 'resize', this._resize.bind(this));
        CustomEvent.observe("partial.page.reload", this.clearCursor.bind(this));
        CustomEvent.observe("tab.activated", this.clearCursor.bind(this));
        CustomEvent.observe('list.section.toggle', this.clearCursor.bind(this));
      },
      updateTable: function() {
        this.tableController.observeOnBody("keydown", this.keyDown.bind(this));
        this.tableController.observeOnBody("keypress", this.keyPress.bind(this));
        this.tableController.observeOnBody("blur", this.blur.bind(this));
        if (isMSIE)
          this.tableController.observeOnBody("focusout", this.blur.bind(this));
        this.tableController.observe('glide:list_v2.edit.saves_completed', this._handleSavesCompleted.bind(this));
        this.tableController.observe('glide:list_v2.edit.row_added', this._handleRowAdded.bind(this));
        this.cellSelector = this.tableController.buildCellSelector();
      },
      unLoadTable: function() {
        this.cellSelector = null;
      },
      setAnchorCell: function(anchor) {
        this.anchor = $(anchor);
        this.setCursorElement(this.anchor);
      },
      getAnchorCell: function() {
        return this.anchor;
      },
      getAnchorSysId: function() {
        return this.tableController.getSysIdByCell(this.getAnchorCell());
      },
      getAnchorAttribute: function(attribute) {
        return this.tableController.getAttributeByCell(attribute, this.getAnchorCell());
      },
      getAnchorFqFieldName: function() {
        var anchor = this.getAnchorCell();
        var row = this.tableController.getRowByCell(anchor);
        if (row.hasAttribute('data-detail-row'))
          return row.getAttribute('data-detail-row');
        return this.tableController.getNameFromColumn(anchor.cellIndex);
      },
      getAnchorRow: function() {
        return this.tableController.getRowByCell(this.getAnchorCell());
      },
      getAnchorPos: function() {
        return this.tableController.getRecordPos(this.getAnchorRow());
      },
      keyPress: function(evt) {
        if ((evt.keyCode != Event.KEY_TAB) && !this._inEditor())
          return;
        switch (evt.keyCode) {
          case Event.KEY_TAB:
          case Event.KEY_UP:
          case Event.KEY_DOWN:
          case Event.KEY_RIGHT:
          case Event.KEY_LEFT:
            evt.stop();
            break;
        }
      },
      keyDown: function(e) {
          if (e.keyCode == Event.KEY_TAB) {
            var shouldStop = this.tabKey(e);
            if (shouldStop)
              e.stop();
            return;
          }
          if (!this._inEditor())
            return;
          switch (e.keyCode) {
            case Event.KEY_DOWN:
              e.stop();
              if (e.shiftKey)
                this.selectVerticalKey(e, "down");
              else
                this.downArrow(e);
              break;
            case Event.KEY_UP:
              e.stop();
              if (e.shiftKey)
                this.selectVerticalKey(e, "up");
              else
                this.upArro