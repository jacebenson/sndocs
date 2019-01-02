var TextAreaElement = Class.create({
  initialize: function(name) {
    this.name = name;
  },
  setReadOnly: function(disabled) {
    var d = gel(this.name);
    if (disabled) {
      d.readOnly = "readonly";
      addClassName(d, 'readonly');
    } else {
      d.readOnly = "";
      removeClassName(d, 'readonly');
    }
  },
  setValue: function(newValue, newDisplayValue) {
    var d = gel(this.name + ".ta");
    if (d)
      d.value = newValue;
    var d = gel(this.name);
    d.value = newValue;
  }
});