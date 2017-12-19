var cxs_TableFltrConfig = Class.create();
cxs_TableFltrConfig.prototype = Object.extendsObject(cxs_FltrConfig, {
	
	/**
	 * Returns a Search Resource query for this resource 
	 */
	getSearchResourceFilter: function() {
		return this._getSearchResourceFilter(this._gr.cxs_table_config);
	},

    type: 'cxs_TableFltrConfig'
});