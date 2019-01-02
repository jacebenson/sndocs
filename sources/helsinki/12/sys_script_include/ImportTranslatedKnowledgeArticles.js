var ImportTranslatedKnowledgeArticles = Class.create();
ImportTranslatedKnowledgeArticles.prototype = {
    initialize: function() {
    },
	
	copyAttachment: function(oldKbId, newKbId) {
		var queryAttGr = new GlideRecord('sys_attachment');
		queryAttGr.addQuery('table_name', 'kb_knowledge');
		queryAttGr.addQuery('table_sys_id', oldKbId);
		queryAttGr.query();
		while (queryAttGr.next()) {
			var insertAttGr = new GlideRecord('sys_attachment');
			insertAttGr.initialize();
			insertAttGr.table_name = queryAttGr.table_name;
			insertAttGr.table_sys_id = newKbId;
			insertAttGr.file_name = queryAttGr.file_name;
			insertAttGr.content_type = queryAttGr.content_type;
			insertAttGr.size_bytes = queryAttGr.size_bytes;
			insertAttGr.compressed = queryAttGr.compressed;
			insertAttGr.size_compressed = queryAttGr.size_compressed;
			var attachId = insertAttGr.insert();
			var queryDocGr = new GlideRecord('sys_attachment_doc');
			queryDocGr.addQuery('sys_attachment', queryAttGr.sys_id);
			queryDocGr.query();
			while (queryDocGr.next()) {
				var insertDocGr = new GlideRecord('sys_attachment_doc');
				insertDocGr.initialize();
				insertDocGr.sys_attachment = attachId;
				insertDocGr.position = queryDocGr.position;
				insertDocGr.length = queryDocGr.length;
				insertDocGr.data = queryDocGr.data;
				insertDocGr.insert();
			}
		}
	},

    assignField: function(newGr, newField, oldGr,field) {
		if (!newGr.isValidField(newField) || !oldGr.isValidField(field))
			return ;
		newGr[newField] = oldGr[field];
	},

    importTranslated: function(kbGr, titleGr, textGr) {
		if (!textGr)
			return null;
		var newKbGr = new GlideRecord('kb_knowledge');
		newKbGr.initialize();
		if (titleGr)
			this.assignField(newKbGr, 'language', titleGr, 'language');
		else 
			this.assignField(newKbGr, 'language', textGr, 'language');
		this.assignField(newKbGr, 'parent', kbGr, 'sys_id');
		this.assignField(newKbGr, 'topic', kbGr, 'topic');
		this.assignField(newKbGr, 'category', kbGr, 'category');
		newKbGr.workflow_state = 'draft';
		this.assignField(newKbGr, 'article_type', kbGr, 'article_type');
		this.assignField(newKbGr, 'roles', kbGr, 'roles');
		if (titleGr)
			this.assignField(newKbGr, 'short_description', titleGr, 'label');
		else
			this.assignField(newKbGr, 'short_description', kbGr, 'short_description');
		this.assignField(newKbGr, 'text', textGr, 'value');
		this.assignField(newKbGr, 'meta', kbGr, 'meta');
		this.assignField(newKbGr, 'source', kbGr, 'source');
		this.assignField(newKbGr, 'flagged', kbGr, 'flagged');
		this.assignField(newKbGr, 'author', kbGr, 'author');
		this.assignField(newKbGr, 'use_count', kbGr, 'use_count');
		this.assignField(newKbGr, 'rating', kbGr, 'rating');
		this.assignField(newKbGr, 'description', kbGr, 'description');
		this.assignField(newKbGr, 'kb_knowledge_base', kbGr, 'kb_knowledge_base');
		this.assignField(newKbGr, 'kb_category', kbGr, 'kb_category');
		this.assignField(newKbGr, 'retired', kbGr, 'retired');
		this.assignField(newKbGr, 'disable_commenting', kbGr, 'disable_commenting');
		this.assignField(newKbGr, 'disable_suggesting', kbGr, 'disable_suggesting');
		return newKbGr.insert();
	},

    searchTranslated: function(kbGr) {
		var titleGr = new GlideRecord('sys_translated');
		var textGr = new GlideRecord('sys_translated_text');
		var languages = {};
		titleGr.addQuery('name', 'kb_knowledge');
		titleGr.addQuery('element', 'short_description');
		titleGr.addQuery('value', kbGr.short_description);
		titleGr.query();
		textGr.addQuery('tablename', 'kb_knowledge');
		textGr.addQuery('documentkey', kbGr.sys_id);
		textGr.addQuery('fieldname', 'text');
		textGr.query();
		while (titleGr.next()) {
			var lang = titleGr.language;
			if (!languages[lang]) 
				languages[lang] = {title: null, text: null};
			languages[lang].title = titleGr.sys_id;
		}
		while (textGr.next()) {
			var lang = textGr.language;
			if (!languages[lang])
				languages[lang] = {title: null, text: null};
			languages[lang].text = textGr.sys_id;
		}
		for (var lang in languages) {
			if (languages.hasOwnProperty(lang)) {
				var titleGr2 = null;
				var textGr2 = null;
				if (languages[lang].title) {
					if (titleGr.get(languages[lang].title))
						titleGr2 = titleGr;
				}
				if (languages[lang].text) {
					if (textGr.get(languages[lang].text)) 
						textGr2 = textGr;
				}
				if(!this.checkLocalizedArticleExists(lang, kbGr)) {
					var newKbId = this.importTranslated(kbGr, titleGr2, textGr2);
					if(newKbId) {
						new GlideTSUtil().indexDocument('kb_knowledge', newKbId + "")
						this.copyAttachment(kbGr.sys_id, newKbId);
						gs.log("Imported article: '" + kbGr.short_description + "' for language: '" + lang + "' in Draft State.");
					}
					

				} else {
					gs.log("Skipped Import for article: '" + kbGr.short_description + "' in language: '" + lang + "'");
				}
			}
		}
	},
	
	checkLocalizedArticleExists: function(language, articleRecord) {
		var articleAgg = new GlideAggregate('kb_knowledge');
		articleAgg.addQuery("language", language);
		articleAgg.addQuery("parent", articleRecord.getUniqueValue());
		articleAgg.addAggregate("COUNT");
		articleAgg.query();		
		var count = 0;
		if (articleAgg.next()) {
			count = articleAgg.getAggregate('COUNT');
		}
		return (count > 0) ? true : false;
	},
	
	importArticles: function() {
			var gr = new GlideRecord('kb_knowledge');
			gr.addActiveQuery();
			gr.query();
			while (gr.next()) 
				this.searchTranslated(gr);
	},

    type: 'ImportTranslatedKnowledgeArticles'
};