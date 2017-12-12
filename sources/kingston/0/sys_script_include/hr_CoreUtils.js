var hr_CoreUtils = Class.create();
hr_CoreUtils.prototype = {
    initialize: function() {
    },

	hasRoles: function() {
		var roles = gs.getUser().getRoles();
		
		if (roles.length == 0)
			return false;
		else if (roles.length == 1 && roles[0] == 'snc_internal') //For explicit roles plugin
			return false;
		
		return true;
	},
	
 	impersonateCheck: function() {
	 	return gs.getSession().isImpersonating() && gs.getProperty('sn_hr_core.impersonateCheck') == 'true';
 	},

 	isAssigned: function(request) {
		return (!request.assignment_group.nil() || !request.assigned_to.nil());
 	},

 	hasValidAssignee: function(record) {
		var grMember = new GlideRecord('sys_user_grmember');
		grMember.addQuery('user', record.assigned_to);
		grMember.addQuery('group', record.assignment_group);
		grMember.setLimit(1);
		grMember.query();
		var assigneeInAssignmentGroup = grMember.hasNext();
		if (assigneeInAssignmentGroup)
			return true;

		var asmtGroup = new GlideRecord('sys_user_group');
		asmtGroup.get(record.assignment_group);
		var assigneeIsAssignmentGroupMgr = asmtGroup.manager + '' == record.assigned_to + '';
		if (assigneeIsAssignmentGroupMgr)
			return true;

		return false;
 	},

	isClosed: function(record) {
		return (record.state == 3) || (record.state == 4) || (record.state == 7);
	},

	isParentClosed : function(record) {
		return (record.parent.state == 3) || (record.parent.state == 4) || (record.parent.state == 7);
	},

	canEscalate: function(task) {
		if (this.isClosed(task) || task.assignment_group.nil())
			return false;

		var gr = new GlideRecord('sn_hr_core_tier_definition');
		gr.addQuery('escalate_from', task.assignment_group);
		gr.addNotNullQuery('escalate_to');
		gr.query();
		if (gr.getRowCount() > 0)
			return true;

		return false;
	},

 	hasOpenTasks : function() {
		// we are now allowing an hr case to have child tasks other than hr_task, so removing sm logic to restrict to sm tables only
		var gr = new GlideRecord('task');
		gr.addQuery("parent", current.sys_id);
		gr.addEncodedQuery("stateNOT IN3,4,7,9"); // SM assumed that 3, 4, 7 and 9 were the only ones that indicated closed
		gr.query();
		if(gr.getRowCount() != 0){
			while(gr.next()){
				var grTask = new GlideRecord('sn_hr_core_task');
				if(grTask.get(gr.getUniqueValue())){
					if(grTask.optional == false)
						return true;
				}
			}
		}
		return false;
 	},

	fieldChangeCheck: function(fieldList) {
		var fieldArray = fieldList.split(",");
		for (var x=0; x<fieldArray.length; x++) {
			if (current.isValidField(fieldArray[x])) {
				if (current[fieldArray[x]].changes()) {
					return true;
				}
			}
		}
		return false;
	},
	
	isCase: function (className) {
		return className == hr.TABLE_CASE || hr.TABLE_CASE_EXTENSIONS.toString().indexOf(className) >= 0;
	},

	//Returning display value only for Refernce type fields 	
	getFieldsDisplayValue: function (field,value,table) {
		var referenceTable = this._getReferenceTable(table,field);
		if(referenceTable){
			var refGr = new GlideRecord(referenceTable);
			return (refGr.get(value))? refGr.getDisplayValue(): "";
		}
	},

	_getReferenceTable: function (table, field) {
		var fTypeRef = new GlideRecord("sys_dictionary");
		fTypeRef.addQuery('name', table);
		fTypeRef.addQuery('element',field);
		fTypeRef.addQuery('internal_type','reference');
		fTypeRef.query();
		return (fTypeRef.next())? String(fTypeRef.reference):"";
	},

	type : 'hr_CoreUtils'
};
