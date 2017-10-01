/*! RESOURCE: /scripts/GwtListEditEncryptedText.js */
var GwtListEditEncryptedText = Class.create(GwtListEditWindow, {
    createEditControls: function() {
        var input = this._createTextAreaInput();
        this.setTitle(input);
    },
    _createTextAreaInput: function() {
        var answer = cel("textarea");
        answer.value = this.editor.getDisplayValue();
        answer.rows = 4;
        answer.id = GwtListEditWindow.inputID;
        if (this.doctype)
            answer.addClassName('form-control list-edit-input');
        if (!this.doctype) {
            answer.style.width = this.preferredWidth;
            answer.style.overflow = "auto";
        }
        this.focusElement = answer;
        return answer;
    },
    save: function() {
        var input = GwtListEditWindow.getCellEditValue();
        if (input) {
            this.setValue(null, input.value);
            this.setRenderValue(this.truncateDisplayValue(input.value));
        }
    },
    toString: function() {
        return "GwtListEditEncryptedText";
    }
});;