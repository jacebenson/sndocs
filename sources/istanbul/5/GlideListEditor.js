/*! RESOURCE: /scripts/GlideListEditor.js */
var GlideListEditor = Class.create({
      MSGS: [
        'Mark deleted', 'New row'
      ],
      initialize: function(table) {
        this.tableController = new GwtListEditTableController(table);
        this.changes = new GwtListEditorPendingChanges(this.tableController);
        this.tableController.changes = this.changes;
        this.renderer = new GwtListEditValueRenderer(this.changes, this.tableController);
        this.tableController.renderer = this.renderer;
        this.savePolicy = this.tableController.buildSavePolicy();
        this.gridEdit = new GwtGridEdit(this.tableController);
        this.msgs = getMessages(this.MSGS);
        this.emptyRecord = null;
        this._observeTableEvents();
        if (this.tableController.isFormUI())
          this.changes.loadTable(function() {});
      },
      updateTable: function(tableDOM) {
        if (this.tableController.isForTable(tableDOM))
          return;
        this.tableController.updateTable(tableDOM);
        this.renderer.updateTable();
        this.gridEdit.updateTable();
        this._observeTableEvents();
      },
      unLoadTable: function(tableDOM) {
        this.tableController.unLoadTable(tableDOM);
      },
      _observeTableEvents: function() {
        var policyCallback = this._savePolicy.bind(this);
        this.tableController.observe('glide:list_v2.edit.cells_changed', policyCallback);
        this.tableController.observe('glide:list_v2.edit.focus_moved', policyCallback);
        this.tableController.observe('glide:list_v2.edit.save_now', policyCallback);
        Event.observe(this.tableController.tableElementDOM, 'click', policyCallback);
        this.tableController.observe('glide:list_v2.edit.changes_saved', this._handleChangesSaved.bind(this));
        this.tableController.observe('glide:list_v2.edit.rows_deleted', this._handleRowsDeleted.bind(this));
        this.tableController.observe('glide:list_v2.edit.focus_moved', this._handleFocusMoved.bind(this));
        Event.observe(this.tableController.tableElementDOM, 'glide:list_v2.edit.update_column', this._updateColumn.bind(this));
        Event.observe(this.tableController.tableElementDOM, 'glide:list_v2.edit.check_enter_once', this._checkEnterOnce.bind(this));
        if (window.GlideListEditorMessaging)
          new GlideListEditorMessaging(this);
      },
      createCellEditor: function(element, ignoreTypes) {
        if (!this.tableController.canEdit())
          return null;
        this.gridEdit.hideCursor();
        this.gridEdit.clearRanges();
        this.gridEdit.setAnchorCell(element);
        this.cellEditor = new GwtCellEditor(this.gridEdit, ignoreTypes,
          this.changes, this.tableController, this.renderer);
        return this.cellEditor;
      },
      setCursor: function(element) {
        this.gridEdit.setCursorElement(element);
      },
      _savePolicy: function(evt) {
        this.savePolicy.analyzeEvent(evt);
        if (this.savePolicy.isDirectSave()) {
          this.saveChanges(this._saveComplete.bind(this));
          return;
        }
        if (this.savePolicy.isDeferredSave()) {
          this._fireChangesDeferred();
          this._saveComplete();
          return;
        }
        if (this.savePolicy.isImpliedSave()) {
          this.saveChanges(null);
          return;
        }
      },
      _fireChangesDeferred: function() {
        var info = {
          listId: this.tableController.listID,
          defers: this.savePolicy.getDeferredSaves()
        };
        this.tableController.fire('glide:list_v2.edit.changes_deferred', info);
      },
      _saveComplete: function() {
        var info = {
          listId: this.tableController.listID
        };
        this.tableController.fire('glide:list_v2.edit.saves_completed', info);
        CustomEvent.fire('list_content_changed');
      },
      _handleChangesSaved: function(evt) {
        this.savePolicy.handleChangesSaved(evt);
      },
      _handleRowsDeleted: function(evt) {
        this.savePolicy.handleRowsDeleted(evt);
        this.gridEdit.showCursor();
      },
      _handleFocusMoved: function(evt) {
        if (!this.cellEditor)
          return;
        if (!this.cellEditor.isActive())
          return;
        if (evt.memo.listId !== this.tableController.listID)
          return;
        var cursorCell = this.gridEdit.getCursorCell();
        var anchorCell = this.gridEdit.getAnchorCell();
        if (cursorCell !== anchorCell) {
          this.cellEditor.dismiss();
          GwtListEditor.forPage.edit(cursorCell);
        }
      },
      saveNow: function() {
        var info = {
          listId: this.tableController.listID
        };
        this.tableController.fire('glide:list_v2.edit.save_now', info);
      },
      applyUpdates: function() {
        this.changes.resetAggregates();
        var updater = new GlideListEditor.RowUpdater(this.changes, this.tableController, this.renderer);
        this.changes.exportRecords(updater);
        if (this.tableController.needsInsertRow())
          this.renderer.addRowNoInsert();
      },
      _getRow: function(sysId) {
        return this.tableController.getRow(sysId);
      },
      addRow: function() {
        this.renderer.addRow();
      },
      saveUpdatesInForm: function() {
        addHidden(this._getForm(), this._getXmlIslandName(), this._serializeModified());
      },
      _serializeModified: function() {
        var xml = this._createRecordUpdateXml();
        var selector = new GlideListEditor.IsModifiedRecordSelector(this.changes);
        var receiver = new GlideListEditor.XmlSerializingReceiver(xml, xml.documentElement, selector);
        this.changes.exportChanges(receiver);
        return getXMLString(xml);
      },
      _createRecordUpdateXml: function() {
        var xml = loadXML("<record_update/>");
        this.tableController.exportXml(xml.documentElement);
        return xml;
      },
      _getForm: function() {
        if ((typeof g_form == "undefined") || (!g_form))
          return null;
        return gel(g_form.getTableName() + ".do");
      },
      _getXmlIslandName: function() {
        return "ni.java.com.glide.ui_list_edit.ListEditFormatterAction[" + this.tableController.listID + "]";
      },
      callOnSubmit: function() {
        var retVal;
        var scriptName = "onSubmit_" + this.tableController.listID;
        for (var ndx = 0;
          (ndx < 100) && (retVal != false); ndx++) {
          var f = GlideListEditor.getClientScriptFunc(scriptName, ndx);
          if (f == null)
            break;
          try {
            retVal = f();
          } catch (ex) {}
        }
        return retVal;
      },
      saveChanges: function(onComplete) {
        var saver = new GwtListEditAjaxChangeSaver(this.changes, this.tableController, onComplete);
        saver.save();
      },
      buildGList: function() {
        return new GwtListEditGList(this.changes, this.tableController, this.renderer);
      },
      hasChanges: function() {
        var selector = new GlideListEditor.IsModifiedRecordSelector(this.changes);
        var inspector = new GlideListEditor.ChangeCounter(selector);
        this.changes.inspectRecords(inspector);
        return inspector.isDone();
      },
      deleteRowToggle: function(sysId) {
        this.renderer.deleteRowToggle(sysId);
      },
      getSelectedRows: function() {
        return this.gridEdit.getSelectedRows();
      },
      _updateColumn: function(evt) {
        var columnName = evt.memo.columnName;
        var value = evt.memo.newValue;
        var ids = evt.memo.ids != null ? evt.memo.ids : this.changes.calcWritableSysIds(this.tableController.sysIds, [columnName]);
        var numIds = ids.length;
        for (var i = 0; i < numIds; i++) {
          var id = ids[i];
          if (evt.memo.ids != null || this.changes.emptyRecord == null || this.changes.emptyRecord.sysId != id) {
            this.renderer.setValue(id, columnName, value);
            this.changes.setRenderValue(id, columnName, value);
            if (this.changes.isFieldDirty(id, columnName)) {
              this.renderer.renderValue(id, columnName);
            }
          }
        }
      },
      _checkEnterOnce: function(evt) {
          var properties = evt.memo.properties;
          var answer = [];
          var l = properties.length;
          for (var j = 0; j < l; j++) {
            var p = properties[j];
            var columnName = p.field;
            var ids = evt.memo.ids != null ? evt.memo.ids : this.changes.calcWritableSysIds(this.tableController.sysIds, [columnName]);
            var num