var CanReportOnTables = Class.create();
CanReportOnTables.prototype = {
	initialize: function() {
	},
	
	process: function() {
		var result = [];
		var reportChoiceList = new GlideReportChoiceList();
		reportChoiceList.setCanRead(true);
		reportChoiceList.setNoViews(false);
		reportChoiceList.setNoSystemTables(false);
		reportChoiceList.generateChoices();
		for (var i = 0; i < reportChoiceList.getSize(); i++)
			result.push('' + reportChoiceList.get(i).getValue());
		
		return result;
	},
	type: 'CanReportOnTables'
};