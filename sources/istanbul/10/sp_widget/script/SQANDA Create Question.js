(function($sp, input, data, gs, GlideRecord) {
  "use strict";
	data.typeTagNameMsg = gs.getMessage("Type tag name...");
	data.mustSpecifyQuestionMsg = gs.getMessage("You must specify a question");
	data.postingMsg = gs.getMessage("Posting");
	data.communityBreadcrumb = gs.getMessage("Community");
	data.questionSuggestions = [];
	data.knowledgeBase = $sp.getPortalRecord().getValue("sqanda_knowledge_base") || gs.getProperty("glide.service_portal.sqanda.default_kb");

	if (input && input.method === 'save') {
		data.table = input.table;
		data.sys_id = input.sys_id;
		var result = {};
		if (input._fields) {
			result = $sp.saveRecord(input.table, input.sys_id, input._fields);
			if (result.sys_id && input.tagList.length > 0) {
				input.tagList.split(',').forEach(function(tagID) {
					var labelEntryGR = new GlideRecord("sqanda_tag_entry");
					labelEntryGR.initialize();
					labelEntryGR.tag = tagID;
					labelEntryGR.reference_name = "kb_social_qa_question";
					labelEntryGR.reference_id = result.sys_id;
					labelEntryGR.insert();
				})
			}
		}

		if (input.sys_id == '-1'){
			data.sys_id = result.sys_id;
			data.isNewRecord = true;
		}
	} else if (input && input.method === 'search') {
		var questionGR = new GlideRecord("kb_social_qa_question");
		questionGR.addActiveQuery();
		questionGR.addQuery('123TEXTQUERY321', input.query);
		questionGR.orderBy('votes');
		questionGR.query();
		while(questionGR.next()) {
			if (!$sp.canReadRecord(questionGR))
				continue;

			var question = {};
			question.title = questionGR.getValue("question");
			question.sys_id = questionGR.getUniqueValue();

			var answerGR = new GlideRecord("kb_social_qa_answer");
			answerGR.addQuery("question", question.sys_id);
			answerGR.addQuery("accepted", true);
			answerGR.query();

			question.acceptedAnswer = (answerGR.getRowCount() > 0);

			data.questionSuggestions.push(question);
		}

		return data;
	} else {
		data.table = 'kb_social_qa_question';
		data.sys_id = '-1';
	}

  data.f = $sp.getForm(data.table, data.sys_id, data.query);
	data.f._fields.kb_knowledge_base.value = data.knowledgeBase;
})($sp, input, data, gs, GlideRecord);