KBKnowledgeBaseSNC = Class.create();

KBKnowledgeBaseSNC.prototype =  Object.extendsObject(KBCommon, {
	knowledgeHelper: new SNC.KnowledgeHelper(),
	PATH_TO_OWNER: "owner",
	PATH_TO_MANAGERS: "kb_managers",
	
	/**
	 * Only a knowledge_admin can create a kb_knowledge_base record.
	 *
	 * @param GlideRecord: kb_knowledge_base
	 * @return Boolean: can logged in user create a kb_knowledge_base
	 */
	canCreate: function(knowledgeBaseGr) {
		return gs.hasRole("knowledge_admin");
	},
	
	/**
	 * Can the current user read kb_knowledge_base contents
	 * based on the user criteria configuration.
	 *
	 * @param GlideRecord: kb_knowledge_base
	 * @return Boolean: can logged in user read the kb_knowledge_base
	 */
	canRead: function(knowledgeBaseGr) {
		return this.knowledgeHelper.canRead(knowledgeBaseGr);
	},
	
	/**
	 * Providing user is a knowledge_admin, or is an owner/ manager 
	 * of the kb_knowledge_base let them update the record.
	 *
	 * @param GlideRecord: kb_knowledge_base
	 * @return Boolean: can logged in user update the kb_knowledge_base
	 */
	canWrite: function(knowledgeBaseGr) {
		
		if (gs.hasRole("knowledge_admin"))
			return true;
		
		if (this.isKnowledgeBaseOwner(knowledgeBaseGr, this.PATH_TO_OWNER))
			return true;
		
		if (this.isKnowledgeBaseManager(knowledgeBaseGr, this.PATH_TO_MANAGERS))
			return true;
		
		return false;
	},
	
	/**
	 * Stop any user from deleting the kb_knowledge_base without following procedure.
	 *
	 * @param GlideRecord: kb_knowledge_base
	 * @return Boolean: can logged in user delete the kb_knowledge_base
	 */
	canDelete: function(knowledgeBaseGr) {
	    return false;
	},
	
	/**
	 * Checks to see if the specified user is a owner or manager of any knowledge base
	 * @param String: user's sys_id
	 * @return Boolean: true if user is owner or manager of any knowledge base, false otherwise
	 */
	isManagerOfAny: function(userId) {
		var kbGr = new GlideRecord("kb_knowledge_base");
		var qc = kbGr.addQuery("owner", "CONTAINS", userId);
		qc.addOrCondition("kb_managers", "CONTAINS", userId);
		kbGr.query();
		return kbGr.hasNext();
	},
	
	/**
	 * Get all the knowledge base sys ids that the current user is a manager or owner of
	 * Note: knowledge_admin gets all knowledge bases
	 *
	 * @return Array of sys ids
	 */
	getAllSysIds: function() {
		var kbGr = new GlideRecord("kb_knowledge_base");
		var userId = gs.getUserID();
		if (!gs.hasRole("knowledge_admin")) {
			var qc = kbGr.addQuery("owner", "CONTAINS", userId);
			qc.addOrCondition("kb_managers", "CONTAINS", userId);
		}
		kbGr.query();
		
		var result = [];
		while (kbGr.next()) {
			result.push(kbGr.sys_id+"");
		}
		return result;
	},

	type: "KBKnowledgeBaseSNC"
});