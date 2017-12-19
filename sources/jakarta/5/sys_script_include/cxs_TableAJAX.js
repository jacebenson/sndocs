var cxs_TableAJAX = Class.create();

cxs_TableAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getTableConfigJSON: function() {
		return new JSON().encode(this.getTableConfig());
	},
	
	getTableConfig: function() {
		var searchConfig = {};
		
		var tableName = this.getParameter("sysparm_table");
		var recordSysId = this.getParameter("sysparm_record_sys_id");
		
		if (!tableName && !currentTableName)
			return searchConfig;
		
		var tableConfigGr = new GlideRecord('cxs_table_config');
		tableConfigGr.addQuery('table', tableName);
		tableConfigGr.addActiveQuery();
		tableConfigGr.query();
		if (!tableConfigGr.next())
			return searchConfig;
		
		var tableConfig = cxs_App.getBusiness(tableConfigGr);
		
		searchConfig = tableConfig.getTableConfigObject();
		searchConfig.record_matches_condition = tableConfig.matchesCondition(recordSysId);

		return searchConfig;
    },
	
    getDefaultLimit: function() {
        return gs.getProperty("com.snc.contextual_search.result.default.limit", 10);
    },
    
    getNextOrderNumber: function() {		
 	   var configSysId = this.getParameter("sysparm_cxs_table_config");
		if (!configSysId)
			return 100;
    
		var tableConfigGr = new GlideRecord("cxs_table_config");
		if (!tableConfigGr.get(configSysId))
			return 100;
		
		return cxs_App.getBusiness(tableConfigGr).nextFieldOrderNumber();
 	},	
	
	isPublic: function() {
		return false;
	},
	
	type: 'cxs_TableAJAX'
});