var cxs_SearchResourceConfig = Class.create();
cxs_SearchResourceConfig.prototype = Object.extendsObject(cxs_Base, {

	populateTable: function() {
		var tableName = new sn_cxs_int.CXSResourceUtils().getDefinedEncodedQueryTable(this._gr);
		if (tableName)
			this._gr.table = tableName;
	},
	
	supportsEncodedQuery: function() {
		return new sn_cxs_int.CXSResourceUtils().getDefinedSupportsEncodedQuery(this._gr);
	},
	
	supportsSearchAs: function() {
		return new sn_cxs_int.CXSResourceUtils().getDefinedSupportsSearchAs(this._gr);
	},
	
	updateContextConfigs: function() {
		if (!this._gr || !this._gr.getValue("cxs_searcher_config"))
			return;
		
		var contextConfigGr = new GlideRecord("cxs_context_config");
		contextConfigGr.addQuery("cxs_searcher_config", this._gr.getValue("cxs_searcher_config"));
		contextConfigGr.query();
		
		while (contextConfigGr.next())
			SNC.SearchService.updateContextProperties(contextConfigGr.getUniqueValue());
	},

    type: "cxs_SearchResourceConfig"
});