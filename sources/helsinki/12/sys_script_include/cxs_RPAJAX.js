var cxs_RPAJAX = Class.create();

cxs_RPAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getRPConfigJSON: function() {
		return new JSON().encode(this.getRPConfig());
	},
	
	getRPConfig: function() {
		var searchConfig = {};

		var catItemId = this.getParameter("sysparm_cat_item_id");

		if (!catItemId)
			return searchConfig;
		
		var rpConfigGr = new GlideRecord('cxs_rp_config');
		rpConfigGr.addQuery('sc_cat_item', catItemId);
		rpConfigGr.addActiveQuery();
		rpConfigGr.query();
		if (!rpConfigGr.next())
			return searchConfig;
		
		searchConfig = cxs_App.getBusiness(rpConfigGr).getRPConfigObject();

		return searchConfig;
    },
	
    getDefaultLimit: function() {
        return gs.getProperty("com.snc.contextual_search.result.default.limit", 10);
    },	
	
	isPublic: function() {
		return false;
	},
	
	type: 'cxs_RPAJAX'
});