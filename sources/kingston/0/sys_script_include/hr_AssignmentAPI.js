var hr_AssignmentAPI = Class.create();
hr_AssignmentAPI.prototype = {
	initialize: function() {
	},

	getAgentsByCountryAndSkillsOrderLeastLoaded: function(rec) {
		return new sn_hr_core.hr_AssignmentUtil().getAgentsByCountryAndSkillsOrderLeastLoaded(rec);
	},

	getAgentsBySkillOrderLeastLoaded: function(rec) {
		return new sn_hr_core.hr_AssignmentUtil().getAgentsBySkillOrderLeastLoaded(rec);
	},

	getAgentsForHrTaskByCountryAndSkills: function(rec) {
		return new sn_hr_core.hr_AssignmentUtil().getAgentsForHrTaskByCountryAndSkills(rec);	
	},

	getAgentsForHrTaskBySkills: function(rec) {
		return new sn_hr_core.hr_AssignmentUtil().getAgentsForHrTaskBySkills(rec);
	},

	type: 'hr_AssignmentAPI'
};