/*! RESOURCE: /scripts/classes/TableElement.js */
var TableElement = Class.create({
  REF_ELEMENT_PREFIX: 'ref_',
  initialize: function(elementName, elementLabel) {
    this.name = elementName;
    this.label = elementLabel;
    this.clearLabel = '';
    this.tableName = '';
    this.type = 'string';
    this.isRef = false;
    this.refLabel = null;
    this.refDisplay = null;
    this.refQual = null;
    this.reference = null;
    this.refKey = null;
    this.refRotated = false;
    this.array = null;
    this.canread = 'unknown';
    this.canwrite = 'unknown';
    this.saveastemplate = 'unknown';
    this.choice = '';
    this.multi = false;
    this.active = 'unknown';
    this.table = null;
    this.dependent = null;
    this.maxLength = null;
    this.displayChars = "-1";
    this.attributes = {};
    this.dependentChildren = {};
    this.namedAttributes = {};
    this.extensionElement = false;
    this.dynamicCreation = false;
  },
  addAttribute: function(name, value) {
    this.attributes[name] = value;
  },
  getAttribute: function(name) {
    return this.attributes[name];
  },
  getBooleanAttribute: function(name, defaultValue) {
    var v = this.getAttribute(name);
    if (v == null)
      return (typeof defaultValue !== 'undefined') ? defaultValue : true;
    if (v == 'false' || v == 'no')
      return false;
    return true;
  },
  isDependent: function() {
    return this.dependent != null;
  },
  hasDependentChildren: function() {
    for (var key in this.dependentChildren)
      return true;
    return false;
  },
  getDependentChildren: function() {
    return this.dependentChildren;
  },
  setTable: function(t) {
    this.table = t;
  },
  setType: function(type) {
    this.type = type;
    if (type == 'glide_list')
      this.isRef = false;
    if (type == 'glide_var')
      this.isRef = true;
  },
  setReference: function(reference) {
    if (reference && reference != '')
      this.reference = reference;
    this.isRef = false;
    switch (this.type) {
      case 'glide_list':
        if (this.reference)
          this.isRef = true;
        break;
      case 'reference':
      case 'domain_id':
      case 'glide_var':
      case 'currency2':
        this.isRef = true;
        break;
    }
  },
  setRefRotated: function(rotated) {
    if ('yes' == rotated)
      this.refRotated = true;
    else
      this.refRotated = false;
  },
  setCanWrite: function(ra) {
    if ('no' == ra)
      this.canwrite = false;
    else
      this.canwrite = true;
  },
  setSaveAsTemplate: function(ra) {
    if ('no' == ra)
      this.saveastemplate = false;
    else
      this.saveastemplate = true;
  },
  setCanRead: function(ra) {
    if ('no' == ra)
      this.canread = false;
    else
      this.canread = true;
  },
  setActive: function(active) {
    if ('no' == active)
      this.active = false;
    else
      this.active = true;
  },
  setRefQual: function(refQual) {
    this.refQual = refQual;
  },
  setRefKey: function(refKey) {
    this.refKey = refKey;
  },
  setRefLabel: function(label) {
    this.refLabel = label;
  },
  setRefDisplay: function(display) {
    this.refDisplay = display;
  },
  setArray: function(array) {
    this.array = array;
  },
  setClearLabel: function(cl) {
    this.clearLabel = cl;
  },
  setChoice: function(choice) {
    this.choice = choice;
  },
  setMulti: function(multi) {
    this.multi = multi;
  },
  setExtensionElement: function(b) {
    this.extensionElement = b;
  },
  setDependent: function(dep) {
    if (dep && dep != '')
      this.dependent = dep;
  },
  addDependentChild: function(name) {
    if (name)
      this.dependentChildren[name] = true;
  },
  setMaxLength: function(maxLength) {
    this.maxLength = maxLength;
  },
  setDisplayChars: function(displayChars) {
    this.displayChars = displayChars;
  },
  setNamedAttributes: function(attrs) {
    if (!attrs)
      return;
    var pairs = attrs.split(',');
    for (var i = 0; i < pairs.length; i++) {
      var parts = pairs[i].split('=');
      if (parts.length == 2)
        this.namedAttributes[parts[0]] = parts[1];
    }
  },
  setDynamicCreation: function(dynamic) {
    this.dynamicCreation = dynamic;
  },
  isReference: function() {
    return this.isRef;
  },
  isRefRotated: function() {
    return this.refRotated;
  },
  isExtensionElement: function() {
    return this.extensionElement;
  },
  isDate: function() {
    return dateTypes[this.type];
  },
  isDateOnly: function() {
    if (dateOnlyTypes[this.type])
      return true;
    else
      return false;
  },
  isDateTime: function() {
    if (dateTimeTypes[this.type])
      return true;
    else
      return false;
  },
  getName: function() {
    return this.name;
  },
  getLabel: function() {
    return this.label;
  },
  getClearLabel: function() {
    return this.clearLabel;
  },
  getReference: function() {
    return this.reference;
  },
  getMulti: function() {
    return this.multi;
  },
  isMulti: function() {
    return this.getMulti() == 'yes';
  },
  getDependent: function() {
    return this.dependent;
  },
  getRefQual: function() {
    return this.refQual;
  },
  getRefKey: function() {
    return this.refKey;
  },
  getRefLabel: function() {
    return this.refLabel;
  },
  getRefDisplay: function() {
    return this.refDisplay;
  },
  getType: function() {
    return this.type;
  },
  getChoice: function() {
    return this.choice;
  },
  getTable: function() {
    return this.table;
  },
  getTableName: function() {
    return this.tableName;
  },
  setTableName: function(t) {
    this.tableName = t;
  },
  isChoice: function() {
    return (this.choice == 1 ||
      this.choice == 3 ||
      this.type == "day_of_week" ||
      this.type == "week_of_month" ||
      this.type == "month_of_year");
  },
  getMaxLength: function() {
    return this.maxLength;
  },
  getDisplayChars: function() {
    return this.displayChars;
  },
  canRead: function() {
    if (this.canread == 'unknown')
      return this.getBooleanAttribute("canread");
    return this.canread;
  },
  canSaveAsTemplate: function() {
    if (this.saveastemplate == 'unknown')
      return this.getBooleanAttribute("save_as_template");
    return this.saveastemplate;
  },
  canWrite: function() {
    if (this.canwrite == 'unknown')
      return this.getBooleanAttribute("canwrite");
    return this.canwrite;
  },
  canMatch: function() {
    return this.getBooleanAttribute("canmatch");
  },
  isEdgeEncrypted: function() {
    return this.getBooleanAttribute("edge_encrypted", false);
  },
  isActive: function() {
    if (this.active == 'unknown')
      return this.getBooleanAttribute("active");
    return this.active;
  },
  isNumber: function() {
    return this.type == 'integer' ||
      this.type == 'decimal' ||
      this.type == 'numeric' ||
      this.type == 'float' ||
      this.type == 'percent_complete';
  },
  isArray: function() {
    if (this.array && this.array == 'yes')
      return true;
    return false;
  },
  canSort: function() {
    if (!this.getBooleanAttribute("cansort"))
      return false;
    if (this.name.indexOf("password") > -1)
      return false;
    if (this.name == 'sys_id')
      return false;
    if (this.type == "journal" || this.type == "journal_input")
      return false;
    if (this.isArray())
      return false;
    return true;
  },
  canSortI18N: function() {
    return this.getBooleanAttribute("cansorti18n");
  },
  canGroup: function() {
    if (this.getNamedAttribute("can_group") == "true")
      return true;
    if (this.isEdgeEncrypted() && this.canMatch())
      return true;
    if (!this.canSort())
      return false;
    if (this.isMulti())
      return false;
    if (this.name.indexOf(".") > -1 && this.name.indexOf(this.REF_ELEMENT_PREFIX) > -1)
      return false;
    if (this.type == "glide_duration")
      return true;
    if (this.type == 'glide_date_time' ||
      this.type == 'glide_date' ||
      this.type == 'glide_time' ||
      this.type == 'due_date')
      return false;
    return true;
  },
  getAttributes: function() {
    return this.attributes['attributes'];
  },
  getNamedAttribute: function(name) {
    if (this.namedAttributes[name])
      return this.namedAttributes[name];
    else
      return null;
  },
  type: function() {
    return "TableElement";
  },
  isDynamicCreation: function() {
    return this.dynamicCreation;
  },
  isEncrypted: function() {
    return this.getBooleanAttribute("glide_encrypted", false) || this.getType() == "glide_encrypted";
  }
});
TableElement.get = function(name) {
  var names = name.split('.');
  var table = names[0];
  var tableDef = Table.get(table);
  var e = null;
  for (var i = 1; i < names.length; i++) {
    e = tableDef.getElement(names[i]);
    if (i == names.length - 1)
      break;
    if (!e.isReference())
      break;
    tableDef = Table.get(e.getReference());
  }
  return e;
};