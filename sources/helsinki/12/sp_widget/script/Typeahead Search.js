(function() {
	data.searchType = $sp.getParameter("t");
	data.results = [];
    data.searchMsg = gs.getMessage("Search");
	data.limit = options.limit || 15;
	var textQuery = '123TEXTQUERY321';

	if (!input)
		return;

	data.q = input.q;
	getKnowledge();
	if (gs.isLoggedIn())
		getCatalogItems();
	data.sqandaEnabled = gs.getProperty('glide.sp.socialqa.enabled', false) === 'true';
	if (data.sqandaEnabled)
		getQuestions();

	// add in additional search tables from sp_search_groups
	var portalGR = $sp.getPortalRecord();
	var portalID = portalGR.getDisplayValue('sys_id');
	var sg = GlideRecord('sp_search_group');
	sg.addQuery('sp_portal',portalID);
	sg.addQuery('active',true);
	sg.orderBy('order');
	sg.query();
	while (sg.next())
		addSearchTable(sg);

	// typeahead search generates multiple "Your text query contained only
	// common words..." msgs, we don't want them
	gs.flushMessages();

	function addSearchTable(sg) {
		var table = sg.getValue('name');
		var condition = sg.getValue('condition');
		var gr = GlideRecord(table);
		if (condition)
			gr.addEncodedQuery(condition);

		gr.addQuery(textQuery, data.q);
		gr.query();
		var searchTableCount = 0;
		while (gr.next() && searchTableCount < data.limit) {
			var rec = {};
			rec.type = "rec";
			rec.table = table;
			rec.sys_id = gr.getDisplayValue('sys_id');
			rec.page = sg.getDisplayValue('sp_page');
			if (!rec.page)
				rec.page = "form";
			rec.label = gr.getDisplayValue();
			rec.score = parseInt(gr.ir_query_score.getDisplayValue());
			data.results.push(rec);
			searchTableCount++;
		}
	}

	function getKnowledge() {
		var kb = new GlideRecord('kb_knowledge');
		kb.addQuery('workflow_state', 'published');
		kb.addQuery('valid_to', '>=', (new GlideDate()).getLocalDate().getValue());
		kb.addQuery(textQuery, data.q);
		kb.addQuery('kb_knowledge_base', $sp.getValue('kb_knowledge_base'));
		kb.query();
		var kbCount = 0;
		while (kb.next() && kbCount < data.limit) {
			if (!$sp.canReadRecord(kb))
				continue;

			var article = {};
			article.type = "kb";
			$sp.getRecordDisplayValues(article, kb, 'sys_id,number,short_description,published,text');
			if (!article.text)
				article.text = "";
			article.text = $sp.stripHTML(article.text);
			article.text = article.text.substring(0,200);
			article.score = parseInt(kb.ir_query_score.getDisplayValue());
			article.label = article.short_description;
			data.results.push(article);
			kbCount++;
		}
	}

	function getCatalogItems() {
		var sc = new GlideRecord('sc_cat_item');
		sc.addQuery(textQuery, data.q);
		sc.addQuery('active',true);
		sc.addQuery('no_search', '!=', true);
		sc.addQuery('visible_standalone', true);
		sc.addQuery('sys_class_name', 'NOT IN', 'sc_cat_item_wizard');
		sc.addQuery('sc_catalogs', $sp.getValue('sc_catalog'));
		sc.query();
		var catCount = 0;
		while (sc.next() && catCount < data.limit) {
			if (!$sp.canReadRecord(sc))
				continue;

			var item = {};
			if (sc.getRecordClassName() == "sc_cat_item_guide")
				item.type = "sc_guide";
			else if (sc.getRecordClassName() == "sc_cat_item_content") {
				var gr = new GlideRecord('sc_cat_item_content');
				gr.get(sc.getUniqueValue());
				$sp.getRecordValues(item, gr, 'url,content_type,kb_article');
				item.type = "sc_content";
			}
			else
				item.type = "sc";
			
			$sp.getRecordDisplayValues(item, sc, 'name,short_description,picture,price,sys_id');
			item.score = parseInt(sc.ir_query_score.getDisplayValue());
			item.label = item.name;
			data.results.push(item);
			catCount++;
		}
	}

	function getQuestions() {
		var questionGR = new GlideRecord("kb_social_qa_question");
		questionGR.addActiveQuery();
		questionGR.addQuery(textQuery, data.q);
		questionGR.query();
		var qCount = 0;
		while (questionGR.next() && qCount < data.limit) {
			if (!$sp.canReadRecord(questionGR))
				continue;

			var question = {};
			question.type = "qa";
			$sp.getRecordDisplayValues(question, questionGR, 'question,question_details,sys_created_on,sys_id');
			question.text = (question.question_details) ? $sp.stripHTML(question.question_details) : "";
			question.text = question.text.substring(0,200);
			question.label = question.question;
			question.score = 0;
			data.results.push(question);
			qCount++;
		}
	}
})();