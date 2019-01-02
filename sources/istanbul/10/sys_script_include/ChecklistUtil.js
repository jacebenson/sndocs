var ChecklistUtil = Class.create();
ChecklistUtil.prototype = {
    initialize: function() {
    },
	
	hasChecklistItems : function(checklistGR) {
		if(this.hasChecklist(checklistGR)) {
			var items = new GlideRecord("checklist_item");
			items.addQuery("checklist", checklistGR.sys_id);
			items.query();
			if (items.getRowCount() > 0) 
				return true;
			return false;
		}
		return false;
	},
	
	hasTemplates : function() {
		var temp = new GlideRecord("checklist_template");
		temp.query();
		if (temp.next())
			return true;
		return false;
	},
	
	hasChecklist : function (checklistGR) {
		var sysID = checklistGR.sys_id + '';
		return (new GlideStringUtil()).isEligibleSysID(sysID);
	},
	
    type: 'ChecklistUtil'
};