/*! RESOURCE: /scripts/GwtListEditJournal.js */
var GwtListEditJournal = Class.create(GwtListEditWindow, {
    createEditControls: function() {
        var input = this._createTextAreaInput();
        this.setTitle(input);
    },
    onKeyReturn: function($super, evt) {
        if (window.g_accessibility && evt && evt.target && evt.target.id == 'cell_edit_cancel')
            return this.onKeyEsc(evt);
        if (evt.shiftKey)
            return;
        $super(evt);
    },
    _createTextAreaInput: function() {
        var answer = cel("textarea");
        answer.value = "";
        answer.rows = 3;
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
        if (input)
            this.setValue(null, input.value);
    },
    toString: function() {
        return "GwtListEditJournal";
    }
});;