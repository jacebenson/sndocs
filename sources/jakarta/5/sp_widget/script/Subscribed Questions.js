data.questions = [];
data.knowledgeBase = $sp.getPortalRecord().getValue("sqanda_knowledge_base") || gs.getProperty("glide.service_portal.sqanda.default_kb");
var userID = gs.getUserID();
var liveProfileGR = new GlideRecord("live_profile");
liveProfileGR.addQuery("document", userID);
liveProfileGR.query();

if (liveProfileGR.next()) {
	var liveProfileID = liveProfileGR.getValue("sys_id");
	var subscriptionGR = new GlideRecord("kb_social_qa_subscribe");
	subscriptionGR.addQuery("profile", liveProfileID);
	subscriptionGR.addQuery("question.active", "true");
	subscriptionGR.addQuery("question.kb_knowledge_base", data.knowledgeBase);
	subscriptionGR.query();
	
	while(subscriptionGR.next()) {
		data.questions.push(new Question(subscriptionGR.getElement("question").getRefRecord()));
	}
}

function Question(gr) {
	this.sys_created_on = gr.getValue("sys_created_on");
	this.question = gr.getValue("question");
	this.question_details = gr.getValue("question_details");
	this.sys_id = gr.getValue("sys_id");
	this.profile = gr.getElement("profile").getRefRecord().getValue("name");
	
	var answerGR = new GlideRecord("kb_social_qa_answer");
	answerGR.addActiveQuery();
	answerGR.addQuery("question", this.sys_id);
	answerGR.query();
	this.answers = answerGR.getRowCount();
	
	this.votes = 0;
	var voteGR = new GlideRecord("kb_social_qa_vote");
	voteGR.addQuery("reference_id", this.sys_id);
	voteGR.query();
	while(voteGR.next()) {
		this.votes = (voteGR.getValue("up_vote") === '1') ? this.votes + 1 : this.votes - 1;
	}
}