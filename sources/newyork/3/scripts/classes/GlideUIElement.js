/*! RESOURCE: /scripts/classes/GlideUIElement.js */
var GlideUIElement = Class.create({
  CACHE_ELEMENTS: true,
  ENABLE_CHILD_WALKING: false,
  initialize: function(tableName, fieldName, type, mandatory, reference, attributes, scope) {
    this.tableName = tableName;
    this.fieldName = fieldName;
    this.type = type;
    this.mandatory = mandatory;
    this.reference = reference;
    this.attributes = attributes;
    this.elementFetched = false;
    this.elementParentNode;
    this.fetchedNodes = {};
    this.scope = scope || "global";
  },
  getType: function() {
    return this.type;
  },
  getID: function() {
    return this.tableName + '.' + this.fieldName;
  },
  getElementParentNode: function() {
    if (!this.elementFetched) {
      this.elementParentNode = gel('element.' + this.getID());
      this.elementFetched = true;
    }
    return this.elementParentNode;
  },
  getElement: function() {
    return this.getChildElementById(this.getID());
  },
  getLabelElement: function() {
    var parentElementNode = this.getElementParentNode();
    if (!parentElementNode)
      parentElementNode = document;
    var labels = parentElementNode.getElementsByTagName('label');
    for (var i = 0;
      (label = labels[i]); i++) {
      if (label.htmlFor == this.getID())
        return label;
    }
    return this.getStatusElement();
  },
  getStatusElement: function() {
    return this.getChildElementById('status.' + this.getID());
  },
  getChildElementById: function(id) {
    if (this.fetchedNodes[id])
      return this.fetchedNodes[id];
    var element = this.getChildElementById0(id);
    if (element)
      this.fetchedNodes[id] = element;
    return element;
  },
  getChildElementById0: function(id) {
    var element;
    if (this.ENABLE_CHILD_WALKING) {
      element = this._findSubChild(this.getElementParentNode(), id);
      if (element)
        return element;
    }
    return gel(id);
  },
  isMandatory: function() {
    return this.mandatory;
  },
  isDerived: function() {
    if (!this.fieldName)
      return false;
    return this.fieldName.indexOf('.') > -1;
  },
  setMandatory: function(mandatory) {
    this.mandatory = mandatory;
  },
  getValue: function() {
    var element = this.getElement();
    return element && element.value;
  },
  getScope: function() {
    return this.scope;
  },
  _findSubChild: function(startNode, id) {
    if (!startNode || (startNode.id && startNode.id == id))
      return startNode;
    var childNodes = startNode.children || startNode.childNodes;
    for (var i = 0; i < childNodes.length; i++) {
      var foundNode = this._findSubChild(childNodes[i], id);
      if (foundNode)
        return foundNode;
    }
    return;
  },
  type: "GlideUIElement"
});

function createGlideUIElement(tableName, fieldName, type, mandatory, reference, attributes, scope) {
  if (mandatory && fieldName && fieldName.indexOf('.') > -1)
    return new GlideMandatoryDerivedUIElement(tableName, fieldName, type, mandatory, reference, attributes, scope);
  return new GlideUIElement(tableName, fieldName, type, mandatory, reference, attributes, scope);
};