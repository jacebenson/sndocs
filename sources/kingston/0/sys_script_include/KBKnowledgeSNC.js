KBKnowledgeSNC = Class.create();

KBKnowledgeSNC.prototype =  Object.extendsObject(KBCommon, {

    PATH_TO_OWNER: "kb_knowledge_base.owner",
    PATH_TO_MANAGERS: "kb_knowledge_base.kb_managers",
	
	/**
	 * Can the current user create kb_knowledge records
	 *
     * @param GlideRecord: kb_knowledge
	 **/
    canCreate: function() {
		// if there is atleat 1 knowledge base the current user can contribute to
		// then they can create
		var kb = new GlideRecord("kb_knowledge_base");
		kb.addActiveQuery();
		kb.query();

		while(kb.next()) {
			//Ignore Checking for V2 Kb as there is no user criteria
			if(kb.kb_version == "2")
				continue;

			if(this._knowledgeHelper.canContribute(kb))
				return true;
		}
			
		return false;
    },

    canRead: function(knowledgeGR) {

		// Case1: User has passed in a new legacy record, so do not give them permission to read this record (Let existing legacy ACLs handle this instead)
		if (knowledgeGR.isNewRecord()) 
			return this.canCreate();
		
		// Case2: User has passed in an existing legacy record, so do not give them permission to read this record (Let existing legacy ACLs handle this instead)
		if (!this.isRecordVersion3(knowledgeGR))
			return false;
		
		// Case3: User has knowledge_admin role, so give them permission to read this record
        if (gs.hasRole("knowledge_admin"))
            return true;

		// Case4: User is knowledge base owner, so give them permission to read this record
        if (this.isKnowledgeBaseOwner(knowledgeGR, this.PATH_TO_OWNER))
            return true;

		// Case5: User is knowledge base manager, so give them permission to read this record
        if (this.isKnowledgeBaseManager(knowledgeGR, this.PATH_TO_MANAGERS))
            return true;

		//PRB752684 Fix
		//If article is not published or outdated additional roles may be required to view the article based on
		//property values and state of the article.
        
		// Case6: If user can only read from the knowledge base, show them published and outdated kb_knowledge
		if (this._knowledgeHelper.canRead(knowledgeGR) && 
			(knowledgeGR.workflow_state == "published" || 
			 knowledgeGR.workflow_state == "outdated"  || 
			 this._knowledgeHelper.canReadUnpublished(knowledgeGR))){
			// Use role based security on article if property is set to true
			var useRoleBasedSecurity = gs.getProperty("glide.knowman.search.apply_role_based_security", true);
			if(useRoleBasedSecurity && !knowledgeGR.roles.nil() && knowledgeGR.roles != ""){
				return gs.hasRole(knowledgeGR.roles);
			}
			return true;
		}
		
		// Case7: If the user can contribute to the knowledge base allow them to read the knowledge record
		if (this._knowledgeHelper.canContribute(knowledgeGR))
			return true;	
		
		// Default: User should NOT be given permission to read this record
		return false;
    },

    canWrite: function(knowledgeGR) {
		
		if(this.isExternalArticle(knowledgeGR))
			return false;
		
		if(!gs.nil(knowledgeGR.kb_knowledge_base) && !this.isRecordVersion3(knowledgeGR))
			return false;
		
		if(knowledgeGR.isNewRecord())
			return this.canCreate();
		else {
			if(this.isVersioningEnabled())
				return new KBVersioning().canWrite(knowledgeGR);
			else
				return this._knowledgeHelper.canContribute(knowledgeGR);
		}
    },

    canDelete: function(knowledgeGR) {
		
		if(this.isExternalArticle(knowledgeGR))
			return false;
		
		// Delegate to versioning if enabled
		if(this.isVersioningEnabled())
			return new KBVersioning().canDelete(knowledgeGR);
        return false;
    },

	canRetire: function(knowledgeGR) {
		
		if(this.isExternalArticle(knowledgeGR))
			return false;
		
		if(this.isVersioningEnabled())
			return new KBVersioning().canRetire(knowledgeGR);
		else
			return this.canRetireKnowledge(knowledgeGR);
	},
	
	canPublish: function(knowledgeGR) {
		
		if(this.isExternalArticle(knowledgeGR))
			return false;
		
		// Case 1: Pass in a valid value
		if (!knowledgeGR)
			return false;

		// Case 2: If the record is published continue
		if (knowledgeGR.workflow_state != "draft")
			return false;
		
		// If versioning enabled, delegate to versioning permissions
		if(this.isVersioningEnabled())
			return new KBVersioning().canPublish(knowledgeGR);
		else
			// Case 3: If user can contribute continue
			return (this._knowledgeHelper.canContribute(knowledgeGR));
	},
	
	retire: function(knowledgeGR) {
		knowledgeGR.workflow_state = "retired";
		return knowledgeGR.update();
	},

    type: "KBKnowledgeSNC"
});
