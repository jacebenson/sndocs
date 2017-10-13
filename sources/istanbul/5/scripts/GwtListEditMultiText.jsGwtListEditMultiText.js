/*! RESOURCE: /scripts/GwtListEditMultiText.js */
var GwtListEditMultiText = Class.create(GwtListEditWindow, {
  createEditControls: function() {
    var input = this._createTextAreaInput();
    this.setTitle(input);
  },
  onKeyEsc: function(evt) {
    evt.stop();
    this.dismiss();
    setTimeout(this._delayedRefresh.bind(this), 10);
  },
  onKeyReturn: function(evt) {
    if (evt.shiftKey)
      return;
    evt.stop();
    this.saveAndClose();
    if (evt.ctrlKey)
      setTimeout(this._delayedEdit.bind(this), 10);
    else
      setTimeout(this._delayedRefresh.bind(this), 10);
  },
  _delayedRefresh: function() {
    this.gridEdit.refreshCursor();
  },
  _delayedEdit: function() {
    this.gridEdit.editNextRow();
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
    return "GwtListEditMultiText";
  }
});;