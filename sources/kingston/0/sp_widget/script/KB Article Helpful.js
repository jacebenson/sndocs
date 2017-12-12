if (gs.getProperty("glide.knowman.show_yn_rating", "true") == "true" && gs.hasRole(gs.getProperty("glide.knowman.show_yn_rating.roles"))) {
	data.sys_id = $sp.getParameter('sys_id');
	data.percent = getPercent();
	data.title = options.title || gs.getMessage("Helpful?");
	data.isValidArticle = isValidArticle();
	data.submittingMsg = gs.getMessage("Submitting");
}

if (input) {
	data.response = options.response || gs.getMessage('Thank you');
	var gr = new GlideRecord('kb_feedback');
	gr.user = gs.getUserID();
	if (input.state == "useful_yes")
		gr.useful = 'yes';
	else
		gr.useful = 'no';
	gr.article = input.sys_id;
	gr.insert();
}

function getPercent() {
	var kbUseful = new GlideRecordCounter("kb_feedback");
	kbUseful.addQuery("article", data.sys_id);
	kbUseful.addQuery("useful", "yes").addOrCondition("useful", "no");
	var all = kbUseful.getCount();
	if (all == 0)
		return -1;

	kbUseful.initialize();
	kbUseful.addQuery("article", data.sys_id);
	kbUseful.addQuery("useful", "yes");
	var yes = kbUseful.getCount();
	return Math.round((yes / all) * 100);
}

function isValidArticle() {
	var articleGR = GlideRecord("kb_knowledge");
	articleGR.get(data.sys_id);
	var recordIsValid = articleGR.isValidRecord();
	var canReadArticle = articleGR.canRead();
	return recordIsValid && canReadArticle;
}