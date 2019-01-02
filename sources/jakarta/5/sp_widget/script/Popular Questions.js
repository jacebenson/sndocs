// populate the 'data' object
// e.g., data.table = $sp.getValue('table');
data.userIsGuest = (gs.getUserName() === "guest");

data.knowledgeBase = $sp.getPortalRecord().getValue("sqanda_knowledge_base") || gs.getProperty("glide.service_portal.sqanda.default_kb");

data.questions = [];

options.maximum_entries = options.maximum_entries || 5;

var questionGR = new GlideRecord("kb_social_qa_question");
questionGR.addActiveQuery();
questionGR.addQuery("kb_knowledge_base", data.knowledgeBase);
questionGR.orderByDesc("answer_count");
questionGR.query();

data.totalQuestionCount = questionGR.getRowCount();

var count = 0;
while(questionGR.next() && count < options.maximum_entries) {
	data.questions.push(new Question(questionGR));
	count++;
}

function Question(gr) {
	this.sys_created_on = gr.getValue("sys_created_on");
	this.question = gr.getValue("question");
	this.sys_id = gr.getValue("sys_id");
	this.profile = gr.getElement("profile").getRefRecord().getValue("name");
	this.votes = gr.getValue("votes");
	this.answers = gr.getValue("answer_count");
}