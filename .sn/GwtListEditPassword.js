/*! RESOURCE: /scripts/GwtListEditPassword.js */
var GwtListEditPassword = Class.create(GwtListEditWindow, {
    createEditControls: function() {
        var input = this.createTextInput();
        input.type = "password";
        this.setTitle(input);
    },
    save: function() {
        var input = GwtListEditWindow.getCellEditValue();
        if (input)
            this.setValue(null, input.value);
    },
    toString: function() {
        return "GwtListEditPassword";
    }
});;