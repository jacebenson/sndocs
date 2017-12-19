(function() {
	data.communityBreadcrumb = gs.getMessage("Community");
	data.knowledgeBase = $sp.getPortalRecord().getValue("sqanda_knowledge_base") || gs.getProperty("glide.service_portal.sqanda.default_kb");
	//If no questions have been asked yet, don't load anything up.
	data.noQuestionsExist = false;
	var allQuestionsGR = new GlideRecord("kb_social_qa_question");
	allQuestionsGR.addActiveQuery();
	allQuestionsGR.addQuery("kb_knowledge_base", data.knowledgeBase);
	allQuestionsGR.query();
	if (allQuestionsGR.getRowCount() === 0) {
		data.noQuestionsExist = true;
		return;
	}

	var sortTypes = ['newest', 'top', 'unanswered'];
	data.tagID = (input && input.tagID) || $sp.getParameter("sys_id");

	if (data.tagID && data.tagID != "-1") {
		var labelGR = new GlideRecord("sqanda_tag");
		if (!labelGR.get(data.tagID))
			data.tagID = null;
	}

	data.page = $sp.getParameter("page") || 1;
	data.page = parseInt(data.page);
	if (isNaN(data.page))
		data.page = 1;

	var pageCount = 20;

	data.sort = (input && input.sort) || $sp.getParameter("sort") || "newest";
	if (!contains(sortTypes, data.sort))
		data.sort = "newest";

	var entryIDs = [];

	if (data.tagID != null) {
		var labelEntryGR = new GlideRecord("sqanda_tag_entry");
		labelEntryGR.addQuery("reference_name", "kb_social_qa_question");
		if (data.tagID != "-1") {
			data.tagName = labelGR.getValue("name");
			labelEntryGR.addQuery("tag", data.tagID);
		} else {
			var loggedInSysUserID = gs.getUser().getID();
			var liveProfileID = "";
			var liveProfileGR = new GlideRecord("live_profile");
			liveProfileGR.addQuery("document", loggedInSysUserID);
			liveProfileGR.query();
			if (liveProfileGR.next())
				liveProfileID = liveProfileGR.getValue("sys_id");

			var tagIDs = [];
			var userTagsGR = new GlideRecord("sqanda_tag_entry");
			userTagsGR.addQuery("reference_name", "live_profile");
			userTagsGR.addQuery("reference_id", liveProfileID);
			userTagsGR.addNotNullQuery("tag");
			userTagsGR.query();
			while (userTagsGR.next()) {
				tagIDs.push(userTagsGR.getValue("tag"));
			}

			labelEntryGR.addQuery("tag", "IN", tagIDs.join(","));
			if (tagIDs.length == 0)
				data.tagID = null;
		}

		labelEntryGR.query();

		entryIDs = [];
		while (labelEntryGR.next())
			entryIDs.push(labelEntryGR.getValue("reference_id"));
	}

	var questionGR = new GlideRecord("kb_social_qa_question");
	questionGR.addQuery("kb_knowledge_base", data.knowledgeBase);
	questionGR.addActiveQuery();

	if (data.tagID != null)
		questionGR.addQuery("sys_id", "IN", entryIDs.concat(","));

	if (data.sort.equals("newest"))
		questionGR.orderByDesc('sys_created_on');
	else
		questionGR.orderByDesc('votes');

	if (data.sort.equals("unanswered"))
		questionGR.addQuery("answer_count", 0);

	questionGR.chooseWindow((data.page - 1) * pageCount, (data.page - 1) * pageCount + pageCount, true);
	questionGR.query();

	data.hasNextPage = (questionGR.getRowCount() > ((data.page - 1) * pageCount + pageCount));

	data.questions = [];
	while (questionGR.next())
		data.questions.push(new Question(questionGR))
		})();

function Question(gr) {
	this.question = gr.getValue("question");
	this.question_details = gr.getValue("question_details");
	this.sys_id = gr.getUniqueValue();
	this.votes = parseInt(gr.getValue("votes")) || 0;
	this.tags = [];
	this.profile = new Profile(gr.getElement("profile").getRefRecord());
	this.sys_created_on = gr.getValue("sys_created_on");
	this.answer_count = parseInt(gr.getValue("answer_count")) || 0;

	var labelEntryGR = new GlideRecord("sqanda_tag_entry");
	labelEntryGR.addQuery("reference_id", this.sys_id);
	labelEntryGR.query();

	while(labelEntryGR.next()) {
		this.tags.push(new Tag(labelEntryGR.getElement("tag").getRefRecord()));
	}	
}

function Profile(gr) {
	this.name = gr.getValue("name");
	this.sys_id = gr.getValue("sys_id");
	this.document = {
		sys_id: gr.getValue("document")
	};
}

function Tag(gr) {
	this.sys_id = gr.getUniqueValue();
	this.name = gr.getValue('name');
}

function contains(arr, str) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].equals(str))
			return true;
	}

	return false;
}