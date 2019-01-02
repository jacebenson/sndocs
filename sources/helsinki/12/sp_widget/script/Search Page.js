// populate the 'data' variable
data.showPrices = $sp.showCatalogPrices();
data.q = $sp.getParameter('q');
data.t = $sp.getParameter('t');
data.results = [];

if (data.t)
	data.limit = options.max_group || 15;
else 
	data.limit = options.max_all || 30;

// add in additional search tables from sp_search_groups
var portalGR = $sp.getPortalRecord();
var portalID = portalGR.getUniqueValue();
var sg = GlideRecord('sp_search_group');
sg.addQuery('sp_portal', portalID);
sg.addActiveQuery();
if (data.t)
	sg.addQuery("name", data.t);
sg.orderBy('order');
sg.query();
while (sg.next())
	addSearchTable(sg);

function addSearchTable(sg) {
	var table = sg.getValue('name');
	var fields = $sp.getListColumns(table,'sp');
	fields = fields.split(',');
	var condition = sg.getValue('condition');
	var gr = GlideRecord(table);
	if (condition)
		gr.addEncodedQuery(condition);

	gr.addQuery('123TEXTQUERY321', data.q);
	gr.query();
	var searchTableCount = 0;
	while (gr.next() && searchTableCount < data.limit) {
		if (!gr.canRead())
			continue;

		var rec = {};
		rec.type = "rec";
		rec.table = table;
		rec.sys_id = gr.getUniqueValue();
		rec.page = sg.getDisplayValue('sp_page');
		if (!rec.page)
			rec.page = "form";
		rec.label = gr.getDisplayValue();
		rec.score = parseInt(gr.ir_query_score.getDisplayValue());
		rec.fields = [];
		for (var i in fields) {
			var field = fields[i];
			var obj = getField(gr, field);
			if (rec.label != obj.value && !GlideStringUtil.nil(obj.display_value))
				rec.fields.push(obj);
		}

		data.results.push(rec);
		searchTableCount++;
	}
}

if (data.t == 'kb' || !data.t) {
	var kb = $sp.getKBRecord();
	kb.addQuery('123TEXTQUERY321', data.q);
	kb.setLimit(data.limit);
	kb.query();
	data.article_count = kb.getRowCount();
	while (kb.next()) {
		// Does user have permission to see this item?
		if (!$sp.canReadRecord("kb_knowledge", kb.getUniqueValue()))
			continue;

		var article = {};
		$sp.getRecordDisplayValues(article, kb, 'sys_id,number,short_description,text');
		article.publishedUTC = kb.getValue('published');
		article.type = "kb";
		if (!article.text)
			article.text = "";
		article.text = $sp.stripHTML(article.text) + "";
		article.text = article.text.substring(0, 200);
		article.score = parseInt(kb.ir_query_score.getDisplayValue());
		data.results.push(article);
	}
	$sp.logSearch('kb_knowledge', data.q, kb.getRowCount());
}

if (gs.isLoggedIn() && (data.t == 'sc' || !data.t)) {
	var sc = $sp.getSCRecord();
	sc.addQuery('123TEXTQUERY321', data.q);
	sc.setLimit(data.limit);
	sc.query();
	while (sc.next()) {
		// Does user have permission to see this item?
		var catItem = GlideappCatalogItem.get(sc.sys_id.getDisplayValue());
		if (!catItem.canViewOnSearch())
			continue;

		var item = {};
		$sp.getRecordDisplayValues(item, sc, 'name,short_description,picture,price,sys_id,sys_class_name');
		item.score = parseInt(sc.ir_query_score.getDisplayValue());
		item.page = "sc_cat_item";
		item.type = "sc";
		if (sc.getRecordClassName() == "sc_cat_item_content") {
			var gr = new GlideRecord('sc_cat_item_content');
			gr.get(sc.getUniqueValue());
			$sp.getRecordValues(item, gr, 'url,content_type,kb_article');
			item.type = "sc_content";
		} else if (sc.getRecordClassName() == "sc_cat_item_guide") {
			item.page = "sc_cat_item_guide";
		}
		data.results.push(item);
	}
	$sp.logSearch('sc_cat_item', data.q, sc.getRowCount());
}

data.sqandaEnabled = gs.getProperty('glide.sp.socialqa.enabled', false) === 'true';

if (data.sqandaEnabled && (data.t == 'qa' || !data.t)) {
	var questionGR = new GlideRecord("kb_social_qa_question")
	questionGR.addQuery('123TEXTQUERY321',data.q);
	questionGR.setLimit(data.limit);
	questionGR.query();
	while (questionGR.next()) {
		if (!$sp.canReadRecord(questionGR))
			continue;

		var question = {};
		question.type = "qa";
		$sp.getRecordDisplayValues(question, questionGR, 'question,votes,question_details,sys_id');
		question.createdUTC = questionGR.getValue('sys_created_on');
		question.text = (question.question_details) ? $sp.stripHTML(question.question_details) : "";
		question.text = question.text.substring(0,200);
		question.label =  $sp.stripHTML(question.question);

		question.votes = 0;
		var voteGR = new GlideRecord("kb_social_qa_vote");
		voteGR.addQuery("reference_id", questionGR.getUniqueValue());
		voteGR.query();
		while (voteGR.next())
			question.votes = (voteGR.getValue("up_vote") === "1") ? question.votes + 1 : question.votes - 1;

		question.votes = question.votes;

		question.tags = [];
		var labelEntryGR = new GlideRecord("sqanda_tag_entry");
		labelEntryGR.addQuery("reference_id", question.sys_id);
		labelEntryGR.query();
		while (labelEntryGR.next()) {
			var labelGR = labelEntryGR.getElement("tag").getRefRecord();
			question.tags.push({
				sys_id: labelGR.getUniqueValue(),
				name: labelGR.getValue("name")
			})
		}

		data.results.push(question);
	}
	$sp.logSearch('kb_social_qa_question', data.q, questionGR.getRowCount());
}

function getField(gr, name) {
	var f = {};
	f.display_value = gr.getDisplayValue(name);
	f.value = gr.getValue(name);
	var ge = gr.getElement(name);
	if (ge == null)
		return f;

	f.type = ge.getED().getInternalType()
	f.label = ge.getLabel();
	return f;
}