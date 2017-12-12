data.isLoggedInUser = gs.getSession().isLoggedIn();
data.tsQueryId = $sp.getParameter("sysparm_tsqueryId") || "";

if (input) {
	if(input.action == "saveHelpful"){
		data.response = options.response || gs.getMessage('Thank you');
		var kbSNC = new global.KBAjaxSNC();
		var params = {};
		params.article = input.article_sys_id;
		params.useful = (input.useful == 'useful_yes') ? 'yes' : 'no';
		params.user = gs.getUserID();
		params.session_id = gs.getSessionID();
		params.search_id = data.tsQueryId;
		var resp = kbSNC.saveUsefulWithParams(params) + '';
		var successMessage = options.feedback_message ? options.feedback_message : gs.getMessage('Thank You');
		data.response = resp.includes('true') ? successMessage : gs.getMessage('Failed to save feedback');		
		data.success = resp.includes('true');
	}
	else if(input.action == 'getHelpful'){
		data.percent = getPercent();
		data.helpfulContent = gs.getMessage("{0}% found this helpful", data.percent + '');
	}
}


function getPercent() {
	var fbs = new GlideRecord("kb_feedback");
	fbs.addQuery("useful", "yes");
	fbs.addQuery("article", input.article_sys_id);
	fbs.query();
	var useful_yes = fbs.getRowCount();
	fbs = new GlideRecord("kb_feedback");
	fbs.addNotNullQuery("useful");
	fbs.addQuery("article",input.article_sys_id);
	fbs.query();
	var useful_total = fbs.getRowCount();

	var percentage = (useful_total > 0) ? Math.round(useful_yes/useful_total*100) : 0;
	return percentage;
}

