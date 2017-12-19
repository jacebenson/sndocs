(function () {
	data.recipientsMsg = gs.getMessage("Recipients");
	data.commentMsg = gs.getMessage("Add a comment");
	data.optionalMsg = gs.getMessage("Optional Message");
	data.communityBreadcrumb = gs.getMessage("Community");
	data.subscribeMessage = gs.getMessage("You subscribed to this question");
	data.unsubscribeMessage = gs.getMessage("You unsubscribed from this question");
	data.answerSubmitted = gs.getMessage("Your answer has been posted");
	data.commentPostedMsg = gs.getMessage("Your comment has been posted");
	data.cancelCommentMessage = gs.getMessage("Your comment was canceled");
	data.acceptedMsg = gs.getMessage("You accepted this answer");
	data.unAcceptedMsg = gs.getMessage("You unaccepted this answer");
	data.editMsg = gs.getMessage("You have editted successfully");
	data.questionID = $sp.getParameter("question_id") || $sp.getParameter("sys_id");

	if (input == null)
		data._attachmentGUID = gs.generateGUID();

	if (input && input.method == 'generate_guid') {
		data._attachmentGUID = gs.generateGUID();
		return;
	}

	if (input)
		data.questionID = input.sys_id;

	if (input && input.method === 'save') {
		data.result = createAnswer(input);
	}

	if (!data.questionID){
		var answerId = $sp.getParameter("answer_id");
		if (answerId) {
			var answer = new GlideRecord("kb_social_qa_answer");
			answer.get(answerId);
			data.questionID = answer.getValue('question');
		} else
			return;
	}

	data.sysUserID = gs.getUser().getID();
	data.userIsGuest = (gs.getUserName() === "guest");
	var liveProfileGR = new GlideRecord("live_profile");
	liveProfileGR.addQuery("document", data.sysUserID);
	liveProfileGR.query();
	data.liveProfileID = (liveProfileGR.next()) ? liveProfileGR.getValue("sys_id") : "";

	var questionGR = new GlideRecord("kb_social_qa_question");
	if (questionGR.get(data.questionID)) {
		incrementViewCounter(data.questionID)

		//get question
		data.question = new Question(questionGR);
		data.answers = [];
		data.comments = {};
		data.votes = {};

		//get question votes
		var questionVotes = [];
		var questionVoteGR = new GlideRecord("kb_social_qa_vote");
		questionVoteGR.addActiveQuery();
		questionVoteGR.addQuery("reference_name", "kb_social_qa_question");
		questionVoteGR.addQuery("reference_id", data.questionID);
		questionVoteGR.query();
		while(questionVoteGR.next())
			questionVotes.push(new Vote(questionVoteGR));

		data.votes[data.questionID] = questionVotes;

		//get comments on the question
		var questionComments = [];
		var commentGR = new GlideRecord("kb_social_qa_comment");
		commentGR.addActiveQuery();
		commentGR.addQuery("reference_name", "kb_social_qa_question");
		commentGR.addQuery("reference_id", data.questionID);
		commentGR.query();
		while(commentGR.next())
			questionComments.push(new Comment(commentGR));

		data.comments[data.questionID] = questionComments;

		//get answers
		var answerGR = new GlideRecord("kb_social_qa_answer");
		answerGR.addActiveQuery();
		answerGR.orderByDesc("accepted");
		answerGR.orderByDesc("votes");
		answerGR.addQuery("question", data.questionID);
		answerGR.query();

		var answerIDs = [];
		while (answerGR.next()) {
			var answer = new Answer(answerGR);
			data.answers.push(answer);
			answerIDs.push(answer.sys_id);
			data.comments[answer.sys_id] = [];
			data.votes[answer.sys_id] = [];
		}

		//get comments on the answers
		var answerCommentGR = new GlideRecord("kb_social_qa_comment");
		answerCommentGR.addActiveQuery();
		answerCommentGR.addQuery("reference_name", "kb_social_qa_answer");
		answerCommentGR.addQuery("reference_id", "IN", answerIDs.toString());
		answerCommentGR.query();
		while(answerCommentGR.next()) {
			var comment = new Comment(answerCommentGR);
			data.comments[comment.reference_id].push(comment);
		}

		//get answer votes
		var answerVoteGR = new GlideRecord("kb_social_qa_vote");
		answerVoteGR.addActiveQuery();
		answerVoteGR.addQuery("reference_name", "kb_social_qa_answer");
		answerVoteGR.addQuery("reference_id", "IN", answerIDs.toString());
		answerVoteGR.query();
		while(answerVoteGR.next()) {
			var vote = new Vote(answerVoteGR);
			data.votes[vote.reference_id].push(vote);
		}
	}

	function Question(gr) {
		this.addCommentState = false;
		this.sys_created_on = gr.getValue("sys_created_on");
		this.question = gr.getValue("question");
		this.question_details = gr.getValue("question_details");
		this.sys_id = gr.getValue("sys_id");
		this.views = gr.getValue("views");
		this.tableName = gr.getTableName();
		this.profile = new Profile(gr.getElement("profile").getRefRecord());

		this.tags = [];
		var labelEntryGR = new GlideRecord("sqanda_tag_entry");
		labelEntryGR.addQuery('reference_id', this.sys_id);
		labelEntryGR.query();
		while(labelEntryGR.next())
			this.tags.push(new Tag(labelEntryGR.getElement('tag').getRefRecord()))

			this.subscription = "";
		var subscriptionGR = new GlideRecord("kb_social_qa_subscribe");
		subscriptionGR.addQuery("question", data.questionID);
		subscriptionGR.addQuery("profile", data.liveProfileID);
		subscriptionGR.query();
		if (subscriptionGR.next())
			this.subscription = subscriptionGR.getValue("sys_id");
	}

	function Profile(gr) {
		this.name = gr.getValue("name");
		this.sys_id = gr.getValue("sys_id");
		this.document = {
			sys_id: gr.getValue("document")
		};
	}

	function Vote(gr) {
		this.sys_id = gr.getValue("sys_id");
		this.profile = gr.getValue("profile");
		this.reference_id = gr.getValue("reference_id");
		this.up_vote = gr.getValue("up_vote");
		this.type = (gr.getValue("up_vote") === "1") ? "upvote" : "downvote";
	}

	function Answer(gr) {
		this.sys_id = gr.getValue("sys_id");
		this.votes = gr.getValue("votes");
		this.profile = new Profile(gr.getElement("profile").getRefRecord());
		this.accepted = (gr.getValue("accepted") === "1");
		this.sys_created_on = gr.getValue("sys_created_on");
		this.answer = gr.getValue("answer");
		this.tableName = gr.getTableName();
		this.addCommentState = false;
	}

	function Comment(gr) {
		this.sys_id = gr.getValue("sys_id");
		this.comment = gr.getValue("comment");
		this.reference_id = gr.getValue("reference_id");
		this.sys_created_on = gr.getValue("sys_created_on");
		this.profile = new Profile(gr.getElement("profile").getRefRecord());
	}

	function Tag(gr) {
		this.sys_id = gr.getUniqueValue();
		this.name = gr.getValue('name');
	}

	function incrementViewCounter(questionID) {
		//Increment the view counter
		var viewGR = new GlideRecord("kb_social_qa_view");
		viewGR.addActiveQuery();
		viewGR.addQuery("question", questionID);
		viewGR.addQuery("session_id", gs.getSessionID());
		viewGR.query();

		if (!viewGR.hasNext()) {
			var newViewGR = new GlideRecord("kb_social_qa_view");
			newViewGR.initialize();
			newViewGR.setWorkflow(true);
			newViewGR.setValue("question", questionID);
			newViewGR.insert();
		}
	}
})();