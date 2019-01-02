var SocialQAAnswer = Class.create();
SocialQAAnswer.prototype = {
    initialize: function() {
		this.globalUtil = new global.GlobalKnowledgeUtil();
		this.socialQACommon = new SocialQACommon();
		this.tableNames = this.socialQACommon.getTableNames();
    },
	
	_getAnswerRecord: function(id) {
		var gr = new GlideRecord(this.tableNames.table_answer);
		gr.addActiveQuery();
		gr.addQuery('sys_id', id);
		gr.query();
		return gr;
	},
	
	_populateAnswerCommentJSON: function(params) {
		var socialComment = new SocialQAComment();
		var comments = socialComment.getCommentsJSON(this.tableNames.table_answer, params.sys_id);
		return comments;
	},
	
	_populateProfileJSON: function(id) {
		var profile = this.globalUtil.getProfileDetails(id);
		return profile;
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
	
	_getACLs: function(answerGR) {
		var admin = false;
		var sessionProfile = this.globalUtil.getSessionProfile();
		
		if(gs.hasRole('admin'))
			admin = true;

		var acl = {};
		if(admin || answerGR.profile == sessionProfile) { //My Answer
			acl.can_edit = true;
			acl.can_delete = true;
			}
		else{
			acl.can_edit = false;
			acl.can_delete = false;
		}
		return acl;
	},

	hasAcceptedAnswer: function(questionID){
		var answer = new GlideRecord(this.tableNames.table_answer);
		answer.addActiveQuery();
		answer.addQuery('question', questionID);
		answer.addQuery('accepted', '1');
		answer.query();
		return answer.hasNext();
	},
	
	getAnswersJSON: function(questionId) {
		var answer = new GlideRecord(this.tableNames.table_answer);
		answer.addActiveQuery();
		answer.addQuery('question', questionId);
		answer.query();
		
		var answers = [];
		while (answer.next()) {
			answers.push(this.answerJSON(answer));
		}
		
		return answers;
	},

	answerJSON: function(answerGR) {
		var answer = {};
		answer.active = answerGR.getValue('active');
		answer.accepted = answerGR.getValue('accepted');
		answer.accepted = answer.accepted == '1' ? true : false;
		if(answer.accepted)
			answer.accepted_by = this._populateProfileJSON(answerGR.getValue('accepted_by'))
		answer.answer = answerGR.getValue('answer');
		answer.votes = answerGR.getValue('votes');
		answer.profile = this._populateProfileJSON(answerGR.getValue('profile'));
		answer.question = answerGR.getValue('question');
		answer.sys_id = answerGR.getValue('sys_id');
		answer.has_comment = answerGR.has_comment;
		if (answer.has_comment) {
			var commentData = this._populateAnswerCommentJSON({sys_id:answer.sys_id});
			answer.comments = commentData.comments;
			answer.has_more_comments = commentData.has_more;
		}
		answer.sys_created_on = answerGR.getValue('sys_created_on');
		answer.sys_updated_on = answerGR.getValue('sys_updated_on');
		answer.vote_reference = this._getVoteDetail(answerGR.getValue('sys_id'),this.tableNames.table_answer);
		answer.acls = this._getACLs(answerGR);
		return answer;
	},

    type: 'SocialQAAnswer'
};