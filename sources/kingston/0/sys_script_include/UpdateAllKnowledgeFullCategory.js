var UpdateAllKnowledgeFullCategory = Class.create();
UpdateAllKnowledgeFullCategory.prototype = {
    initialize: function() {
    },
	
	getAllLanguageCodes: function() {
		var languageList = new Array();
		var translationRecords = new GlideAggregate("sys_translated_text");
        translationRecords.addQuery("tablename", "kb_category");
		translationRecords.addQuery("fieldname", "label");
		translationRecords.groupBy("language");
		translationRecords.query();
		while(translationRecords.next()) {
			languageList.push(translationRecords.getValue("language") + '');
		}
		return languageList;
	},
	
	// Updates the Knowledge Full Category Display Value for all the Locales that have a Category Label translation.
    updateFullCategoryForAllLocale : function() {
		var allLanguageCodes = this.getAllLanguageCodes();
		for (var i = 0; i < allLanguageCodes.length; i++) {
			this.updateFullCategoryForLocale(allLanguageCodes[i]);
		}			
    },
    
    // Updates the Knowledge Full Category Display Value for all the Locales that have a Category Label translation.
    updateFullCategoryForLocale : function(languageCode) {
		var knowHelp = new SNC.KnowledgeHelper();
		var topLevelCategoryRecords = new GlideRecord("kb_knowledge_base");
		topLevelCategoryRecords.query();
		while(topLevelCategoryRecords.next()) {
			knowHelp.setNestedCategories(topLevelCategoryRecords.getUniqueValue(), "", languageCode);
		}
    },
	
	// Updates the Knowledge Full Category Display Value for all the Locales that have a Category Label translation.
    updateFullCategoryForKnowledgeBase : function(knowledgeBaseId) {
		var success = true;
		var knowHelp = new SNC.KnowledgeHelper();
		var allLanguageCodes = this.getAllLanguageCodes();
		for (var i = 0; i < allLanguageCodes.length; i++) {
			result = knowHelp.setNestedCategories(knowledgeBaseId, "", allLanguageCodes[i]);
			if(!result)
				success = false;
		}
		return success;
    },

    type: 'UpdateAllKnowledgeFullCategory'
};