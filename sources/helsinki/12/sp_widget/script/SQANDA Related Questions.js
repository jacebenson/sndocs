// populate the 'data' object
// e.g., data.table = $sp.getValue('table');
(function() {
	data.knowledgeBase = $sp.getPortalRecord().getValue("sqanda_knowledge_base") || gs.getProperty("glide.service_portal.sqanda.default_kb");
	data.questionID = $sp.getParameter("question_id") || $sp.getParameter("sys_id");
	if (!data.questionID){
		var answerId = $sp.getParameter("answer_id");
		if (answerId) {
			var answer = new GlideRecord("kb_social_qa_answer");
			answer.get(answerId);
			data.questionID = answer.getValue('question');
		} else
			return;
	}

	var questionGR = new GlideRecord("kb_social_qa_question");
	if (questionGR.get(data.questionID)) {
		data.question = new Question(questionGR);

		//to make sure we dont return duplicate questions
		var foundQuestionIDs = [];

		foundQuestionIDs.push(data.question.sys_id);

		//just grab three of the tags... dont want this to go on for ages
		//if someone is an overzelous tagger
		data.tags = data.question.tags.slice(0, 3);

		data.tags.forEach(function(tag) {
			tag.questions = [];

			var tagEntryGR = new GlideRecord("sqanda_tag_entry");
			tagEntryGR.addQuery("tag", tag.sys_id);
			tagEntryGR.addQuery("reference_name", "kb_social_qa_question");
			tagEntryGR.query();

			var taggedQuestionIDs = [];
			while(tagEntryGR.next()) {
				taggedQuestionIDs.push(tagEntryGR.getValue('reference_id'));
			}
			
			var taggedQuestionGR = new GlideRecord("kb_social_qa_question");
			taggedQuestionGR.addQuery("kb_knowledge_base", data.knowledgeBase);
			taggedQuestionGR.addActiveQuery();
			taggedQuestionGR.addQuery("sys_id", "IN", taggedQuestionIDs.toString());
			taggedQuestionGR.query();

			var count = 0;
			while(taggedQuestionGR.next() && count < 5) {
				if (!contains(foundQuestionIDs, taggedQuestionGR.getUniqueValue())) {
					tag.questions.push(new Question(taggedQuestionGR));
					foundQuestionIDs.push(taggedQuestionGR.getUniqueValue());
					count++;
				}
			}
		});
		
		data.recentQuestions = [];
		var recentQuestionGR = new GlideRecord("kb_social_qa_question");
		recentQuestionGR.addQuery("kb_knowledge_base", data.knowledgeBase);
		recentQuestionGR.addActiveQuery();
		recentQuestionGR.orderByDesc('sys_created_on');
		recentQuestionGR.query();
		
		var count = 0;
		while(recentQuestionGR.next() && count < 10) {
			if (!contains(foundQuestionIDs, recentQuestionGR.getUniqueValue())) {
				data.recentQuestions.push(new Question(recentQuestionGR));
				foundQuestionIDs.push(recentQuestionGR.getUniqueValue());
				count++;
			}
		}

	}

	function Question(gr) {
		this.sys_created_on = gr.getValue("sys_created_on");
		this.question = gr.getValue("question");
		this.question_details = gr.getValue("question_details");
		this.sys_id = gr.getValue("sys_id");
		this.profile = new Profile(gr.getElement("profile").getRefRecord());

		this.subscribers = 0;
		var subscriberGR = new GlideRecordCounter("kb_social_qa_subscribe");
		subscriberGR.addQuery("question", this.sys_id);
		subscriberGR.query();
		this.subscribers = subscriberGR.getCount();
		
		var viewGR = new GlideRecord("kb_social_qa_view");
		viewGR.addQuery("question", this.sys_id);
		viewGR.query();
		this.views = viewGR.getRowCount();
		
		this.tags = [];
		var labelEntryGR = new GlideRecord("sqanda_tag_entry");
		labelEntryGR.addQuery('reference_id', this.sys_id);
		labelEntryGR.query();
		while(labelEntryGR.next())
			this.tags.push(new Tag(labelEntryGR.getElement('tag').getRefRecord()))
	}

	function Tag(gr) {
		this.sys_id = gr.getUniqueValue();
		this.name = gr.getValue('name');
	}

	function Profile(gr) {
		this.name = gr.getValue("name");
		this.sys_id = gr.getValue("sys_id");
		this.document = {
			sys_id: gr.getValue("document")
		};
	}
	
	function contains(arr, value) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].equals(value)) {
				return true;
			}
		}
		
		return false;
	}
})();