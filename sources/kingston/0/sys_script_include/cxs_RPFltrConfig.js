var cxs_RPFltrConfig = Class.create();
cxs_RPFltrConfig.prototype = Object.extendsObject(cxs_FltrConfig, {
	
	/**
	 * Returns a list of possible Search Resource Ids for the configuration
	 */
	getSearchResourceFilter: function() {
		return this._getSearchResourceFilter(this._gr.cxs_rp_config);
	},

    type: 'cxs_RPFltrConfig'
});