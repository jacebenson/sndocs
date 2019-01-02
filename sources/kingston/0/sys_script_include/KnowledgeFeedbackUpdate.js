var KnowledgeFeedbackUpdate = Class.create();
KnowledgeFeedbackUpdate.prototype = {
	initialize: function() {
	},
	
	upgrade: function(){
		//Migrates comment feedback to live_message
		var feedback = new GlideRecord('kb_feedback');
		feedback.setUseEngines(false);
		feedback.addNotNullQuery('comments');
		feedback.addNullQuery('live_message');
		feedback.query();
		while (feedback.next()) {
			var userId = feedback.getValue("user");
			var liveProfileId = null;
			if (!JSUtil.nil(userId))
				liveProfileId = new GlideappLiveProfile().getID(userId);

			var articleId = feedback.getValue('article');
			var article = feedback.article.getDisplayValue();
			if (JSUtil.nil(articleId)) {
				gs.logWarning("\"kb_feedback\" record does not have an article - equivalent \"live_message\" record will not be created","KnowledgeFeedbackUpdate");
				continue;
			}
			
			var liveGroupProfileId = new GlideappLiveFeedUIAction().getGroupID("kb_knowledge", articleId);
			if (JSUtil.nil(liveGroupProfileId)) {
				gs.logWarning("Failed to create \"live_group_profile\" record for \"kb_knowledge\"" + article + " on \"kb_feedback\" record with sys_id \"" + feedback.getUniqueValue() + "\"","KnowledgeFeedbackUpdate");
				continue;
			}
				
			var liveMessageId = this.migrateFeedback(liveGroupProfileId, liveProfileId, feedback);
			if (!JSUtil.nil(liveMessageId)) {
				feedback.live_message = liveMessageId;
				feedback.update();
			}
		}
	},
	
	migrateFeedback: function(liveGroupProfileId, liveProfileId, feedback) {
		// migrates comments
		var liveMessage = new GlideRecord('live_message');
		liveMessage.initialize();
		liveMessage.autoSysFields(false);
		liveMessage.setUseEngines(false);
		liveMessage.setWorkflow(false);
		liveMessage.message = feedback.getValue('comments');
		liveMessage.sys_created_by = feedback.user.getDisplayValue();
		liveMessage.sys_created_on = feedback.getValue('sys_created_on');
		liveMessage.group = liveGroupProfileId;
		liveMessage.profile = liveProfileId;
	
		return liveMessage.insert();
	},
	
	type: 'KnowledgeFeedbackUpdate'
}