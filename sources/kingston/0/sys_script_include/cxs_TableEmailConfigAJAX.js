var cxs_TableEmailConfigAJAX = Class.create();

cxs_TableEmailConfigAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
    getDefaultLimit: function() {
        return gs.getProperty("com.snc.contextual_search.result.default.limit", 10);
    },	
	
	isPublic: function() {
		return false;
	},
	
	type: 'cxs_TableEmailConfigAJAX'
});