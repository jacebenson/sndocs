var FindRelevantAcls = Class.create();

FindRelevantAcls.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	process : function() {
		var identifier = this.getParameter("sysparm_identifier");
		var operationID = this.getParameter("sysparm_operationID");
		var resourceID = this.getParameter("sysparm_resourceID");

		var originalIdentifier = this.getParameter("sysparm_original_identifier");
		var originalOperationID = this.getParameter("sysparm_original_operationID");
		var originalResourceID = this.getParameter("sysparm_original_resourceID");		
		var aclSysID = this.getParameter("sysparm_sysID");

		var allPlans = [];
		var plan = GlideContextualSecurityManager.getRelatedACLs(identifier, operationID, resourceID);

		//cannot put the returned object directly as it is in JSON format and here we have javascript array
		var json = new JSON();
		var originalPlan;

		if (GlideStringUtil.notNil(originalIdentifier) && GlideStringUtil.notNil(originalOperationID) && GlideStringUtil.notNil(originalResourceID)) {
			if(GlideStringUtil.notNil(aclSysID)){
				originalPlan = GlideContextualSecurityManager.getRelatedACLs(aclSysID);
			}
			else{
				originalPlan = GlideContextualSecurityManager.getRelatedACLs(originalIdentifier, originalOperationID, originalResourceID);
			}
			allPlans.push(json.decode(originalPlan));
		}
		
		allPlans.push(json.decode(plan));
		return json.encode(allPlans);
	},

    type: 'FindRelevantAcls'
});