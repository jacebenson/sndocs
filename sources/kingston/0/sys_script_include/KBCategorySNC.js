KBCategorySNC = Class.create();

KBCategorySNC.prototype =  Object.extendsObject(KBCommon, {
	
	/**
	 * If the user is a owner/ manager of the KB 
	 * they should be able to create a category.
	 *
	 * @param String: kb_category sys_id
	 * @return Boolean: can logged in user create a category
	 */
	canCreate: function(categoryId) {
		return this.managerRightToKnowledgeCategory(categoryId) || gs.hasRole("knowledge_admin");
	},
	
	/**
	 * Every user should be able to read all categories.
	 *
	 * @param String: kb_category sys_id
	 * @return Boolean: can logged in user read the category
	 */
	canRead: function(categoryId) {
		return this.canReadRootKnowledgeBase(categoryId);
	},
	
	/**
	 * Providing user is an owner/ manager of the
	 * corresponding kb_knowledge_base let them update the record.
	 *
	 * @param String: kb_category sys_id
	 * @return Boolean: can logged in user update the category
	 */
	canWrite: function(categoryId) {
		return this.managerRightToKnowledgeCategory(categoryId) || gs.hasRole("knowledge_admin");
	},
	
	/**
	 * Only owner/ manager can delete empty categories.
	 *
	 * @param String: kb_category sys_id
	 * @return Boolean: can logged in user delete the category
	 */
	canDelete: function(categoryId) {
	    return this.managerRightToKnowledgeCategory(categoryId) && this.isEmptyCategory(categoryId);
	},
	
	/**
	 * Only owner/ manager of a KB can activate/dectivate a category.
	 *
	 * @param String: kb_category sys_id
	 * @return Boolean: can logged in user activate/deactivate the category
	 */
	canActivate: function(categoryId) {
	    return this.managerRightToKnowledgeCategory(categoryId) || gs.hasRole("knowledge_admin");
	},

	type: "KBCategorySNC"
});