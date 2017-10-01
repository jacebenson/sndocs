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
            if (this.inputControls.tableElement.isDynamicCreation())
                sys_id = displayValue;
            else
                return;
        }
        if (sys_id == "NULL") {
            displayValue = '';
        }
        this.setReferenceValue(sys_id, refValid);
        this.setRenderValue(displayValue);
    },
    setReferenceValue: function(value, valid) {
        this.setValue(value);
        if (this.editor)
            this.editor.setReferenceValid(valid);
    },
    dismiss: function($super) {
        if (this.destroyed || !this.inputControls)
            return false;
        this.inputControls.clearDropDown();
        $super();
    },
    onKeyReturn: function(evt) {
        if (window.g_accessibility && evt && evt.target && evt.target.id == 'cell_edit_cancel')
            return this.onKeyEsc(evt);
        evt.stop();
        setTimeout(this.saveAndClose.bind(this), 50);
        this._placeCursorReturn(evt);
    },
    _getRefQualTag: function() {
        var cell = this.getAnchorCell();
        var table = findParentByTag(cell, "TABLE");
        if (table) {
            var tag = getAttributeValue(table, 'glide_list_edit_ref_qual_tag');
            if (tag)
                return tag;
        }
        return "";
    },
    _getDisplayValue: function() {
        if (this.editor.getValue() == "NULL")
            return "";
        return this.editor.getRenderValue() || this.editor.getDisplayValue();
    },
    toString: function() {
        return "GwtListEditReference";
    }
});;