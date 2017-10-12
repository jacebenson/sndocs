/*! RESOURCE: /scripts/GwtCellEditor.js */
var GwtCellEditor = Class.create({
      REF_ELEMENT_PREFIX: 'ref_',
      IGNORE_MSG: "This element type is not editable from the list.",
      WAITING_IMAGE: 'images/loading_anim3.gifx',
      initialize: function(gridEdit, ignoreTypes, changes, tableController, renderer) {
        this.gridEdit = gridEdit;
        this.ignoreTypes = ignoreTypes;
        this.changes = changes;
        this.tableController = tableController;
        this.renderer = renderer;
        this._initElement();
        this.savedFields = [];
        if (this.changes.isDeletedRow(this.sysId))
          return;
        this.timer = setTimeout(this.showLoading.bind(this), this.WAIT_INITIAL_DELAY);
        this.valid = true;
        this.errorMsg = this._checkIgnoreTypes();
        if (this.errorMsg) {
          this.editWindow = this._buildErrorEditor();
          return;
        }
        this.errorMsg = this._checkMultipleDerivedOrExtended();
        if (this.errorMsg) {
          this.editWindow = this._buildErrorEditor();
          return;
        }
        this._loadValues(this.renderEditor.bind(this));
      },
      dismiss: function() {
        this.valid = false;
        this.hideLoading();
        if (this.editWindow)
          this.editWindow.dismiss();
      },
      saveAndClose: function() {
          this.valid = false;
          this.hideLoading();
          if (this.editWindow)
            return this.editWindow.sa