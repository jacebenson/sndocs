var cxs_SearchContextAJAX = Class.create();

cxs_SearchContextAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	isConfigured: function() {
		var contextId = this.getParameter("sysparm_context_id");
        
        //Check for any table configurations
		var stbl = new GlideRecord('cxs_table_config');
        stbl.addQuery('cxs_context_config', "IN", contextId);
        stbl.query();
		
		//Check for any record producer configurations
		var srp = new GlideRecord('cxs_rp_config');
        srp.addQuery('cxs_context_config', "IN", contextId);
        srp.query();

        return stbl.hasNext() || srp.hasNext();
    },
	
	type: 'cxs_SearchContextAJAX'
});