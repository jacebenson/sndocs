/*! RESOURCE: /scripts/GwtListEditText.js */
var GwtListEditText = Class.create(GwtListEditWindow, {
    createEditControls: function() {
        var input = this.createTextInput();
        input.value = this.editor.getValue();
        var tableElement = this.editor.tableElement;
        if (tableElement.maxLength > 0)
            input.setAttribute("maxLength", tableElement.maxLength);
        var answer = this.editor.getValue();
        if (tableElement.isNumber()) {
            input.value = this.editor.getDisplayValue();
            input.className = this.doctype ? 'decimal form-control list-edit-input' : 'decimal';
            answer = this.editor.getDisplayValue();
        }
        this.setTitle(input);
        answer = answer.replace(/\n/g, " ");
        answer = answer.replace(/\t/g, "");
        this.focusElement.value = answer;
    },
    save: function() {
        var input = GwtListEditWindow.getCellEditValue();
        if (input) {
            if (this.editor.tableElement.isNumber() || this.editor.tableElement.getType() == "translated_text")
                this.setValue(null, input.value);
            else
                this.setValue(input.value);
            this.setRenderValue(this.truncateDisplayValue(input.value));
        }
    },
    toString: function() {
        return "GwtListEditText";
    }
});;