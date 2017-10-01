/*! RESOURCE: /scripts/GwtListEditTranslatedField.js */
var GwtListEditTranslatedField = Class.create(GwtListEditWindow, {
    createEditControls: function() {
        var input = this.createTextInput();
        input.value = this.editor.getDisplayValue();
        this.setTitle(input);
        if (this.editor.tableElement.maxLength > 0)
            input.setAttribute("maxLength", this.editor.tableElement.maxLength);
        var answer = input.value.replace(/\n/g, " ");
        answer = answer.replace(/\t/g, "");
        this.focusElement.value = answer;
    },
    save: function() {
        var input = GwtListEditWindow.getCellEditValue();
        if (input) {
            this.setValue(null, input.value);
            this.setRenderValue(this.truncateDisplayValue(input.value));
        }
    },
    toString: function() {
        return "GwtListEditTranslatedField";
    }
});;