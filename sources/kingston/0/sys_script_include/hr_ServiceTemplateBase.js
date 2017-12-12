var hr_ServiceTemplateBase = Class.create();
hr_ServiceTemplateBase.prototype = {
    initialize: function() {
    },
	
	/**
	  * Generate a service template
	  *
	  * @param serviceTemplate GlideRecord for the sn_hr_core_service_activity
	  * @param parent GlideRecord of the parent record for this activity
	  */
	generateServiceTemplate: function(serviceTemplate, parent) {
		if (!serviceTemplate || !serviceTemplate.isValid() || !parent || !parent.isValid())
			return false;
		
		if (serviceTemplate.getValue("child_template"))
			return this._generateTemplate(serviceTemplate, parent);
		
		return false;
	},
	
	_generateTemplate: function(serviceTemplate, parent) {
		var recordSysId = new sn_hr_core.hr_TemplateUtils()._applyChildren(parent.getRecordClassName(), parent.getUniqueValue(), serviceTemplate.getValue("child_template"));
		
		return recordSysId != null;
	},

    type: 'hr_ServiceTemplateBase'
};