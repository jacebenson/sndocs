var SocialQAView = Class.create();
SocialQAView.prototype = {
    initialize: function() {
		this.globalUtil = new global.GlobalKnowledgeUtil();
		this.socialQACommon = new SocialQACommon();
		this.tableNames = this.socialQACommon.getTableNames();
    },
	
	_updateQuestionTable: function(questionId) {
		var gr = new GlideRecord(this.tableNames.table_question);
		gr.addActiveQuery();
		gr.addQuery('sys_id', questionId);
		gr.query();
		if (gr.next()) {
			gr.views++;
			gr.update();
		}
	},
	
	questionViewIncrement: function(questionId) {
		var inValid = gs.nil(questionId);
		if (inValid)
			return ;
		
		var gr = new GlideRecord(this.tableNames.table_view);
		var sessionId = gs.getSessionID();
		gr.addActiveQuery();
		gr.addQuery('session_id', sessionId);
		gr.addQuery('question', questionId);
		gr.query();
		if (gr.hasNext()) 
			return ;
		else {
			gr.initialize();
			gr.session_id = sessionId;
			gr.question = questionId;
			gr.insert();
			this._updateQuestionTable(questionId);
		}
	},

    type: 'SocialQAView'
};