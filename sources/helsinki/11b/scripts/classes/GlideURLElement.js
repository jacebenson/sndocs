/*! RESOURCE: /scripts/classes/GlideURLElement.js */
var GlideURLElement = Class.create({
  initialize: function(name) {
    this.name = name;
  },
  setReadOnly: function(disabled) {
    var lockElement = gel(this.name + "_lock");
    if (!lockElement)
      return;
    var unlockElement = gel(this.name + "_unlock");
    if (disabled) {
      lock(lockElement, this.name, this.name, this.name + "_link", this.name, this.name + "_link");
      hideObject(unlockElement);
    } else {
      showObjectInlineBlock(unlockElement);
    }
  },
  setValue: function(value) {
    var encodedValue = htmlEscape(value);
    var update_id = this.name + "_link";
    var update_element = gel(update_id);
    if (update_element.href) {
      update_element.href = value;
    }
    update_element.innerHTML = encodedValue;
    var input = gel(this.name);
    input.value = value;
    onChange(this.name);
  },
  isDisabled: function() {
    var unlockElement = gel(this.name + "_unlock");
    return unlockElement.style.display == "none";
  },
  type: "GlideURLElement",
  z: null
});;