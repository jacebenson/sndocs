/*! RESOURCE: /scripts/classes/GlideFilterItemVariables.js */
var GlideFilterItemVariables = Class.create(GlideFilterVariables, {
  getFilterText: function(oper) {
    if (!this.variableFilter)
      return '';
    return "variablesHASITEMVARIABLE:" + this.getValues() + oper + this.variableFilter.getValues();
  },
  z: null
});;