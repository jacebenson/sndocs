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
		
		// set rp filter config
		var filterConfig = this.getRPFilterConfig(searchConfig.sys_id);
		searchConfig.filter_config = filterConfig;
		return searchConfig;
    },
    
    getRPFilterConfig: function(rpConfigId) {
        var searchFilterConfig = {};
		
        var isActive = GlidePluginManager.isActive('com.snc.contextual_search.dynamic_filters');
        if (!isActive || !rpConfigId)
            return searchFilterConfig;
        
		
		searchFilterConfig.source = "cxs_RPActions";
		searchFilterConfig.filters_configured = false;
		searchFilterConfig.config_id = rpConfigId;
		
        var rpConfigGr = new GlideRecord("cxs_rp_filter_config");
        rpConfigGr.addQuery("cxs_rp_config", rpConfigId);
        rpConfigGr.addActiveQuery();
        rpConfigGr.query();
        
		while(rpConfigGr.next()) {
			var rpConfig = cxs_App.getBusiness(rpConfigGr);
			if(rpConfig.isFiltersConfigured()) {
				searchFilterConfig.filters_configured = true;
				break;
			}
		}

        return searchFilterConfig;
    },
	
    getDefaultLimit: function() {
        return gs.getProperty("com.snc.contextual_search.result.default.limit", 10);
    },	
	
	isPublic: function() {
		return false;
	},
	
	type: 'cxs_RPAJAX'
});