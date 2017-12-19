var ScopeChecker = Class.create();
ScopeChecker.prototype = {
    initialize: function() {
    },

	getSysIdByScopeName: function(scopeName) {
		if (gs.nil(scopeName) || "global" == scopeName)
			return null;
		
		var gr = new GlideRecord("sys_store_app");
		if (!gr.isValid())
			return null;
		
		gr.addQuery("scope", scopeName);
		gr.query();
		if (gr.next() && gr.getRowCount() == 1)
			return gr.sys_id.toString();
		
		return null;
	},
	
	isStoreApp: function(scopeName) {
		var sys_id = this.getSysIdByScopeName(scopeName);
		return !gs.nil(sys_id);
	},
	
    type: 'ScopeChecker'
};