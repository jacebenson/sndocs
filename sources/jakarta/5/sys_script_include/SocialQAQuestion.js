var SocialQAQuestion = Class.create();

SocialQAQuestion.prototype = {
	//Error Message
	SECURITY_CONSTRAINT: gs.getMessage('Security constraints prevent access to this page'),
	
    initialize: function() {
		this.globalUtil = new global.GlobalKnowledgeUtil();
		this.socialQACommon = new SocialQACommon();
		this.tableNames = this.socialQACommon.getTableNames();
    },
    //Private APIs
	_isQuestionParamsValid:function(params){
		var isValid = true;
		if(!gs.nil(params.knowledge_base)) {
			var kbRead = this.globalUtil.getCanReadKBs();
			isValid = kbRead.indexOf(params.knowledge_base) >= 0;
		}
		else
			isValid = false;

		isValid = isValid && !gs.nil(params.question);
		return isValid;
	},
	
	_viewCountIncrement: function(questionId){
		var socialQAView = new SocialQAView();
		socialQAView.questionViewIncrement(questionId);
	},
	
	_createQuestion:function(params){
		var gr = new GlideRecord(this.tableNames.table_question);
		var response = { id:''};
		if(this._isQuestionParamsValid(params)){
			gr.initialize();
			gr.active = 1;
			gr.answer_count = 0;
			gr.has_comment = 0;
			gr.setValue("question_details", params.question_details);
			gr.question = params.question;
			gr.views = 0;
			gr.votes = 0;
			gr.last_activity= new GlideDateTime();
			if(params.profile)
				gr.profile = params.profile;
			gr.kb_knowledge_base = params.knowledge_base;
			gr.kb_category = params.kb_category;
			response.id = gr.insert();
			if(params.tags)
				this._processTags(params, gr);
			return response;
		}else{
			gs.addErrorMessage(gs.getMessage('Mandatory parameter missing'));
			return response;
		}
		
	},
	_updateQuestion: function(params) {
		var gr = new GlideRecordSecure(this.tableNames.table_question);
		if(gr.get(params.sys_id)) {
			gr.setValue("question_details", params.question_details);
			gr.question = params.question;
			gr.kb_knowledge_base = params.knowledge_base;
			gr.kb_category = params.kb_category;
			gr.last_activity= new GlideDateTime();
			gr.update();
			if(params.tags) {
				this._processTags(params, gr);
			}
			return {};
		}
	},
	_processTags: function(params, question) {
		var tags = new SocialQATags();
		for(var i=0;i<params.tags.length;i++) {
			tags.createTag(params.tags[i].name, question.getUniqueValue());
		}
	},
	_getQuestionRecord: function(id) {
		var gr = new GlideRecord(this.tableNames.table_question);
		gr.addActiveQuery();
		gr.addQuery('sys_id', id);
		gr.query();
		return gr;
	},
	
	_populateAnswersJSON: function(params, page) {
		var socialAnswer = new SocialQAAnswer();
		var answers = socialAnswer.getAnswersJSON(params.sys_id.toString(), page);
		return answers;
	},
	
	_populateTagsJSON: function(questionId) {
		var tagsGR = new GlideRecord('label_entry');
		tagsGR.addQuery('table', 'kb_social_qa_question');
		tagsGR.addQuery('table_key', questionId);
		tagsGR.addQuery('label.active', true);
		tagsGR.query();
		
		var answers = [];
		var socialTags = new SocialQATags();
		while (tagsGR.next()) {
			var tag = {};
			tag.name = tagsGR.label.name.toString();
			tag.sys_id = tagsGR.label.toString();
			tag.viewable_by = tagsGR.label.viewable_by.toString();
			if(socialTags._getTagId(tag.name)){//Check Visibility
				if(tag.viewable_by == 'me') {
					if(tagsGR.label.owner == gs.getUserID())
						answers.push(tag);
				}
				else
					answers.push(tag);
			}
		}
		
		return answers;
	},
	
	_populateCommentsJSON: function(params) {
		var socialComment = new SocialQAComment();
		var comments = socialComment.getCommentsJSON(this.tableNames.table_question, params.sys_id);		
		return comments;
	},
	
	_populateProfileJSON: function(id) {
		var profile = this.globalUtil.getProfileDetails(id);
		return profile;
	},
	
	_canReadKnowledgeBase: function(base) {
		var canReadBases = this.globalUtil.getCanReadKBs();
		if(canReadBases === '')
			return true;
		if(canReadBases.indexOf(base) != -1)
			return true;
		else
			return false;
	},
	_getVoteDetail:function(referenceId,referenceName){
		var voteGR = new GlideRecord(this.socialQACommon.getTableNames().table_vote);
		voteGR.addQuery('reference_name', referenceName);
		voteGR.addQuery('reference_id', referenceId);
		voteGR.addQuery('profile', this.globalUtil.getSessionProfile());
		voteGR.query();
		if(voteGR.next()){
			 return {
				 sys_id:voteGR.getValue('sys_id'),
				 up_vote:voteGR.getValue('up_vote')=== "1" ?true:false };
		}
		return {};

	},
	
	_getACLs: function(questionGR) {
		var isKnowledgeManager = false;
		var sessionProfile = this.globalUtil.getSessionProfile();
		var sessionProfileDetails = this.globalUtil.getProfileDetails(sessionProfile);
		if(gs.hasRole('admin'))
			isKnowledgeManager = true;
		else
			isKnowledgeManager = this.socialQACommon.isKnowledgeManager(questionGR.getValue('kb_knowledge_base'), sessionProfileDetails.user);
		var acl = {};
		if(isKnowledgeManager) { //Admin
			acl.kb_manager = true;
			acl.can_edit = true;
			acl.can_delete = true;
			acl.can_accept = true;
		}
		else if(questionGR.profile == sessionProfile) { //My Question
			acl.kb_manager = false;
			acl.can_edit = true;
			acl.can_delete = true;
			acl.can_accept = true;
			}
		else{
			acl.kb_manager = false;
			acl.can_edit = false;
			acl.can_delete = false;
			acl.can_accept = false;
		}
		return acl;
	},
	
	//Public APIs
	createQuestion: function(params) {
		return this._createQuestion(params);
	},
	updateQuestion: function(params) {
		return this._updateQuestion(params);
	},
	toJSON: function(params) {
		var questionGR = this._getQuestionRecord(params.sys_id);
		if(!questionGR.hasNext())
			return ;
		
		questionGR.next();
		if(!this._canReadKnowledgeBase(questionGR.getValue('kb_knowledge_base'))) {
			throw this.SECURITY_CONSTRAINT;
		}
		var question = {};
		question.question = questionGR.getValue('question');
		question.question_details = questionGR.getValue('question_details');
		question.answer_count = questionGR.getValue('answer_count');
		if(question.answer_count != '0') {
			question.answers = this._populateAnswersJSON(params);
		}
		question.tags = this._populateTagsJSON(params.sys_id);
		question.has_comment = questionGR.has_comment;
		if (question.has_comment) {
			var commentData = this._populateCommentsJSON(params);
			question.comments = commentData.comments;
			question.has_more_comments = commentData.has_more;
		}
		question.last_activity = questionGR.getValue('last_activity');
		question.profile = this._populateProfileJSON(questionGR.profile);
		question.votes = questionGR.getValue('votes');
		question.views = questionGR.getValue('views');
		question.sys_created_on = questionGR.getValue('sys_created_on');
		question.sys_updated_on = questionGR.getValue('sys_updated_on');
		question.sys_id = questionGR.getValue('sys_id');
		question.vote_reference = this._getVoteDetail(questionGR.getValue('sys_id'),this.tableNames.table_question);
		question.questionSubscriptionId = this.getSubscriptionIdofQuestion(question.sys_id, this.globalUtil.getSessionProfile());
		question.knowledge_base = questionGR.getValue('kb_knowledge_base');
		question.knowledge_base_display = questionGR.kb_knowledge_base.getDisplayValue();
		question.kb_category = questionGR.getValue('kb_category');
		question.kb_category_display = questionGR.kb_category.label.getDisplayValue();
		question.kb_category_full = questionGR.kb_category.full_category.getDisplayValue();
		question.category_tree = this.socialQACommon.getCategoryBreadcrumb(question.sys_id);
		question.acls = this._getACLs(questionGR, question.profile);
		this._viewCountIncrement(question.sys_id);
		return question;
	},

	subscribeToQuestion: function(questionId, profileId) {
		if(!profileId)
			profileId = this.globalUtil.getSessionProfile();
		var grSubscribe = new GlideRecord(this.tableNames.table_subscribe);
		if(!grSubscribe.isValid())
			return '';
		if(!this.getSubscriptionIdofQuestion(questionId, profileId)) {
			grSubscribe.initialize();
			grSubscribe.setValue('profile', profileId);
			grSubscribe.setValue('question', questionId);
			var subscriptionId = grSubscribe.insert();
			return subscriptionId;
		}
	},
	getSubscriptionIdofQuestion: function(questionId, profileId) {
		var gr = new GlideRecord(this.tableNames.table_subscribe);
		if(!gr.isValid())
			return '';
		gr.addActiveQuery();
		gr.addQuery('question', questionId);
		gr.addQuery('profile', profileId);
		gr.query();
		if(gr.next())
			return gr.getValue('sys_id');
		else
			return '';
	},
	getSubscribersToQuestion: function(questionId) {
		var subscribers = [];
		var gr = new GlideRecord(this.tableNames.table_subscribe);
		if(!gr.isValid())
			return '';
		gr.addActiveQuery();
		gr.addQuery('question', questionId);
		gr.query();
		while(gr.next())
			subscribers.push(gr.profile.document.toString());
		return subscribers.join(',');
	},
	deleteQuestion: function(questionId) {
		var gr = new GlideRecordSecure('kb_social_qa_question');
		if(gr.get(questionId)) {
			gr.active = false;
			gr.update();
		}
	},
	getQuestionAcls: function(questionId) {
		gs.info('Question sys_id is: ' + questionId);
		var questionGR = this._getQuestionRecord(questionId);
		if(questionGR.next())
			return this._getACLs(questionGR);
		else {
			//This will happen if we are on a new Question 
			//We don't have info about knowledge base
			var acls = {};

			acls.kb_manager = false;
			acls.can_edit = true;
			acls.can_delete = true;
			acls.can_accept = true;
			return acls;
		}
	},
	type: 'SocialQAQuestion'
};
	