var DeleteRelationshipAjax = Class.create();

DeleteRelationshipAjax.prototype =  Object.extendsObject(AbstractAjaxProcessor, {
	process: function() {
		if (this.getType() == "deleteRelationship") {
			this.deleteRelationship(this.getValue(), this.getParameter("sysparm_changeset"));
		}
	},
	
	deleteRelationship: function(item_id, task_id) {
		var gr = new GlideRecord("cmdb_rel_ci");
		if (gr.get(item_id)) {
			var base = new SNC.CMDBUtil();
			base.baselineProposedChangesGenDeleteRelation(gr, task_id);
		}
	},
	
	type: "DeleteRelationshipAjax"
});