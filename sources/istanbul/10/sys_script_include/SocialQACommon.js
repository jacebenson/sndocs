var SocialQACommon = Class.create();
SocialQACommon.prototype = {
	TABLE_QUESTION: 'kb_social_qa_question',
	TABLE_ANSWER: 'kb_social_qa_answer',
	TABLE_COMMENT: 'kb_social_qa_comment',
	TABLE_VOTE: 'kb_social_qa_vote',
	TABLE_VIEW: 'kb_social_qa_view',
	TABLE_SUBSCRIBE : 'kb_social_qa_subscribe',
	TABLE_PROFILE: 'live_profile',
    initialize: function() {
		this.globalUtil = new global.GlobalKnowledgeUtil();
    },
	
	getTableNames: function() {
		var tableNames = {};
		tableNames.table_question = this.TABLE_QUESTION;
		tableNames.table_answer = this.TABLE_ANSWER;
		tableNames.table_comment = this.TABLE_COMMENT;
		tableNames.table_vote = this.TABLE_VOTE;
		tableNames.table_view = this.TABLE_VIEW;
		tableNames.table_profile = this.TABLE_PROFILE;
		tableNames.table_subscribe = this.TABLE_SUBSCRIBE;
		return tableNames;
	},
	
	canCreate: function(base) {
		//Checks if current user has create access in the Knowledge Base
		//Create access for Question, Answer, vote, coment
		var kblist = this.globalUtil.getCanReadKBs();
		if(kblist.indexOf(base)!=-1)
			return true;
		else
			return false;
	},
	canRead: function(base) {
		//Checks if current user has read access in the Knowledge Base
		//Read access for Question, Answer, vote, comment
		var kblist = this.globalUtil.getCanReadKBs();
		if(kblist.indexOf(base)!=-1)
			return true;
		else
			return false;
	},
	canWrite: function(base) {
		//Checks if current user has write access in the Knowledge Base
		//Write access for Question, Answer, vote, comment
		return this.canRead(base);
	},
	canReadVoteorComment: function(reference_name, reference_id) {
		if(gs.nil(reference_name) && gs.nil(reference_id))
			return false;
		var grRef = new GlideRecord(reference_name);
		if(grRef.isValid() && grRef.get(reference_id)) {
			if(grRef.getTableName() == this.TABLE_QUESTION)
				return this.canRead(grRef.kb_knowledge_base);
			else
				return this.canRead(grRef.question.kb_knowledge_base);
		}
		return false;
	},
	canCreateVoteorComment: function(reference_name, reference_id) {
		return this.canReadVoteorComment(reference_name, reference_id);
	},
	canEditQuestion: function(gr) {
		var profile = new global.GlobalKnowledgeUtil().getSessionProfile();
		var user = gs.getUserID();
		var kbManager = this.isKnowledgeManager(gr.getValue('kb_knowledge_base'), user);
		if(kbManager)
			return true;

		var canWrite = this.canWrite(gr.kb_knowledge_base);
		return (canWrite && (gr.profile == profile));
	},
	canEditAnswer: function(current) {
		var profile = new global.GlobalKnowledgeUtil().getSessionProfile();
		var user = gs.getUserID();
		var kbManager = this.isKnowledgeManager(current.question.kb_knowledge_base, user);
		if(kbManager)
			return true;

		var canWrite = this.canWrite(current.question.kb_knowledge_base);
		return (canWrite && (current.profile == profile));
	},
	isQuestionPoster: function(profile) {
		var sessionProfile = new global.GlobalKnowledgeUtil().getSessionProfile();
		return (sessionProfile == profile);
	},
	canEditVote: function(gr) {
		return this.canEditComment(gr);
	},
	canEditComment: function(gr) {
		if(!gr.isValid())
			return false;
		var reference_name = gr.getValue('reference_name');
		var reference_id = gr.getValue('reference_id');
		if(gs.nil(reference_name) && gs.nil(reference_id))
			return false;
		var grRef = new GlideRecord(reference_name);
		if(grRef.isValid() && grRef.get(reference_id)) {
			var kbManager = false;
			if(grRef.getTableName() == this.TABLE_QUESTION)
				kbManager = this.isKnowledgeManager(grRef.kb_knowledge_base, gs.getUserID());
			else
				kbManager = this.isKnowledgeManager(grRef.question.kb_knowledge_base, gs.getUserID());
			if(kbManager)
				return true;
			var profile = new global.GlobalKnowledgeUtil().getSessionProfile();

			if(gr.profile == profile)
				return true;
		}
		return false;
	},
	isKnowledgeManager: function(kbID, userID) {
		var gr = new GlideRecord('kb_knowledge_base');
		if(gr.get(kbID)) {
			var managers = gr.getValue('kb_managers');
			var owner = gr.getValue('owner');
			if(gs.nil(managers)) 
				return (owner == userID);
			else
				return (owner == userID || managers.indexOf(userID) > -1);
		}
		return false;
	},
	showAccept: function(gr) { //This is for Answer UI Actions
		if(gs.hasRole('admin'))
			return true;
		if(this.isKnowledgeManager(gr.question.kb_knowledge_base, gs.getUserID()))
			return true;
		var profile = new global.GlobalKnowledgeUtil().getSessionProfile();
		if(gr.question.profile == profile)
			return true;
		return false;
	},
	getCategoryBreadcrumb: function (questionId) {
		var node = [];
		var questionGR = new GlideRecord(this.TABLE_QUESTION);
		questionGR.addActiveQuery();
		questionGR.addQuery('sys_id', questionId);
		questionGR.query();
		if(!questionGR.hasNext())
			return node;
		questionGR.next();
		
		if(questionGR.getValue('kb_category') == '')
			return node;
		var categoryId = questionGR.kb_category;
		do {
			var kbCategoryGR = new GlideRecord('kb_category');
			if (kbCategoryGR.get(categoryId)) {
				var catNode = {};
				catNode.name = kbCategoryGR.getValue('label');
				catNode.sys_id = kbCategoryGR.getUniqueValue();
				catNode.type = 'category';
				catNode.knowledge_base = questionGR.getValue('kb_knowledge_base');
				node.unshift(catNode);
				categoryId = kbCategoryGR.getValue('parent_id');
			}
			else
				break;
		} while (kbCategoryGR.parent_table != 'kb_knowledge_base');
		return node;
	},
    type: 'SocialQACommon'
};