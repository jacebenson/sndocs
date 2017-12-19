var RecurringCostRollupProcessor = Class.create();
RecurringCostRollupProcessor.prototype = {
	initialize: function() {
	},
	
	_fieldToPrice : function(element) {
		var price = parseFloat(element);
		if (isNaN(price))
			price = 0;
		return price;
	},
	
	processChangeToItem: function(item) {
		if (JSUtil.nil(item) || JSUtil.nil(item.request))
			return;
		var requestId = item.request.sys_id+"";
		this.processChangeToRequest(requestId);
	},
		
	processChangeToRequest: function(request) {
		if (JSUtil.nil(request))
			return;
		new SNC.Request(request).recalculateRecurringCost();
	},
	
	type: 'RecurringCostRollupProcessor'
};