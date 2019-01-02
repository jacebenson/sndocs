var GlobalKnowledgeUtil = Class.create();
GlobalKnowledgeUtil.prototype = {
    initialize: function() {
    },
	getSessionProfile: function() {
		return new LiveFeedUtil().getSessionProfile();
	},
	getProfileDetails: function(id) {
		var profile = new SNC.LiveFeedApi().getProfileDetails(id, 'BASIC');
		return JSON.parse(profile);
	},
	getCanReadKBs: function() {
		var ids = "sys_idIN";
		var readKBs = new KnowledgeRefQualifiers().getCanReadKBs();
		//Check for Social Q&A Enabled for the KB
		
		var kb = new GlideRecord("kb_knowledge_base");
		kb.addEncodedQuery(readKBs);
		kb.addQuery('enable_socialqa', true);
		kb.query();
		
		while(kb.next()) {	
			ids += kb.getUniqueValue() + ",";
		}
		
		return ids;
	},
	getUiNotifications: function() {
		return new SNC.LiveFeedApi().getUiNotifications();
	},
	getClientParameters: function(param) {
		var trans = GlideTransaction.get();
		if(trans) {
			var param_value = GlideTransaction.get().getRequestParameter(param);
			gs.info('Data from Glide transaction: ' + param_value);
			return param_value;
		}
		return '';
	},
	getDirection: function() {
		return GlideI18NStyle.getDirection();
	},
	getJSONCategories: function(kbKnowledgeBaseId){
			return new SNC.KnowledgeHelper().getJSONCategories(kbKnowledgeBaseId);
	},
	getCategoryIdsForKB: function(kbKnowledgeBaseId){
		function flatenCategoryJSON(flatCat, categories) {
			for(var i = 0; i < categories.length; i++) {
				var category = categories[i];
				if(category.items.length > 0) {
					flatenCategoryJSON(flatCat, category.items);
				}
				flatCat.push(category.id);
				
			}
		}
		var categories = new SNC.KnowledgeHelper().getJSONCategories(kbKnowledgeBaseId);
		categories = JSON.parse(categories);
		var flatCategories = [];
		flatenCategoryJSON(flatCategories, categories);
		return flatCategories;
	},
	getRefQualCategoryIdsForKB: function(kbKnowledgeBaseId) {
		var ids = this.getCategoryIdsForKB(kbKnowledgeBaseId);
		var catID = 'sys_idIN';
		for(var i=0 ; i<ids.length ; i++) {
			catID = catID + ids[i] + ",";
		}
		return catID;
	},
	getCompatibility: function() {
		var browser = gs.getSession().getProperty('user_agent_browser');
		var browser_version = gs.getSession().getProperty('user_agent_version_nocompat');

		if(browser == 'ie' && parseInt(browser_version)<10)
			return 'block';
		return 'allow';
	},
	canCreateNewQuestion: function() {
		var ids = this.getCanReadKBs();
		if(ids == "sys_idIN")
			return false;
		else
			return true;
	},
	checkpluginActive: function(plugin) {
		return pm.isActive(plugin);
	},
    type: 'GlobalKnowledgeUtil'
};