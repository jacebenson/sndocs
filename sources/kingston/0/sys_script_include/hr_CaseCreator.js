var hr_CaseCreator = Class.create();
hr_CaseCreator.prototype = {
    initialize: function() {
    },

	/**
	* Helper method to create multiple HR cases
	* services -- An array of HR service sys ids
	* caseInfo -- This object has options for the created cases, e.g. assigned to, subject person, opened for
	* returns count of cases created
	*/
	createCasesFromService:function(services, caseInfo) {
		if (services && Array.isArray(services)) {
			for (var i = 0; i < services.length; i++)
				this.createCaseFromService(services[i], caseInfo);
			return services.length;
		}
		return 0;
	},

	/**
	* Helper method to create individual HR case
	* caseInfo -- This object has options for the created case, e.g. assigned to, subject person, opened for
	* returns sys_id of the new HR case created
	*/
	createCaseFromService:function(hrServiceId, caseInfo) {
		if (!hrServiceId || !caseInfo || !caseInfo.opened_for)
			return;

		var hrServiceGr = new GlideRecord('sn_hr_core_service');
		var sysId;
		if (hrServiceGr.get(hrServiceId)) {
			var caseGr = new GlideRecord(hrServiceGr.service_table);
			if (!caseGr.isValid())
				return;
			caseGr.hr_service = hrServiceGr.getUniqueValue();
			caseGr.topic_detail = hrServiceGr.topic_detail;
			caseGr.topic_category = hrServiceGr.topic_detail.topic_category;
			caseGr.template = hrServiceGr.template;

			for (var key in caseInfo)
				caseGr.setValue(key, caseInfo[key]);

			// call apply before so that the fields that get defaulted will get overridden by the template
			new sn_hr_core.hr_TemplateUtils().applyBefore(hrServiceGr.template, caseGr);
			sysId = caseGr.insert();
		}
		return sysId;
	},

    type: 'hr_CaseCreator'
};