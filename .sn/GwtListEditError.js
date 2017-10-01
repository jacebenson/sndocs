/*! RESOURCE: /scripts/GwtListEditError.js */
var GwtListEditError = Class.create(GwtListEditWindow, {
    initialize: function($super, editor, gridEdit, errorMsg) {
        this.errorMsg = errorMsg;
        $super(editor, gridEdit);
    },
    _showUpdateMessage: function() {
        return;
    },
    createEditControls: function() {
        var input = this.createTextInput();
        input.value = this.editor.getDisplayValue();
        if (this.doctype)
            input.style.marginBottom = '3px';
        input.style.backgroundColor = "LightGrey";
        input.readOnly = true;
        this.setTitle(input);
        this.appendStatusPane(this.errorMsg);
        var e = $('cell_edit_ok');
        if (e)
            e.parentNode.removeChild(e);
    },
    focusEditor: function() {
        this.focusElement.focus();
    },
    saveAndClose: function() {
        this.dismiss();
        return true;
    },
    toString: function() {
        return "GwtListEditError";
    }
});;