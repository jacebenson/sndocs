var KnowledgeAccess = Class.create();
KnowledgeAccess.prototype = {

    initialize: function() {
	    this.knowledgeHelper = new SNC.KnowledgeHelper(); 
    },
	
	/**
	 * Determine if a user has the right to access a knowledge base
	 *
	 * @param GlideRecord kb_knowledge_base or kb_knowledge
	 *
	 * @return boolean
	 */
	managerRights: function(kb) {
		var owner, managers;

		if(kb.getTableName() == "kb_knowledge" || kb.instanceOf("kb_knowledge")) {
			owner = kb.kb_knowledge_base.owner;
			managers = kb.kb_knowledge_base.kb_managers;
		} else {
			owner = kb.owner;
			managers = kb.kb_managers;
		}

		// user has knowledge_admin role
		if(gs.hasRole("knowledge_admin"))
			return true;
		
		// user has manager role and is knowledge base owner
		if(gs.hasRole("knowledge_manager") && owner == gs.getUserID()) 
		   return true;
		
		// user is listed in knowledge base manager list
		if(JSUtil.notNil(managers) && managers.indexOf(gs.getUserID()) != -1)
			return true;

		return false;
	},

    /**
	 * Determine if a user has the right to access kb_category record
	 *
	 * @param String kbCategoryId
	 *
	 * @return boolean
	 */
	managerRightToKnowledgeCategory: function(kbCategoryId) {
		var rootId = this.knowledgeHelper.getRootKBId(kbCategoryId);

		var kbKnowledgeBase = new GlideRecord("kb_knowledge_base");
		kbKnowledgeBase.get(rootId);
		
        return this.managerRights(kbKnowledgeBase);
	},
	
	/**
	 * Determine if a user is a contributor of a knowledge base
	 *
	 * @param GlideRecord kb_knowledge_base or kb_knowledge
	 *
	 * @return boolean
	 */
	contributorRight: function(kb) {
		if (kb.getTableName() == "kb_knowledge" || kb.getTableName() == "kb_knowledge_base" || kb.instanceOf("kb_knowledge")) {
		    return this.knowledgeHelper.canContribute(kb);
		}
		
		return false;
	},

	/**
	* Determines if the user can read the article or knowledge base
	*
	* @param GlideRecord kb_knowledge or kb_knowledge_base
	*
	* @return boolean
	*/
	canReadArticle: function(kb) {
		if (kb.getTableName() == "kb_knowledge" || kb.getTableName() == "kb_knowledge_base" || kb.instanceOf("kb_knowledge")) {
			return this.knowledgeHelper.canRead(kb);
        }

		return false;
	},
	
	/**
	* Determines if a given knowledge category has children(categories or articles) or is empty
	*
	* @param String sys_id of a kb_category record
	*
	* @return boolean
	*/
	isEmptyCategory: function(kbCategoryId) {
		var kbKnowledge = new GlideRecord("kb_knowledge");
		var category = new GlideRecord("kb_category");
		
		// Check for any child categories or related knowledge articles
		if (kbKnowledge.get("kb_category", kbCategoryId) || category.get("parent_id", kbCategoryId))
			return false;
		
		return true;
	},
	
	
    type: 'KnowledgeAccess'
};