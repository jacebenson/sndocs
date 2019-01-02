var WorkflowElementVersionUtils = Class.create();
WorkflowElementVersionUtils.prototype = {
    initialize: function() {
      this.ElementVersionAPI = new SNC.ElementVersionAPI(); // new syle API
    },

	canSubmit: function(current) {
		return this.ElementVersionAPI.canSubmit(current);
	},
	
	canCheckout: function(current) {
		return this.ElementVersionAPI.canCheckout(current);
	},
	
	canForceCheckout: function(current) {
		return this.ElementVersionAPI.canForceCheckout(current);
	},
	
	canPublish: function(current) {
		return this.ElementVersionAPI.canPublish(current);
	},
	
	canEdit: function(current) {
		return this.ElementVersionAPI.canEdit(current);
	},
	
	canDelete: function(current) {
		return this.ElementVersionAPI.canDelete(current);
	},
	
	canDeleteCondition: function(current) {
		var act_ele_Id = current.activity_definition;
		var gRec = new GlideRecord('wf_element_activity');
		gRec.get(act_ele_Id);
		return this.ElementVersionAPI.canDelete(gRec);
	},
	
	save: function(current) {
		return this.ElementVersionAPI.save(current);
	},
	
	submit: function(current) {
		return this.ElementVersionAPI.submit(current);
	},
	
	publish: function(current) {
		return this.ElementVersionAPI.publish(current);
	},
	
	checkout: function(current) {
		var id = this.ElementVersionAPI.checkout(current);
		return id;
	},
	
	forceCheckout: function(current) {
		return this.ElementVersionAPI.forceCheckout(current);
	},
	
	deleteIt: function(current) {
		var id = this.ElementVersionAPI.deleteIt(current);
		return id;
	},
	
	deleteConditionDefault: function(current) {
		var id = this.ElementVersionAPI.deleteConditionDefault(current);
		return id;
	},
	
	getVersions: function(activityId) {
		return this.ElementVersionAPI.getVersions(activityId);
	},
	
	getActiveElementActivityList: function(userId) {
		return this.ElementVersionAPI.getActiveElementActivityList(userId);
	},
	
	getActiveElementActivityListQuery: function(userId) {
		return this.ElementVersionAPI.getActiveElementActivityListQuery(userId);
	},

    type: 'WorkflowElementVersionUtils'
};