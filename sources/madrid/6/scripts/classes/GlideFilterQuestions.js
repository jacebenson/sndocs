/*! RESOURCE: /scripts/classes/GlideFilterQuestions.js */
var GlideFilterQuestions = Class.create(GlideFilterVariables, {
      getFilterText: function(oper) {
        if (!this.variableFilter)
          return '';
        return "variablesHASQUESTION:" + this.getValues() + oper + this.variableFilter.getValues();
      },
      _refListOpenCat: function() {
        reflistOpen(this.catID, "cat_item", "sc_cat_item_producer");
        return false;
      },
      _onFocusCat: function(evt) {
          if (!this.inputs[3].ac) {
            this.inputs[3].ac = new AJAXTableCompleter(this.inputs[3], this.catID, '');
            this.inputs[3].ac.setFilterCallBack(this._refValueChangeCat.bind(this));
            this.inputs[3].ac.elementName = "item_option_new.cat_item";
            this.inputs[3].ac.setAdditionalValue("ac_columns", "short_description;category");
            this.inputs[3].ac.setAdditionalValue("sysparm_ref_qual", "active=tru