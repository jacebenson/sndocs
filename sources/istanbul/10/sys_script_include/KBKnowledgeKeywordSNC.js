KBKnowledgeKeywordSNC = Class.create();

KBKnowledgeKeywordSNC.prototype =  Object.extendsObject(KBCommon, {
	
	PATH_TO_OWNER: "knowledge.kb_knowledge_base.owner",
	PATH_TO_MANAGERS: "knowledge.kb_knowledge_base.kb_managers",
    PATH_TO_OWNER_FROM_KNOWLEDGE: "kb_knowledge_base.owner",
    PATH_TO_MANAGERS_FROM_KNOWLEDGE: "kb_knowledge_base.kb_managers",
    PATH_TO_OWNER_FROM_KB: "owner",
    PATH_TO_MANAGERS_FROM_KB: "kb_managers",
      	
	/**
	 * If the user is a owner/ manager of the KB or knowledge_admin 
	 * they should be able to create kb_knowledge_keyword record
	 *
	 * @param GlideRecord: knowledgeKeywordGr
	 * @return Boolean: can logged in user pin an article
	 */
	canCreate: function(glideRecord) {	

	    if (gs.hasRole("knowledge_admin"))
	    	return true;

	    //check can create for table list view and for new record from kb_knowledge_keyword
	    if (glideRecord === null|| typeof glideRecord === "undefined" || glideRecord.getRecordClassName() === "kb_knowledge_keyword")         {
	        return new KBKnowledgeBaseSNC().isManagerOfAny(gs.getUserID());
	    }
	    
	    //check can create for related list view on kb_knowledge record
	    if (glideRecord.getRecordClassName() == "kb_knowledge"){
	        var kbKnowledgeKeyword = new GlideRecord("kb_knowledge_keyword");
	        if (kbKnowledgeKeyword.get("knowledge", glideRecord.sys_id))
	        	return false;
	        
	        return this.isKnowledgeBaseOwner(glideRecord, this.PATH_TO_OWNER_FROM_KNOWLEDGE)|| this.isKnowledgeBaseManager(glideRecord,this.PATH_TO_MANAGERS_FROM_KNOWLEDGE);
	    }
	    
	    //check can create for related list view on kb_knowledge_base record
	    if (glideRecord.getRecordClassName() == "kb_knowledge_base"){
	        return this.isKnowledgeBaseOwner(glideRecord, this.PATH_TO_OWNER_FROM_KB)|| this.isKnowledgeBaseManager(glideRecord,this.PATH_TO_MANAGERS_FROM_KB);
	    }
		
	    return false;
    },
	
	/**
	 * If the user is a knowledge_admin or manager/owner of any knowledge base
	 * they should be able read
	 *
	 * @param GlideRecord: knowledgeKeywordGr
	 * @return Boolean: can logged in user read the record
	 */
	canRead: function(knowledgeKeywordGr) {
	    if (gs.hasRole("knowledge_admin"))
	        return true;
	
	    return new KBKnowledgeBaseSNC().isManagerOfAny(gs.getUserID());		
	},
	
	/**
	 * If the user is knowledge_admin or owner/ manager of the KB
	 * they should be able to write
	 *
	 * @param GlideRecord: knowledgeKeywordGr
	 * @return Boolean: can logged in user read the record
	 */
	canWrite: function(knowledgeKeywordGr) {
		if (gs.hasRole("knowledge_admin"))
            return true;
		
	    if (knowledgeKeywordGr.isNewRecord())
	        return this.canCreate(knowledgeKeywordGr);
		
	    return (this.isKnowledgeBaseOwner(knowledgeKeywordGr, this.PATH_TO_OWNER) ||
			this.isKnowledgeBaseManager(knowledgeKeywordGr, this.PATH_TO_MANAGERS));	       
	},
	
	/**
	 * If the user is a owner/ manager of the KB or knowledge_admin
	 * they should be able to delete
	 *
	 * @param GlideRecord: knowledgeKeywordGr
	 * @return Boolean: can logged in user delete the category
	 */
	canDelete: function(knowledgeKeywordGr) {
		if (gs.hasRole("knowledge_admin"))
            return true;
		
         return (this.isKnowledgeBaseOwner(knowledgeKeywordGr, this.PATH_TO_OWNER) ||
			this.isKnowledgeBaseManager(knowledgeKeywordGr, this.PATH_TO_MANAGERS));	
	},
	
	
	/**
	 * Get all the the sys_ids of articles which are not featured and which beloongs to the knowledge base 
	 * that the current user is a manager or owner of
	 * Note: knowledge_admin gets all knowledge bases
	 *
	 * @return Array of sys ids
	 */
	getAvailableArticleIds: function() {
		var result = [];
		var kbGr = new GlideRecord("kb_knowledge_keyword");
		kbGr.query();
		while (kbGr.next()) {
			result.push(kbGr.knowledge+"");
		}
		
		kbGr = new GlideRecord("kb_knowledge");
		var userId = gs.getUserID();
		if (!gs.hasRole("knowledge_admin")) {
			var qc = kbGr.addQuery("kb_knowledge_base.owner", "CONTAINS", userId);
			qc.addOrCondition("kb_knowledge_base.kb_managers", "CONTAINS", userId);
		}
		kbGr.addQuery("sys_id", "NOT IN", result.join());
		kbGr.query();
		
		result = [];
		while (kbGr.next()) {
			result.push(kbGr.sys_id+"");
		}
		
		return result;
	},
	
	
	/**
	 * Get all the the sys_ids of KnowledgeBases for which user can create featured content
	 * Note: knowledge_admin gets all knowledge bases
	 *
	 * @return Array of sys ids
	 */
	getAvailableKbIds: function() {
		var result = [];
		var kbGr = new GlideRecord("kb_knowledge_base");
		var userId = gs.getUserID();
		if (!gs.hasRole("knowledge_admin")) {
			var qc = kbGr.addQuery("owner", "CONTAINS", userId);
			qc.addOrCondition("kb_managers", "CONTAINS", userId);
		}
		kbGr.query();
		while (kbGr.next()) {
			result.push(kbGr.sys_id+"");
		}
		return result;
	},

	type: "KBKnowledgeKeywordSNC"
});