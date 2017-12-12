var hr_CaseHierarchyUtils = Class.create();
hr_CaseHierarchyUtils.prototype = {
    initialize: function() {
    },

	getQueryToLimitServices: function(record) {
		if (record.topic_detail)
			return 'topic_detail=' + record.topic_detail;

		if (record.topic_category)
			return 'topic_detail.topic_category=' + record.topic_category;

		if (record.sys_class_name)

			return 'topic_detail.topic_category.coe=' + record.sys_class_name + "^value!=" + hr.BULK_PARENT_CASE_SERVICE + this._getHrServicesAssociatedWithCriteria(record);
		return '';
	},
	
	_getHrServicesAssociatedWithCriteria : function(record) {
		
		var hrServiceIds = [];
		var hrServices = new GlideRecord('sn_hr_core_service');
		hrServices.addQuery('topic_detail.topic_category.coe', record.sys_class_name);
		hrServices.addActiveQuery();
		hrServices.query();
		while (hrServices.next()) {
			if (gs.nil(hrServices.hr_criteria))
					hrServiceIds.push(hrServices.sys_id + '');
			else {
				if(!gs.nil(record.subject_person)) {
					var hrCriteria = hrServices.hr_criteria.split(',');
					
					for (var i = 0; i < hrCriteria.length; i++) {
						var isValidCriteria = new hr_Criteria().evaluateById(hrCriteria[i]+'', record.subject_person +'');
						if (isValidCriteria) {
							hrServiceIds.push(hrServices.sys_id + '');
							break;
						} 
					}
				}	
			}
		}
			
		if (gs.nil(record.subject_person) || hrServiceIds.length > 0) 
			return '^sys_idIN' + hrServiceIds.toString();
		else
			return '^sys_idIN';
	},

	getApprovalAssignmentOptions : function(record) {
		if (!record || !record.service_table)
			return "sys_idIN";
		else
			return this._getOptionsForCOE(record.service_table);
	},

  getApprovalAssignmentOptionsForHrServiceActivity : function(record) {
		var str = "sys_id=null";

		if (!record || !record.parent_service)
			return str;

		var gr = new GlideRecord('sn_hr_core_service');
		if (gr.get(record.parent_service))
			return this.getApprovalAssignmentOptions(gr);

		return str;
	},

	getApprovalAssignmentOptionsForCOE : function(tableName) {
		if (!tableName)
			return "sys_idIN";
		else
			return this._getOptionsForCOE(tableName);
	},

	_getOptionsForCOE : function(table) {
		var str = "sys_idIN";
		var hrTables = new GlideTableHierarchy(table).getTables();
		var gr = new GlideRecord('sn_hr_core_service_approval_option');
		gr.addActiveQuery();
		gr.addQuery('case_table', 'IN', hrTables);
		gr.query();

		while (gr.next())
			str += gr.getUniqueValue() + ",";

		return str;
	},
	
	getQueryToLimitUsersWithCaseWriterRole : function(record) {
		var hrTables = new GlideTableHierarchy(record.sys_class_name).getTables();
		
		if (hrTables.indexOf('sn_hr_le_case') > -1) 
			return 'roles=sn_hr_le.case_writer';
		else
			return 'roles=sn_hr_core.case_writer';
	},

    type: 'hr_CaseHierarchyUtils'
};