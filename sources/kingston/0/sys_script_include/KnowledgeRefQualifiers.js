var KnowledgeRefQualifiers = Class.create();
KnowledgeRefQualifiers.prototype = {
    initialize: function() {
    },
	
	getCanContributeKBs: function() {
		var ids = "";
		var kbHelper = new SNC.KnowledgeHelper();
		
		if(gs.hasRole("admin"))
			return ids;
		
		ids = "sys_idIN";
		var kb = new GlideRecord("kb_knowledge_base");
		kb.addActiveQuery();
		kb.query();
		
		while(kb.next()) {
			if(kbHelper.canContribute(kb))	
				ids += kb.getUniqueValue() + ",";
		}
		
		return ids;
	},

	getCanReadKBs: function() {
		var ids = "";
		var kbHelper = new SNC.KnowledgeHelper();
		
		if(gs.hasRole("admin"))
			return ids;
		
		ids = "sys_idIN";
		var kb = new GlideRecord("kb_knowledge_base");
		kb.addActiveQuery();
		kb.query();
		
		while(kb.next()) {
			if(kbHelper.canRead(kb))	
				ids += kb.getUniqueValue() + ",";
		}
		
		return ids;
	},
	
	
	/**
	 * Generates a list of selectable knowledge base records based on a users roles for the
	 * kb_uc many to many tables
	 * 
	 * @return String enodedQuery
	 */
	kbReferenceQualifierForUcTables: function() {
		if(gs.hasRole("admin"))
			return 'kb_version!=2^EQ';

		return 'owner=' + gs.getUserID() + '^ORkb_managersLIKE' + gs.getUserID() +'^EQ';
	},
	
	/**
	 * Returns a list of workflows that run on the kb_knowledge table
	 *
	 * @return String enodedQuery
	 */
	knowledgeWorkflows: function() {
		var wfIds = [];
		var gr = new GlideRecord("wf_workflow_version");
		gr.addQuery("published", true);
		gr.addQuery("table", "kb_knowledge");
		gr.addActiveQuery();
		gr.query();
		
		while(gr.next()) {
			wfIds.push(gr.workflow.toString());
		}
		
		return "sys_idIN" + wfIds.join();
	},
		
	/** Qualifier to return list of category ids belongs to a specified knowledge base
	 *
	 *
	 * @return string qualifier using list of category id
	**/
	getRefQualCategoryIdsForKB: function(kbKnowledgeBaseId) {
		return new global.GlobalKnowledgeUtil().getRefQualCategoryIdsForKB(kbKnowledgeBaseId);
	},
	
	type: 'KnowledgeRefQualifiers'
};