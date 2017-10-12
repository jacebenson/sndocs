/*! RESOURCE: /scripts/GwtListEditReference.js */
var GwtListEditReference = Class.create(GwtListEditWindow, {
      createEditControls: function() {
        this.id = this.refName;
        this._createInputControls(this.getTitle());
      },
      _createInputControls: function(parent) {
        var refSysId = this.editor.getValue();
        var rowSysId = this.getAnchorSysId();
        this.inputControls = new AJAXReferenceControls(this.editor.tableElement, this.id, parent, refSysId, rowSysId, this._getRefQualTag());
        this.inputControls.setDisplayValue(this._getDisplayValue());
        this.focusElement = this.inputControls.getInput();
        this.focusElement.style.width = this.preferredWidth;
        this.inputControls.setRecord(this.editor);
      },
      saveAndClose: function($super) {
        this.inputControls.resolveReference();
        if (this.inputControls.isResolving())
          this.inputControls.setResolveCallback(this.saveAndClose.bind(this));
        else
          return $super();
      },
      save: function() {
          var sys_id = this.inputControls.getValue();
          if (!sys_id)
            sys_id = "NULL";
          if (sys_id == "1111")
            sys_id = "NULL";
          var displayValue = this.inputControls.getDisplayValue();
          var refValid = this.inputControls.isReferenceValid();
          if (!refValid) {
            if (this.inputControls.tableElemen