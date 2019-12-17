/*! RESOURCE: /scripts/classes/GlideMandatoryDerivedUIElement.js */
var GlideMandatoryDerivedUIElement = Class.create(GlideUIElement, {
  initialize: function($super, tableName, fieldName, type, mandatory, reference, attributes, scope) {
    $super(tableName, fieldName, type, mandatory, reference, attributes, scope);
    this.referenceFieldName = fieldName ? fieldName.substr(0, fieldName.lastIndexOf('.')) : '';
    this.mandatoryDerived = mandatory && this.referenceFieldName ? true : false;
    if (this.mandatoryDerived) {
      this.mandatory = null;
      var e = this.getElement();
      if (e)
        e.setAttribute("mandatory", mandatory);
    }
    this.referenceField;
  },
  isMandatory: function() {
    return this.mandatory == null ?
      !this._isDisabled() && this.isMandatoryByReferenceField() :
      this.mandatory;
  },
  isMandatoryByReferenceField: function() {
    return this.referenceField && (this.referenceField.isMandatory() || this.referenceField.getValue()) ? true : false;
  },
  getElementMandatory: function() {
    var e = this.getElement();
    return e ? e.getAttribute('mandatory') : null;
  },
  setReferenceField: function(reference) {
    this.referenceField = reference;
  },
  _isDisabled: function() {
    var control = this.getElement();
    if (!control)
      return true;
    if (control.getAttribute('derived-waiting') === "true")
      return false;
    return control.disabled || control.readOnly ||
      ((typeof control.hasClassName === "function") && control.hasClassName("readonly")) ||
      ((typeof control.getAttribute === "function") && control.getAttribute("writeaccess") == "false");
  },
  type: "GlideMandatoryDerivedUIElement"
});;