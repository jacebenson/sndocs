var cxs_SearchServerAJAX = Class.create();

cxs_SearchServerAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	isConfigured: function() {
		var serverId = this.getParameter("sysparm_server_id");
        
		var scc = new GlideRecord('cxs_context_config');
        scc.addQuery('cxs_searcher_config', "IN", serverId);
        scc.query();

        return scc.hasNext();
    },
	
	type: 'cxs_SearchServerAJAX'
});