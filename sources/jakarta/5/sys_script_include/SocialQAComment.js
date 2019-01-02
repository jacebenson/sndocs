var SocialQAComment = Class.create();
SocialQAComment.prototype = {
    initialize: function() {
		this.globalUtil = new global.GlobalKnowledgeUtil();
		this.socialQACommon = new SocialQACommon();
		this.tableNames = this.socialQACommon.getTableNames();
    },
	
	_getCommentRecord: function(id) {
		var gr = new GlideRecord(this.tableNames.table_comment);
		gr.addActiveQuery();
		gr.addQuery('sys_id', id);
		gr.query();
		return gr;
	},
	
	_populateProfile: function(id) {
		var profile = this.globalUtil.getProfileDetails(id);
		return profile;
	},
	
	_getACLs: function(commentGR) {
		var admin = false;
		var sessionProfile = this.globalUtil.getSessionProfile();
		
		if(gs.hasRole('admin'))
			admin = true;

		var acl = {};
		if(admin || commentGR.profile == sessionProfile) { //My Answer
			acl.can_edit = true;
			acl.can_delete = true;
			}
		else{
			acl.can_edit = false;
			acl.can_delete = false;
		}
		return acl;
	},
	
	getCommentsJSON: function(refName, refId, withoutLimit) {
		var commentData = {};
		commentData.comments = [];
		commentData.has_more =false;
		var limit = parseInt(gs.getProperty('sn_kb_social_qa.comment_limit', 5)) + 1;
		var gr = new GlideRecord(this.tableNames.table_comment);
		gr.addActiveQuery();
		gr.addQuery('reference_name', refName);
		gr.addQuery('reference_id', refId);
		if(!withoutLimit)
			gr.setLimit(limit);
		gr.orderByDesc('sys_created_on');
		gr.query();
		var i = 1;
		while(gr.next()) {
			if(i < limit || withoutLimit)
				commentData.comments.push(this.commentJSON(gr));
			else if(i == limit && !withoutLimit)
				commentData.has_more = true;
			i++;
		}
		return commentData;
	},

	commentJSON: function(commentGR) {
		var comment = {};
		comment.comment = commentGR.getValue('comment');
		comment.profile = this._populateProfile(commentGR.getValue('profile'));
		comment.sys_id = commentGR.getValue('sys_id');
		comment.sys_created_on = commentGR.getValue('sys_created_on');
		comment.sys_updated_on = commentGR.getValue('sys_updated_on');
		comment.acls = this._getACLs(commentGR);
		return comment;
	},
    type: 'SocialQAComment'
};