var DesiredStateUtil = Class.create();

DesiredStateUtil.prototype = {
    condTables: null,
	numTables: null,
	
	initialize: function() {
		this.condTables = ["cert_attr_cond", "cert_ci_rel_cond", "cert_group_rel_cond", "cert_user_rel_cond", "cert_related_list_cond"];
		this.numTables = this.condTables.length;
    },

    type: 'DesiredStateUtil',
	
	clonedConditions : function(templateId) {
		var clonedCondition = [];
		for (var i = 0; i < this.numTables; i++) {
			var condTable = this.condTables[i];
			clonedCondition[i] = new GlideRecord(condTable);
			clonedCondition[i].addQuery('cert_template', templateId);
			clonedCondition[i].addNotNullQuery('original_id');
			clonedCondition[i].query();
		}
		return clonedCondition;
	},
	
	// Copy conditions of template to new template version
	// Adjust conditions already cloned
	copyConditions : function(templateId, newTemplateId, clonedCondition) {
		for (var i = 0; i < this.numTables; i++) {
			var condTable = this.condTables[i];
			
			var alreadyCloned = {};
			while (clonedCondition[i].next()) {
				var original_id = String(clonedCondition[i].original_id);
				clonedCondition[i].original_id = "";
				if (original_id === 'deleted') 
					alreadyCloned[String(clonedCondition[i].sys_id)] = true;
				else {
					alreadyCloned[original_id] = true;
					clonedCondition[i].cert_template = newTemplateId;
					SNC.VersionControl.updatePreventingBR(clonedCondition[i]);
				}
			}
			
			var condition = new GlideRecord(condTable);
			condition.query('cert_template', templateId);
			while (condition.next()) {
				if (!alreadyCloned[String(condition.sys_id)]) {
					condition.cert_template = newTemplateId;
					SNC.VersionControl.insertPreventingBR(condition);
				}
			}
		}
	}
}