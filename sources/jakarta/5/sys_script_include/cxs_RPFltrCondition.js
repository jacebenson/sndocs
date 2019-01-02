var cxs_RPFltrCondition = Class.create();
cxs_RPFltrCondition.prototype = Object.extendsObject(cxs_Base, {
    
	// Variables types allowed for comparison
	VAR_TYPES: {"1": true, "3": true, "4": true, "5": true, "6": true, "7": true,
				"8": true, "9": true, "10": true, "15": true, "16": true, "18": true,
				"21": true, "22": true, "26": true, "27": true, "28": true},
	
	/**
	 * Create the encoded query filter to lookup variables for comparison
	 */
	getVariableFilter: function() {
		var variableIds = [];
	
		var catItemId = this._gr.cxs_rp_fltr_config.cxs_rp_config.sc_cat_item;
		if (JSUtil.nil(catItemId))
			return "sys_idIN" + resourceIds;
		
		var variables = new GlideRecord("item_option_new");
		variables.addActiveQuery();
		variables.addQuery("cat_item", catItemId);
		variables.query();
		
		while (variables.next()) {
			this._log.error("\n\n\n\nvariables: " + variables.getDisplayValue() + "\n\n\n\n" + variables.type + "\n\n\n\n" + this.VAR_TYPES[variables.type + ""] + "\n\n\n\n");
			if (!this.VAR_TYPES[variables.type + ""])
				continue;
			variableIds.push(variables.getUniqueValue()+"");
		}
		
		return "sys_idIN" + variableIds;
	},

    type: 'cxs_RPFltrCondition'
});