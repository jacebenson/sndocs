(function() {
	if(!input){
		/*
		Generate object with list of options and legacy properties to be used client side.
		For any case, if the option contains any value it will take preference over system properties.

		Glyph option field is to set icon for pinned articles
		*/
		var articleCount = gs.getProperty('glide.knowman.search.articles_per_page');
		options.init_article_count =  parseInt(options.init_article_count || articleCount || 20);
		options.scroll_article_count = parseInt(options.scroll_article_count || articleCount || 20) ;
		options.pinned_article_label = options.pinned_article_label ? gs.getMessage(options.pinned_article_label) : gs.getMessage('Show Pinned Articles');
		options.hide_category = options.hide_category ? (options.hide_category == 'Use system property' ?  gs.getProperty('glide.knowman.search.show_category') == 'false' : options.hide_category == 'Yes') : gs.getProperty('glide.knowman.search.show_category') == 'false' || false;
		options.attachment_type = (!options.attachment_type || options.attachment_type == 'use_property') ? (gs.getProperty('glide.knowman.search.attachment') || 'LINK_SNIPPET') : options.attachment_type;
		options.show_relevancy = options.show_relevancy ? (options.show_relevancy == 'Use system property' ?  gs.getProperty('glide.knowman.search.show_relevancy') == 'true' : options.show_relevancy == 'Yes') : gs.getProperty('glide.knowman.search.show_relevancy') == 'true' || false;
		options.knowledge_seperator = options.knowledge_seperator || '|';
		options.category_seperator = options.category_seperator || ">";
		options.category_reverse = options.category_reverse ? options.category_reverse == 'false' : true;
		options.show_unpublished = false;
		options.knowledge_fields = options.knowledge_fields ? options.knowledge_fields.split(",") : getKnowledgeFieldsfromProperties();
		options.social_fields = options.social_fields ? options.social_fields.split(",") : getSocialFieldsfromProperties();
		options.show_secondary_fields_label = options.show_secondary_fields_label ? options.show_secondary_fields_label == 'true' : true;
		options.pinned_icon = options.glyph || 'book';

		data.instanceid = $sp.getDisplayValue("sys_id");
		//Get the templates URL
		data.article_template = "kb_result_article_summary";//$sp.translateTemplate("kb_result_article_summary");
		data.pinned_article_template = "kb_result_pinned_article_summary";//$sp.translateTemplate("kb_result_pinned_article_summary");
		data.useDocumentViewer = (gs.getProperty('sn_km_portal.glide.knowman.serviceportal.use_document_viewer', 'false') == 'true') && GlidePluginManager.isActive('com.snc.documentviewer');
		data.externalContentLabel = gs.getMessage(gs.getProperty('sn_km_intg.glide.knowman.external.ui_label_for_external_content', 'External Content')) || gs.getMessage('External Content');

		var userPreferance_sortOrder = gs.getUser().getPreference('knowledge.portal_search.sort.field');
		var widger_sortOrder = options.default_order;
		//Set default sorting order / direction from option
		var defaulOrder = userPreferance_sortOrder || widger_sortOrder || 'sys_view_count:desc';
		
		options.default_order = 'sys_view_count';
		options.default_order_desc = true;
		var defaultOrderAry = defaulOrder.split(":");
		if(defaultOrderAry.length > 0){
			options.default_order = defaultOrderAry[0];
			options.default_order_desc = defaultOrderAry[1] == 'desc' || false;
		}

		//Prepare request parameters for first result load
		var obj = {};
		obj.keyword = "";
		obj.start = 0;
		obj.end = options.init_article_count;
		obj.language = "";
		obj.variables = "";
		obj.filters = "";
		obj.order = options.default_order+','+options.default_order_desc;
		obj.knowledge_fields = options.knowledge_fields.join(',');
		obj.social_fields = options.social_fields.join(',');
		obj.attachment = true;
		obj.resources = "";
		options.filters = obj;

		//get result for first load
		//data.results = getResults(obj);
		//return;

	}else if(input && input.payload){
		data.results = getResults(input.payload);

	}

	function getResults(data){	
		var searchRequest = new KBPortalService();
		return searchRequest.getResultData(data);
	}

	function getKnowledgeFieldsfromProperties(){

		//Generate secondary fields based on legacy properties
		var fields = [];

		if(gs.getProperty('glide.knowman.search.show_article_number') && gs.getProperty('glide.knowman.search.show_article_number') == 'true'){
			var kbMod = new global.KBViewModel();
			if(kbMod.isVersioningEnabled()){
				fields.push('display_number');
			}else{
				fields.push('number');
			}
		}
		if(gs.getProperty('glide.knowman.search.show_author') && gs.getProperty('glide.knowman.search.show_author') == 'true')
			fields.push('author');
		if(gs.getProperty('glide.knowman.search.show_view_count') && gs.getProperty('glide.knowman.search.show_view_count') == 'true')
			fields.push('sys_view_count');		
		if(gs.getProperty('glide.knowman.search.show_last_modified') && gs.getProperty('glide.knowman.search.show_last_modified') == 'true')
			fields.push('sys_updated_on');
		if(gs.getProperty('glide.knowman.search.show_published') && gs.getProperty('glide.knowman.search.show_published') == 'true')
			fields.push('published');
		if(gs.getProperty('glide.knowman.show_unpublished') && gs.getProperty('glide.knowman.show_unpublished') == 'true'){
			fields.push('workflow_state');
			options.show_unpublished = true;
		}

		fields.push('rating');
		fields.push('external');

		return fields;
	}

	function getSocialFieldsfromProperties(){

		//Generate secondary fields based on legacy properties
		var fields = [];
		if(gs.getProperty('glide.knowman.search.show_author') && gs.getProperty('glide.knowman.search.show_author') == 'true')
			fields.push('profile');	
		if(gs.getProperty('glide.knowman.search.show_view_count') && gs.getProperty('glide.knowman.search.show_view_count') == 'true')
			fields.push('views');
		if(gs.getProperty('glide.knowman.search.show_last_modified') && gs.getProperty('glide.knowman.search.show_last_modified') == 'true')
			fields.push('sys_updated_on');
		if(gs.getProperty('glide.knowman.search.show_published') && gs.getProperty('glide.knowman.search.show_published') == 'true')
			fields.push('sys_created_on');

		fields.push('votes');
		fields.push('answer_count');

		return fields;
	}

})();