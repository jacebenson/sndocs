var UsageAnalyticsLastNMonths = Class.create();

UsageAnalyticsLastNMonths.prototype = {
    initialize: function() {
    },

	dateToYYYYMM : function (/* Date */ date, /* int */ prevNMonths) {
		date.setMonth(date.getMonth() - prevNMonths, 1);
    	var m = date.getMonth() + 1;
    	var y = date.getFullYear();
    	return '' + y + '-' + (m<=9 ? '0' + m : m);
	},

	getLastNMonths : function (/* int */ n) {
		var lastNMonths = '';
		if (!n || isNaN(n))
			n = 12;
		
		for (var i=0; i<n; i++) {
			var now = new Date();
			var formated = this.dateToYYYYMM(now, i);
			lastNMonths += formated + ",";
		}
		
		if (lastNMonths.indexOf(",", lastNMonths.length - 1) !== -1) 
			lastNMonths = lastNMonths.substring(0, lastNMonths.length - 1);
		return lastNMonths;
	},
	
    type: 'UsageAnalyticsLastNMonths'
}