var OrchUsageAverageCounter = Class.create();
OrchUsageAverageCounter.prototype = {
	initialize: function() {
	},
	
	type: "OrchUsageAverageCounter"
};

OrchUsageAverageCounter.getUsageAverageCount = function(definitionID,  days){
	var cntGr = new GlideRecord("usageanalytics_count");
	cntGr.addQuery("definition_id", definitionID);
	cntGr.addQuery("count", ">", 0);
	cntGr.addQuery("sys_created_on", ">=", gs.daysAgoStart(days));
	cntGr.orderBy("sys_created_on");
	cntGr.query();
	
	if (!cntGr.next())
		return 0;
	
	var firstNoZeroCntDateTime = cntGr.sys_created_on;
	var gr = new GlideAggregate("usageanalytics_count");
	gr.addQuery("definition_id", definitionID);
	gr.addQuery("sys_created_on", ">=", firstNoZeroCntDateTime);
	gr.addAggregate("AVG", "count");
	gr.groupBy("definition_id");
	gr.query();
	
	if (!gr.next())
		return 0;
	
	return parseInt(gr.getAggregate("AVG", "count"));
	
};
