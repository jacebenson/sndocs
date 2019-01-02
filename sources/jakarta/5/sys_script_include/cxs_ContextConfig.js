var cxs_ContextConfig = Class.create();
cxs_ContextConfig.prototype = {
    initialize: function(gr) {
        this._gr = gr;
    },

    isDefault: function() {
        return this._gr.default_config;
    },

    setDefault: function(value) {
        this._gr.default_config = value;
    },

    makeDefault: function() {
        var siblingsGr = new GlideRecord("cxs_context_config");
        siblingsGr.addQuery("sys_id", "!=", this._gr.sys_id);
        siblingsGr.query();

        // Get out if this isn't the first record and default config didn't change to true
        if (siblingsGr.hasNext() && !this._gr.default_config.changesTo(true))
            return false;

        while (siblingsGr.next()) {
            if (!siblingsGr.default_config)
                continue;

            siblingsGr.default_config = false;
            siblingsGr.setWorkflow(false);
            siblingsGr.update();
        }

        // At this point we've either manually set the default flag or we need to as this is the first record
        this._gr.default_config = true;

        gs.addInfoMessage(gs.getMessage("{0} is now the default Search Context", this._gr.name));

        return true;
    },
	
	deleteResourceConfig: function() {
		if (!this._gr || !this._gr.getUniqueValue())
			return;
		
		var resContextConfigGr = new GlideRecord("cxs_res_context_config");
		resContextConfigGr.addQuery("cxs_context_config", this._gr.getUniqueValue());
		resContextConfigGr.query();
		
		var resContextConfigPropGr = new GlideRecord("cxs_res_context_config_prop");
		while (resContextConfigGr.next()) {
			resContextConfigPropGr.initialize();
			resContextConfigPropGr.addQuery("cxs_res_context_config", resContextConfigGr.getUniqueValue());
			resContextConfigPropGr.deleteMultiple();
			resContextConfigGr.deleteRecord();
		}
	},
	
	needsInterleavedSearcher: function() {
		if (!this._gr || !this._gr.getUniqueValue())
			return;

		var rpConfigGr = new GlideRecord("cxs_rp_config");
		rpConfigGr.addQuery("cxs_context_config", this._gr.getUniqueValue());
		rpConfigGr.query();
		if (rpConfigGr.hasNext())
			return true;
		
		var tableConfigGr = new GlideRecord("cxs_table_config");
		tableConfigGr.addQuery("cxs_context_config", this._gr.getUniqueValue());
		tableConfigGr.query();
		if (tableConfigGr.hasNext())
			return true;
		
		return false;
	},
	
	deleteFilterConfigs: function() {
		var isActive = GlidePluginManager.isActive('com.snc.contextual_search.dynamic_filters');
        if (!isActive || !this._gr || !this._gr.getUniqueValue())
            return false;
		
		// delete filters created for table configuration
		var tableConfigGR = new GlideRecord("cxs_table_config");
		tableConfigGR.addQuery("cxs_context_config", this._gr.getUniqueValue());
		tableConfigGR.query();
		while (tableConfigGR.next()) {
			var filterConfigGr = new GlideRecord("cxs_filter_config");
			filterConfigGr.addQuery("cxs_table_config", tableConfigGR.getUniqueValue());
			filterConfigGr.deleteMultiple();
		}
		
		// delete filters created for rp configuration
		var rpConfigGR = new GlideRecord("cxs_rp_config");
		rpConfigGR.addQuery("cxs_context_config", this._gr.getUniqueValue());
		rpConfigGR.query();
		while (rpConfigGR.next()) {
			var rpfilterConfigGr = new GlideRecord("cxs_rp_filter_config");
			rpfilterConfigGr.addQuery("cxs_rp_config", rpConfigGR.getUniqueValue());
			rpfilterConfigGr.deleteMultiple();
		}
        
        return true;
    },
	
    type: "cxs_ContextConfig"
}