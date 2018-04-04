/*! RESOURCE: /scripts/GwtListEditBoolean.js */
var GwtListEditBoolean = Class.create(GwtListEditSelect, {
  addOptions: function() {
    this.staticOptions = true;
    var select = this.focusElement;
    var value = this.editor.getValue();
    addOption(select, true, getMessage("true"), value == "true");
    addOption(select, false, getMessage("false"), value != "true");
  },
  toString: function() {
    return "GwtListEditBoolean";
  }
});;