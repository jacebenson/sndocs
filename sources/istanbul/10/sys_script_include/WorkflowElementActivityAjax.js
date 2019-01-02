var WorkflowElementActivityAjax = Class.create();
WorkflowElementActivityAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	canEdit: function() {
		var canEdit = false;
		var activityId = this.getParameter("sysparm_activity_id");
		var gr = new GlideRecord("wf_element_activity");
		
		if (gr.get(activityId)) {
			var vGR = new GlideRecord("wf_versionable");
			vGR.addQuery("version_container_id", gr.getValue("version_container_id"));
			vGR.orderByDesc("version");
			vGR. setLimit(1);
			vGR.query();
			
			if (vGR.next()) {
				// If currently checked out, is it by this current user?
				canEdit = (vGR.getValue("published") == 0 && gs.getUserID() == vGR.getValue("checked_out_by") &&
							vGR.getValue("wf_element_definition") == gr.getValue("sys_id"));
			}
		}
		gs.log("return canEdit = " + canEdit);
		return canEdit;
	},

	isPublished: function() {
		var published = false;
		var activityId = this.getParameter("sysparm_activity_id");
		var gr = new GlideRecord("wf_element_activity");
		
		if (gr.get(activityId)) {
			var vGR = new GlideRecord("wf_versionable");
			vGR.addQuery("version_container_id", gr.getValue("version_container_id"));
			vGR.orderByDesc("version");
			vGR. setLimit(1);
			vGR.query();
			published = (vGR.next() && vGR.getValue("published") == "1");
		}
		return published;
	},

});