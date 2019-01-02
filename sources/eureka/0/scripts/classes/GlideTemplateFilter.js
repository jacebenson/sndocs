var GlideTemplateFilter = Class.create(GlideFilter, {
  initialize: function(name, query, fDiv, runnable, synchronous, showOperators) {
    if (gtf_show_ops)
      noOps = false;
    else
      noOps = true;
    noSort = true;
    noGroup = true;
    noConditionals = true;
    useTextareas = true;
    filterExpanded = true;
    GlideFilter.prototype.initialize.call(this, name, query, fDiv, runnable, synchronous);
    this.type = "GlideTemplateFilter";
    this.usedFields = new Object();
    this.protectedFields = new Object();
    this.fieldName = null;
    this.ignoreVariables();
  },
  setFieldName: function(name) {
    this.fieldName = name;
  },
  filterFields: function(item) {
    var name = item.getName();
    if (!GlideFilter.prototype.filterFields.call(this, item))
      return false;
    if (!item.canSaveAsTemplate()) {
      this.protectedFields[name] = true;
      return false;
    }
    if (this.usedFields[name])
      return false;
    return true;
  },
  preQuery: function() {
    for (var i = 0; i < this.terms.length; i++) {
      var qp = this.terms[i];
      if (!qp.isValid())
        continue;
      var field = qp.getField();
      this.setFieldUsed(field);
    }
  },
  setFieldUsed: function(name) {
    jslog("Field used:" + name)
    this.usedFields[name] = true;
  },
  setAllowJournal: function(value) {
    this.allowJournal = value;
  },
  setOperations: function(value) {
    if (value == "null")
      return;
    gtfOperators = [];
    operations = value.split(";");
    for (var i = 0; i < operations.length; i++)
      gtfOperators.push(operations[i].split(":"));
  },
  clearFieldUsed: function(name, condition) {
    jslog("Field NOT used:" + name)
    this.usedFields[name] = false;
    if (condition.isPlaceHolder())
      return;
    condition.removePlaceHolder();
    condition.newPlaceHolder();
  },
  refreshSelectList: function() {
    for (var i = 0; i < this.sections.length; i++)
      this.sections[i].refreshSelectList();
    this.updateDBValue();
  },
  setNoOps: function(useExtended) {},
  isProtectedField: function(name) {
    if (this.protectedFields[name])
      return true;
    return false;
  },
  updateDBValue: function() {
    var el = gel(this.fieldName);
    if (el) {
      var value = getFilter(this.fieldName);
      el.value = value;
      onChange(this.fieldName);
    }
  },
  type: 'GlideTemplateFilter'
});