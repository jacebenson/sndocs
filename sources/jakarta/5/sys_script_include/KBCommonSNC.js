var KBCommonSNC = Class.create();

KBCommonSNC.prototype = {
	
	VERSIONING_PLUGIN : 'com.snc.knowledge_advanced',
	initialize: function() {
		this._knowledgeHelper = new SNC.KnowledgeHelper();
	},

	/**
	 * GlideRecord.get() prints a warning message match could not be found.
	 * GlideRecord.next() does not. So this method is exposed for extending objects to use.
	 */
	_get: function(record, fieldName, fieldData) {
		if (record) {
			record.addQuery(fieldName, fieldData);
			record.query();
			if (record.next() && record.isValidRecord())
				return true;
		}
		return false;
	},

	/**
	 * Determines whether the current user is a manager of the knowledge base associated with the passed in record
	 *
	 * @param GlideRecord: record on which to search for managers to evaluate
	 * @param String: (optionally dotted) path to the managers field on the passed in record
	 * @return Boolean: whether the current user is a manager of the passed in record
	 */
	isKnowledgeBaseManager: function(record, pathToUser) {
		var managers = this._getDotField(record, pathToUser);
		var isManager = (managers.indexOf(gs.getUserID()) >= 0);

		return isManager;
	},

	/**
	 * Determines whether the current user is the owner of the knowledge base associated with the passed in record
	 *
	 * @param GlideRecord: record on which to search for owners to evaluate
	 * @param String: (optionally dotted) path to the owner field on the passed in record
	 * @return Boolean: whether the current user is the owner of the passed in record
	 */
	isKnowledgeBaseOwner: function(record, pathToUser) {
		var owner = this._getDotField(record, pathToUser);
		var isOwner = (owner.indexOf(gs.getUserID()) >= 0);

		return isOwner;
	},

	/**
	 * Determine if a user has the right to access kb_category record
	 *
	 * @param String kbCategoryId
	 * @return boolean
	 */
	managerRightToKnowledgeCategory: function(kbCategoryId) {
		var rootId = this._knowledgeHelper.getRootKBId(kbCategoryId);
		var pathToOwner = "owner";
		var pathToManagers = "kb_managers";
		var kbKnowledgeBase = new GlideRecord("kb_knowledge_base");
		if (kbKnowledgeBase.get(rootId))
			return this.isKnowledgeBaseManager(kbKnowledgeBase, pathToManagers) || this.isKnowledgeBaseOwner(kbKnowledgeBase, pathToOwner);

		return false;
	},
	
	/**
 	 * Determine if a user has the right to access root knowledge base record
 	 *
 	 * @param String kbCategoryId
 	 * @return boolean
 	 */
	canReadRootKnowledgeBase: function(kbCategoryId) {
		var rootId = this._knowledgeHelper.getRootKBId(kbCategoryId);
		var kbKnowledgeBase = new GlideRecord("kb_knowledge_base");
		if (kbKnowledgeBase.get(rootId)){
			return kbKnowledgeBase.canRead();
		}

		return false;
	},

	/**
	 * Determines if a given knowledge category has children(categories or articles) or is empty
	 *
	 * @param String sys_id of a kb_category record
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

	/**
	 * Determines if the knowledge base is based on Knowledge Management V3.
	 *
	 * @param String: the sys_id of a knowledge base record to check
	 * @return Boolean: true if knowledge base version is Fuji release, false otherwise
	 */
	isKBVersion3: function(knowledgeBaseId) {
		// Check if preknowledge3 property has been set, if not, knowledge base must be latest
		var legacyKBVersion = gs.getProperty("glide.knowman.preknowledge3.kb_version", null);
		if (JSUtil.nil(legacyKBVersion))
			return true;

		// Check if the knowledge base version number matches Fuji release (version 3)
		return this._getKBVersion(knowledgeBaseId) === "3";
	},

	/**
	 * Determines if the knowledge base is based on Knowledge Management V2.
	 *
	 * @param String: the sys_id of a knowledge base record to check
	 * @return Boolean: true if knowledge base version is Fuji release, false otherwise
	 */
	isKBVersion2: function(knowledgeBaseId) {
		// Check if preknowledge3 property has been set, if not, knowledge base must be latest
		var legacyKBVersion = gs.getProperty("glide.knowman.preknowledge3.kb_version", null);
		if (JSUtil.nil(legacyKBVersion))
			return false;

		// Check if the knowledge base version number is pre Fuji (version 2)
		return this._getKBVersion(knowledgeBaseId) === "2";
	},

	/**
	 * Determines if a kb_knowledge record is based on Knowledge Management V3.
	 *
	 * @param GlideRecord: kb_knowledge record to evaluate
	 * @return Boolean: true if record is based on latest release, false otherwise
	 */
	isRecordVersion3: function(record) {
		var knowledgeBaseId = this._getDotField(record, "kb_knowledge_base");

		return this.isKBVersion3(knowledgeBaseId);
	},

	/**
	 * Determines if a record is displayed with a GlideDialogForm
	 *
	 * @return Boolean: true if the nameofstack is formDialog
	 */
	isStackNameDialog: function() {
		var stack = GlideTransaction.get().getRequestParameter("sysparm_nameofstack");
		return stack == "formDialog";
	},

	isStackNameDialogNavHandler: function(g_uri) {
		// Convert view name to lowercase
		var view = g_uri.get("sysparm_view");
		if (!JSUtil.nil(view))
			view = view.toLowerCase();

		// Case 1: Existing record provided
		var stack = g_uri.get("sysparm_nameofstack");
		if (stack == "formDialog" && !JSUtil.nil(view))
			return true;

		return false;
	},	
	
   /**
     * Can the user create a kb_knowledge record.
     * @param GlideRecord: kb_knowledge 
     * @return Boolean: can logged in user create a kb_knowledge
     */
	_canCreateKnowledge: function(gr){
        if (gs.hasRole("knowledge_admin"))
            return true;

        if (gr.isNewRecord())
			gr = this._getKnowledgeBase(gr) || gr;

        if (this.isKnowledgeBaseOwner(gr, "kb_knowledge_base.owner"))
            return true;

        if (this.isKnowledgeBaseManager(gr, "kb_knowledge_base.kb_managers"))
            return true;

        if (this._knowledgeHelper.canContribute(gr))
            return true;

        return false;
	},
	
	
	canRetireKnowledge: function(itemGr) {
		// Case 1: Pass in a valid value
		if (!itemGr)
			return false;
    
		// Case 2: If the record is published continue
		if (itemGr.workflow_state != "published" && itemGr.workflow_state != "draft")
			return false;
    	
		// Case 3: If user can contribute continue
		if (!new SNC.KnowledgeHelper().canContribute(itemGr))
			return false;
		
		// Default: Allow user to retire knowledge
		return true;
	},

	/** 
	* Checks whether versioning is enabled
	*
	*
	* @return boolean
	*/
	isVersioningEnabled: function(){
		return this._knowledgeHelper.isVersioningEnabled();
	},
	
	/** 
	* Checks whether versioning plugin is activated
	*
	*
	* @return boolean
	*/
	isVersioningInstalled : function(){
		return this._knowledgeHelper.isVersioningInstalled();
	},
	
	/** 
	* Returns the physical record of the given article number
	* Used for global search exact matches
	*
	*
	* @return GlideRecord
	*/
	getKnowledgeRecord: function(articleNumber){
		if(this.isVersioningEnabled())
			return new KBVersioning().getLatestAccessibleVersion(articleNumber);
		else {
			var gr = new GlideRecord('kb_knowledge');
			gr.addQuery('number', articleNumber);
			gr.query();
			if (gr.next())
				return gr;
			else
				return false;
		}
	},
	
    /**
     * Gets the knowledge base whose id has been passed in the URI.
     *
     * @return A kb_knowledge_base record or null
     */
    _getKnowledgeBase: function(gr) {
		var kbId = gr.getValue("kb_knowledge_base");
		
        if (JSUtil.nil(kbId)) {
            gs.log("[KBCommonSNC] Error - No knowledge base id found");
            return null;
        }

		var kbGr = new GlideRecord("kb_knowledge_base");
		if (!this._get(kbGr, "sys_id", kbId)) {
            gs.log("[KBCommonSNC] Error - No knowledge base found matching id " + kbId);
            return null;
        }

        return kbGr;
    },

	_getKBVersion: function(knowledgeBaseId) {
		var gr = new GlideRecord("kb_knowledge_base");
		if (gr.get(knowledgeBaseId))
			return gr.kb_version + "";

		return null;
	},

	_getDotField: function(gr, pathToField) {
		if (JSUtil.nil(gr))
			return "";

		var arrFields = (pathToField || "").split(".");
		var element = gr;
		for (var i = 0; i < arrFields.length; i++) {
			element = element[arrFields[i]];
			if (!element)
				return "";
		}

		return element;
	},

	_encode: function(object) {
		return new JSON.encode(object);
	},

	_decode: function(string) {
		return new JSON.decode(string);
	},

	_i18n: function(message, array) {
		message = message || "";
		var padded =  message;
		var translated = gs.getMessage(padded, array);
		var trimmed = translated.trim();
		return trimmed;
	},

	setUniqueInfoMessage: function(message, key) {
		this._knowledgeHelper.addUniqueInfoMessage(message, key);
	},

	getStateMessage: function(state) {
		var message = {
			draft: "This knowledge item is in draft state and can be edited",
			review: "This knowledge item is in review",
			published: "This knowledge item has been published",
			pending_retirement: "This knowledge item is pending retirement",
			retired: "This knowledge item has been retired"
		};

		return (this._i18n(message[state]) || "");
	},

	/**
 	 * Is it a multi update form.
 	 *
 	 * @param GlideRecord: kb_knowledge
	 **/
	isMultipleKnowledgeUpdate: function(knowledgeGR) {
		try{
			var url = RP.getReferringURL();
			var sys_action = RP.getParameterValue('sys_action');
 			var sysparm_multiple = RP.getParameterValue('sysparm_multiple');
 			         
 			return url && url != null && !gs.nil(url) && (url.startsWith('kb_knowledge_update.do') || url.startsWith('kb_knowledge_base_update.do')) && sys_action == 'sysverb_multiple_update' && sysparm_multiple == 'true';
 		} catch(err) {
 			gs.log("Warning: KBCommonSNC.isMultipleKnowledgeUpdate(" + err.lineNumber + "): " + err.name + " - " + err.message);
 		}
 		return false;
 	},
 
	type: "KBCommonSNC"
};