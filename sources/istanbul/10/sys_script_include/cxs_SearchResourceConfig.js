var cxs_SearchResourceConfig = Class.create();
cxs_SearchResourceConfig.prototype = {
    initialize: function(gr) {
        this._gr = gr;
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
}