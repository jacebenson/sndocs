// Discovery

var DiscoDashboardUtil = Class.create();

DiscoDashboardUtil.getTodayTime = function() {
	return GlideDateTime().getValue();
};

DiscoDashboardUtil.getYesterdayTime = function() {
	var gdt = GlideDateTime();
	gdt.addDays(-1);
	
	return gdt.getValue();
};

DiscoDashboardUtil.addSeconds = function(dateTime, seconds) {
	var gdt = new GlideDateTime(dateTime);
	gdt.addSeconds(600);
	
	return gdt.getValue();
};

DiscoDashboardUtil.getUsedCreds = function() {
	var answer = new Array();
	var i = 0;
	var g = new GlideAggregate('dscy_credentials_affinity');
	g.groupBy('credential_id');
	g.query();
	while(g.next())
		answer[i++] = new String(g.credential_id);
	return answer;
};

DiscoDashboardUtil.prototype = {
	initialize: function() {
	},
	
	type: 'DiscoDashboardUtil'
}