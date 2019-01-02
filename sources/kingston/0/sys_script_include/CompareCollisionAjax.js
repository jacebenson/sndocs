var CompareCollisionAjax = Class.create();
CompareCollisionAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getCollision: function() {
		var problemId = this.getParameter("sysparm_problem_id");
		var previewProblem = new GlideRecord("sys_update_preview_problem");
		previewProblem.get(problemId);

		var rbus = previewProblem.remote_update_set.remote_base_update_set;
		if (rbus == "")
			return "";

		var updateSetXML1 = new GlideRecord('sys_update_xml');
		updateSetXML1.get(previewProblem.remote_update);	
		if (!updateSetXML1.isValidRecord())
			return "";

		var previewProblem2 = new GlideRecord("sys_update_preview_problem");
		previewProblem2.addQuery("remote_update_set.remote_base_update_set", rbus);
		previewProblem2.addQuery("remote_update.name", updateSetXML1.name);
		previewProblem2.addQuery("description", previewProblem.description);
		previewProblem2.addQuery("sys_id", "!=", problemId);
		previewProblem2.query();
		if (previewProblem2.next()) {
			var result = this.newItem("result");
			result.setAttribute("sysparm_update_id1", updateSetXML1.sys_id);
			result.setAttribute("sysparm_update_id2", previewProblem2.remote_update);
			result.setAttribute("sysparm_update_filename", updateSetXML1.name);
			result.setAttribute("sysparm_rbus", rbus);
		}
		else {
			return "";
		}
	},
 
});