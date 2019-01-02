var cxs_FltrConfig = Class.create();
cxs_FltrConfig.prototype = Object.extendsObject(cxs_Base, {
	
	// Core code for looking up the search resource filter.
	_getSearchResourceFilter: function(baseRef) {
		var resourceIds = [];
	
		var searcherId = baseRef.cxs_context_config.cxs_searcher_config;
		if (JSUtil.nil(searcherId))
			return "sys_idIN" + resourceIds;
		
		var resources = new GlideRecord("cxs_search_res_config");
		resources.addActiveQuery();
		resources.addQuery("cxs_searcher_config", searcherId);
		resources.query();
		
		var srchResConf = cxs_App.getBusiness(resources);
		while (resources.next()) {
			if (!srchResConf.supportsEncodedQuery())
				continue;
			resourceIds.push(resources.getUniqueValue()+"");
		}
		
		return "sys_idIN" + resourceIds;
	},
	
    type: 'cxs_FltrConfig'
});